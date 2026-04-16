import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Row, Col, message, Table, Tag, Dropdown, Input, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, MoreOutlined, DownloadOutlined } from '@ant-design/icons';
import { userService } from '@/services/userService';
import { clienteService } from '@/services/clienteService';
import { cotizacionesService } from '@/services/cotizacionesService';
import { humanizarFecha } from '@/utils/dateUtils';

const { Option } = Select;

interface Cliente {
  id: number | string;
  nombre: string;
}

interface Asesor {
  id: number | string;
  nombre: string;
}

interface CotizacionTdiUsa {
  id: number | string;
  ctz: string;
  estado: string;
  cliente: string;
  asesor: string;
  total: number;
  fecha_creacion: string;
}

const CotizacionesTdiUsa: React.FC = () => {
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingAsesores, setLoadingAsesores] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | undefined>(undefined);
  const [asesorSeleccionado, setAsesorSeleccionado] = useState<string | undefined>(undefined);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [buscandoAsesor, setBuscandoAsesor] = useState(false);
  const [cotizaciones, setCotizaciones] = useState<CotizacionTdiUsa[]>([]);
  const [loadingTabla, setLoadingTabla] = useState(false);
  const [tituloTabla, setTituloTabla] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [modalPdfVisible, setModalPdfVisible] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [ctzSeleccionada, setCtzSeleccionada] = useState<string>('');

  useEffect(() => {
    cargarClientes();
    cargarAsesores();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await clienteService.getAll();
      
      // Mapear a la estructura necesaria con formato: (clavecliente) nombre
      const clientesMapeados = response.map((item: any) => ({
        id: item.token,
        nombre: `(${item.clavecliente}) ${item.nombre}`
      }));
      
      setClientes(clientesMapeados);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      message.error('Error al cargar la lista de clientes');
    } finally {
      setLoadingClientes(false);
    }
  };

  const cargarAsesores = async () => {
    try {
      setLoadingAsesores(true);
      const response = await userService.list('', 1, 1000);
      
      // Mapear a la estructura necesaria
      const asesoresFiltrados = response.items
        .map((item: any) => ({
          id: item.token,
          nombre: item.name
        }));
      
      setAsesores(asesoresFiltrados);
    } catch (error) {
      console.error('Error al cargar asesores:', error);
      message.error('Error al cargar la lista de asesores');
    } finally {
      setLoadingAsesores(false);
    }
  };

  const mapearEstado = (estado: number | string): string => {
    const estadoNum = typeof estado === 'string' ? parseInt(estado) : estado;
    switch (estadoNum) {
      case 1:
        return 'Nuevo';
      case 2:
        return 'Pagado';
      default:
        return 'Nuevo';
    }
  };

  const buscarPorCliente = async () => {
    if (!clienteSeleccionado) {
      message.warning('Por favor selecciona un cliente');
      return;
    }

    setBuscandoCliente(true);
    setLoadingTabla(true);
    try {
      const response = await cotizacionesService.listTdiUsa(clienteSeleccionado, 1);
      
      // Mostrar mensaje de éxito de la API
      if (response.message) {
        message.success(response.message);
      }

      // Procesar los datos recibidos
      const data = response?.data || [];
      const cotizacionesMapeadas = data.map((item: any) => ({
        id: item.id || item.ctz,
        ctz: item.ctz,
        estado: mapearEstado(item.estado || item.state),
        cliente: item.cliente || item.customer,
        asesor: item.asesor || item.advisor,
        total: parseFloat(item.total || item.amount || 0),
        fecha_creacion: item.fecha_creacion || item.created_at || item.created
      }));

      setCotizaciones(cotizacionesMapeadas);
      setCurrentPage(1); // Resetear a página 1
      
      // Obtener nombre del cliente para el título
      const clienteNombre = clientes.find(c => c.id === clienteSeleccionado)?.nombre || '';
      setTituloTabla(`Historial de CTZ del cliente ${clienteNombre}`);
      
    } catch (error: any) {
      console.error('Error al buscar cotizaciones:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al buscar cotizaciones';
      message.error(errorMessage);
      setCotizaciones([]);
    } finally {
      setBuscandoCliente(false);
      setLoadingTabla(false);
    }
  };

  const buscarPorAsesor = async () => {
    if (!asesorSeleccionado) {
      message.warning('Por favor selecciona un asesor');
      return;
    }

    setBuscandoAsesor(true);
    setLoadingTabla(true);
    try {
      const response = await cotizacionesService.listTdiUsa(asesorSeleccionado, 2);
      
      // Mostrar mensaje de éxito de la API
      if (response.message) {
        message.success(response.message);
      }

      // Procesar los datos recibidos
      const data = response?.data || [];
      const cotizacionesMapeadas = data.map((item: any) => ({
        id: item.id || item.ctz,
        ctz: item.ctz,
        estado: mapearEstado(item.estado || item.state),
        cliente: item.cliente || item.customer,
        asesor: item.asesor || item.advisor,
        total: parseFloat(item.total || item.amount || 0),
        fecha_creacion: item.fecha_creacion || item.created_at || item.created
      }));

      setCotizaciones(cotizacionesMapeadas);
      setCurrentPage(1); // Resetear a página 1
      
      // Obtener nombre del asesor para el título
      const asesorNombre = asesores.find(a => a.id === asesorSeleccionado)?.nombre || '';
      setTituloTabla(`Historial de CTZ del asesor ${asesorNombre}`);
      
    } catch (error: any) {
      console.error('Error al buscar cotizaciones:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al buscar cotizaciones';
      message.error(errorMessage);
      setCotizaciones([]);
    } finally {
      setBuscandoAsesor(false);
      setLoadingTabla(false);
    }
  };

  const getEstadoColor = (estado: string): string => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'nuevo') return 'blue';
    if (estadoLower === 'pagado') return 'green';
    return 'default';
  };

  const handleAccion = async (accion: string, cotizacion: CotizacionTdiUsa) => {
    if (accion === 'pdf') {
      await handleDescargarPDF(cotizacion);
    } else if (accion === 'detalles') {
      // TODO: Implementar detalles
      message.info(`Acción "${accion}" para CTZ ${cotizacion.ctz}`);
    }
  };

  const handleDescargarPDF = async (cotizacion: CotizacionTdiUsa) => {
    try {
      setCtzSeleccionada(cotizacion.ctz);
      setLoadingPdf(true);
      
      const response = await cotizacionesService.getQuoteTdiUsaPdf(cotizacion.ctz);
      
      if (response.status === 'success' || response.url) {
        setPdfUrl(response.url);
        setModalPdfVisible(true);
        
        if (response.message) {
          message.success(response.message);
        }
      } else {
        message.error(response.message || 'Error al generar el PDF');
      }
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al descargar el PDF';
      message.error(errorMessage);
    } finally {
      setLoadingPdf(false);
    }
  };

  const formatMoney = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const columns = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      fixed: 'left' as const,
      render: (_: any, record: CotizacionTdiUsa) => {
        const items: MenuProps['items'] = [
          {
            key: '1',
            label: 'Ver pagos',
            onClick: () => handleAccion('detalles', record)
          },
          {
            key: '2',
            label: 'Descargar PDF',
            onClick: () => handleAccion('pdf', record)
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomLeft">
            <Button
              type="primary"
              icon={<MoreOutlined />}
              size="small"
              style={{
                backgroundColor: '#ff6600',
                borderColor: '#ff6600'
              }}
            />
          </Dropdown>
        );
      }
    },
    {
      title: 'CTZ',
      dataIndex: 'ctz',
      key: 'ctz',
      width: 150,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 150,
      align: 'center' as const,
      render: (estado: string) => (
        <Tag color={getEstadoColor(estado)}>
          {estado}
        </Tag>
      )
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      width: 200,
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 180,
    },
    {
      title: 'Cantidad',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      align: 'right' as const,
      render: (total: number) => formatMoney(total)
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'fecha_creacion',
      key: 'fecha_creacion',
      width: 180,
      align: 'center' as const,
      render: (fecha: string) => humanizarFecha(fecha)
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Cotizaciones TDI - USA">
        <Row gutter={24}>
          {/* Columna 1: Búsqueda por Cliente */}
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Buscar por Cliente
                </label>
                <Select
                  showSearch
                  placeholder="Selecciona un cliente"
                  style={{ width: '100%' }}
                  size="large"
                  loading={loadingClientes}
                  value={clienteSeleccionado}
                  onChange={(value) => setClienteSeleccionado(value)}
                  filterOption={(input, option) =>
                    ((option?.children as unknown) as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {clientes.map((cliente) => (
                    <Option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </Option>
                  ))}
                </Select>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={buscarPorCliente}
                loading={buscandoCliente}
                style={{ 
                  backgroundColor: '#ff6600', 
                  borderColor: '#ff6600',
                  width: '100%'
                }}
              >
                Buscar Cotizaciones
              </Button>
            </div>
          </Col>

          {/* Columna 2: Búsqueda por Asesor */}
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Buscar por Asesor
                </label>
                <Select
                  showSearch
                  placeholder="Selecciona un asesor"
                  style={{ width: '100%' }}
                  size="large"
                  loading={loadingAsesores}
                  value={asesorSeleccionado}
                  onChange={(value) => setAsesorSeleccionado(value)}
                  filterOption={(input, option) =>
                    ((option?.children as unknown) as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {asesores.map((asesor) => (
                    <Option key={asesor.id} value={asesor.id}>
                      {asesor.nombre}
                    </Option>
                  ))}
                </Select>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={buscarPorAsesor}
                loading={buscandoAsesor}
                style={{ 
                  backgroundColor: '#ff6600', 
                  borderColor: '#ff6600',
                  width: '100%'
                }}
              >
                Buscar Cotizaciones
              </Button>
            </div>
          </Col>
        </Row>

        {/* Tabla de resultados */}
        {cotizaciones.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600, textAlign: 'center' }}>
              {tituloTabla}
            </h3>
            <h4 style={{ marginBottom: '16px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
              Cotizaciones totales: {cotizaciones.length}
            </h4>
            
            {/* Buscador */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <Input
                placeholder="Buscar en la tabla..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
            </div>

            <Table
              columns={columns}
              dataSource={cotizaciones.filter((item) => {
                if (!searchText) return true;
                const search = searchText.toLowerCase();
                return (
                  item.ctz?.toLowerCase().includes(search) ||
                  item.estado?.toLowerCase().includes(search) ||
                  item.cliente?.toLowerCase().includes(search) ||
                  item.asesor?.toLowerCase().includes(search) ||
                  item.total?.toString().includes(search)
                );
              })}
              rowKey="id"
              loading={loadingTabla}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total) => `Total ${total} cotizaciones`,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
                onShowSizeChange: (_current, size) => {
                  setCurrentPage(1);
                  setPageSize(size);
                }
              }}
              scroll={{ x: 1200 }}
            />
          </div>
        )}
      </Card>

      {/* Modal para visualizar PDF */}
      <Modal
        title={`Cotización - ${ctzSeleccionada}`}
        open={modalPdfVisible}
        onCancel={() => {
          setModalPdfVisible(false);
          setPdfUrl('');
        }}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="download" type="primary" style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>
              <DownloadOutlined /> Descargar PDF
            </a>
          </Button>,
          <Button key="close" onClick={() => {
            setModalPdfVisible(false);
            setPdfUrl('');
          }}>
            Cerrar
          </Button>,
        ]}
      >
        {loadingPdf ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            Generando PDF...
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            style={{ width: '100%', height: '80vh', border: 'none' }}
            title="PDF Viewer"
          />
        )}
      </Modal>
    </div>
  );
};

export default CotizacionesTdiUsa;
