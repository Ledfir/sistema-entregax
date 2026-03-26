import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Modal, Popconfirm, message, Typography } from 'antd';
import { InfoCircleOutlined, FileTextOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { humanizarFecha } from '@/utils/dateUtils';

const { Title } = Typography;

interface PagoPendiente {
  key: string;
  id: string;
  cliente: string;
  cantidad: number;
  fecha: string;
  info: string;
  cuenta: string;
  comprobante: string;
  comprobanteUrl: string;
  tipoComprobante: 'imagen' | 'pdf';
}

interface SaldoGeneral {
  key: string;
  id: string;
  claveCliente: string;
  cantidad: number;
  tipo: 'favor' | 'contra';
  detalles: string;
}

export const Saldo = () => {
  const [pagosPendientes, setPagosPendientes] = useState<PagoPendiente[]>([]);
  const [saldosGenerales, setSaldosGenerales] = useState<SaldoGeneral[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState(false);
  const [modalComprobante, setModalComprobante] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);
  const [infoSeleccionada, setInfoSeleccionada] = useState<string>('');
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState<PagoPendiente | null>(null);
  const [detallesSeleccionados, setDetallesSeleccionados] = useState<string>('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // TODO: Reemplazar con llamadas reales al API
      // const responsePendientes = await monederoService.getPendingPayments();
      // const responseSaldos = await monederoService.getGeneralBalances();
      
      // Datos de ejemplo - Pagos pendientes
      const datosPendientes: PagoPendiente[] = [
        {
          key: '1',
          id: '1',
          cliente: 'S2528 - ACME Corporation',
          cantidad: 15000.00,
          fecha: '2026-03-20',
          info: 'Pago de servicios de transporte marítimo. Cliente solicita factura urgente.',
          cuenta: 'BBVA BANCOMER',
          comprobante: 'COMP-001.pdf',
          comprobanteUrl: '/comprobantes/comp-001.pdf',
          tipoComprobante: 'pdf'
        },
        {
          key: '2',
          id: '2',
          cliente: 'C1520 - Tech Solutions SA',
          cantidad: 8500.00,
          fecha: '2026-03-22',
          info: 'Pago parcial de servicios logísticos.',
          cuenta: 'SANTANDER',
          comprobante: 'COMP-002.jpg',
          comprobanteUrl: '/comprobantes/comp-002.jpg',
          tipoComprobante: 'imagen'
        },
        {
          key: '3',
          id: '3',
          cliente: 'D2340 - Global Imports',
          cantidad: 12000.00,
          fecha: '2026-03-24',
          info: 'Pago de envío con factura. Verificar datos fiscales.',
          cuenta: 'HSBC',
          comprobante: 'COMP-003.pdf',
          comprobanteUrl: '/comprobantes/comp-003.pdf',
          tipoComprobante: 'pdf'
        }
      ];

      // Datos de ejemplo - Saldos generales
      const datosSaldos: SaldoGeneral[] = [
        {
          key: '1',
          id: '1',
          claveCliente: 'S2528 - ACME Corporation',
          cantidad: 5000.00,
          tipo: 'favor',
          detalles: 'Saldo a favor por pago anticipado de servicios. Fecha: 10/03/2026. Aplicable a próximos envíos.'
        },
        {
          key: '2',
          id: '2',
          claveCliente: 'C1520 - Tech Solutions SA',
          cantidad: -2500.00,
          tipo: 'contra',
          detalles: 'Saldo pendiente por servicios no pagados. Fecha límite: 30/03/2026. Contactar al cliente.'
        },
        {
          key: '3',
          id: '3',
          claveCliente: 'E3890 - Distribuidora XYZ',
          cantidad: 8000.00,
          tipo: 'favor',
          detalles: 'Depósito general para múltiples servicios. Fecha: 15/03/2026. Balance disponible para uso.'
        },
        {
          key: '4',
          id: '4',
          claveCliente: 'F4561 - Comercial ABC',
          cantidad: -1500.00,
          tipo: 'contra',
          detalles: 'Cargo por servicio extra no contemplado. Fecha: 20/03/2026. Pendiente de facturación.'
        }
      ];

      setPagosPendientes(datosPendientes);
      setSaldosGenerales(datosSaldos);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleVerInfo = (record: PagoPendiente) => {
    setInfoSeleccionada(record.info);
    setModalInfo(true);
  };

  const handleVerComprobante = (record: PagoPendiente) => {
    setComprobanteSeleccionado(record);
    setModalComprobante(true);
  };

  const handleEliminar = async (record: PagoPendiente) => {
    try {
      // TODO: Implementar llamada al API
      // await monederoService.deletePendingPayment(record.id);
      
      setPagosPendientes(pagosPendientes.filter(p => p.key !== record.key));
      
      message.success('Pago eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      message.error('No se pudo eliminar el pago');
    }
  };

  const handleVerDetalles = (record: SaldoGeneral) => {
    setDetallesSeleccionados(record.detalles);
    setModalDetalles(true);
  };

  const columnasPendientes: ColumnsType<PagoPendiente> = [
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      width: 220,
      ellipsis: true
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.cantidad - b.cantidad,
      render: (cantidad: number) => `$${cantidad.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 150,
      sorter: (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
      render: (fecha: string) => humanizarFecha(fecha)
    },
    {
      title: 'Info',
      key: 'info',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<InfoCircleOutlined />}
          onClick={() => handleVerInfo(record)}
        >
          Ver info
        </Button>
      )
    },
    {
      title: 'Cuenta',
      dataIndex: 'cuenta',
      key: 'cuenta',
      width: 150
    },
    {
      title: 'Comprobante',
      key: 'comprobante',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<FileTextOutlined />}
          onClick={() => handleVerComprobante(record)}
        >
          Ver
        </Button>
      )
    },
    {
      title: 'Eliminar',
      key: 'eliminar',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="¿Estás seguro?"
          description="¿Deseas eliminar este pago pendiente?"
          onConfirm={() => handleEliminar(record)}
          okText="Sí"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      )
    }
  ];

  const columnasSaldos: ColumnsType<SaldoGeneral> = [
    {
      title: 'Clave/Cliente',
      dataIndex: 'claveCliente',
      key: 'claveCliente',
      width: 220,
      ellipsis: true
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: 150,
      align: 'right',
      sorter: (a, b) => a.cantidad - b.cantidad,
      render: (cantidad: number, record) => (
        <Tag color={record.tipo === 'favor' ? 'success' : 'error'}>
          {cantidad >= 0 ? '+' : ''}${cantidad.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Tag>
      )
    },
    {
      title: 'Detalles',
      key: 'detalles',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleVerDetalles(record)}
        >
          Ver detalles
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Saldo clientes" 
        bordered={false}
        extra={
          <Button type="primary" onClick={cargarDatos}>
            Actualizar
          </Button>
        }
      >
        {/* Tabla de Pagos Pendientes */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
            Pagos pendientes de aprobación
          </Title>
          <Table
            columns={columnasPendientes}
            dataSource={pagosPendientes}
            loading={loading}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} pagos pendientes`,
              pageSizeOptions: ['5', '10', '20', '50']
            }}
            scroll={{ x: 1000 }}
          />
        </div>

        {/* Tabla de Saldos Generales */}
        <div>
          <Title level={5} style={{ marginBottom: '16px', color: '#52c41a' }}>
            Saldos a favor/pagos generales
          </Title>
          <Table
            columns={columnasSaldos}
            dataSource={saldosGenerales}
            loading={loading}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} registros`,
              pageSizeOptions: ['5', '10', '20', '50']
            }}
            scroll={{ x: 600 }}
          />
        </div>
      </Card>

      {/* Modal para ver información */}
      <Modal
        title="Información del pago"
        open={modalInfo}
        onCancel={() => setModalInfo(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setModalInfo(false)}>
            Cerrar
          </Button>
        ]}
        width={600}
      >
        <div style={{ padding: '20px', lineHeight: '1.8' }}>
          <p>{infoSeleccionada}</p>
        </div>
      </Modal>

      {/* Modal para ver comprobante */}
      <Modal
        title="Comprobante de pago"
        open={modalComprobante}
        onCancel={() => setModalComprobante(false)}
        footer={[
          <Button key="close" onClick={() => setModalComprobante(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {comprobanteSeleccionado && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {comprobanteSeleccionado.tipoComprobante === 'imagen' ? (
              <img
                src={comprobanteSeleccionado.comprobanteUrl}
                alt="Comprobante de pago"
                style={{ maxWidth: '100%', maxHeight: '600px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="18"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <FileTextOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '20px' }} />
                <p style={{ fontSize: '16px', marginBottom: '20px' }}>Archivo PDF: {comprobanteSeleccionado.comprobante}</p>
                <Button type="primary" href={comprobanteSeleccionado.comprobanteUrl} target="_blank">
                  Abrir PDF en nueva pestaña
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal para ver detalles */}
      <Modal
        title="Detalles del saldo"
        open={modalDetalles}
        onCancel={() => setModalDetalles(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setModalDetalles(false)}>
            Cerrar
          </Button>
        ]}
        width={600}
      >
        <div style={{ padding: '20px', lineHeight: '1.8' }}>
          <p>{detallesSeleccionados}</p>
        </div>
      </Modal>
    </div>
  );
};
