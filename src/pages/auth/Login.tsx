import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import './Login.css';

const { Title, Text, Link } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    document.title = 'Sistema Entregax | Login';
    
    // Redirigir si ya está autenticado
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
    
    return () => {
      document.title = 'Sistema Entregax';
    };
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      // Llamada real a la API
      const response = await authService.login({
        username: values.email,
        password: values.password,
      });

      // Verificar respuesta exitosa
      if (response.status === 'success' && response.token) {
        // Construir datos del usuario desde response.data
        const backendData = (response as any).data || {};
        const userData = {
          id: backendData.user_id || 0,
          name: backendData.name || 'Usuario',
          email: backendData.mail || values.email,
          type: backendData.type || 1,
          token: response.token,
          tipo_usuario: backendData.tipo_usuario || backendData.user_type || backendData.type || '',
          tipo_usuario_token: backendData.tipo_usuario_token || '',
          ubicacion: backendData.ubicacion || '',
          ubicacion_token: backendData.ubicacion_token || '',
          asesor: backendData.asesor || '',
          asesor_token: backendData.asesor_token || '',
          profile_image: backendData.profile_image || '',
          login_time: backendData.login_time || '',
        };
        
        // Guardar usuario en el store
        login(userData);
        
        message.success(response.message || '¡Inicio de sesión exitoso!');
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Error en la autenticación');
      }
    } catch (error: any) {
      console.error('Error de login:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al iniciar sesión. Por favor, verifica tus credenciales.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
        <ul className="bubbles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      
      <Card className="login-card">
        <div className="login-content">
          <div className="login-header">
            <div className="logo-container">
              <img 
                src="https://www.sistemaentregax.com/assets/img/logo.png" 
                alt="EntregaX Logo" 
                className="logo-image"
              />
            </div>
            <Title level={3} className="login-title">Bienvenido de nuevo!</Title>
            <Text className="login-subtitle">Inicia sesión para continuar.</Text>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
            className="login-form"
          >
            <Form.Item
              label="Correo"
              name="email"
              rules={[
                { required: true, message: 'Por favor ingresa tu correo' },
                { type: 'email', message: 'Por favor ingresa un correo válido' }
              ]}
            >
              <Input 
                prefix={<UserOutlined className="input-icon" />}
                placeholder="Ingresa tu correo"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Contraseña"
              name="password"
              rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Ingresa tu contraseña"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                <Link href="/forgot-password" className="forgot-link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                loading={loading}
                block
                className="login-button"
              >
                Iniciar sesión
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <Text className="footer-text">
              © 2026 Entregax Paqueteria
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
