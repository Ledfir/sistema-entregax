import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Tag, message, Button, Modal, Select } from 'antd';
import { SearchOutlined, DownloadOutlined, QuestionCircleOutlined, SaveOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { cedisMaritimoService } from '@/services/cedisMaritimoService';
import { useAuthStore } from '@/store/authStore';

interface BlPorRecibir {
  id: string | number;
  name: string;
  week?: string;
  eta?: string;
  estado?: string;
  naviera?: string;
  puerto?: string;
  cbm?: string | number;
  bultos?: string | number;
  [key: string]: any;
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

const RecibirBL: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlPorRecibir[]>([]);
  const [filteredData, setFilteredData] = useState<BlPorRecibir[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BlPorRecibir | null>(null);
  const [blDetalle, setBlDetalle] = useState<BlDetalle | null>(null);
  const [logsData, setLogsData] = useState<LogRecord[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [logsPageSize, setLogsPageSize] = useState(10);
  const cedisList = [
    { value: 'gdl', label: 'CEDIS GDL' },
    { value: 'cdmx', label: 'CEDIS CDMX' },
  ];
  const [selectedCedis, setSelectedCedis] = useState<string | null>(null);
  const [savingCedis, setSavingCedis] = useState(false);

  useEffect(() => {
    document.title = 'Recibir BL | CEDIS Marítimo';
    fetchData();
    return () => { document.title = 'Sistema Entregax'; };
  }, []);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredData(data);
      return;
    }
    const lower = searchText.toLowerCase();
    setFilteredData(
      data.filter(r =>
        Object.values(r).some(v => String(v ?? '').toLowerCase().includes(lower))
      )
    );
  }, [searchText, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await cedisMaritimoService.getBlsPorRecibir();
      const list: BlPorRecibir[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setData(list);
      setFilteredData(list);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Error al cargar los BLs');
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
    if (diffMinutos < 1) return 'Hace unos segundos';
    if (diffMinutos < 60) return `Hace ${diffMinutos} ${diffMinutos === 1 ? 'minuto' : 'minutos'}`;
    if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
    if (diffDias === 1) return `Ayer a las ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDias < 7) return `Hace ${diffDias} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const calcularTotales = () => {
    const totalCbm = logsData.reduce((sum, log) => sum + (parseFloat(log.cbm) || 0), 0);
    const totalBultos = logsData.reduce((sum, log) => sum + (parseFloat(log.bultos) || 0), 0);
    return { cbm: totalCbm.toFixed(2), bultos: totalBultos.toFixed(0) };
  };

  const handleRecibirPL = async (record: BlPorRecibir) => {
    setSelectedRecord(record);
    setModalOpen(true);
    setSelectedCedis(null);
    setLoadingDetalle(true);
    try {
      const detalleRes = await cedisMaritimoService.getDetallesBlRecibido(record.id);
      if (detalleRes.status === 'success' && detalleRes.data) {
        setBlDetalle(detalleRes.data.bl);
        setLogsData(detalleRes.data.logs || []);
      }
    } catch {
      message.error('Error al cargar los detalles del BL');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleGuardarCedis = async () => {
    if (!selectedRecord || !selectedCedis) {
      message.warning('Selecciona un CEDIS antes de guardar');
      return;
    }
    if (!user?.token) {
      message.error('No se encontró la sesión del usuario');
      return;
    }
    setSavingCedis(true);
    try {
      const res = await cedisMaritimoService.recibirBlMaritimo(selectedRecord.id, selectedCedis, user.token);
      if (res?.status === 'success') {
        message.success(res.message || 'BL recibido en CEDIS correctamente');
        handleCloseModal();
        fetchData();
      } else {
        message.error(res?.message || 'Error al procesar la recepción');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al guardar';
      message.error(msg);
    } finally {
      setSavingCedis(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
    setBlDetalle(null);
    setLogsData([]);
    setLogsPageSize(10);
    setSelectedCedis(null);
  };

  const handleDescargarQRs = async () => {
    if (!blDetalle) return;
    try {
      message.loading({ content: 'Generando etiquetas...', key: 'qr-download' });
      const blob = await cedisMaritimoService.imprimirEtiquetasBl(blDetalle.id);
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        message.error({ content: errorData.message || 'Error al generar etiquetas', key: 'qr-download' });
        return;
      }
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
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al descargar las etiquetas';
      message.error({ content: errorMessage, key: 'qr-download' });
    }
  };

  const obtenerColorEstado = (estado: string) => {
    const colores: { [key: string]: string } = {
      recibido: 'blue', procesado: 'green', pendiente: 'orange', rechazado: 'red',
    };
    return colores[estado?.toLowerCase()] || 'default';
  };

  const columns: ColumnsType<BlPorRecibir> = [
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'left',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleRecibirPL(record)}>
          Recibir PL
        </Button>
      ),
    },
    {
      title: 'BL',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
      render: (val) => <strong>{val}</strong>,
    },
    {
      title: 'Week',
      dataIndex: 'week',
      key: 'week',
      render: (val) => val || '—',
    },
    {
      title: 'ETA',
      dataIndex: 'arrived',
      key: 'arrived',
      render: (val) => val || '—',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (val) => val != null ? val : '—',
    },
    {
      title: 'Fecha',
      dataIndex: 'created',
      key: 'created',
      render: (val) => val != null ? val : '—',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (val) => val ? <Tag color={obtenerColorEstado(val)}>{val.toUpperCase()}</Tag> : '—',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="BL Disponibles en Tránsito a CEDIS"
        extra={
          <Input
            placeholder="Buscar..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50'],
            showTotal: (total) => `${total} BL${total !== 1 ? 's' : ''}`,
            onShowSizeChange: (_, size) => setPageSize(size),
          }}
          scroll={{ x: 800 }}
          size="small"
          bordered
        />
      </Card>

      <Modal
        title={`Detalles BL ${selectedRecord?.name || ''}`}
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>Cerrar</Button>,
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
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <QuestionCircleOutlined style={{ fontSize: 16, color: '#888' }} />
                <span style={{ fontSize: '14px' }}>
                  Selecciona en que <strong style={{ color: '#1890ff' }}>CEDIS</strong> se va a recibir:
                </span>
                <Select
                  placeholder="Seleccionar CEDIS"
                  style={{ minWidth: 200 }}
                  value={selectedCedis}
                  onChange={(val) => setSelectedCedis(val)}
                  options={cedisList}
                  loading={loadingDetalle}
                  allowClear
                />
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  onClick={handleGuardarCedis}
                  loading={savingCedis}
                >
                  Guardar
                </Button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>
                  Estado Actual: <span style={{ color: '#1890ff' }}>{blDetalle.estado} - {blDetalle.cedis}</span>
                </h3>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  BL: <strong style={{ color: '#ff8c00' }}>{blDetalle.name}</strong> -&nbsp;
                  WEEK: <strong>{blDetalle.week}</strong> -&nbsp;
                  Fecha: <strong>{formatearFecha(blDetalle.created)}</strong>
                  {logsData.length > 0 && ` - CBMS: ${calcularTotales().cbm}`}
                  {logsData.length > 0 && ` - Bultos: ${calcularTotales().bultos}`}
                </p>
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Imprimir QRs de este BL:</span>
                <Button type="primary" icon={<DownloadOutlined />} onClick={handleDescargarQRs}>
                  Descargar
                </Button>
              </div>

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
                      { title: 'LOG', dataIndex: 'name', key: 'name', align: 'center', width: '15%' },
                      { title: 'Cliente', dataIndex: 'cliente', key: 'cliente', align: 'left', ellipsis: true },
                      { title: 'CBMs', dataIndex: 'cbm', key: 'cbm', align: 'center', width: '12%', render: (val: string) => <strong>{val}</strong> },
                      { title: 'Bultos', dataIndex: 'bultos', key: 'bultos', align: 'center', width: '12%', render: (val: string) => <strong>{val}</strong> },
                      { title: 'Asesor', dataIndex: 'asesor', key: 'asesor', align: 'left', width: '20%', ellipsis: true },
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

export default RecibirBL;

