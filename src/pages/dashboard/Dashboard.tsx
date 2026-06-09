import { useEffect } from 'react';
import { Card, Button, Tag, Row, Col, Table } from 'antd';
import { TrophyOutlined, RiseOutlined, ClockCircleOutlined, BellOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    document.title = 'Sistema Entregax | Dashboard';
  }, []);

  const leaderboardData = [
    {
      key: '1',
      position: 1,
      name: 'Juan Delgado',
      aciertos: '42/50',
      puntos: '2,105',
      estado: 'ASCENDIENDO',
      estadoColor: 'success'
    },
    {
      key: '2',
      position: 14,
      name: 'Angel Aldahir (Tú)',
      aciertos: '38/50',
      puntos: '1,842',
      estado: 'ESTABLE',
      estadoColor: 'default'
    },
    {
      key: '3',
      position: 15,
      name: 'Maria Castro',
      aciertos: '37/50',
      puntos: '1,810',
      estado: 'DESCENDIENDO',
      estadoColor: 'error'
    }
  ];

  const columns = [
    {
      title: 'POSICIÓN',
      dataIndex: 'position',
      key: 'position',
      width: 100,
      render: (pos: number) => (
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '6px', 
          backgroundColor: pos === 1 ? '#fff7e6' : '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: pos === 1 ? '#fa8c16' : '#000'
        }}>
          {pos}
        </div>
      )
    },
    {
      title: 'USUARIO',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: name.includes('Tú') ? 'bold' : 'normal' }}>{name}</span>
    },
    {
      title: 'ACIERTOS',
      dataIndex: 'aciertos',
      key: 'aciertos'
    },
    {
      title: 'PUNTOS',
      dataIndex: 'puntos',
      key: 'puntos',
      render: (puntos: string) => <span style={{ fontWeight: 'bold', color: '#f39915' }}>{puntos}</span>
    },
    {
      title: 'ESTADO',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string, record: any) => (
        <Tag color={record.estadoColor}>{estado}</Tag>
      )
    }
  ];

  return (
    <div className="dashboard-container" style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Hola, {user?.name || 'Usuario'} 👋
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Bienvenido de nuevo al centro de operaciones de la Quiniela EntregaX.
        </p>
      </div>

      <Row gutter={[16, 16]}>
        {/* Columna izquierda */}
        <Col xs={24} lg={16}>
          {/* Estadísticas principales */}
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col xs={24} md={8}>
              <Card style={{ textAlign: 'center' }}>
                <div style={{ color: '#f39915', fontSize: '24px', marginBottom: '8px' }}>
                  <TrophyOutlined />
                  <span style={{ marginLeft: '8px', color: '#52c41a', fontSize: '14px' }}>+15 pts hoy</span>
                </div>
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>PUNTOS TOTALES</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>1,842</div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={{ textAlign: 'center' }}>
                <div style={{ color: '#52c41a', fontSize: '24px', marginBottom: '8px' }}>
                  <RiseOutlined />
                  <span style={{ marginLeft: '8px', color: '#ff4d4f', fontSize: '14px' }}>-2 lugares</span>
                </div>
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>RANKING GLOBAL</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>#14</div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={{ textAlign: 'center' }}>
                <div style={{ color: '#1890ff', fontSize: '24px', marginBottom: '8px' }}>
                  <ClockCircleOutlined />
                  <span style={{ marginLeft: '8px', color: '#999', fontSize: '14px' }}>Cierra en 2d</span>
                </div>
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>APUESTAS PENDIENTES</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>4</div>
              </Card>
            </Col>
          </Row>

          {/* Partido destacado */}
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #654321 0%, #3a3a3a 100%)',
              color: 'white',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <Tag color="orange">COPA DEL MUNDO 2024</Tag>
              <span style={{ fontSize: '12px' }}>📅 24 Nov • 14:00</span>
            </div>
            <Row gutter={[16, 16]} align="middle" style={{ textAlign: 'center' }}>
              <Col span={10}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  margin: '0 auto 12px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <img 
                    src="https://flagcdn.com/w160/mx.png" 
                    alt="México" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ color: 'white', margin: 0 }}>México</h3>
              </Col>
              <Col span={4}>
                <h2 style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '36px' }}>VS</h2>
              </Col>
              <Col span={10}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  margin: '0 auto 12px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <img 
                    src="https://flagcdn.com/w160/pl.png" 
                    alt="Polonia" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ color: 'white', margin: 0 }}>Polonia</h3>
              </Col>
            </Row>
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Button 
                type="primary" 
                size="large"
                danger
                icon={<TrophyOutlined />}
                style={{ 
                  background: 'white',
                  color: '#ff4d4f',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Pronosticar Ahora
              </Button>
            </div>
          </Card>

          {/* Leaderboard */}
          <Card title="Top 5 Leaderboard - Depto. Sistemas" style={{ marginBottom: '16px' }}>
            <Table 
              columns={columns} 
              dataSource={leaderboardData} 
              pagination={false}
              size="middle"
            />
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: '#2c2c2c', 
              borderRadius: '8px',
              color: 'white',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>✅</span>
              <span>¡Tus apuestas han sido guardadas con éxito!</span>
            </div>
          </Card>
        </Col>

        {/* Columna derecha */}
        <Col xs={24} lg={8}>
          {/* Mi Historial */}
          <Card 
            title="Mi Historial" 
            extra={<a href="#" style={{ color: '#f39915' }}>Ver todo</a>}
            style={{ marginBottom: '16px' }}
          >
            <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>BRA</span>
                  <span style={{ margin: '0 8px', color: '#999' }}>VS</span>
                  <span style={{ fontWeight: 'bold' }}>SRB</span>
                </div>
                <div>
                  <Tag color="success">Ganaste</Tag>
                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>+16 pts</span>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>ARG</span>
                  <span style={{ margin: '0 8px', color: '#999' }}>VS</span>
                  <span style={{ fontWeight: 'bold' }}>SAU</span>
                </div>
                <div>
                  <Tag color="error">Perdiste</Tag>
                  <span style={{ color: '#999', fontWeight: 'bold' }}>0 pts</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>FRA</span>
                  <span style={{ margin: '0 8px', color: '#999' }}>VS</span>
                  <span style={{ fontWeight: 'bold' }}>AUS</span>
                </div>
                <div>
                  <Tag color="success">Ganaste</Tag>
                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>+15 pts</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Anuncios */}
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BellOutlined style={{ fontSize: '20px' }} />
              <h3 style={{ margin: 0, color: 'white' }}>Anuncios</h3>
            </div>
            <p style={{ marginBottom: '16px', fontSize: '14px' }}>
              ¡Se han abierto las apuestas para la Gran Final de la Champions League! No te quedes fuera.
            </p>
            <Button 
              style={{ 
                background: 'white',
                color: '#ff6b35',
                border: 'none',
                fontWeight: 'bold'
              }}
            >
              Leer más
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
