import axios from 'axios';

// En desarrollo, usar ruta relativa para aprovechar el proxy de Vite
// En producción, usar la URL completa
const API_URL = 'https://www.sistemaentregax.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const { state } = JSON.parse(authData);
      if (state?.user?.token) {
        config.headers.Authorization = `Bearer ${state.user.token}`;
      }
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
    if (error.response?.status === 401) {
      // Token expirado o no válido
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
