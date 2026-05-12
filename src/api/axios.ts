import axios from 'axios';

// En desarrollo usa ruta relativa para que el proxy de Vite evite CORS
// En producción usa la URL completa
const API_URL = import.meta.env.DEV
  ? '/api'
  : 'https://www.sistemaentregax.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Verifica si un JWT no ha expirado
const isJwtValid = (token: string): boolean => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('auth-storage');
  window.location.href = '/login';
};

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      // Si el token existe pero expiró, cerrar sesión antes de enviar
      if (!isJwtValid(token)) {
        clearSessionAndRedirect();
        return Promise.reject(new Error('Token expirado'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Si el body es FormData, dejar que el navegador establezca el Content-Type automáticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth') || requestUrl.includes('/login');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Token expirado o revocado en rutas protegidas (no en login)
      clearSessionAndRedirect();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
