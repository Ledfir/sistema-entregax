import { useEffect } from 'react';
import { Card, Descriptions, Tag, Avatar } from 'antd';
import { UserOutlined, MailOutlined, KeyOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { HomeServicioCliente } from './HomeServicioCliente';
import { HomeAsesor } from './HomeAsesor';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    document.title = 'Sistema Entregax | Dashboard';
  }, []);

  // Homes específicos por rol
  if (user?.tipo_usuario === 'ASESOR') {
    return <HomeAsesor />;
  }

  if (user?.tipo_usuario === 'SERVICIO AL CLIENTE') {
    return <HomeServicioCliente />;
  }

  return (
    <div className="dashboard-container">
      <h1 style={{ marginBottom: '24px' }}>Bienvenido al Sistema EntregaX</h1>
      
      <Card 
        title="Información de la Sesión" 
        style={{ maxWidth: '800px' }}
        extra={<Tag color="success">Activo</Tag>}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Avatar
            size={64}
            icon={<UserOutlined />}
            src={(user as any)?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Usuario')}&background=f39915&color=fff&size=128`}
            style={{ marginRight: '16px' }}
          />
          <div>
            <h2 style={{ margin: 0 }}>{user?.name || 'Usuario'}</h2>
            <p style={{ margin: 0, color: '#666' }}>{user?.email || 'No disponible'}</p>
          </div>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label={<><IdcardOutlined /> ID de Usuario</>}>
            {user?.id || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label={<><UserOutlined /> Nombre Completo</>}>
            {user?.name || 'No disponible'}
          </Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> Correo Electrónico</>}>
            {user?.email || 'No disponible'}
          </Descriptions.Item>
          <Descriptions.Item label={<><KeyOutlined /> Tipo de Usuario</>}>
            <Tag color="blue">{user?.type || 'N/A'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Hora de Inicio de Sesión">
            {(user as any)?.login_time || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Token de Sesión">
            <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
              {user?.token || 'No disponible'}
            </code>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card 
        title="Datos de Sesión Completos (JSON)" 
        style={{ maxWidth: '800px', marginTop: '24px' }}
      >
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '8px',
          overflow: 'auto',
          maxHeight: '300px'
        }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </Card>
    </div>
  );
};

export default Dashboard;
