import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, DatePicker, Typography, message, Table, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, FileTextOutlined, ExportOutlined } from '@ant-design/icons';
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

  const cargarCuentas = async () => {
    try {
      setLoadingCuentas(true);
      const data = await cuentasService.list();
      setCuentas(data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      message.error('Error al cargar las cuentas');
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
      message.error('Error al cargar los clientes');
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
      message.error('Error al generar el reporte');
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
          disabled={!record.enlace_monedero}
          onClick={() => record.enlace_monedero && window.open(record.enlace_monedero, '_blank')}
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
              style={{
                backgroundColor: '#ff6600',
                borderColor: '#ff6600',
                minWidth: '150px',
              }}
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
    </div>
  );
};

export default ReporteEstadoCuenta;
