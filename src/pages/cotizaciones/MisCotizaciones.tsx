import { useState, useEffect, useMemo } from 'react';
import { Button, Card, Input, Space, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import operacionesService from '@/services/operacionesService';
import { useAuthStore } from '@/store/authStore';

interface CotizacionRow {
  key: string;
  id: string | number;
  cliente: string;
  idco: string;
  creada: string;
  costo: string;
  envio: string;
  total: string;
  raw: any;
}

function mapRows(items: any[]): CotizacionRow[] {
  if (!Array.isArray(items)) return [];
  return items.map((r, idx) => ({
    key:     String(r.id ?? idx),
    id:      r.id ?? idx,
    cliente: r.suite ?? r.idc ?? '',
    idco:    r.ctz ?? '',
    creada:  r.created ?? '',
    costo:   r.costo   != null ? `$${Number(r.costo).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    envio:   r.costoenvio != null ? `$${Number(r.costoenvio).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    total:   r.total   != null ? `$${Number(r.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    raw: r,
  }));
}

const COLUMNS: ColumnsType<CotizacionRow> = [
  { title: 'Cliente', dataIndex: 'cliente', key: 'cliente' },
  { title: 'IDCO',    dataIndex: 'idco',    key: 'idco' },
  { title: 'Creada',  dataIndex: 'creada',  key: 'creada' },
  { title: 'Costo',   dataIndex: 'costo',   key: 'costo' },
  { title: 'Envio',   dataIndex: 'envio',   key: 'envio' },
  { title: 'Total',   dataIndex: 'total',   key: 'total', render: (val) => <strong>{val}</strong> },
  {
    title: 'Detalles',
    key: 'detalles',
    fixed: 'right',
    render: (_: any, row: CotizacionRow) => (
      <Button
        type="primary"
        size="small"
        style={{ background: '#1d3557' }}
        onClick={() => console.log('Detalles', row)}
      >
        Detalles
      </Button>
    ),
  },
];

export const MisCotizaciones = () => {
  const { user } = useAuthStore();

  const [loading, setLoading]       = useState(false);
  const [data, setData]             = useState<CotizacionRow[]>([]);
  const [searchText, setSearchText] = useState('');

  const cargarDatos = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res   = await operacionesService.getMyQuotes(user.id);
      const items = res?.data ?? res ?? [];
      setData(mapRows(Array.isArray(items) ? items : []));
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al cargar las cotizaciones.', showConfirmButton: false, timer: 4000 });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Sistema Entregax | Mis cotizaciones';
    cargarDatos();
  }, []);

  const filtered = useMemo(() => {
    if (!searchText.trim()) return data;
    const q = searchText.toLowerCase();
    return data.filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q)));
  }, [data, searchText]);

  return (
    <Card
      title="Mis cotizaciones"
      extra={
        <Space>
          <Input.Search
            placeholder="Buscar..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
          />
          <Button icon={<ReloadOutlined />} onClick={cargarDatos} />
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Table
          columns={COLUMNS}
          dataSource={filtered}
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} registros` }}
        />
      </Spin>
    </Card>
  );
};
