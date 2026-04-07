import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, DatePicker, Typography, message, Table, Modal, Row, Col, Spin, Descriptions, Divider } from 'antd';
import { SearchOutlined, EyeOutlined, FileTextOutlined, ExportOutlined, DollarOutlined, UserOutlined, BankOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { cuentasService } from '@/services/cuentasService';
import { clienteService } from '@/services/clienteService';
import './ReporteEstadoCuenta.css';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

interface Cuenta {
  id: number | string;
  name: string;
}

interface Cliente {
  token: string;
  nombre: string;
  clavecliente: string;
}

interface RegistroReporte {
  state: number;
  paid: string;
  cantidad: string;
  cliente: string;
  concepto: string;
  ctz: string;
  enlace_monedero: string;
  option_desabilitar: boolean;
  estado: string;
}

const ReporteEstadoCuenta: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingCuentas, setLoadingCuentas] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [registros, setRegistros] = useState<RegistroReporte[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUrl, setModalUrl] = useState<string>('');
  const [modalDetallesVisible, setModalDetallesVisible] = useState(false);
  const [detallesCotizacion, setDetallesCotizacion] = useState<any>(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // Valores por defecto - ayer y hoy
  const defaultDates: [Dayjs, Dayjs] = [
    dayjs().subtract(1, 'day'),
    dayjs()
  ];

  // Cargar cuentas al montar el componente
  useEffect(() => {
    cargarCuentas();
    cargarClientes();
  }, []);

  // Función para extraer mensaje de error del API
  const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Ha ocurrido un error inesperado';
  };

  const cargarCuentas = async () => {
    try {
      setLoadingCuentas(true);
      const data = await cuentasService.list();
      setCuentas(data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      message.error(getErrorMessage(error));
    } finally {
      setLoadingCuentas(false);
    }
  };

  const cargarClientes = async () => {
    try {
      setLoadingClientes(true);
      const data = await clienteService.getAll();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      message.error(getErrorMessage(error));
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleBuscar = async (values: any) => {
    try {
      setLoading(true);
      
      // Formatear fechas en formato YYYY-MM-DD para el API
      let fechaInicio = '';
      let fechaFin = '';
      
      if (values.rangoFecha) {
        const [inicio, fin] = values.rangoFecha;
        fechaInicio = inicio.format('YYYY-MM-DD');
        fechaFin = fin.format('YYYY-MM-DD');
      }

      // Preparar payload para el API
      const payload = {
        cuenta: values.cuenta,
        cliente: values.cliente || 'Todos',
        fechaInicio,
        fechaFin,
      };

      // Enviar al endpoint
      const response = await cuentasService.generarReporte(payload);
      
      // Extraer datos del response
      const data = response?.data ?? [];
      setRegistros(Array.isArray(data) ? data : []);
      
      message.success(`Reporte generado: ${data.length} registros encontrados`);

    } catch (error) {
      console.error('Error al generar reporte:', error);
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const dateFormat = 'DD/MM/YYYY';

  // Funciones para manejar el modal
  const handleOpenModal = (url: string) => {
    if (url) {
      setModalUrl(url);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalUrl('');
  };

  // Funciones para manejar el modal de detalles
  const handleOpenDetalles = async (ctz: string) => {
    if (!ctz) {
      message.warning('No hay información de cotización disponible');
      return;
    }

    try {
      setLoadingDetalles(true);
      setModalDetallesVisible(true);
      const response = await cuentasService.getDetailsReportQuote(ctz);
      // El API retorna { status: "success", data: {...} }
      setDetallesCotizacion(response.data || response);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      message.error(getErrorMessage(error));
      setModalDetallesVisible(false);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const handleCloseDetalles = () => {
    setModalDetallesVisible(false);
    setDetallesCotizacion(null);
  };

  // Definir columnas de la tabla
  const columns: ColumnsType<RegistroReporte> = [
    {
      title: 'Fecha',
      dataIndex: 'paid',
      key: 'paid',
      width: 110,
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: 120,
      align: 'right',
      render: (value: string) => `$${value}`,
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      key: 'concepto',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'IDCO',
      dataIndex: 'ctz',
      key: 'ctz',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Detalles',
      key: 'detalles',
      width: 80,
      align: 'center',
      render: (_, record: RegistroReporte) => (
        <Button 
          type="link" 
          size="small"
          icon={<EyeOutlined />}
          disabled={!record.ctz}
          onClick={() => record.ctz && handleOpenDetalles(record.ctz)}
        />
      ),
    },
    {
      title: 'Ticket',
      key: 'ticket',
      width: 140,
      align: 'center',
      render: (_, record: RegistroReporte) => (
        <Button 
          type="primary"
          size="small"
          icon={<FileTextOutlined />}
          disabled={!record.enlace_monedero}
          onClick={() => handleOpenModal(record.enlace_monedero)}
        >
          Comprobante
        </Button>
      ),
    },
    {
      title: 'Factura',
      key: 'factura',
      width: 100,
      align: 'center',
      render: () => '-',
    },
    {
      title: 'R.P.',
      key: 'rp',
      width: 80,
      align: 'center',
      render: () => '-',
    },
    {
      title: 'Comprobación',
      key: 'comprobacion',
      width: 120,
      align: 'center',
      render: () => '-',
    },
    {
      title: 'Deshabilitar',
      key: 'deshabilitar',
      width: 120,
      align: 'center',
      render: (_, record: RegistroReporte) => (
        <Button 
          type="default" 
          size="small" 
          danger
          disabled={!record.option_desabilitar}
        >
          Deshabilitar
        </Button>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 100,
    },
  ];

  return (
    <div className="reporte-estado-cuenta-wrapper">
      <Card 
        title="Reporte de cuenta" 
        className="reporte-estado-cuenta-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBuscar}
          initialValues={{
            cliente: 'Todos',
            rangoFecha: defaultDates,
          }}
        >
          <Title level={5} style={{ textAlign: 'center', marginBottom: 24 }}>
            Seleccione cuenta y fecha
          </Title>

          <div className="form-row">
            <Form.Item
              label="Cuenta"
              name="cuenta"
              rules={[{ required: true, message: 'Seleccione una cuenta' }]}
              className="form-item-half"
            >
              <Select 
                placeholder="Seleccione una cuenta" 
                showSearch
                loading={loadingCuentas}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {cuentas.map((cuenta) => (
                  <Option key={cuenta.id} value={cuenta.id}>
                    {cuenta.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Cliente"
              name="cliente"
              className="form-item-half"
            >
              <Select 
                placeholder="Seleccione un cliente"
                showSearch
                loading={loadingClientes}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="Todos">Todos</Option>
                {clientes.map((cliente) => (
                  <Option key={cliente.token} value={cliente.token}>
                    {cliente.nombre} ({cliente.clavecliente})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="fecha-section">
            <Title level={5} style={{ textAlign: 'center', marginBottom: 8 }}>
              Seleccionar fecha
            </Title>
            <Text 
              type="secondary" 
              style={{ 
                display: 'block', 
                textAlign: 'center', 
                marginBottom: 12,
                fontSize: '12px'
              }}
            >
              Fecha En FORMATO DD/MM/YYYY
            </Text>

            <Form.Item
              label="Rango de fecha"
              name="rangoFecha"
              rules={[{ required: true, message: 'Seleccione un rango de fecha' }]}
            >
              <RangePicker
                style={{ width: '100%' }}
                format={dateFormat}
                placeholder={['Fecha inicio', 'Fecha fin']}
              />
            </Form.Item>
          </div>

          <Form.Item style={{ textAlign: 'center', marginTop: 24, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
              size="large"
              style={{ minWidth: '150px' }}
            >
              Buscar
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {registros.length > 0 && (
        <Card 
          title={`Resultados del reporte (${registros.length} registros)`}
          className="reporte-estado-cuenta-card"
          style={{ marginTop: 24 }}
        >
          <Table
            columns={columns}
            dataSource={registros}
            rowKey={(record) => record.state + record.paid + Math.random()}
            rowClassName={(record) => {
              if (record.state === 1) return 'row-state-yellow';
              if (record.state === 2) return 'row-state-green';
              return '';
            }}
            scroll={{ x: 1740 }}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} registros`,
            }}
            bordered
          />
        </Card>
      )}

      <Modal
        title="Comprobante"
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="open" type="primary" icon={<ExportOutlined />} onClick={() => window.open(modalUrl, '_blank')}>
            Abrir en nueva pestaña
          </Button>,
          <Button key="close" onClick={handleCloseModal}>
            Cerrar
          </Button>,
        ]}
        width={900}
        centered
        destroyOnClose
        bodyStyle={{ padding: '16px', maxHeight: '70vh', overflow: 'auto' }}
      >
        {modalUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={modalUrl}
              alt="Comprobante"
              style={{
                maxWidth: '100%',
                maxHeight: '65vh',
                height: 'auto',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
        )}
      </Modal>

      {/* Modal de Detalles de Cotización */}
      <Modal
        title={`DETALLES DE COTIZACIÓN ${detallesCotizacion?.cotizacion?.ctz || ''}`}
        open={modalDetallesVisible}
        onCancel={handleCloseDetalles}
        footer={[
          <Button key="close" onClick={handleCloseDetalles}>
            Cerrar
          </Button>,
        ]}
        width={1200}
        centered
        destroyOnClose
        bodyStyle={{ padding: '24px', maxHeight: '80vh', overflow: 'auto' }}
      >
        {loadingDetalles ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : detallesCotizacion ? (
          <>
            <Row gutter={[16, 16]}>
              {/* Información General */}
              <Col xs={24} md={12} lg={6}>
                <Card size="small" title={<><FileTextOutlined /> Información General</>} style={{ height: '100%' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="CTZ">
                      {detallesCotizacion?.cotizacion?.ctz || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tipo de servicio">
                      {detallesCotizacion?.servicio || 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Cliente y Asesor */}
              <Col xs={24} md={12} lg={6}>
                <Card size="small" title={<><UserOutlined /> Cliente y Asesor</>} style={{ height: '100%' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Cliente">
                      {detallesCotizacion?.cliente || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Asesor">
                      {detallesCotizacion?.asesor || 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Resumen Financiero */}
              <Col xs={24} md={12} lg={6}>
                <Card size="small" title={<><DollarOutlined /> Resumen Financiero</>} style={{ height: '100%' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Costo">
                      ${parseFloat(detallesCotizacion?.cotizacion?.costo || '0').toFixed(2)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Costo de envío">
                      ${parseFloat(detallesCotizacion?.cotizacion?.costoenvio || '0').toFixed(2)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total">
                      <strong>${parseFloat(detallesCotizacion?.cotizacion?.total || '0').toFixed(2)}</strong>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Tiempos y Cuenta */}
              <Col xs={24} md={12} lg={6}>
                <Card size="small" title={<><ClockCircleOutlined /> Tiempos y Cuenta</>} style={{ height: '100%' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Cuenta">
                      {detallesCotizacion?.cuenta || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha de creación">
                      {detallesCotizacion?.cotizacion?.created || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha de pago">
                      {detallesCotizacion?.cotizacion?.pagado ? 
                        dayjs(detallesCotizacion.cotizacion.pagado).format('YYYY-MM-DD HH:mm:ss') : 
                        'Sin fecha de pago'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* Historial de Pagos */}
            {detallesCotizacion?.pagos && detallesCotizacion.pagos.length > 0 && (
              <>
                <Divider orientation="left">HISTORIAL DE PAGOS</Divider>
                <Table
                  dataSource={detallesCotizacion.pagos}
                  rowKey={(record: any) => record.token || Math.random()}
                  pagination={false}
                  size="small"
                  scroll={{ x: 600 }}
                  columns={[
                    {
                      title: 'Fecha',
                      dataIndex: 'paid',
                      key: 'paid',
                      width: 120,
                    },
                    {
                      title: 'Pagado',
                      dataIndex: 'cantidad',
                      key: 'cantidad',
                      width: 120,
                      render: (value: string | number) => `$${parseFloat(String(value || '0')).toFixed(2)}`,
                    },
                    {
                      title: 'Total',
                      key: 'total',
                      width: 120,
                      render: () => `$${parseFloat(detallesCotizacion?.cotizacion?.total || '0').toFixed(2)}`,
                    },
                    {
                      title: 'Comprobante',
                      key: 'comprobante',
                      width: 150,
                      render: (_, record: any) => {
                        const comprobanteUrl = record.token && record.ext 
                          ? `https://www.sistemaentregax.com/pagos/comprobante/${record.token}${record.ext}`
                          : null;
                        
                        return (
                          <Button
                            type="primary"
                            size="small"
                            icon={<FileTextOutlined />}
                            onClick={() => comprobanteUrl && handleOpenModal(comprobanteUrl)}
                            disabled={!comprobanteUrl}
                          >
                            Ver Comprobante
                          </Button>
                        );
                      },
                    },
                  ]}
                />
              </>
            )}

            {/* Desglose de Guía y Envío */}
            {detallesCotizacion?.waybills && detallesCotizacion.waybills.length > 0 && (
              <>
                <Divider orientation="left">DESGLOSE DE GUÍA Y ENVÍO</Divider>
                <Table
                  dataSource={detallesCotizacion.waybills}
                  rowKey={(record: any) => record.name || record.guiaingreso || Math.random()}
                  pagination={false}
                  size="small"
                  scroll={{ x: 1200 }}
                  columns={
                    detallesCotizacion.servicio === 'MARITIMO'
                      ? [
                          // Columnas para servicio MARITIMO
                          {
                            title: 'Nombre',
                            dataIndex: 'name',
                            key: 'name',
                            width: 180,
                          },
                          {
                            title: 'Guía Salida',
                            dataIndex: 'guiasalida',
                            key: 'guiasalida',
                            width: 150,
                            render: (value: string) => value || '-',
                          },
                          {
                            title: 'Logo',
                            dataIndex: 'logo',
                            key: 'logo',
                            width: 100,
                            render: (value: string | number) => {
                              const logoValue = String(value);
                              if (logoValue === '0') return 'Generico';
                              if (logoValue === '1') return 'Logo';
                              return '-';
                            },
                          },
                          {
                            title: 'CBM',
                            dataIndex: 'cbm',
                            key: 'cbm',
                            width: 100,
                            render: (value: string | number) => `${parseFloat(String(value || '0')).toFixed(2)}`,
                          },
                          {
                            title: 'Bultos',
                            dataIndex: 'bultos',
                            key: 'bultos',
                            width: 80,
                            render: (value: string | number) => `${value || '0'}`,
                          },
                          {
                            title: 'Peso',
                            dataIndex: 'peso',
                            key: 'peso',
                            width: 100,
                            render: (value: string | number) => `${value || '0'}`,
                          },
                        ]
                      : [
                          // Columnas para servicio TDI
                          {
                            title: 'Guía Ingreso',
                            dataIndex: 'guiaingreso',
                            key: 'guiaingreso',
                            width: 180,
                          },
                          {
                            title: 'Guía Salida',
                            dataIndex: 'guiasalida',
                            key: 'guiasalida',
                            width: 150,
                            render: (value: string) => value || '-',
                          },
                          {
                            title: 'Contenido',
                            dataIndex: 'contenido',
                            key: 'contenido',
                            width: 120,
                          },
                          {
                            title: 'Costo',
                            dataIndex: 'costo',
                            key: 'costo',
                            width: 100,
                            render: (value: string | number) => `$${parseFloat(String(value || '0')).toFixed(2)}`,
                          },
                          {
                            title: 'Costo x GL',
                            dataIndex: 'cotgl',
                            key: 'cotgl',
                            width: 100,
                            render: (value: string | number) => `$${parseFloat(String(value || '0')).toFixed(2)}`,
                          },
                          {
                            title: 'Kilos',
                            dataIndex: 'kilos',
                            key: 'kilos',
                            width: 80,
                            render: (value: string | number) => `${value || '0'}`,
                          },
                          {
                            title: 'Tipo de cambio',
                            dataIndex: 'tipodecambio',
                            key: 'tipodecambio',
                            width: 120,
                            render: (value: string | number) => `$${parseFloat(String(value || '0')).toFixed(2)}`,
                          },
                          {
                            title: 'Costo Envío',
                            dataIndex: 'costoenvio',
                            key: 'costoenvio',
                            width: 100,
                            render: (value: string | number) => `$${parseFloat(String(value || '0')).toFixed(2)}`,
                          },
                        ]
                  }
                />
              </>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No hay información disponible</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReporteEstadoCuenta;
