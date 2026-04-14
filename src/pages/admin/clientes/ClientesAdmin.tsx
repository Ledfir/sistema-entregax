import React, { useState, useEffect } from 'react';
import { Card, Table, Dropdown, Button, Input, message, Modal, Row, Col, Carousel, Select, Tag, Spin, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, DownOutlined, InfoCircleOutlined, EnvironmentOutlined, FileTextOutlined, HistoryOutlined, GiftOutlined, CalendarOutlined, MailOutlined, PhoneOutlined, MobileOutlined, GlobalOutlined, PictureOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import { clienteService } from '@/services/clienteService';

interface Cliente {
  id: string | number;
  token: string;
  suite: string;
  nombre: string;
  correo: string;
  tel: string;
  asesor: string;
}

const ClientesAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Cliente[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<Cliente[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalBeneficiosVisible, setModalBeneficiosVisible] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [loadingBeneficios, setLoadingBeneficios] = useState(false);
  const [beneficioCredito, setBeneficioCredito] = useState<boolean>(false);
  const [beneficioPrecioUSA, setBeneficioPrecioUSA] = useState<boolean>(false);
  const [beneficioPrecioMaritimo, setBeneficioPrecioMaritimo] = useState<boolean>(false);
  const [modalDireccionesVisible, setModalDireccionesVisible] = useState(false);
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [modalFiscalesVisible, setModalFiscalesVisible] = useState(false);
  const [datosFiscales, setDatosFiscales] = useState<any[]>([]);
  const [loadingFiscales, setLoadingFiscales] = useState(false);
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false);
  const [servicios, setServicios] = useState<any[]>([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string | undefined>(undefined);
  const [historialData, setHistorialData] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [modalInformacionVisible, setModalInformacionVisible] = useState(false);
  const [infoCliente, setInfoCliente] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  useEffect(() => {
    cargarClientes();
    cargarServicios();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
      // Resetear a la primera página cuando se filtra
      setPagination({ ...pagination, current: 1 });
    } else {
      setFilteredData(data);
    }
  }, [searchText, data]);

  const cargarInformacion = async (token: string) => {
    try {
      setLoadingInfo(true);
      const response = await clienteService.get(token);
      setInfoCliente(response);
    } catch (error) {
      console.error('Error al cargar información del cliente:', error);
      message.error('Error al cargar la información del cliente');
      setInfoCliente(null);
    } finally {
      setLoadingInfo(false);
    }
  };

  const cargarBeneficios = async (token: string) => {
    try {
      setLoadingBeneficios(true);
      const response = await clienteService.getBenefits(token);
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        // La API devuelve un array con objetos { id: "1", state: 0/1 }
        // id 1 = Crédito, id 2 = USA, id 3 = Marítimo
        const creditoBenefit = response.data.find((b: any) => b.id === "1" || b.id === 1);
        const usaBenefit = response.data.find((b: any) => b.id === "2" || b.id === 2);
        const maritimoBenefit = response.data.find((b: any) => b.id === "3" || b.id === 3);
        
        setBeneficioCredito(creditoBenefit?.state === 1 || creditoBenefit?.state === "1");
        setBeneficioPrecioUSA(usaBenefit?.state === 1 || usaBenefit?.state === "1");
        setBeneficioPrecioMaritimo(maritimoBenefit?.state === 1 || maritimoBenefit?.state === "1");
      } else {
        // Valores por defecto si no hay respuesta
        setBeneficioCredito(false);
        setBeneficioPrecioUSA(false);
        setBeneficioPrecioMaritimo(false);
      }
    } catch (error) {
      console.error('Error al cargar beneficios:', error);
      message.error('Error al cargar los beneficios del cliente');
      // Valores por defecto en caso de error
      setBeneficioCredito(false);
      setBeneficioPrecioUSA(false);
      setBeneficioPrecioMaritimo(false);
    } finally {
      setLoadingBeneficios(false);
    }
  };

  const handleToggleBeneficio = async (benefitId: number, benefitName: string, currentState: boolean) => {
    if (!clienteSeleccionado) return;

    const accion = currentState ? 'desactivar' : 'activar';
    
    Modal.confirm({
      title: `¿Confirmar ${accion} beneficio?`,
      content: `¿Está seguro que desea ${accion} el beneficio de ${benefitName} para ${clienteSeleccionado.nombre}?`,
      okText: 'Sí, confirmar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          setLoadingBeneficios(true);
          const response = await clienteService.updateBenefits(clienteSeleccionado.token, benefitId);
          
          if (response.status === 'success') {
            message.success(response.message || `Beneficio ${accion} correctamente`);
            // Recargar beneficios para obtener el estado actualizado
            await cargarBeneficios(clienteSeleccionado.token);
          } else {
            message.warning(response.message || 'No se pudo actualizar el beneficio');
          }
        } catch (error) {
          console.error('Error al actualizar beneficio:', error);
          const errorMessage = (error as any)?.response?.data?.message || 'Error al actualizar el beneficio';
          message.error(errorMessage);
        } finally {
          setLoadingBeneficios(false);
        }
      },
    });
  };

  const cargarDirecciones = async (token: string) => {
    try {
      setLoadingDirecciones(true);
      const response = await clienteService.getDeliveryAddresses(token);
      
      // Manejar diferentes formatos de respuesta
      let direccionesData = [];
      
      if (Array.isArray(response)) {
        // Si la respuesta es directamente un array
        direccionesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // Si la respuesta tiene estructura { status, data }
        direccionesData = response.data;
      }
      
      if (direccionesData.length > 0) {
        setDirecciones(direccionesData);
      } else {
        setDirecciones([]);
        message.info('No se encontraron direcciones de entrega');
      }
    } catch (error) {
      console.error('Error al cargar direcciones:', error);
      const errorMessage = (error as any)?.response?.data?.message || 'Error al cargar las direcciones';
      message.error(errorMessage);
      setDirecciones([]);
    } finally {
      setLoadingDirecciones(false);
    }
  };

  const cargarDatosFiscales = async (token: string) => {
    try {
      setLoadingFiscales(true);
      const response = await clienteService.getBillingAddresses(token);
      
      if (Array.isArray(response)) {
        setDatosFiscales(response);
      } else {
        setDatosFiscales([]);
        message.info('No se encontraron datos fiscales');
      }
    } catch (error) {
      console.error('Error al cargar datos fiscales:', error);
      const errorMessage = (error as any)?.response?.data?.message || 'Error al cargar los datos fiscales';
      message.error(errorMessage);
      setDatosFiscales([]);
    } finally {
      setLoadingFiscales(false);
    }
  };

  const cargarServicios = async () => {
    try {
      setLoadingServicios(true);
      const response = await clienteService.listServices();
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        setServicios(response.data);
      } else {
        setServicios([]);
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      message.error('Error al cargar los servicios');
      setServicios([]);
    } finally {
      setLoadingServicios(false);
    }
  };

  const cargarHistorial = async (serviceId: string) => {
    if (!clienteSeleccionado) return;
    
    try {
      setLoadingHistorial(true);
      setHistorialData([]);
      
      const response = await clienteService.getHistory(clienteSeleccionado.token, serviceId);
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        setHistorialData(response.data);
      } else if (Array.isArray(response)) {
        setHistorialData(response);
      } else {
        setHistorialData([]);
        message.info('No se encontró historial para este servicio');
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
      message.error('Error al cargar el historial del servicio');
      setHistorialData([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Definir columnas dinámicas según el tipo de servicio
  const getHistorialColumns = (): ColumnsType<any> => {
    const serviceId = String(servicioSeleccionado);
    
    if (serviceId === '4') {
      // Columnas para servicio marítimo (service_id = 4)
      return [
        {
          title: 'LOG',
          dataIndex: 'log',
          key: 'log',
          width: 150,
        },
        {
          title: 'CTZ',
          dataIndex: 'ctz',
          key: 'ctz',
          width: 100,
        },
        {
          title: 'Week',
          dataIndex: 'week',
          key: 'week',
          width: 100,
          align: 'center' as const,
        },
        {
          title: 'CBM',
          dataIndex: 'cbm',
          key: 'cbm',
          width: 100,
          align: 'center' as const,
        },
        {
          title: 'Bultos',
          dataIndex: 'bultos',
          key: 'bultos',
          width: 100,
          align: 'center' as const,
        },
        {
          title: 'Peso',
          dataIndex: 'peso',
          key: 'peso',
          width: 100,
          align: 'center' as const,
          render: (value: string) => value ? `${value} Kg` : '-',
        },
        {
          title: 'Logo',
          dataIndex: 'logo',
          key: 'logo',
          width: 80,
          align: 'center' as const,
          render: (value: string) => value === '1' ? <Tag color="green">Sí</Tag> : <Tag>No</Tag>,
        },
        {
          title: 'Sensible',
          dataIndex: 'sensible',
          key: 'sensible',
          width: 100,
          align: 'center' as const,
          render: (value: string) => value === '0' ? <Tag>No</Tag> : <Tag color="orange">Sí</Tag>,
        },
        {
          title: 'Estado',
          dataIndex: 'estado',
          key: 'estado',
          width: 200,
          render: (value: string) => <Tag color="blue">{value || 'N/A'}</Tag>,
        },
      ];
    }
    
    if (serviceId === '1' || serviceId === '2' || serviceId === '3') {
      // Columnas para servicio de envíos/paquetería (service_id = 1)
      return [
        {
          title: 'Guía de Ingreso',
          dataIndex: 'Guia de ingreso',
          key: 'guia_ingreso',
          width: 180,
        },
        {
          title: 'Guía Única',
          dataIndex: 'Guia unica',
          key: 'guia_unica',
          width: 180,
        },
        {
          title: 'CTZ',
          dataIndex: 'CTZ',
          key: 'ctz',
          width: 100,
        },
        {
          title: 'Estado',
          dataIndex: 'Estado',
          key: 'estado',
          width: 250,
          render: (value: string) => <Tag color="blue">{value || 'N/A'}</Tag>,
        },
        {
          title: 'Guía de Salida',
          dataIndex: 'Guia de salida',
          key: 'guia_salida',
          width: 150,
          render: (value: any) => value ? value : <Tag>Sin guía</Tag>,
        },
        {
          title: 'Costo',
          dataIndex: 'Costo',
          key: 'costo',
          width: 100,
          align: 'center' as const,
          render: (value: string) => value ? `$${value}` : '-',
        },
        {
          title: 'Tipo de Cambio',
          dataIndex: 'Tipo de cambio',
          key: 'tipo_cambio',
          width: 120,
          align: 'center' as const,
        },
        {
          title: 'Kilos',
          dataIndex: 'kilos',
          key: 'kilos',
          width: 80,
          align: 'center' as const,
          render: (value: string) => value ? `${value} Kg` : '-',
        },
        {
          title: 'Dimensiones (L×A×An)',
          key: 'dimensiones',
          width: 150,
          align: 'center' as const,
          render: (_: any, record: any) => {
            const largo = record.largo || '0';
            const alto = record.alto || '0';
            const ancho = record.ancho || '0';
            return `${largo}×${alto}×${ancho} cm`;
          },
        },
      ];
    }
    
    // Columnas genéricas para otros servicios
    return [];
  };

  const cargarClientes = async () => {
    try {
      setLoading(true);
      
      // Llamar al endpoint
      const response = await clienteService.listCustomersAdmin();
      
      if (response.status === 'success' && response.data) {
        // Mapear los datos de la API a la estructura de la tabla
        const mappedData = response.data.map((item: any, index: number) => ({
          id: index + 1,
          token: item.token,
          suite: item.suite,
          nombre: item.nombre,
          correo: item.correo,
          tel: item.telefono,
          asesor: item.asesor,
        }));
        setData(mappedData);
        setPagination({ ...pagination, total: mappedData.length });
      } else {
        setData([]);
        message.info('No se encontraron clientes');
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.message || 
                           'Error al cargar los clientes';
      message.error(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (cliente: Cliente, key: string) => {
    switch (key) {
      case 'informacion':
        setClienteSeleccionado(cliente);
        setModalInformacionVisible(true);
        cargarInformacion(cliente.token);
        break;
      case 'direcciones':
        setClienteSeleccionado(cliente);
        setModalDireccionesVisible(true);
        cargarDirecciones(cliente.token);
        break;
      case 'fiscales':
        setClienteSeleccionado(cliente);
        setModalFiscalesVisible(true);
        cargarDatosFiscales(cliente.token);
        break;
      case 'historial':
        setClienteSeleccionado(cliente);
        setModalHistorialVisible(true);
        setServicioSeleccionado(undefined);
        break;
      case 'beneficios':
        setClienteSeleccionado(cliente);
        setModalBeneficiosVisible(true);
        cargarBeneficios(cliente.token);
        break;
      default:
        break;
    }
  };

  const getMenuItems = (cliente: Cliente): MenuProps['items'] => [
    {
      key: 'informacion',
      label: 'Información',
      icon: <InfoCircleOutlined />,
      onClick: () => handleMenuClick(cliente, 'informacion'),
    },
    {
      key: 'direcciones',
      label: 'Direcciones',
      icon: <EnvironmentOutlined />,
      onClick: () => handleMenuClick(cliente, 'direcciones'),
    },
    {
      key: 'fiscales',
      label: 'Fiscales',
      icon: <FileTextOutlined />,
      onClick: () => handleMenuClick(cliente, 'fiscales'),
    },
    {
      key: 'historial',
      label: 'Historial',
      icon: <HistoryOutlined />,
      onClick: () => handleMenuClick(cliente, 'historial'),
    },
    {
      key: 'beneficios',
      label: 'Beneficios',
      icon: <GiftOutlined />,
      onClick: () => handleMenuClick(cliente, 'beneficios'),
    },
  ];

  const columns: ColumnsType<Cliente> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: Cliente) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="primary" style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}>
            Acciones <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'SUITE',
      dataIndex: 'suite',
      key: 'suite',
      width: 100,
      align: 'center',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 250,
    },
    {
      title: 'Correo',
      dataIndex: 'correo',
      key: 'correo',
      width: 250,
    },
    {
      title: 'Tel',
      dataIndex: 'tel',
      key: 'tel',
      width: 130,
      align: 'center',
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 200,
    },
  ];

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Listado de clientes">
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar cliente..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            size="large"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Card>

      {/* Modal de Información del Cliente */}
      <Modal
        title={`Información - ${clienteSeleccionado?.nombre || ''}`}
        open={modalInformacionVisible}
        onCancel={() => { setModalInformacionVisible(false); setInfoCliente(null); }}
        footer={null}
        width={800}
      >
        {loadingInfo ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Cargando información...</p>
          </div>
        ) : infoCliente ? (
          <div style={{ padding: '8px 0' }}>
            {/* Cabecera */}
            <Card style={{ marginBottom: 16, border: '1px solid #e0e0e0', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Avatar
                  size={80}
                  style={{ backgroundColor: '#ff6600', fontSize: 32, flexShrink: 0 }}
                >
                  {infoCliente.nombre?.charAt(0)}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, marginBottom: 8, fontSize: 22, fontWeight: 700 }}>{infoCliente.nombre || 'N/A'}</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <Tag style={{ margin: 0 }}><strong>ID:</strong> {infoCliente.id || 'N/A'}</Tag>
                    <Tag style={{ margin: 0 }}><strong>Alias:</strong> {infoCliente.alias || 'N/A'}</Tag>
                    <Tag style={{ margin: 0 }}><strong>Suite:</strong> {infoCliente.clavecliente || 'N/A'}</Tag>
                    {infoCliente.created && (
                      <span style={{ color: '#888', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarOutlined /> Registrado: {infoCliente.created}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Contacto */}
            <Card size="small" title="Contacto" style={{ marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', width: '33%' }}>
                      <span style={{ color: '#888', marginRight: 6 }}><MailOutlined /></span>
                      <strong>Correo</strong>
                      <div style={{ marginTop: 2 }}>{infoCliente.correo || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', width: '33%' }}>
                      <span style={{ color: '#888', marginRight: 6 }}><PhoneOutlined /></span>
                      <strong>Teléfono</strong>
                      <div style={{ marginTop: 2 }}>{infoCliente.telefono || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', width: '33%' }}>
                      <span style={{ color: '#888', marginRight: 6 }}><MobileOutlined /></span>
                      <strong>Móvil</strong>
                      <div style={{ marginTop: 2 }}>{infoCliente.movil || 'N/A'}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: '#25D366', marginRight: 6 }}>💬</span>
                      <strong>WhatsApp</strong>
                      <div style={{ marginTop: 2 }}>{infoCliente.whatsapp || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: '#888', marginRight: 6 }}>微</span>
                      <strong>WeChat</strong>
                      <div style={{ marginTop: 2 }}>{infoCliente.wechat || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: '#1877F2', marginRight: 6 }}><GlobalOutlined /></span>
                      <strong>Facebook</strong>
                      <div style={{ marginTop: 2 }}>{infoCliente.facebook || 'N/A'}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>

            {/* INE */}
            <Card size="small" title="Identificación (INE)">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card
                    size="small"
                    title="Frente"
                    style={{ textAlign: 'center', border: '1px solid #e0e0e0' }}
                    headStyle={{ textAlign: 'center' }}
                    extra={infoCliente.ladoa ? (
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => window.open(infoCliente.ladoa, '_blank')}
                      >
                        Ver
                      </Button>
                    ) : null}
                  >
                    {infoCliente.ladoa ? (
                      <img src={infoCliente.ladoa} alt="INE Frente" style={{ maxWidth: '100%', borderRadius: 8 }} />
                    ) : (
                      <div style={{ padding: '40px 0', color: '#bbb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: '2px dashed #e0e0e0', borderRadius: 8 }}>
                        <PictureOutlined style={{ fontSize: 48 }} />
                        <span style={{ fontSize: 13 }}>Imagen no disponible<br />or Sin subir</span>
                      </div>
                    )}
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card
                    size="small"
                    title="Reverso"
                    style={{ textAlign: 'center', border: '1px solid #e0e0e0' }}
                    headStyle={{ textAlign: 'center' }}
                    extra={infoCliente.ladob ? (
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => window.open(infoCliente.ladob, '_blank')}
                      >
                        Ver
                      </Button>
                    ) : null}
                  >
                    {infoCliente.ladob ? (
                      <img src={infoCliente.ladob} alt="INE Reverso" style={{ maxWidth: '100%', borderRadius: 8 }} />
                    ) : (
                      <div style={{ padding: '40px 0', color: '#bbb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: '2px dashed #e0e0e0', borderRadius: 8 }}>
                        <PictureOutlined style={{ fontSize: 48 }} />
                        <span style={{ fontSize: 13 }}>Imagen no disponible<br />or Sin subir</span>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </Card>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p>No se pudo cargar la información del cliente</p>
          </div>
        )}
      </Modal>

      {/* Modal de Beneficios */}
      <Modal
        title={`Beneficios - ${clienteSeleccionado?.nombre || ''}`}
        open={modalBeneficiosVisible}
        onCancel={() => setModalBeneficiosVisible(false)}
        footer={null}
        width={1000}
      >
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {/* Tarjeta Crédito */}
          <Col xs={24} md={8} style={{ display: 'flex' }}>
            <Card 
              style={{ textAlign: 'center', width: '100%', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 350 }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="https://img.icons8.com/color/48/bank-card-back-side.png" 
                  alt="Credit Card" 
                  style={{ width: 80, height: 80, marginBottom: 16 }} 
                />
                <h3 style={{ fontSize: 20, marginBottom: 16 }}>Crédito</h3>
                <p style={{ color: '#666', marginBottom: 24 }}>
                  Al habilitar esta opción se otorgará crédito al cliente, solo en estrategas y usa
                </p>
              </div>
              <Button 
                loading={loadingBeneficios}
                size="large" 
                onClick={() => handleToggleBeneficio(1, 'Crédito', beneficioCredito)}
                style={{ 
                  backgroundColor: beneficioCredito ? '#52c41a' : '#dc0000', 
                  borderColor: beneficioCredito ? '#52c41a' : '#dc0000', 
                  color: '#ffffff' 
                }}
              >
                Crédito : {beneficioCredito ? 'Sí' : 'No'}
              </Button>
            </Card>
          </Col>

          {/* Tarjeta Precio USA */}
          <Col xs={24} md={8} style={{ display: 'flex' }}>
            <Card 
              style={{ textAlign: 'center', width: '100%', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 350 }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="https://img.icons8.com/color/48/usa.png" 
                  alt="USA Flag" 
                  style={{ width: 80, height: 80, marginBottom: 16 }} 
                />
                <h3 style={{ fontSize: 20, marginBottom: 16 }}>Precio USA</h3>
                <p style={{ color: '#666', marginBottom: 24 }}>
                  Esta opción habilita precio mayoreo en USA solo aplica en bodegas USA
                </p>
              </div>
              <Button 
                loading={loadingBeneficios}
                size="large" 
                onClick={() => handleToggleBeneficio(2, 'Precio USA', beneficioPrecioUSA)}
                style={{ 
                  backgroundColor: beneficioPrecioUSA ? '#52c41a' : '#dc0000', 
                  borderColor: beneficioPrecioUSA ? '#52c41a' : '#dc0000', 
                  color: '#ffffff' 
                }}
              >
                USA : {beneficioPrecioUSA ? 'Sí' : 'No'}
              </Button>
            </Card>
          </Col>

          {/* Tarjeta Precio Marítimo */}
          <Col xs={24} md={8} style={{ display: 'flex' }}>
            <Card 
              style={{ textAlign: 'center', width: '100%', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 350 }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 80, marginBottom: 16 }}>🚢</div>
                <h3 style={{ fontSize: 20, marginBottom: 16 }}>Precio Marítimo</h3>
                <p style={{ color: '#666', marginBottom: 24 }}>
                  Esta opción habilita precio mayoreo en marítimo a precio de 15 cbm
                </p>
              </div>
              <Button 
                loading={loadingBeneficios}
                size="large" 
                onClick={() => handleToggleBeneficio(3, 'Precio Marítimo', beneficioPrecioMaritimo)}
                style={{ 
                  backgroundColor: beneficioPrecioMaritimo ? '#52c41a' : '#dc0000', 
                  borderColor: beneficioPrecioMaritimo ? '#52c41a' : '#dc0000', 
                  color: '#ffffff' 
                }}
              >
                Marítimo : {beneficioPrecioMaritimo ? 'Sí' : 'No'}
              </Button>
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* Modal de Datos Fiscales */}
      <Modal
        title={`Datos Fiscales - ${clienteSeleccionado?.nombre || ''}`}
        open={modalFiscalesVisible}
        onCancel={() => setModalFiscalesVisible(false)}
        footer={null}
        width={800}
      >
        {loadingFiscales ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p>Cargando datos fiscales...</p>
          </div>
        ) : datosFiscales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p>No hay datos fiscales registrados</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16, color: '#666' }}>
              Total de datos fiscales: {datosFiscales.length}
            </div>
            <style>
              {`
                .ant-carousel .slick-prev,
                .ant-carousel .slick-next {
                  color: #ff6600;
                  font-size: 24px;
                  z-index: 2;
                }
                .ant-carousel .slick-prev:hover,
                .ant-carousel .slick-next:hover {
                  color: #ff8833;
                }
                .ant-carousel .slick-prev {
                  left: -10px;
                }
                .ant-carousel .slick-next {
                  right: -10px;
                }
                .ant-carousel .slick-dots li button {
                  background: #d9d9d9;
                }
                .ant-carousel .slick-dots li.slick-active button {
                  background: #ff6600;
                }
              `}
            </style>
            <Carousel 
              arrows 
              dots={true} 
              dotPosition="bottom" 
              style={{ padding: '0 30px' }}
            >
              {datosFiscales.map((fiscal, index) => (
                <div key={fiscal.id || index}>
                  <Card
                    style={{
                      margin: '20px 10px 40px 10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileTextOutlined style={{ fontSize: 20, color: '#ff6600' }} />
                        <span>Datos Fiscales {index + 1} de {datosFiscales.length}</span>
                      </div>
                    }
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <p><strong>Razón Social:</strong> {fiscal.razonsocial || 'N/A'}</p>
                        <p><strong>RFC:</strong> {fiscal.rfc || 'N/A'}</p>
                        <p><strong>Calle:</strong> {fiscal.calle || 'N/A'}</p>
                        <p><strong>Núm. Exterior:</strong> {fiscal.numeroext || 'N/A'}</p>
                        <p><strong>Núm. Interior:</strong> {fiscal.numeroint || 'N/A'}</p>
                        <p><strong>Colonia:</strong> {fiscal.colonia || 'N/A'}</p>
                        <p><strong>C.P.:</strong> {fiscal.cp || 'N/A'}</p>
                        <p><strong>Municipio:</strong> {fiscal.municipio || 'N/A'}</p>
                        <p><strong>Ciudad:</strong> {fiscal.ciudad || 'N/A'}</p>
                        <p><strong>Estado:</strong> {fiscal.estado || 'N/A'}</p>
                        <p><strong>País:</strong> {fiscal.pais || 'N/A'}</p>
                        <p><strong>Email:</strong> {fiscal.email || 'N/A'}</p>
                        <p><strong>Teléfono:</strong> {fiscal.tel || 'N/A'}</p>
                        <p><strong>Régimen Fiscal:</strong> {fiscal.regimen || 'N/A'}</p>
                        <p><strong>Uso CFDI:</strong> {fiscal.uso_cfdi || 'N/A'}</p>
                      </Col>
                    </Row>
                  </Card>
                </div>
              ))}
            </Carousel>
          </>
        )}
      </Modal>

      {/* Modal de Direcciones */}
      <Modal
        title={`Direcciones de Entrega - ${clienteSeleccionado?.nombre || ''}`}
        open={modalDireccionesVisible}
        onCancel={() => setModalDireccionesVisible(false)}
        footer={null}
        width={800}
      >
        {loadingDirecciones ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p>Cargando direcciones...</p>
          </div>
        ) : direcciones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p>No hay direcciones de entrega registradas</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16, color: '#666' }}>
              Total de direcciones: {direcciones.length}
            </div>
            <style>
              {`
                .ant-carousel .slick-prev,
                .ant-carousel .slick-next {
                  color: #ff6600;
                  font-size: 24px;
                  z-index: 2;
                }
                .ant-carousel .slick-prev:hover,
                .ant-carousel .slick-next:hover {
                  color: #ff8833;
                }
                .ant-carousel .slick-prev {
                  left: -10px;
                }
                .ant-carousel .slick-next {
                  right: -10px;
                }
                .ant-carousel .slick-dots li button {
                  background: #d9d9d9;
                }
                .ant-carousel .slick-dots li.slick-active button {
                  background: #ff6600;
                }
              `}
            </style>
            <Carousel 
              arrows 
              dots={true} 
              dotPosition="bottom" 
              style={{ padding: '0 30px' }}
            >
              {direcciones.map((direccion, index) => {
                // Construir la dirección completa para Google Maps
                const direccionCompleta = [
                  direccion.calle,
                  direccion.numeroext,
                  direccion.colonia,
                  direccion.cp,
                  direccion.municipio,
                  direccion.ciudad,
                  direccion.estado,
                  direccion.pais
                ].filter(Boolean).join(', ');
                
                const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed`;
                
                return (
                  <div key={direccion.id || index}>
                    <Card
                      style={{
                        margin: '20px 10px 40px 10px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <EnvironmentOutlined style={{ fontSize: 20, color: '#ff6600' }} />
                          <span>Dirección {index + 1} de {direcciones.length}</span>
                        </div>
                      }
                    >
                      <Row gutter={[16, 16]}>
                        {/* Columna izquierda - Datos */}
                        <Col xs={24} sm={24} md={12}>
                          <p><strong>Quien recibe:</strong> {direccion.quienrecibe || 'N/A'}</p>
                          <p><strong>Calle:</strong> {direccion.calle || 'N/A'}</p>
                          <p><strong>Núm. Exterior:</strong> {direccion.numeroext || 'N/A'}</p>
                          <p><strong>Núm. Interior:</strong> {direccion.numeroint || 'N/A'}</p>
                          <p><strong>Colonia:</strong> {direccion.colonia || 'N/A'}</p>
                          <p><strong>C.P.:</strong> {direccion.cp || 'N/A'}</p>
                          <p><strong>Municipio:</strong> {direccion.municipio || 'N/A'}</p>
                          <p><strong>Ciudad:</strong> {direccion.ciudad || 'N/A'}</p>
                          <p><strong>Estado:</strong> {direccion.estado || 'N/A'}</p>
                          <p><strong>País:</strong> {direccion.pais || 'N/A'}</p>
                          <p><strong>Teléfono:</strong> {direccion.telefono || 'N/A'}</p>
                          <p><strong>Móvil:</strong> {direccion.movil || 'N/A'}</p>
                        </Col>
                        
                        {/* Columna derecha - Mapa */}
                        <Col xs={24} sm={24} md={12}>
                          <div style={{ 
                            border: '1px solid #d9d9d9', 
                            borderRadius: '4px', 
                            overflow: 'hidden',
                            height: '350px'
                          }}>
                            <iframe
                              title={`Mapa de dirección ${index + 1}`}
                              src={mapsUrl}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          </div>
                        </Col>
                        
                        {/* Referencias y lugar de entrega - Full width */}
                        {direccion.refe && (
                          <Col span={24}>
                            <p><strong>Referencias:</strong> {direccion.refe}</p>
                          </Col>
                        )}
                        {direccion.lugarentrega && (
                          <Col span={24}>
                            <p><strong>Lugar de entrega:</strong> {direccion.lugarentrega}</p>
                          </Col>
                        )}
                      </Row>
                    </Card>
                  </div>
                );
              })}
            </Carousel>
          </>
        )}
      </Modal>

      {/* Modal de Historial */}
      <Modal
        title={`Historial - ${clienteSeleccionado?.nombre || ''}`}
        open={modalHistorialVisible}
        onCancel={() => {
          setModalHistorialVisible(false);
          setServicioSeleccionado(undefined);
          setHistorialData([]);
        }}
        footer={null}
        width={1000}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Tipo de servicio:
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="Seleccione un tipo de servicio"
              value={servicioSeleccionado}
              onChange={(value) => {
                setServicioSeleccionado(value);
                if (value) {
                  cargarHistorial(value);
                } else {
                  setHistorialData([]);
                }
              }}
              loading={loadingServicios}
              allowClear
            >
              {servicios.map((servicio) => (
                <Select.Option key={servicio.id} value={servicio.id}>
                  {servicio.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          
          {loadingHistorial && (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <p>Cargando historial...</p>
            </div>
          )}

          {!loadingHistorial && servicioSeleccionado && historialData.length > 0 && getHistorialColumns().length > 0 && (
            <div style={{ marginTop: 24 }}>
              <Table
                dataSource={historialData}
                columns={getHistorialColumns()}
                rowKey={(record) => record.log || record.id || record.token}
                pagination={{ pageSize: 10 }}
                size="small"
                bordered
                scroll={{ x: 'max-content' }}
              />
            </div>
          )}

          {!loadingHistorial && servicioSeleccionado && historialData.length > 0 && getHistorialColumns().length === 0 && (
            <div style={{ 
              marginTop: 24, 
              padding: 50, 
              background: '#fff3cd', 
              borderRadius: 8,
              textAlign: 'center',
              border: '1px solid #ffc107'
            }}>
              <p>La vista de historial para este tipo de servicio aún no está disponible.</p>
            </div>
          )}

          {!loadingHistorial && servicioSeleccionado && historialData.length === 0 && (
            <div style={{ 
              marginTop: 24, 
              padding: 50, 
              background: '#f5f5f5', 
              borderRadius: 8,
              textAlign: 'center' 
            }}>
              <p>No se encontró historial para este servicio</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ClientesAdmin;
