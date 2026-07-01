import { useEffect, useState } from 'react';
import { Card, Button, Tag, Row, Col, Spin, Carousel } from 'antd';
import { TrophyOutlined, BellOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { quinielaService } from '@/services/quinielaService';
import './Dashboard.css';

interface Partido {
  id: string;
  home_team: string;
  home_flag: string;
  away_team: string;
  away_flag: string;
  match_date: string;
  stage?: string;
  match_number?: string;
  group_letter?: string;
}

interface Torneo {
  id: string;
  name: string;
  proximo_partido: Partido;
}

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [cargandoPartido, setCargandoPartido] = useState(true);
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const [prediccionesPendientes, setPrediccionesPendientes] = useState(0);
  const [cargandoPendientes, setCargandoPendientes] = useState(true);
  const [puntosTotales, setPuntosTotales] = useState(0);
  const [cargandoPuntos, setCargandoPuntos] = useState(true);

  useEffect(() => {
    document.title = 'Sistema Entregax | Dashboard';
  }, []);

  useEffect(() => {
    const cargarTorneos = async () => {
      try {
        setCargandoPartido(true);
        const respuesta = await quinielaService.getProximoPartido();
        console.log('Respuesta del Dashboard:', respuesta);
        
        // Verificar si es un array (nuevos datos)
        if (Array.isArray(respuesta)) {
          console.log('✅ Es un array de torneos:', respuesta);
          setTorneos(respuesta);
        } else {
          console.log('Solo objeto individual, lo convertimos a array');
          setTorneos([]);
        }
      } catch (error) {
        console.error('Error al cargar torneos:', error);
        setTorneos([]);
      } finally {
        setCargandoPartido(false);
      }
    };

    cargarTorneos();
  }, []);

  useEffect(() => {
    const cargarPuntosTotales = async () => {
      if (!user?.id) {
        setCargandoPuntos(false);
        return;
      }
      try {
        setCargandoPuntos(true);
        const puntos = await quinielaService.getPuntosTotales(user.id);
        setPuntosTotales(puntos);
      } catch (error) {
        console.error('Error al cargar puntos totales:', error);
      } finally {
        setCargandoPuntos(false);
      }
    };

    cargarPuntosTotales();
  }, [user?.id]);

  useEffect(() => {
    const cargarPrediccionesPendientes = async () => {
      if (!user?.id) {
        setCargandoPendientes(false);
        return;
      }
      try {
        setCargandoPendientes(true);
        const count = await quinielaService.getPrediccionesPendientes(user.id);
        setPrediccionesPendientes(count);
      } catch (error) {
        console.error('Error al cargar predicciones pendientes:', error);
      } finally {
        setCargandoPendientes(false);
      }
    };

    cargarPrediccionesPendientes();
  }, [user?.id]);

  useEffect(() => {
    const cargarHistorial = async () => {
      if (!user?.id) {
        setCargandoHistorial(false);
        return;
      }
      try {
        setCargandoHistorial(true);
        const datos = await quinielaService.getHistorialPredicciones(user.id);
        setHistorial(datos);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      } finally {
        setCargandoHistorial(false);
      }
    };

    cargarHistorial();
  }, [user?.id]);

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
          <Card style={{ marginBottom: '16px' }}>
            {/* Estadísticas principales */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>PUNTOS TOTALES</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{cargandoPuntos ? '-' : puntosTotales}</div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>RANKING GLOBAL</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>- EN ESPERA DEL INICIO DE PARTIDOS -</div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>APUESTAS PENDIENTES</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{cargandoPendientes ? '-' : prediccionesPendientes}</div>
                </div>
              </Col>
            </Row>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #e8e8e8', margin: '24px 0' }}></div>

            {/* Carrusel de torneos */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, #654321 0%, #3a3a3a 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '8px'
              }}
            >
              {cargandoPartido ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin />
                </div>
              ) : torneos.length > 0 ? (
                <Carousel
                  arrows
                  dots={true}
                  autoplay={true}
                  autoplaySpeed={10000}
                  style={{ padding: '0 20px' }}
                >
                  {torneos.map((torneo) => (
                    <div key={torneo.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <Tag color="orange">{torneo.name.toUpperCase()}</Tag>
                        <span style={{ fontSize: '12px', color: 'white' }}>📅 {new Date(torneo.proximo_partido.match_date).toLocaleDateString('es-ES')} • {new Date(torneo.proximo_partido.match_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
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
                              src={torneo.proximo_partido.home_flag} 
                              alt={torneo.proximo_partido.home_team} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <h3 style={{ color: 'white', margin: 0 }}>{torneo.proximo_partido.home_team}</h3>
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
                              src={torneo.proximo_partido.away_flag} 
                              alt={torneo.proximo_partido.away_team} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <h3 style={{ color: 'white', margin: 0 }}>{torneo.proximo_partido.away_team}</h3>
                        </Col>
                      </Row>
                      <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <Button 
                          type="primary" 
                          size="large"
                          href={`/quiniela`}
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
                    </div>
                  ))}
                </Carousel>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
                  <p>No hay próximos partidos disponibles</p>
                </div>
              )}
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
            {cargandoHistorial ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="small" />
              </div>
            ) : historial.length > 0 ? (
              historial.map((prediccion) => (
                <div key={prediccion.id} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>{prediccion.equipo1.nombre}</span>
                      <span style={{ margin: '0 8px', color: '#999' }}>VS</span>
                      <span style={{ fontWeight: 'bold' }}>{prediccion.equipo2.nombre}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {prediccion.tu_prediccion.prediccion === 'HOME' && (
                        <span style={{ color: '#52c41a' }}>Gana {prediccion.equipo1.nombre}</span>
                      )}
                      {prediccion.tu_prediccion.prediccion === 'DRAW' && (
                        <span style={{ color: '#999' }}>Empate</span>
                      )}
                      {prediccion.tu_prediccion.prediccion === 'AWAY' && (
                        <span style={{ color: '#ff4d4f' }}>Gana {prediccion.equipo2.nombre}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                <p>Sin registros disponibles</p>
              </div>
            )}
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
              No olvides cargar tus predicciones antes del próximo partido. ¡Cada punto cuenta para subir en el ranking!
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
