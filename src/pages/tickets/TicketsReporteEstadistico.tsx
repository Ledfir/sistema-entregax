import { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin, DatePicker, Button, Modal } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, InboxOutlined, UserOutlined, EnvironmentOutlined, SearchOutlined, BarChartOutlined, DownloadOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import ticketsService from '@/services/ticketsService';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import './Tickets.css';

const { RangePicker } = DatePicker;

interface TicketEstadistica {
  total: number;
  pendientes: number;
  enProceso: number;
  finalizados: number;
  rechazados: number;
  archivados: number;
  porUbicacion: {
    [key: string]: number;
  };
  porCategoria: {
    [key: string]: number;
  };
  porAsesor: {
    [key: string]: number;
  };
  tiempoPromedio: number;
}

interface TicketData {
  token: string;
  name: string;
  category: string;
  state: string;
  created: string;
  designado: string;
  asesor: string;
  place: string;
  suite: string;
  cliente: string;
}

export const TicketsReporteEstadistico = () => {
  const [loading, setLoading] = useState(false);
  // Estadísticas globales del API (para las cards, no cambian con filtros)
  const [estadisticasGlobales, setEstadisticasGlobales] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    finalizados: 0,
    rechazados: 0,
  });
  // Estadísticas para las tablas (sí cambian con filtros)
  const [estadisticas, setEstadisticas] = useState<TicketEstadistica>({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    finalizados: 0,
    rechazados: 0,
    archivados: 0,
    porUbicacion: {},
    porCategoria: {},
    porAsesor: {},
    tiempoPromedio: 0,
  });
  const [_ticketsActivos, setTicketsActivos] = useState<TicketData[]>([]);
  const [rangoFechas, setRangoFechas] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  
  // Estados para controlar modales de gráficas
  const [modalUbicacionVisible, setModalUbicacionVisible] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [modalAsesorVisible, setModalAsesorVisible] = useState(false);

  // Refs para capturar las gráficas
  const chartUbicacionRef = useRef<HTMLDivElement>(null);
  const chartCategoriaRef = useRef<HTMLDivElement>(null);
  const chartAsesorRef = useRef<HTMLDivElement>(null);

  // Funciones para exportar gráficas
  const exportarGrafica = async (ref: React.RefObject<HTMLDivElement>, nombreArchivo: string) => {
    if (ref.current) {
      try {
        const canvas = await html2canvas(ref.current, {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${nombreArchivo}_${dayjs().format('YYYY-MM-DD_HH-mm')}.png`;
        link.href = url;
        link.click();
      } catch (error) {
        console.error('Error al exportar gráfica:', error);
      }
    }
  };

  useEffect(() => {
    document.title = 'Reporte Estadístico - Tickets';
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [totalesResponse, activosResponse] = await Promise.all([
        ticketsService.getTicketsTotales(),
        ticketsService.getTicketsActivos(),
      ]);

      const activos = activosResponse.status === 'success' ? activosResponse.data : [];

      setTicketsActivos(activos);

      // Resetear filtro de fechas al cargar datos nuevos
      setRangoFechas(null);
      
      // Cargar estadísticas globales desde el endpoint (para las cards)
      if (totalesResponse.status === 'success' && totalesResponse.data) {
        const datosGlobales = {
          total: parseInt(totalesResponse.data.total) || 0,
          pendientes: totalesResponse.data.pendientes || 0,
          enProceso: totalesResponse.data.en_proceso || 0,
          finalizados: totalesResponse.data.finalizados || 0,
          rechazados: totalesResponse.data.rechazados || 0,
        };
        setEstadisticasGlobales(datosGlobales);
        // Las tablas permanecen vacías hasta que se seleccione un rango de fechas
      } else {
        // Si el API falla, calcular solo las cards localmente
        const datosGlobales = {
          total: activos.length,
          pendientes: activos.filter(t => t.state === 'Pendiente').length,
          enProceso: activos.filter(t => t.state === 'En proceso').length,
          finalizados: activos.filter(t => t.state === 'Finalizado').length,
          rechazados: activos.filter(t => t.state === 'Rechazado').length,
        };
        setEstadisticasGlobales(datosGlobales);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRangoFechasChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setRangoFechas(dates);
    
    // Si se limpia el filtro, vaciar las tablas
    if (!dates || !dates[0] || !dates[1]) {
      setEstadisticas({
        ...estadisticas,
        porUbicacion: {},
        porCategoria: {},
        porAsesor: {},
      });
    }
  };

  const handleFiltrar = async () => {
    if (!rangoFechas || !rangoFechas[0] || !rangoFechas[1]) {
      return;
    }

    setLoading(true);
    try {
      const fechaInicio = rangoFechas[0].format('YYYY-MM-DD');
      const fechaFin = rangoFechas[1].format('YYYY-MM-DD');

      console.log('Enviando petición con fechas:', { fechaInicio, fechaFin });
      const response = await ticketsService.getReportTickets(fechaInicio, fechaFin);
      console.log('Respuesta completa del API:', response);
      
      if (response.status === 'success' && response.data) {
        console.log('Datos recibidos:', response.data);
        
        // Procesar los datos recibidos del endpoint
        const porUbicacion: { [key: string]: number } = {};
        const porCategoria: { [key: string]: number } = {};
        const porAsesor: { [key: string]: number } = {};

        // Procesar ubicaciones (nota: el API devuelve "ubication" sin c)
        if (response.data.ubication && Array.isArray(response.data.ubication)) {
          console.log('Procesando ubicaciones:', response.data.ubication);
          response.data.ubication.forEach((item: any) => {
            const ubicacion = item.ubicacion || 'Sin ubicación';
            porUbicacion[ubicacion] = parseInt(item.total) || 0;
          });
        }

        // Procesar categorías (nota: el API devuelve "categorias" en plural)
        if (response.data.categories && Array.isArray(response.data.categories)) {
          console.log('Procesando categorías:', response.data.categories);
          response.data.categories.forEach((item: any) => {
            const categoria = item.categoria || 'Sin categoría';
            porCategoria[categoria] = parseInt(item.total) || 0;
          });
        }

        // Procesar asesores (nota: el API devuelve "asesores" en plural y usa "name")
        if (response.data.asesores && Array.isArray(response.data.asesores)) {
          console.log('Procesando asesores:', response.data.asesores);
          response.data.asesores.forEach((item: any) => {
            const asesor = item.name || 'Sin asesor';
            porAsesor[asesor] = parseInt(item.total) || 0;
          });
        }

        console.log('Datos procesados:', { porUbicacion, porCategoria, porAsesor });

        // Actualizar estadísticas con los datos procesados
        setEstadisticas({
          ...estadisticas,
          porUbicacion,
          porCategoria,
          porAsesor,
        });
      } else {
        console.log('No hay datos o status no es success:', response);
      }
    } catch (error) {
      console.error('Error al obtener reporte de tickets:', error);
      // Si hay error, vaciar las tablas
      setEstadisticas({
        ...estadisticas,
        porUbicacion: {},
        porCategoria: {},
        porAsesor: {},
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular total de ubicaciones
  const totalUbicaciones = Object.values(estadisticas.porUbicacion).reduce((sum, val) => sum + val, 0);
  
  const datosTablaUbicacion = Object.entries(estadisticas.porUbicacion).map(([ubicacion, cantidad]) => ({
    key: ubicacion,
    ubicacion,
    cantidad,
    porcentaje: totalUbicaciones > 0 ? ((cantidad / totalUbicaciones) * 100).toFixed(1) : '0.0',
  }));

  // Calcular total de categorías
  const totalCategorias = Object.values(estadisticas.porCategoria).reduce((sum, val) => sum + val, 0);
  
  const datosTablaCategoria = Object.entries(estadisticas.porCategoria).map(([categoria, cantidad]) => ({
    key: categoria,
    categoria,
    cantidad,
    porcentaje: totalCategorias > 0 ? ((cantidad / totalCategorias) * 100).toFixed(1) : '0.0',
  }));

  // Calcular total de asesores
  const totalAsesores = Object.values(estadisticas.porAsesor).reduce((sum, val) => sum + val, 0);
  
  const datosTablaAsesor = Object.entries(estadisticas.porAsesor).map(([asesor, cantidad]) => ({
    key: asesor,
    asesor,
    cantidad,
    porcentaje: totalAsesores > 0 ? ((cantidad / totalAsesores) * 100).toFixed(1) : '0.0',
  }));

  const columnasUbicacion: ColumnsType<any> = [
    { title: 'Ubicación', dataIndex: 'ubicacion', key: 'ubicacion' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', align: 'center' },
    { 
      title: 'Porcentaje', 
      dataIndex: 'porcentaje', 
      key: 'porcentaje', 
      align: 'center',
      render: (value) => <Tag color="blue">{value}%</Tag>
    },
  ];

  const columnasCategoria: ColumnsType<any> = [
    { title: 'Categoría', dataIndex: 'categoria', key: 'categoria' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', align: 'center' },
    { 
      title: 'Porcentaje', 
      dataIndex: 'porcentaje', 
      key: 'porcentaje', 
      align: 'center',
      render: (value) => <Tag color="green">{value}%</Tag>
    },
  ];

  const columnasAsesor: ColumnsType<any> = [
    { title: 'Asesor', dataIndex: 'asesor', key: 'asesor' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', align: 'center' },
    { 
      title: 'Porcentaje', 
      dataIndex: 'porcentaje', 
      key: 'porcentaje', 
      align: 'center',
      render: (value) => <Tag color="purple">{value}%</Tag>
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Estadísticas</h2>}
        style={{ marginBottom: 24 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#666' }}>Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            {/* Leyenda de Estadísticas Globales */}
            <div style={{ 
              marginBottom: 20, 
              paddingBottom: 12,
              borderBottom: '2px solid #e8e8e8'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: 600, 
                color: '#333',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Estadísticas Globales
              </h3>
            </div>
            
            {/* Estadísticas Generales */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }} justify="space-around">
              <Col xs={24} sm={12} md={8} lg={4} xl={4}>
                <Card hoverable style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <Statistic
                    title={<span style={{ color: 'white' }}>Total Tickets</span>}
                    value={estadisticasGlobales.total}
                    valueStyle={{ color: 'white' }}
                    prefix={<InboxOutlined />}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={4} xl={4}>
                <Card hoverable style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <Statistic
                    title={<span style={{ color: 'white' }}>Pendientes</span>}
                    value={estadisticasGlobales.pendientes}
                    valueStyle={{ color: 'white' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={4} xl={4}>
                <Card hoverable style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <Statistic
                    title={<span style={{ color: 'white' }}>En Proceso</span>}
                    value={estadisticasGlobales.enProceso}
                    valueStyle={{ color: 'white' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={4} xl={4}>
                <Card hoverable style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                  <Statistic
                    title={<span style={{ color: 'white' }}>Finalizados</span>}
                    value={estadisticasGlobales.finalizados}
                    valueStyle={{ color: 'white' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={4} xl={4}>
                <Card hoverable style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', color: 'white' }}>
                  <Statistic
                    title={<span style={{ color: 'white' }}>Rechazados</span>}
                    value={estadisticasGlobales.rechazados}
                    valueStyle={{ color: 'white' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            {/* Leyenda de Estadísticas por rango de fechas */}
            <div style={{ 
              marginBottom: 20, 
              paddingBottom: 12,
              borderBottom: '2px solid #e8e8e8'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: 600, 
                color: '#333',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Estadísticas por Rango de Fechas
              </h3>
            </div>
            {/* Selector de Rango de Fechas */}
            <div style={{ 
              marginBottom: 24, 
              padding: '16px', 
              background: '#f5f5f5', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>
                Filtrar por rango de fechas:
              </span>
              <RangePicker
                value={rangoFechas}
                onChange={handleRangoFechasChange}
                format="DD/MM/YYYY"
                placeholder={['Fecha inicial', 'Fecha final']}
                style={{ minWidth: 280 }}
                allowClear
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleFiltrar}
                disabled={!rangoFechas || !rangoFechas[0] || !rangoFechas[1]}
              >
                Filtrar
              </Button>
              {rangoFechas && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Mostrando tickets desde {rangoFechas[0]?.format('DD/MM/YYYY')} hasta {rangoFechas[1]?.format('DD/MM/YYYY')}
                </span>
              )}
            </div>

            {/* Tablas de Desglose */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={8}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <EnvironmentOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                        <span>Tickets por Ubicación</span>
                      </div>
                      <Button 
                        type="link" 
                        icon={<BarChartOutlined />}
                        size="small"
                        onClick={() => setModalUbicacionVisible(true)}
                      >
                        Ver gráfico
                      </Button>
                    </div>
                  }
                  bordered
                  style={{ height: '100%' }}
                >
                  <Table
                    columns={columnasUbicacion}
                    dataSource={datosTablaUbicacion}
                    pagination={false}
                    size="small"
                    scroll={{ y: 300 }}
                    locale={{ emptyText: 'Selecciona un rango de fechas para ver las estadísticas' }}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <InboxOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                        <span>Tickets por Categoría</span>
                      </div>
                      <Button 
                        type="link" 
                        icon={<BarChartOutlined />}
                        size="small"
                        onClick={() => setModalCategoriaVisible(true)}
                      >
                        Ver gráfico
                      </Button>
                    </div>
                  }
                  bordered
                  style={{ height: '100%' }}
                >
                  <Table
                    columns={columnasCategoria}
                    dataSource={datosTablaCategoria}
                    pagination={false}
                    size="small"
                    scroll={{ y: 300 }}
                    locale={{ emptyText: 'Selecciona un rango de fechas para ver las estadísticas' }}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserOutlined style={{ fontSize: 18, color: '#722ed1' }} />
                        <span>Tickets por Asesor</span>
                      </div>
                      <Button 
                        type="link" 
                        icon={<BarChartOutlined />}
                        size="small"
                        onClick={() => setModalAsesorVisible(true)}
                      >
                        Ver gráfico
                      </Button>
                    </div>
                  }
                  bordered
                  style={{ height: '100%' }}
                >
                  <Table
                    columns={columnasAsesor}
                    dataSource={datosTablaAsesor}
                    pagination={false}
                    size="small"
                    scroll={{ y: 300 }}
                    locale={{ emptyText: 'Selecciona un rango de fechas para ver las estadísticas' }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Card>

      {/* Modales con gráficas */}
      <Modal
        title="Gráfica de Tickets por Ubicación"
        open={modalUbicacionVisible}
        onCancel={() => setModalUbicacionVisible(false)}
        footer={
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => exportarGrafica(chartUbicacionRef, 'tickets_por_ubicacion')}
          >
            Descargar PNG
          </Button>
        }
        width={900}
      >
        <div ref={chartUbicacionRef} style={{ padding: '20px 0', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datosTablaUbicacion}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="ubicacion" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                style={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [`${value} tickets`, 'Cantidad']}
                labelStyle={{ color: '#333' }}
              />
              <Bar dataKey="cantidad" fill="#1890ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Modal>

      <Modal
        title="Gráfica de Tickets por Categoría"
        open={modalCategoriaVisible}
        onCancel={() => setModalCategoriaVisible(false)}
        footer={
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => exportarGrafica(chartCategoriaRef, 'tickets_por_categoria')}
          >
            Descargar PNG
          </Button>
        }
        width={900}
      >
        <div ref={chartCategoriaRef} style={{ padding: '20px 0', height: 450 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datosTablaCategoria.map(item => ({
                  name: item.categoria,
                  value: item.cantidad
                }))}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                fill="#52c41a"
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
                labelLine={true}
              >
                {datosTablaCategoria.map((_, index) => {
                  const colors = ['#52c41a', '#73d13d', '#95de64', '#b7eb8f', '#d9f7be', '#f6ffed', '#389e0d', '#237804'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${value} tickets`, 'Cantidad']}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => {
                  const item = datosTablaCategoria.find(d => d.categoria === value);
                  return `${value} (${item?.porcentaje}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Modal>

      <Modal
        title="Gráfica de Tickets por Asesor"
        open={modalAsesorVisible}
        onCancel={() => setModalAsesorVisible(false)}
        footer={
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => exportarGrafica(chartAsesorRef, 'tickets_por_asesor')}
          >
            Descargar PNG
          </Button>
        }
        width={900}
      >
        <div ref={chartAsesorRef} style={{ padding: '20px 0', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datosTablaAsesor}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="asesor" type="category" width={150} />
              <Tooltip 
                formatter={(value: any) => [`${value} tickets`, 'Cantidad']}
                labelStyle={{ color: '#333' }}
              />
              <Bar dataKey="cantidad" fill="#722ed1" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Modal>
    </div>
  );
};

export default TicketsReporteEstadistico;
