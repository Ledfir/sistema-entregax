import { useState, useEffect } from 'react';
import { Card, Tabs, Button, Row, Col, Avatar, Tag, Spin, Empty, message, Modal, Input, Select, Collapse, Slider } from 'antd';
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
  const [equipoModal, setEquipoModal] = useState<any>(null);
  const [modalEquipoVisible, setModalEquipoVisible] = useState(false);
  const [cargandoEquipo, setCargandoEquipo] = useState(false);
  const [golDescansoLocal, setGolDescansoLocal] = useState<number>(0);
  const [golDescansoVisitante, setGolDescansoVisitante] = useState<number>(0);
  const [totalCorners, setTotalCorners] = useState<number>(8);
  const [habraPenal, setHabraPenal] = useState<string>('');
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
        
        // Cargar goles de descanso
        const golDescansoLocalVal = (validacion.prediccion as any)?.home_score_medio_tiempo;
        const golDescansoVisitanteVal = (validacion.prediccion as any)?.away_score_medio_tiempo;
        if (golDescansoLocalVal !== undefined) {
          setGolDescansoLocal(parseInt(golDescansoLocalVal) || 0);
        }
        if (golDescansoVisitanteVal !== undefined) {
          setGolDescansoVisitante(parseInt(golDescansoVisitanteVal) || 0);
        }
        
        // Cargar corners
        const cornersVal = (validacion.prediccion as any)?.corners;
        if (cornersVal !== undefined) {
          setTotalCorners(parseInt(cornersVal) || 8);
        }
        
        // Cargar penales (convertir 1/0 a si/no)
        const penalsVal = (validacion.prediccion as any)?.penals;
        if (penalsVal !== undefined) {
          const penalFormato = penalsVal === '1' || penalsVal === 1 ? 'si' : 'no';
          setHabraPenal(penalFormato);
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
    setGolDescansoLocal(0);
    setGolDescansoVisitante(0);
    setTotalCorners(8);
    setHabraPenal('');
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

  const buscarEquipo = async (nombreEquipo: string) => {
    try {
      setCargandoEquipo(true);
      console.log('Buscando equipo:', nombreEquipo);

      const respuesta = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${nombreEquipo}`
      );
      const datos = await respuesta.json();

      console.log('Datos de equipo:', datos);

      if (datos.teams && Array.isArray(datos.teams) && datos.teams.length > 0) {
        setEquipoModal(datos.teams[0]);
        setModalEquipoVisible(true);
      } else {
        message.error('No se encontró información del equipo');
      }
    } catch (error) {
      console.error('Error al buscar equipo:', error);
      message.error('Error al buscar el equipo');
    } finally {
      setCargandoEquipo(false);
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
          nombreJugador: jugadorSeleccionado?.strPlayer || undefined,
          golDescansoLocal,
          golDescansoVisitante,
          totalCorners,
          habraPenal
        });

        // Llamar al servicio para guardar la predicción con los goles y puntos extras
        await quinielaService.guardarPrediccion(
          String(user.id),
          partidoSeleccionado.id,
          prediccion,
          golesLocal,
          golesVisitante,
          prediccionMostrar?.id ? String(prediccionMostrar.id) : undefined,
          primerGoleador || undefined,
          jugadorSeleccionado?.strPlayer || undefined,
          golDescansoLocal,
          golDescansoVisitante,
          totalCorners || undefined,
          habraPenal || undefined
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
            style={{ marginBottom: '8px', borderColor: '#000000', cursor: 'pointer' }}
            onClick={() => buscarEquipo(partido.equipo1.nombre)}
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
            style={{ marginBottom: '8px', borderColor: '#000000', cursor: 'pointer' }}
            onClick={() => buscarEquipo(partido.equipo2.nombre)}
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
            <h2 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 600 }}>
              Haz tu predicción
            </h2>
            
            {/* Resumen del partido - MEJORADO */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '32px',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <Avatar
                  size={80}
                  src={partidoSeleccionado.equipo1.logo}
                  style={{ marginBottom: '12px' }}
                />
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {partidoSeleccionado.equipo1.nombre}
                </div>
              </div>
              <div style={{ color: '#999', fontSize: '16px', fontWeight: 'bold' }}>VS</div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <Avatar
                  size={80}
                  src={partidoSeleccionado.equipo2.logo}
                  style={{ marginBottom: '12px' }}
                />
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {partidoSeleccionado.equipo2.nombre}
                </div>
              </div>
            </div>

            {/* Inputs de goles */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: '8px', fontWeight: 'bold', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                  Goles - {partidoSeleccionado.equipo1.nombre}
                </p>
                <Input
                  type="number"
                  min="0"
                  value={golesLocal}
                  onChange={(e) => setGolesLocal(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  style={{ fontSize: '24px', textAlign: 'center', fontWeight: 'bold', height: '56px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px', color: '#999' }}>
                –
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: '8px', fontWeight: 'bold', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                  Goles - {partidoSeleccionado.equipo2.nombre}
                </p>
                <Input
                  type="number"
                  min="0"
                  value={golesVisitante}
                  onChange={(e) => setGolesVisitante(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  style={{ fontSize: '24px', textAlign: 'center', fontWeight: 'bold', height: '56px' }}
                />
              </div>
            </div>

            {/* Desplegable de Puntos Extras */}
            <div style={{ marginBottom: '24px' }}>
              <Collapse
                items={[
                  {
                    key: '1',
                    label: <span style={{ fontWeight: 'bold', color: '#1890ff' }}>◎ PUNTOS EXTRA</span>,
                    extra: <span style={{ fontSize: '12px', color: '#999' }}>Maximiza tus puntos</span>,
                    children: (
                      <div>
                        {/* Quién anotará primero */}
                        <p style={{ marginBottom: '12px', fontWeight: 'bold', textAlign: 'left', fontSize: '14px' }}>
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
                          style={{ width: '100%', marginBottom: '24px' }}
                        />

                        {/* Resultado al descanso - NUEVO */}
                        <p style={{ marginBottom: '12px', fontWeight: 'bold', textAlign: 'left', fontSize: '14px' }}>
                          Resultado al descanso
                        </p>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
                          <Input
                            type="number"
                            min="0"
                            value={golDescansoLocal}
                            onChange={(e) => setGolDescansoLocal(parseInt(e.target.value) || 0)}
                            placeholder="0"
                            style={{ fontSize: '16px', textAlign: 'center', fontWeight: 'bold', height: '40px' }}
                          />
                          <span style={{ color: '#999', fontSize: '16px' }}>vs</span>
                          <Input
                            type="number"
                            min="0"
                            value={golDescansoVisitante}
                            onChange={(e) => setGolDescansoVisitante(parseInt(e.target.value) || 0)}
                            placeholder="0"
                            style={{ fontSize: '16px', textAlign: 'center', fontWeight: 'bold', height: '40px' }}
                          />
                        </div>

                        {/* Total de Corners - NUEVO */}
                        <p style={{ marginBottom: '12px', fontWeight: 'bold', textAlign: 'left', fontSize: '14px' }}>
                          Mas de {totalCorners} corners
                        </p>
                        <div style={{ marginBottom: '24px' }}>
                          <Slider
                            min={0}
                            max={20}
                            value={totalCorners}
                            onChange={setTotalCorners}
                            marks={{ 0: '0', 10: '10', 20: '20+' }}
                          />
                          <span style={{ color: '#1890ff', fontWeight: 'bold', fontSize: '14px' }}>{totalCorners}</span>
                        </div>

                        {/* ¿Habrá penal? - NUEVO */}
                        <p style={{ marginBottom: '12px', fontWeight: 'bold', textAlign: 'left', fontSize: '14px' }}>
                          ¿Habrá penal?
                        </p>
                        <Select
                          placeholder="Selecciona una opción"
                          value={habraPenal || undefined}
                          onChange={setHabraPenal}
                          options={[
                            {
                              label: 'Sí',
                              value: 'si'
                            },
                            {
                              label: 'No',
                              value: 'no'
                            }
                          ]}
                          style={{ width: '100%', marginBottom: '24px' }}
                        />

                        {/* Buscador de Jugador */}
                        <p style={{ marginBottom: '12px', fontWeight: 'bold', textAlign: 'left', fontSize: '14px' }}>
                          Buscar jugador que anotará
                        </p>
                        <Input
                          placeholder="Ej: Morata..."
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
              Empaté
            </Button>
          </div>
        )}
      </Modal>
      {/* Modal de Equipo */}
      <Modal
        title={null}
        open={modalEquipoVisible}
        onCancel={() => setModalEquipoVisible(false)}
        footer={null}
        width={600}
        centered
        bodyStyle={{ padding: '32px' }}
        loading={cargandoEquipo}
      >
        {equipoModal && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '24px' }}>{equipoModal.strTeam}</h2>

            {/* Logo del equipo */}
            {equipoModal.strBadge && (
              <div style={{ marginBottom: '24px' }}>
                <img
                  src={equipoModal.strBadge}
                  alt={equipoModal.strTeam}
                  style={{
                    maxHeight: '150px',
                    maxWidth: '150px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}

            {/* Información del equipo */}
            <div style={{ textAlign: 'left', marginTop: '24px' }}>
              {equipoModal.strCountry && (
                <p>
                  <strong>País:</strong> {equipoModal.strCountry}
                </p>
              )}
              {equipoModal.intFormedYear && (
                <p>
                  <strong>Fundado:</strong> {equipoModal.intFormedYear}
                </p>
              )}
              {equipoModal.strLeague && (
                <p>
                  <strong>Liga:</strong> {equipoModal.strLeague}
                </p>
              )}
              {equipoModal.strManager && (
                <p>
                  <strong>Entrenador:</strong> {equipoModal.strManager}
                </p>
              )}
              {equipoModal.strStadium && (
                <p>
                  <strong>Estadio:</strong> {equipoModal.strStadium}
                </p>
              )}
              {equipoModal.intStadiumCapacity && (
                <p>
                  <strong>Capacidad del Estadio:</strong> {equipoModal.intStadiumCapacity?.toLocaleString()}
                </p>
              )}

              {/* Descripción */}
              {equipoModal.strDescriptionEN && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Descripción:</p>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                    {equipoModal.strDescriptionEN}
                  </p>
                </div>
              )}
            </div>

            <Button
              type="primary"
              style={{ marginTop: '24px', width: '100%' }}
              onClick={() => setModalEquipoVisible(false)}
            >
              Cerrar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Partidos;
