import { useEffect, useState } from 'react';
import { Card, Table, Input, Button, Dropdown, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { SearchOutlined, MoreOutlined, EyeOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import axios from '@/api/axios';
import { useSnackbar } from 'notistack';
import { CargoExtraDetalleView } from './CargoExtraDetalleView';
import './CargoExtra.css';

interface CargoExtraPendienteItem {
  id: string;
  token: string;
  idce: string;
  idu?: string;
  idc?: string;
  cta?: string;
  pagado?: string | number;
  listo?: string | number;
  file?: string;
  fechap: string | null;
  resp?: string;
  state?: string | number;
  created: string | null;
  paid?: string | null;
  extencion?: string;
  suite?: string;
  cliente: string;
  cuenta?: string;
  monto: string | number;
}

export const CargoExtraPendientes = () => {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CargoExtraPendienteItem[]>([]);
  const [filtered, setFiltered] = useState<CargoExtraPendienteItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<CargoExtraPendienteItem | null>(null);
  const [loadingPdfId, setLoadingPdfId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Sistema Entregax | Pendientes de Pago';
    if (user?.id) fetchPendientes();
  }, [user?.id]);

  const fetchPendientes = async () => {
    setLoading(true);
    try {
      const token = user?.token || localStorage.getItem('token') || '';
      const res = await axios.get(`/extra-charges/pending-payments/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data;
      let list: CargoExtraPendienteItem[] = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (payload?.status === 'success' && Array.isArray(payload.data)) {
        list = payload.data;
      } else if (payload?.data && Array.isArray(payload.data)) {
        list = payload.data;
      }
      setData(list);
      setFiltered(list);
    } catch {
      setData([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const q = value.toLowerCase();
    setFiltered(
      data.filter(
        (r) =>
          r.idce?.toLowerCase().includes(q) ||
          r.cliente?.toLowerCase().includes(q) ||
          String(r.monto).includes(q) ||
          r.cuenta?.toLowerCase().includes(q)
      )
    );
  };

  const formatMonto = (value: string | number) => {
    const num = parseFloat(String(value));
    if (isNaN(num)) return '—';
    return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return '—';
    try {
      return new Date(fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return fecha;
    }
  };

  const isVencido = (fecha: string | null) => {
    if (!fecha || fecha.startsWith('0000')) return false;
    return new Date(fecha) < new Date();
  };

  const generatePdf = async (idce: string) => {
    setLoadingPdfId(idce);
    try {
      const token = user?.token || localStorage.getItem('token') || '';
      const res = await axios.get(`/extra-charges/generate-pdf/${idce}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data;
      if (payload?.status === 'success' && payload?.url) {
        window.open(payload.url, '_blank');
      } else {
        enqueueSnackbar(payload?.message ?? 'Error al generar el PDF', { variant: 'error' });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      enqueueSnackbar(e?.response?.data?.message ?? e?.message ?? 'Error al generar el PDF', { variant: 'error' });
    } finally {
      setLoadingPdfId(null);
    }
  };

  const columns: ColumnsType<CargoExtraPendienteItem> = [
    {
      title: 'Opciones',
      key: 'opciones',
      align: 'center',
      width: 90,
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'ver',
            icon: <EyeOutlined />,
            label: 'Ver detalles',
            onClick: () => setSelectedRecord(record),
          },
          {
            key: 'pdf',
            icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
            label: loadingPdfId === record.idce ? 'Generando...' : 'Descargar PDF',
            disabled: loadingPdfId === record.idce,
            onClick: () => generatePdf(record.idce),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomLeft">
            <Button
              size="small"
              icon={<MoreOutlined />}
              style={{ borderColor: '#d9d9d9' }}
            />
          </Dropdown>
        );
      },
    },
    {
      title: 'IDCE',
      dataIndex: 'idce',
      key: 'idce',
      align: 'center',
      render: (v) => <strong>{v || '—'}</strong>,
    },
    {
      title: 'Cliente',
      key: 'cliente',
      align: 'center',
      render: (_, record) =>
        record.suite
          ? <span style={{ fontWeight: 500 }}>({record.suite}) {record.cliente}</span>
          : <span>{record.cliente || '—'}</span>,
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      align: 'center',
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{formatMonto(v)}</span>
      ),
    },
    {
      title: 'Cuenta',
      dataIndex: 'cuenta',
      key: 'cuenta',
      align: 'center',
      render: (v) => v || '—',
    },
    {
      title: 'Fecha límite de pago',
      dataIndex: 'fechap',
      key: 'fechap',
      align: 'center',
      render: (v) => (
        <span style={{ color: isVencido(v) ? '#ff4d4f' : undefined, fontWeight: isVencido(v) ? 600 : undefined }}>
          {formatFecha(v)}
        </span>
      ),
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'created',
      key: 'created',
      align: 'center',
      render: (v) => formatFecha(v),
    },
    {
      title: 'Estado',
      key: 'estado',
      align: 'center',
      render: (_, record) => {
        const val = Number(record.state);
        switch (val) {
          case 0: return <Tag color="error">Eliminado</Tag>;
          case 1: return <Tag color="processing">Nuevo</Tag>;
          case 2: return <Tag color="success">Pagado</Tag>;
          case 3: return <Tag color="default">Cancelado</Tag>;
          default: return <Tag color="warning">Pendiente</Tag>;
        }
      },
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      {selectedRecord ? (
        <CargoExtraDetalleView
          token={selectedRecord.token}
          idce={selectedRecord.idce}
          suite={selectedRecord.suite}
          clienteName={selectedRecord.cliente}
          monto={selectedRecord.monto}
          fechap={selectedRecord.fechap}
          state={selectedRecord.state}
          pagado={selectedRecord.pagado}
          onBack={() => setSelectedRecord(null)}
        />
      ) : (
      <Card
        title={
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.4 }}>
            PENDIENTES DE PAGO
          </span>
        }
        extra={
          <Input
            placeholder="Buscar..."
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
      >
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="token"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '25', '50'],
            showTotal: (total) => `Total: ${total} registros`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
          locale={{ emptyText: 'Sin pendientes de pago' }}
        />
      </Card>
      )}
    </div>
  );
};
