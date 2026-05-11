import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, message, Tag, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { cedisMaritimoService } from '@/services/cedisMaritimoService';

interface BlRecibidoRecord {
  id: string | number;
  bl_number: string;
  week: string;
  eta: string;
  tipo: string;
  fecha: string;
  estado: string;
  observaciones?: string;
}

interface LogRecord {
  name: string;
  cliente: string;
  cbm: string;
  bultos: string;
  asesor: string;
}

interface BlDetalle {
  id: string;
  name: string;
  week: string;
  created: string;
  estado: string;
  cedis: string;
  cbm?: string;
  bultos?: string;
}

const HistorialBlRecibidos: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlRecibidoRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<BlRecibidoRecord[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BlRecibidoRecord | null>(null);
  const [blDetalle, setBlDetalle] = useState<BlDetalle | null>(null);
  const [logsData, setLogsData] = useState<LogRecord[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [logsPageSize, setLogsPageSize] = useState(10);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchText, data]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const response = await cedisMaritimoService.getHistorialBlRecibidos();
      
      if (response.status === 'success' && response.data) {
        // Mapear los datos de la API a la estructura de la tabla
        const mappedData = response.data.map((item: any) => ({
          id: item.id,
          bl_number: item.name,
          week: item.week,
          eta: item.arrived,
          tipo: item.tipo,
          fecha: item.created,
          estado: item.estado,
        }));
        setData(mappedData);
      } else {
        setData([]);
        message.info('No se encontraron registros');
      }
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.message || 
                           'Error al cargar los datos';
      message.error(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffMinutos = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    // Menos de 1 minuto
    if (diffMinutos < 1) {
      return 'Hace unos segundos';
    }
    
    // Menos de 1 hora
    if (diffMinutos < 60) {
      return `Hace ${diffMinutos} ${diffMinutos === 1 ? 'minuto' : 'minutos'}`;
    }
    
    // Menos de 24 horas
    if (diffHoras < 24) {
      return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
    }
    
    // Ayer
    if (diffDias === 1) {
      return `Ayer a las ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Menos de 7 días
    if (diffDias < 7) {
      return `Hace ${diffDias} días`;
    }
    
    // Fecha completa humanizada
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const obtenerColorEstado = (estado: string) => {
    const colores: { [key: string]: string } = {
      recibido: 'blue',
      procesado: 'green',
      pendiente: 'orange',
      rechazado: 'red',
    };
    return colores[estado.toLowerCase()] || 'default';
  };

  const handleVerDetalle = async (record: BlRecibidoRecord) => {
    setSelectedRecord(record);
    setModalOpen(true);
    setLoadingDetalle(true);
    
    try {
      const response = await cedisMaritimoService.getDetallesBlRecibido(record.id);
      
      if (response.status === 'success' && response.data) {
        setBlDetalle(response.data.bl);
        setLogsData(response.data.logs || []);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      message.error('Error al cargar los detalles del BL');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
    setBlDetalle(null);
    setLogsData([]);
    setLogsPageSize(10);
  };

  const handleDescargarQRs = async () => {
    if (!blDetalle) return;
    
    try {
      message.loading({ content: 'Generando etiquetas...', key: 'qr-download' });
      
      const blob = await cedisMaritimoService.imprimirEtiquetasBl(blDetalle.id);
      
      // Verificar si la respuesta es un JSON de error
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        message.error({ content: errorData.message || 'Error al generar etiquetas', key: 'qr-download' });
        return;
      }
      
      // Descargar el PDF
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_BL_${blDetalle.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success({ content: 'Etiquetas descargadas correctamente', key: 'qr-download' });
    } catch (error: any) {
      console.error('Error al descargar etiquetas:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al descargar las etiquetas';
      message.error({ content: errorMessage, key: 'qr-download' });
    }
  };

  // Calcular totales de CBM y Bultos de los logs
  const calcularTotales = () => {
    const totalCbm = logsData.reduce((sum, log) => sum + (parseFloat(log.cbm) || 0), 0);
    const totalBultos = logsData.reduce((sum, log) => sum + (parseFloat(log.bultos) || 0), 0);
    return {
      cbm: totalCbm.toFixed(2),
      bultos: totalBultos.toFixed(0)
    };
  };

  const columns: ColumnsType<BlRecibidoRecord> = [
    {
      title: 'ACCIONES',
      key: 'acciones',
      width: 150,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: BlRecibidoRecord) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetalle(record)}
          >
            Detalles
          </Button>
        </div>
      ),
    },
    {
      title: 'BL',
      dataIndex: 'bl_number',
      key: 'bl_number',
      width: 150,
      align: 'center',
    },
    {
      title: 'WEEK',
      dataIndex: 'week',
      key: 'week',
      width: 120,
      align: 'center',
    },
    {
      title: 'ETA',
      dataIndex: 'eta',
      key: 'eta',
      width: 120,
      align: 'center',
      render: (fecha: string) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      },
    },
    {
      title: 'TIPO',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 100,
      align: 'center',
    },
    {
      title: 'FECHA',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 150,
      align: 'center',
      render: (fecha: string) => formatearFecha(fecha),
    },
    {
      title: 'ESTADO',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      align: 'center',
      render: (estado: string) => (
        <Tag color={obtenerColorEstado(estado)}>
          {estado.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Historial de BL Recibidos por CEDIS"
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar BL, Cliente, Naviera, etc..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
            size="large"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} Entradas`,
            onShowSizeChange: (_current, size) => setPageSize(size),
          }}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Card>

      <Modal
        title={`Detalles BL ${selectedRecord?.bl_number || ''}`}
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Cerrar
          </Button>,
        ]}
        width={1200}
      >
        {loadingDetalle ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Cargando detalles...</p>
          </div>
        ) : (
          blDetalle && (
            <div style={{ padding: '20px 0' }}>
              {/* Estado Actual */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>
                  Estado Actual: <span style={{ color: '#1890ff' }}>{blDetalle.estado} - {blDetalle.cedis}</span>
                </h3>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  BL: <strong style={{ color: '#ff8c00' }}>{blDetalle.name}</strong> - 
                  WEEK: <strong>{blDetalle.week}</strong> - 
                  Fecha: <strong>{formatearFecha(blDetalle.created)}</strong>
                  {logsData.length > 0 && ` - CBMS: ${calcularTotales().cbm}`}
                  {logsData.length > 0 && ` - Bultos: ${calcularTotales().bultos}`}
                </p>
              </div>

              {/* Botón de descarga de QRs */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Imprimir QRs de este BL:</span>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />}
                  onClick={handleDescargarQRs}
                >
                  Descargar
                </Button>
              </div>

              {/* Tabla de LOGs */}
              {logsData.length > 0 && (
                <Card 
                  title="Logs Registrados" 
                  size="small" 
                  style={{ marginTop: '20px' }}
                  bodyStyle={{ padding: '12px' }}
                >
                  <Table
                    dataSource={logsData}
                    rowKey="name"
                    pagination={{
                      pageSize: logsPageSize,
                      showSizeChanger: true,
                      pageSizeOptions: ['5', '10', '20', '50'],
                      showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
                      onShowSizeChange: (_current, size) => setLogsPageSize(size),
                    }}
                    bordered
                    size="middle"
                    style={{ marginTop: '8px' }}
                    columns={[
                      {
                        title: 'LOG',
                        dataIndex: 'name',
                        key: 'name',
                        align: 'center',
                        width: '15%',
                      },
                      {
                        title: 'Cliente',
                        dataIndex: 'cliente',
                        key: 'cliente',
                        align: 'left',
                        ellipsis: true,
                      },
                      {
                        title: 'CBMs',
                        dataIndex: 'cbm',
                        key: 'cbm',
                        align: 'center',
                        width: '12%',
                        render: (value: string) => <strong>{value}</strong>
                      },
                      {
                        title: 'Bultos',
                        dataIndex: 'bultos',
                        key: 'bultos',
                        align: 'center',
                        width: '12%',
                        render: (value: string) => <strong>{value}</strong>
                      },
                      {
                        title: 'Asesor',
                        dataIndex: 'asesor',
                        key: 'asesor',
                        align: 'left',
                        width: '20%',
                        ellipsis: true,
                      },
                    ]}
                  />
                </Card>
              )}
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default HistorialBlRecibidos;
