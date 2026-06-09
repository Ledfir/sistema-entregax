import { useState, useEffect } from 'react';
import { Card, Tabs, Button, Row, Col, Avatar, Tag, Spin, Empty, message, Modal } from 'antd';
import { TrophyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { quinielaService } from '@/services/quinielaService';
import { useAuthStore } from '@/store/authStore';
import './Partidos.css';

interface Partido {
  id: string;
  matchNumber: string;
  groupLetter: string;
  stage: string;
  liga: string;
  ligaColor: string;
  hora: string;
  equipo1: {
    nombre: string;
    logo: string;
  };
  equipo2: {
    nombre: string;
    logo: string;
  };
  estadio?: string;
  enVivo?: boolean;
  verDetalles?: boolean;
}

// const PARTIDOS_DATA: Partido[] = [];

export const Partidos = () => {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [partidosFiltrados, setPartidosFiltrados] = useState<Partido[]>([]);
  const [filtroJornada, setFiltroJornada] = useState<string>('group_stage_1');
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<Partido | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { user } = useAuthStore();

  // Cargar partidos desde la API
  useEffect(() => {
    const cargarPartidos = async () => {
      try {
        setCargando(true);
        const datos = await quinielaService.getPartidos();
        setPartidos(datos);
      } catch (error) {
        console.error('Error al cargar partidos:', error);
        message.error('Error al cargar los partidos');
      } finally {
        setCargando(false);
      }
    };

    cargarPartidos();
  }, []);

  useEffect(() => {
    document.title = 'Sistema Entregax | Partidos';
  }, []);

  // Filtrar partidos por jornada
  useEffect(() => {
    const filtrados = partidos.filter(p => p.stage === filtroJornada);
    setPartidosFiltrados(filtrados);
  }, [filtroJornada, partidos]);

  const abrirModalPrediccion = async (partido: Partido) => {
    if (!user?.id) return;
    
    try {
      const validacion = await quinielaService.validarPrediccion(String(user.id), partido.id);
      
      if (!validacion.valida) {
        // No hay predicción previa, abrir modal normal
        setPartidoSeleccionado(partido);
        setModalVisible(true);
      } else {
        // Ya existe una predicción previa
        let prediccionTexto = '';
        if (validacion.prediccion === 'HOME') {
          prediccionTexto = `Gana ${partido.equipo1.nombre}`;
        } else if (validacion.prediccion === 'DRAW') {
          prediccionTexto = 'Empate';
        } else if (validacion.prediccion === 'AWAY') {
          prediccionTexto = `Gana ${partido.equipo2.nombre}`;
        }
        
        Modal.info({
          title: 'Predicción Existente',
          content: `Ya tienes una predicción para este partido: ${prediccionTexto}`,
          okText: 'Entendido',
        });
      }
    } catch (error) {
      console.error('Error al validar predicción:', error);
      message.error('Error al validar la predicción');
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setPartidoSeleccionado(null);
  };

  const handlePrediccion = (resultado: string) => {
    if (partidoSeleccionado) {
      mostrarConfirmacion(resultado);
    }
  };

  const mostrarConfirmacion = (resultado: string) => {
    let titulo = '';
    let descripcion = '';

    if (resultado.includes('Empate')) {
      titulo = 'Confirmar Empate';
      descripcion = `¿Confirmas que será empate entre ${partidoSeleccionado?.equipo1.nombre || 'Equipo 1'} y ${partidoSeleccionado?.equipo2.nombre || 'Equipo 2'}?`;
    } else if (resultado.includes(partidoSeleccionado?.equipo1.nombre || '')) {
      titulo = `Confirmar: Gana ${partidoSeleccionado?.equipo1.nombre}`;
      descripcion = `¿Confirmas que ganará ${partidoSeleccionado?.equipo1.nombre} frente a ${partidoSeleccionado?.equipo2.nombre}?`;
    } else {
      titulo = `Confirmar: Gana ${partidoSeleccionado?.equipo2.nombre}`;
      descripcion = `¿Confirmas que ganará ${partidoSeleccionado?.equipo2.nombre} frente a ${partidoSeleccionado?.equipo1.nombre}?`;
    }

    Modal.confirm({
      title: titulo,
      icon: <ExclamationCircleOutlined />,
      content: descripcion,
      okText: 'Sí, confirmar',
      cancelText: 'Cancelar',
      onOk() {
        guardarPrediccion(resultado);
      },
    });
  };

  const guardarPrediccion = async (resultado: string) => {
    if (partidoSeleccionado && user?.id) {
      try {
        setEnviando(true);
        
        // Mapear resultado a valor numérico
        let prediccion: number;
        if (resultado.includes('Empate')) {
          prediccion = 2;
        } else if (resultado.includes(partidoSeleccionado.equipo1.nombre)) {
          prediccion = 1;
        } else {
          prediccion = 3;
        }

        // Llamar al servicio para guardar la predicción
        await quinielaService.guardarPrediccion(
          String(user.id),
          partidoSeleccionado.id,
          prediccion
        );

        message.success('¡Predicción guardada exitosamente!');
        cerrarModal();
      } catch (error: any) {
        console.error('Error al guardar predicción:', error);
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Error al guardar la predicción';
        message.error(errorMessage);
      } finally {
        setEnviando(false);
      }
    }
  };

  const renderPartidoCard = (partido: Partido) => (
    <Card key={partido.id} className="partido-card">
      <div className="partido-header">
        <Tag color={partido.ligaColor} style={{ marginBottom: '8px' }}>
          {partido.liga}
        </Tag>
        <span className="partido-hora">{partido.hora}</span>
      </div>

      <div className="partido-content">
        {/* Equipo 1 */}
        <div className="equipo">
          <Avatar
            size={60}
            src={partido.equipo1.logo}
            style={{ marginBottom: '8px', borderColor: '#000000' }}
          />
          <div className="equipo-nombre">{partido.equipo1.nombre}</div>
        </div>

        {/* Versus */}
        <div className="versus">
          <div className="vs-text">VS</div>
          {partido.estadio && (
            <div className="estadio">{partido.estadio}</div>
          )}
          {partido.enVivo && (
            <div className="en-vivo">EN VIVO</div>
          )}
        </div>

        {/* Equipo 2 */}
        <div className="equipo">
          <Avatar
            size={60}
            src={partido.equipo2.logo}
            style={{ marginBottom: '8px', borderColor: '#000000' }}
          />
          <div className="equipo-nombre">{partido.equipo2.nombre}</div>
        </div>
      </div>

      <div className="partido-footer">
        {partido.verDetalles ? (
          <Button 
            type="default" 
            size="large" 
            block
            style={{ borderColor: '#dc3545', color: '#dc3545' }}
          >
            Ver Detalles
          </Button>
        ) : (
          <Button 
            type="primary" 
            size="large" 
            block
            danger
            icon={<TrophyOutlined />}
            onClick={() => abrirModalPrediccion(partido)}
          >
            Predecir
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="partidos-container">
      {/* Header */}
      <div className="partidos-header">
        <h1>Próximos Partidos</h1>
        <p>Revisa el calendario de los próximos encuentros y haz tus predicciones antes de que inicien los juegos.</p>
      </div>

      {/* Controles */}
      <div className="partidos-controles">
        <Tabs
          activeKey={filtroJornada}
          onChange={setFiltroJornada}
          items={[
            { label: 'Jornada 1', key: 'group_stage_1' },
            { label: 'Jornada 2', key: 'group_stage_2' },
            { label: 'Jornada 3', key: 'group_stage_3' }
          ]}
        />
      </div>

      {/* Grid de Partidos */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#666' }}>Cargando partidos...</p>
        </div>
      ) : partidosFiltrados.length === 0 ? (
        <Empty description="No hay partidos disponibles para esta jornada" />
      ) : (
        <Row gutter={[16, 16]} className="partidos-grid">
          {partidosFiltrados.map(partido => (
            <Col key={partido.id} xs={24} md={12} lg={8}>
              {renderPartidoCard(partido)}
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de Predicción */}
      <Modal
        title={null}
        open={modalVisible}
        onCancel={cerrarModal}
        footer={null}
        width={500}
        centered
        bodyStyle={{ padding: '32px' }}
      >
        {partidoSeleccionado && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '24px' }}>Haz tu predicción</h2>
            
            {/* Resumen del partido */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-around',
              marginBottom: '32px',
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={60}
                  src={partidoSeleccionado.equipo1.logo}
                  style={{ marginBottom: '8px' }}
                />
                <div style={{ fontWeight: 'bold' }}>
                  {partidoSeleccionado.equipo1.nombre}
                </div>
              </div>
              <div style={{ color: '#999', fontSize: '14px' }}>VS</div>
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={60}
                  src={partidoSeleccionado.equipo2.logo}
                  style={{ marginBottom: '8px' }}
                />
                <div style={{ fontWeight: 'bold' }}>
                  {partidoSeleccionado.equipo2.nombre}
                </div>
              </div>
            </div>

            {/* Opciones de predicción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button
                type="primary"
                size="large"
                style={{ 
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  height: '50px',
                  fontSize: '16px'
                }}
                onClick={() => handlePrediccion(`Ganador: ${partidoSeleccionado.equipo1.nombre}`)}
                disabled={enviando}
              >
                ✓ Gana {partidoSeleccionado.equipo1.nombre}
              </Button>
              
              <Button
                type="default"
                size="large"
                style={{ 
                  height: '50px',
                  fontSize: '16px',
                  color: '#faad14',
                  borderColor: '#faad14'
                }}
                onClick={() => handlePrediccion('Empate')}
                disabled={enviando}
              >
                = Empate
              </Button>

              <Button
                type="primary"
                size="large"
                style={{ 
                  background: '#1890ff',
                  borderColor: '#1890ff',
                  height: '50px',
                  fontSize: '16px'
                }}
                onClick={() => handlePrediccion(`Ganador: ${partidoSeleccionado.equipo2.nombre}`)}
                disabled={enviando}
              >
                ✓ Gana {partidoSeleccionado.equipo2.nombre}
              </Button>
            </div>

            <Button
              type="text"
              style={{ marginTop: '16px', width: '100%' }}
              onClick={cerrarModal}
              disabled={enviando}
            >
              Cancelar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Partidos;
