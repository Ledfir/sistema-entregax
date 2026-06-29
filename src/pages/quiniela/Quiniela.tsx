import { useState, useEffect } from 'react';
import { Card, Tabs, Row, Col, Avatar, Tag, Spin, Empty, Badge } from 'antd';
import { quinielaService } from '@/services/quinielaService';
import { useAuthStore } from '@/store/authStore';
import './Quiniela.css';

interface Prediccion {
  id: string;
  id_partido: string;
  liga: string;
  jornada: string;
  fecha: string;
  fecha_unix?: number;
  estado: 'activa' | 'finalizada';
  equipo1: {
    nombre: string;
    logo: string;
  };
  equipo2: {
    nombre: string;
    logo: string;
  };
  resultado_actual?: {
    goles1: number;
    goles2: number;
  };
  en_vivo?: boolean;
  tu_prediccion: {
    goles1: number;
    goles2: number;
    prediccion: 'HOME' | 'DRAW' | 'AWAY';
  };
  puntos_proyectados?: number;
  estado_prediccion?: string;
}

// DATOS DE DEMOSTRACIÓN - Remover cuando backend esté listo
const DEMO_DATA: Prediccion[] = [
  {
    id: '1',
    id_partido: 'partido_1',
    liga: 'LIGA MX',
    jornada: 'Jornada 12',
    fecha: '2026-06-20 19:00:00',
    fecha_unix: new Date('2026-06-20 19:00:00').getTime(),
    estado: 'activa',
    equipo1: { nombre: 'América', logo: 'https://flagcdn.com/mx.svg' },
    equipo2: { nombre: 'Cruz Azul', logo: 'https://flagcdn.com/mx.svg' },
    resultado_actual: { goles1: 2, goles2: 1 },
    en_vivo: true,
    tu_prediccion: { goles1: 2, goles2: 0, prediccion: 'HOME' },
    puntos_proyectados: 5,
    estado_prediccion: 'Acertando Ganador'
  },
  {
    id: '2',
    id_partido: 'partido_2',
    liga: 'PREMIER LEAGUE',
    jornada: 'Mañana, 14:00',
    fecha: '2026-06-21 14:00:00',
    fecha_unix: new Date('2026-06-21 14:00:00').getTime(),
    estado: 'activa',
    equipo1: { nombre: 'Chelsea', logo: 'https://flagcdn.com/gb.svg' },
    equipo2: { nombre: 'Liverpool', logo: 'https://flagcdn.com/gb.svg' },
    en_vivo: false,
    tu_prediccion: { goles1: 1, goles2: 1, prediccion: 'DRAW' }
  },
  {
    id: '3',
    id_partido: 'partido_3',
    liga: 'LALIGA',
    jornada: 'Jornada 20',
    fecha: '2026-06-15 20:00:00',
    fecha_unix: new Date('2026-06-15 20:00:00').getTime(),
    estado: 'finalizada',
    equipo1: { nombre: 'Real Madrid', logo: 'https://flagcdn.com/es.svg' },
    equipo2: { nombre: 'Barcelona', logo: 'https://flagcdn.com/es.svg' },
    resultado_actual: { goles1: 2, goles2: 1 },
    tu_prediccion: { goles1: 2, goles2: 1, prediccion: 'HOME' },
    puntos_proyectados: 10,
    estado_prediccion: '¡Acierto!'
  }
];

export const Quiniela = () => {
  const [quinielas, setQuinielas] = useState<Prediccion[]>(DEMO_DATA);
  const [tab, setTab] = useState<string>('activas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    document.title = 'Sistema Entregax | Mis Predicciones';
  }, []);

  useEffect(() => {
    const cargarQuinielas = async () => {
      if (!user?.id) {
        setCargando(false);
        return;
      }
      try {
        setCargando(true);
        setError(null);
        const datos = await quinielaService.getMisQuinielas(user.id);
        setQuinielas(datos);
      } catch (error) {
        console.error('Error al cargar quinielas:', error);
        setError('No se pudieron cargar las quinielas. Por favor, intenta más tarde.');
        // Mantener datos de demostración en caso de error
        setQuinielas(DEMO_DATA);
      } finally {
        setCargando(false);
      }
    };

    cargarQuinielas();
  }, [user?.id]);

  // Función para determinar si una predicción está activa basada en fecha
  const isActivaByDate = (prediccion: Prediccion): boolean => {
    let fechaComparacion: number | null = null;

    // Prioridad 1: Intentar parsear el campo fecha como string (formato backend)
    if (typeof prediccion.fecha === 'string' && prediccion.fecha.includes('-')) {
      try {
        // Convertir formato "YYYY-MM-DD HH:MM:SS" a ISO 8601 "YYYY-MM-DDTHH:MM:SS"
        const fechaFormateada = prediccion.fecha.replace(' ', 'T');
        const fechaObj = new Date(fechaFormateada);
        
        // Validar que la fecha sea válida
        if (!isNaN(fechaObj.getTime())) {
          fechaComparacion = fechaObj.getTime();
          console.log(`Predicción ${prediccion.id}: fecha="${prediccion.fecha}" -> timestamp=${fechaComparacion}, ahora=${Date.now()}, activa=${fechaComparacion > Date.now()}`);
        }
      } catch (e) {
        console.error('Error parseando fecha:', prediccion.fecha, e);
      }
    }
    
    // Prioridad 2: Si tiene fecha_unix y no se pudo parsear, usarlo
    if (fechaComparacion === null && prediccion.fecha_unix) {
      fechaComparacion = prediccion.fecha_unix;
      console.log(`Predicción ${prediccion.id}: usando fecha_unix=${fechaComparacion}, ahora=${Date.now()}, activa=${fechaComparacion > Date.now()}`);
    }

    // Si se logró obtener una fecha válida, compararla
    if (fechaComparacion !== null) {
      return fechaComparacion > Date.now();
    }

    // Fallback: usar el campo estado
    console.log(`Predicción ${prediccion.id}: usando fallback, estado=${prediccion.estado}`);
    return prediccion.estado === 'activa';
  };

  // Función auxiliar para obtener el timestamp de una predicción
  const getFechaTimestamp = (prediccion: Prediccion): number => {
    if (prediccion.fecha_unix) {
      return prediccion.fecha_unix;
    }
    if (typeof prediccion.fecha === 'string' && prediccion.fecha.includes('-')) {
      try {
        const fechaFormateada = prediccion.fecha.replace(' ', 'T');
        const fecha = new Date(fechaFormateada);
        if (!isNaN(fecha.getTime())) {
          return fecha.getTime();
        }
      } catch (e) {
        // ignorar error
      }
    }
    return 0;
  };

  const quinielas_activas = quinielas
    .filter(isActivaByDate)
    .sort((a, b) => getFechaTimestamp(a) - getFechaTimestamp(b)); // Ordenar de menor a mayor (próximas primero)
  
  const quinielas_finalizadas = quinielas
    .filter(q => !isActivaByDate(q))
    .sort((a, b) => getFechaTimestamp(b) - getFechaTimestamp(a)); // Ordenar de mayor a menor (más recientes primero)
  
  console.log(`Total: ${quinielas.length}, Activas: ${quinielas_activas.length}, Finalizadas: ${quinielas_finalizadas.length}`);

  const renderQuinielaCard = (prediccion: Prediccion) => (
    <Card key={prediccion.id} className="quiniela-card">
      <div className="quiniela-header">
        <div className="quiniela-info">
          <Tag color="#dc3545">{prediccion.liga}</Tag>
          <span className="quiniela-jornada">• {prediccion.jornada}</span>
        </div>
        <div className="quiniela-estado">
          {prediccion.en_vivo && (
            <Tag color="success" style={{ fontSize: '12px' }}>EN VIVO - 72'</Tag>
          )}
          {!prediccion.en_vivo && prediccion.fecha_unix && prediccion.fecha_unix > Date.now() && (
            <span style={{ fontSize: '12px', color: '#999' }}>{prediccion.fecha}</span>
          )}
          {!prediccion.en_vivo && prediccion.fecha_unix && prediccion.fecha_unix <= Date.now() && (
            <span style={{ fontSize: '12px', color: '#999' }}>FINALIZADO</span>
          )}
          {!prediccion.en_vivo && !prediccion.fecha_unix && prediccion.estado === 'activa' && (
            <span style={{ fontSize: '12px', color: '#999' }}>{prediccion.fecha}</span>
          )}
          {!prediccion.en_vivo && !prediccion.fecha_unix && prediccion.estado === 'finalizada' && (
            <span style={{ fontSize: '12px', color: '#999' }}>FINALIZADO</span>
          )}
        </div>
      </div>

      <div className="quiniela-partidos">
        {/* Resultado Actual */}
        <div className="partido-section">
          <div className="equipo">
            <Avatar size={50} src={prediccion.equipo1.logo} />
            <span>{prediccion.equipo1.nombre}</span>
          </div>

          <div className="marcador-actual">
            <div className="resultado">
              {prediccion.resultado_actual ? (
                <div className="score">
                  {prediccion.resultado_actual.goles1} - {prediccion.resultado_actual.goles2}
                </div>
              ) : (
                <div className="vs">VS</div>
              )}
            </div>
          </div>

          <div className="equipo">
            <Avatar size={50} src={prediccion.equipo2.logo} />
            <span>{prediccion.equipo2.nombre}</span>
          </div>
        </div>
      </div>

      {/* Tu Predicción */}
      <div className="quiniela-prediccion">
        <div className="prediccion-label">TU PREDICCIÓN</div>
        <div className="prediccion-content">
          <div className="prediccion-resultado">
            {prediccion.tu_prediccion.prediccion === 'HOME' && `Gana ${prediccion.equipo1.nombre}`}
            {prediccion.tu_prediccion.prediccion === 'DRAW' && 'Empate'}
            {prediccion.tu_prediccion.prediccion === 'AWAY' && `Gana ${prediccion.equipo2.nombre}`}
          </div>
          {prediccion.puntos_proyectados !== undefined && (
            <div className="prediccion-puntos">
              <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
                Puntos Proyectados: {prediccion.puntos_proyectados}
              </div>
              {prediccion.estado_prediccion && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {prediccion.estado_prediccion}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="quiniela-container">
      {/* Header */}
      <div className="quiniela-header-section">
        <h1>Mis Quinielas</h1>
        <p>Gestiona tus predicciones y sigue tus resultados en tiempo real.</p>
        {error && (
          <div style={{ 
            marginTop: '12px', 
            padding: '8px 12px', 
            backgroundColor: '#fff2f0', 
            borderLeft: '3px solid #ff4d4f',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#cf1322'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="quiniela-tabs">
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              label: (
                <span>
                  Activas
                  {quinielas_activas.length > 0 && (
                    <Badge count={quinielas_activas.length} style={{ marginLeft: '8px' }} />
                  )}
                </span>
              ),
              key: 'activas',
            },
            { label: 'Finalizadas', key: 'finalizadas' },
          ]}
        />
      </div>

      {/* Grid de Quinielas */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#666' }}>Cargando quinielas...</p>
        </div>
      ) : tab === 'activas' ? (
        quinielas_activas.length === 0 ? (
          <Empty description="No hay quinielas activas" />
        ) : (
          <Row gutter={[16, 16]} className="quinielas-grid">
            {quinielas_activas.map(prediccion => (
              <Col key={prediccion.id} xs={24} md={12} lg={12}>
                {renderQuinielaCard(prediccion)}
              </Col>
            ))}
          </Row>
        )
      ) : quinielas_finalizadas.length === 0 ? (
        <Empty description="No hay quinielas finalizadas" />
      ) : (
        <Row gutter={[16, 16]} className="quinielas-grid">
          {quinielas_finalizadas.map(prediccion => (
            <Col key={prediccion.id} xs={24} md={12} lg={12}>
              {renderQuinielaCard(prediccion)}
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Quiniela;
