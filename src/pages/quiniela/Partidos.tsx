import { useState, useEffect } from 'react';
import { Card, Tabs, Button, Row, Col, Avatar, Tag, Spin, Empty, message, Modal, Input, Select, Collapse } from 'antd';
import { TrophyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { quinielaService, type Torneo } from '@/services/quinielaService';
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

interface Prediccion {
  id?: string;
  prediction: 'HOME' | 'DRAW' | 'AWAY';
  home_score: number;
  away_score: number;
}

// const PARTIDOS_DATA: Partido[] = [];

export const Partidos = () => {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [partidosFiltrados, setPartidosFiltrados] = useState<Partido[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<string>('');
  const [filtroJornada, setFiltroJornada] = useState<string>('');
  const [stagesActuales, setStagesActuales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<Partido | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [golesLocal, setGolesLocal] = useState<number>(0);
  const [golesVisitante, setGolesVisitante] = useState<number>(0);
  const [prediccionMostrar, setPrediccionMostrar] = useState<Prediccion | null>(null);
  const [primerGoleador, setPrimerGoleador] = useState<string>('');
  const [busquedaJugador, setBusquedaJugador] = useState<string>('');
  const [jugadoresEncontrados, setJugadoresEncontrados] = useState<any[]>([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<any>(null);
  const [cargandoJugadores, setCargandoJugadores] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const cargarTorneos = async () => {
      try {
        const listaTorneos = await quinielaService.getTorneos();
        setTorneos(listaTorneos);
        if (listaTorneos.length > 0) {
          setTorneoSeleccionado(listaTorneos[0].id);
          setStagesActuales(listaTorneos[0].stages);
          if (listaTorneos[0].stages.length > 0) {
            setFiltroJornada(listaTorneos[0].stages[0].stage);
          }
        }
      } catch (error) {
        console.error('Error al cargar torneos:', error);
        message.error('Error al cargar los torneos');
      }
    };

    cargarTorneos();
  }, []);

  useEffect(() => {
    if (!torneoSeleccionado) return;

    const torneo = torneos.find(t => t.id === torneoSeleccionado);
    if (torneo) {
      setStagesActuales(torneo.stages);
      if (torneo.stages.length > 0) {
        setFiltroJornada(torneo.stages[0].stage);
      }
    }
  }, [torneoSeleccionado, torneos]);

  useEffect(() => {
    if (!torneoSeleccionado) return;

    const cargarPartidos = async () => {
      try {
        setCargando(true);
        const datos = await quinielaService.getPartidos(torneoSeleccionado);
        setPartidos(datos);
      } catch (error) {
        console.error('Error al cargar partidos:', error);
        message.error('Error al cargar los partidos');
      } finally {
        setCargando(false);
      }
    };

    cargarPartidos();
  }, [torneoSeleccionado]);

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
    
    // Verificar si la fecha del partido ya pasó
    const fechaPartido = new Date(partido.hora || '');
    const ahora = new Date();
    const partidoYaPaso = fechaPartido < ahora;
    
    if (partidoYaPaso) {
      message.error('No puedes modificar predicciones de partidos que ya se jugaron');
      return;
    }
    
    try {
      const validacion = await quinielaService.validarPrediccion(String(user.id), partido.id);
      
      // Si valida es false, no permitir hacer predicción
      if (!validacion.valida) {
        message.error('No puedes modificar esta predicción');
        return;
      }
      
      // Establecer todos los valores ANTES de abrir el modal
      setPartidoSeleccionado(partido);
      setPrediccionMostrar(validacion.prediccion || null);
      
      // Establecer goles si hay predicción previa
      if (validacion.prediccion) {
        setGolesLocal(validacion.prediccion.home_score || 0);
        setGolesVisitante(validacion.prediccion.away_score || 0);
        
        // Cargar puntos extras si existen
        const primerGol = (validacion.prediccion as any)?.initial_goal || (validacion.prediccion as any)?.primer_goleador;
        const nombreJugador = (validacion.prediccion as any)?.anotador || (validacion.prediccion as any)?.nombre_jugador;
        
        if (primerGol) {
          // Convertir "HOME" a "home" y "AWAY" a "away"
          const goleadorFormato = primerGol.toLowerCase() === 'home' ? 'home' : primerGol.toLowerCase() === 'away' ? 'away' : primerGol;
          setPrimerGoleador(goleadorFormato);
        }
        
        if (nombreJugador) {
          setJugadorSeleccionado({
            strPlayer: nombreJugador,
            strCutout: null
          });
        }
      } else {
        setGolesLocal(0);
        setGolesVisitante(0);
      }
      
      setBusquedaJugador('');
      setJugadoresEncontrados([]);
      setModalVisible(true);
    } catch (error) {
      console.error('Error al validar predicción:', error);
      message.error('Error al validar la predicción');
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setPartidoSeleccionado(null);
    setPrediccionMostrar(null);
    setGolesLocal(0);
    setGolesVisitante(0);
    setPrimerGoleador('');
    setBusquedaJugador('');
    setJugadoresEncontrados([]);
    setJugadorSeleccionado(null);
  };

  const buscarJugador = async (nombre: string) => {
    if (!nombre.trim()) {
      setJugadoresEncontrados([]);
      return;
    }

    try {
      setCargandoJugadores(true);
      // Convertir espacios a guiones bajos
      const nombreFormato = nombre.trim().replace(/\s+/g, '_');
      console.log('Buscando jugador:', nombreFormato);
      
      const respuesta = await fetch(
        `https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${nombreFormato}`
      );
      const datos = await respuesta.json();
      
      console.log('Datos de API:', datos);
      
      if (datos.player && Array.isArray(datos.player)) {
        console.log('Jugadores encontrados:', datos.player.length);
        setJugadoresEncontrados(datos.player);
      } else {
        console.log('No se encontraron jugadores');
        setJugadoresEncontrados([]);
      }
    } catch (error) {
      console.error('Error al buscar jugador:', error);
      message.error('Error al buscar el jugador');
      setJugadoresEncontrados([]);
    } finally {
      setCargandoJugadores(false);
    }
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

        console.log('Enviando predicción:', {
          usuario: String(user.id),
          partido: partidoSeleccionado.id,
          prediccion,
          golesLocal,
          golesVisitante,
          idPrediccion: prediccionMostrar?.id ? String(prediccionMostrar.id) : undefined,
          primerGoleador: primerGoleador || undefined,
          nombreJugador: jugadorSeleccionado?.strPlayer || undefined
        });

        // Llamar al servicio para guardar la predicción con los goles y puntos extras
        await quinielaService.guardarPrediccion(
          String(user.id),
          partidoSeleccionado.id,
          prediccion,
          golesLocal,
          golesVisitante,
          prediccionMostrar?.id ? String(prediccionMostrar.id) : undefined,
          primerGoleador,
          jugadorSeleccionado?.strPlayer
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
        <div className="torneo-select">
          <span className="torneo-select-label">Torneo</span>
          <Select
            value={torneoSeleccionado || undefined}
            onChange={setTorneoSeleccionado}
            style={{ width: '100%', maxWidth: 320 }}
            size="large"
            placeholder="Selecciona un torneo"
            loading={torneos.length === 0}
            options={torneos.map(torneo => ({
              label: torneo.name,
              value: torneo.id,
            }))}
          />
        </div>

        {/* Tabs para Desktop */}
        <div className="filtros-desktop">
          <Tabs
            activeKey={filtroJornada}
            onChange={setFiltroJornada}
            items={stagesActuales.map(stage => ({
              label: stage.name,
              key: stage.stage,
            }))}
          />
        </div>

        {/* Select para Mobile */}
        <div className="filtros-mobile">
          <Select
            value={filtroJornada}
            onChange={setFiltroJornada}
            style={{ width: '100%' }}
            size="large"
            options={stagesActuales.map(stage => ({
              label: stage.name,
              value: stage.stage,
            }))}
          />
        </div>
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
            <h2 style={{ marginBottom: '8px' }}>
              {prediccionMostrar ? 'Modifica tu predicción' : 'Haz tu predicción'}
            </h2>
            
            {/* Mostrar predicción anterior si existe */}
            {prediccionMostrar && (
              <div style={{ 
                marginBottom: '24px', 
                padding: '12px',
                backgroundColor: '#f0f0f0',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#666'
              }}>
                <p style={{ margin: '0' }}>
                  Tu predicción anterior: <strong>
                    {prediccionMostrar.prediction === 'HOME' ? partidoSeleccionado.equipo1.nombre : 
                     prediccionMostrar.prediction === 'AWAY' ? partidoSeleccionado.equipo2.nombre : 
                     'Empate'} {prediccionMostrar.home_score} - {prediccionMostrar.away_score}
                  </strong>
                </p>
              </div>
            )}
            
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

            {/* Inputs de goles */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: '8px', fontWeight: 'bold', textAlign: 'left' }}>
                  Goles - {partidoSeleccionado.equipo1.nombre}
                </p>
                <Input
                  type="number"
                  min="0"
                  value={golesLocal}
                  onChange={(e) => setGolesLocal(parseInt(e.target.value) || 0)}
                  placeholder="Ingresa los goles"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: '8px', fontWeight: 'bold', textAlign: 'left' }}>
                  Goles - {partidoSeleccionado.equipo2.nombre}
                </p>
                <Input
                  type="number"
                  min="0"
                  value={golesVisitante}
                  onChange={(e) => setGolesVisitante(parseInt(e.target.value) || 0)}
                  placeholder="Ingresa los goles"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            {/* Desplegable de Puntos Extras */}
            <div style={{ marginBottom: '24px' }}>
              <Collapse
                items={[
                  {
                    key: '1',
                    label: 'Puntos extras',
                    children: (
                      <div>
                        <p style={{ marginBottom: '12px', fontWeight: 'bold', textAlign: 'left' }}>
                          Quién anotará primero
                        </p>
                        <Select
                          placeholder="Selecciona un equipo"
                          value={primerGoleador || undefined}
                          onChange={setPrimerGoleador}
                          options={[
                            {
                              label: partidoSeleccionado.equipo1.nombre,
                              value: 'home'
                            },
                            {
                              label: partidoSeleccionado.equipo2.nombre,
                              value: 'away'
                            }
                          ]}
                          style={{ width: '100%', marginBottom: '20px' }}
                        />

                        {/* Buscador de Jugador */}
                        <p style={{ marginBottom: '12px', fontWeight: 'bold', textAlign: 'left', marginTop: '20px' }}>
                          Buscar jugador que anotará
                        </p>
                        <Input
                          placeholder="Ingresa nombre del jugador (ej: Lionel Messi)"
                          value={busquedaJugador}
                          onChange={(e) => {
                            setBusquedaJugador(e.target.value);
                            buscarJugador(e.target.value);
                          }}
                          style={{ marginBottom: '12px' }}
                          allowClear
                        />

                        {/* Resultados de búsqueda */}
                        {cargandoJugadores && (
                          <div style={{ textAlign: 'center', padding: '12px' }}>
                            <Spin size="small" />
                          </div>
                        )}

                        {!cargandoJugadores && jugadoresEncontrados.length > 0 && (
                          <div style={{ 
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            marginBottom: '12px'
                          }}>
                            {jugadoresEncontrados.map((jugador) => (
                              <div
                                key={jugador.idPlayer}
                                onClick={() => {
                                  setJugadorSeleccionado(jugador);
                                  setBusquedaJugador('');
                                  setJugadoresEncontrados([]);
                                }}
                                style={{
                                  padding: '12px',
                                  borderBottom: '1px solid #f0f0f0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                {jugador.strCutout && (
                                  <img
                                    src={jugador.strCutout}
                                    alt={jugador.strPlayer}
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '4px',
                                      objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                                <span>{jugador.strPlayer}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Jugador Seleccionado */}
                        {jugadorSeleccionado && (
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#e6f7ff',
                            borderRadius: '4px',
                            border: '1px solid #91d5ff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '12px'
                          }}>
                            {jugadorSeleccionado.strCutout && (
                              <img
                                src={jugadorSeleccionado.strCutout}
                                alt={jugadorSeleccionado.strPlayer}
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '4px',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                            <div>
                              <p style={{ margin: '0', fontWeight: 'bold' }}>
                                {jugadorSeleccionado.strPlayer}
                              </p>
                              <Button
                                type="text"
                                size="small"
                                danger
                                onClick={() => setJugadorSeleccionado(null)}
                              >
                                Cambiar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
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
              
              {/* Mostrar empate solo en fase de grupos */}
              {partidoSeleccionado.stage.startsWith('group_stage_') && (
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
              )}

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
