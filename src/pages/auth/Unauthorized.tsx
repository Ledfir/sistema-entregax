import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';

export const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Result
        status="403"
        icon={<LockOutlined style={{ fontSize: '72px', color: '#ff4d4f' }} />}
        title="403"
        subTitle="Lo sentimos, no tienes permisos para acceder a esta página."
        extra={[
          <Button type="primary" key="home" onClick={handleGoHome}>
            Ir al inicio
          </Button>,
          <Button key="back" onClick={handleGoBack}>
            Volver
          </Button>,
        ]}
      />
    </div>
  );
};

export default Unauthorized;
