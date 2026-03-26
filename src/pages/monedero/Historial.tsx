import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Modal, message } from 'antd';
import { FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { humanizarFecha } from '@/utils/dateUtils';

interface Pago {
  key: string;
  id: string;
  asesor: string;
  cliente: string;
  comprobante: string;
  comprobanteUrl: string;
  tipoComprobante: 'imagen' | 'pdf';
  cantidad: number;
  fechaPago: string;
  cuenta: string;
  facturado: boolean;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'verificando';
  infoFacturacion?: {
    clienteId: string;
    fecha: string;
    cantidadFacturar: number;
    cuentaFiscal: string;
    tipoServicio: string;
    direccionFiscal: string;
    cedulaFiscalUrl?: string;
  };
}

export const Historial = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalComprobante, setModalComprobante] = useState(false);
  const [modalFacturacion, setModalFacturacion] = useState(false);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState<Pago | null>(null);
  const [facturacionSeleccionada, setFacturacionSeleccionada] = useState<Pago | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      // TODO: Reemplazar con llamada real al API
      // const response = await monederoService.getPaymentHistory();
      // setPagos(response.data);
      
      // Datos de ejemplo
      const datosEjemplo: Pago[] = [
        {
          key: '1',
          id: '1',
          asesor: 'Juan Pérez',
          cliente: 'S2S28 - ACME Corporation',
          comprobante: 'COMP-001.pdf',
          comprobanteUrl: '/comprobantes/comp-001.pdf',
          tipoComprobante: 'pdf',
          cantidad: 4224.25,
          fechaPago: '2025-12-22',
          cuenta: 'URBAN WOD CF SA DE CV',
          facturado: true,
          estado: 'aprobado',
          infoFacturacion: {
            clienteId: 'S2S28',
            fecha: '22/12/2025, 14:35',
            cantidadFacturar: 4224.25,
            cuentaFiscal: 'URBAN WOD CF SA DE CV',
            tipoServicio: 'Servicios de logística',
            direccionFiscal: 'CVV2207219N3 - Yliana S.A. de C.V. (San Rosa de lima 918 OTRA NO ESPECIFICADA EN EL CATALOGO CP 67286, Juárez Nuevo León)',
            cedulaFiscalUrl: '/cedulas/cedula-001.pdf'
          }
        },
        {
          key: '2',
          id: '2',
          asesor: 'María González',
          cliente: 'C1520 - Tech Solutions SA',
          comprobante: 'COMP-002.jpg',
          comprobanteUrl: '/comprobantes/comp-002.jpg',
          tipoComprobante: 'imagen',
          cantidad: 8500.00,
          fechaPago: '2026-01-15',
          cuenta: 'BANCO SANTANDER S.A.',
          facturado: true,
          estado: 'aprobado',
          infoFacturacion: {
            clienteId: 'C1520',
            fecha: '15/01/2026, 10:20',
            cantidadFacturar: 8500.00,
            cuentaFiscal: 'BANCO SANTANDER S.A.',
            tipoServicio: 'Transporte y logística',
            direccionFiscal: 'TSA850615XY9 - Tech Solutions S.A. de C.V. (Av. Reforma 450, Col. Centro CP 64000, Monterrey Nuevo León)',
            cedulaFiscalUrl: '/cedulas/cedula-002.pdf'
          }
        },
        {
          key: '3',
          id: '3',
          asesor: 'Carlos Ramírez',
          cliente: 'D2340 - Global Imports',
          comprobante: 'COMP-003.pdf',
          comprobanteUrl: '/comprobantes/comp-003.pdf',
          tipoComprobante: 'pdf',
          cantidad: 12000.00,
          fechaPago: '2026-02-10',
          cuenta: 'BBVA BANCOMER',
          facturado: false,
          estado: 'verificando'
        }
      ];
      
      setPagos(datosEjemplo);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      message.error('Error al cargar el historial de pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleVerComprobante = (record: Pago) => {
    setComprobanteSeleccionado(record);
    setModalComprobante(true);
  };

  const handleVerFacturacion = (record: Pago) => {
    if (!record.facturado || !record.infoFacturacion) {
      message.warning('No hay información de facturación disponible');
      return;
    }
    setFacturacionSeleccionada(record);
    setModalFacturacion(true);
  };

  const handleDescargarCedulaFiscal = () => {
    if (facturacionSeleccionada?.infoFacturacion?.cedulaFiscalUrl) {
      // TODO: Implementar descarga de cédula fiscal
      message.success('Descargando cédula fiscal...');
    }
  };

  const getEstadoColor = (estado: Pago['estado']): string => {
    const colores: Record<Pago['estado'], string> = {
      pendiente: 'default',
      verificando: 'processing',
      aprobado: 'success',
      rechazado: 'error'
    };
    return colores[estado];
  };

  const getEstadoTexto = (estado: Pago['estado']): string => {
    const textos: Record<Pago['estado'], string> = {
      pendiente: 'Pendiente',
      verificando: 'Verificando',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado'
    };
    return textos[estado];
  };

  const columns: ColumnsType<Pago> = [
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 150
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      width: 200,
      ellipsis: true
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
          Ver comprobante
        </Button>
      )
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
      title: 'Fecha de pago',
      dataIndex: 'fechaPago',
      key: 'fechaPago',
      width: 150,
      sorter: (a, b) => new Date(a.fechaPago).getTime() - new Date(b.fechaPago).getTime(),
      render: (fecha: string) => humanizarFecha(fecha)
    },
    {
      title: 'Cuenta',
      dataIndex: 'cuenta',
      key: 'cuenta',
      width: 180,
      ellipsis: true
    },
    {
      title: 'Facturado',
      key: 'facturado',
      width: 150,
      align: 'center',
      filters: [
        { text: 'Sí', value: true },
        { text: 'No', value: false }
      ],
      onFilter: (value, record) => record.facturado === value,
      render: (_, record) => (
        record.facturado ? (
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            onClick={() => handleVerFacturacion(record)}
          >
            Ver facturación
          </Button>
        ) : (
          <Tag color="default">No facturado</Tag>
        )
      )
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      filters: [
        { text: 'Pendiente', value: 'pendiente' },
        { text: 'Verificando', value: 'verificando' },
        { text: 'Aprobado', value: 'aprobado' },
        { text: 'Rechazado', value: 'rechazado' }
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado: Pago['estado']) => (
        <Tag color={getEstadoColor(estado)}>
          {getEstadoTexto(estado)}
        </Tag>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Historial de pagos" 
        bordered={false}
        extra={
          <Button type="primary" onClick={cargarHistorial}>
            Actualizar
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={pagos}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} pagos`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

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
                {/* Alternativa: Usar iframe para mostrar PDF */}
                {/* <iframe 
                  src={comprobanteSeleccionado.comprobanteUrl} 
                  style={{ width: '100%', height: '500px', border: 'none' }}
                  title="Comprobante PDF"
                /> */}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal para información de facturación */}
      <Modal
        title="Información de facturación"
        open={modalFacturacion}
        onCancel={() => setModalFacturacion(false)}
        footer={[
          <Button 
            key="cedula" 
            type="primary"
            onClick={handleDescargarCedulaFiscal}
            style={{ marginRight: 'auto' }}
          >
            Cédula fiscal
          </Button>,
          <Button key="close" onClick={() => setModalFacturacion(false)}>
            Cerrar
          </Button>
        ]}
        width={600}
      >
        {facturacionSeleccionada?.infoFacturacion && (
          <div style={{ padding: '20px' }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '15px', 
              backgroundColor: '#52c41a', 
              color: 'white',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              PAGO FACTURADO
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #1890ff', 
                paddingBottom: '10px',
                marginBottom: '15px',
                color: '#333'
              }}>
                Información de facturación
              </h3>
              <div style={{ lineHeight: '2' }}>
                <p><strong>Cliente:</strong> {facturacionSeleccionada.infoFacturacion.clienteId}</p>
                <p><strong>Fecha:</strong> {facturacionSeleccionada.infoFacturacion.fecha}</p>
                <p><strong>Cantidad a facturar:</strong> ${facturacionSeleccionada.infoFacturacion.cantidadFacturar.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p><strong>Cuenta:</strong> {facturacionSeleccionada.infoFacturacion.cuentaFiscal}</p>
                <p><strong>Tipo de servicio:</strong> {facturacionSeleccionada.infoFacturacion.tipoServicio}</p>
              </div>
            </div>

            <div>
              <h3 style={{ 
                borderBottom: '2px solid #1890ff', 
                paddingBottom: '10px',
                marginBottom: '15px',
                color: '#333'
              }}>
                Dirección fiscal para facturación
              </h3>
              <p style={{ lineHeight: '1.8', color: '#555' }}>
                {facturacionSeleccionada.infoFacturacion.direccionFiscal}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
