import { useState, useEffect, useMemo } from 'react';
import { Button, Card, Input, Space, Spin, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import Swal from 'sweetalert2';
import operacionesService from '@/services/operacionesService';
import { useAuthStore } from '@/store/authStore';

dayjs.locale('es');

interface GuiaArchivadaRow {
  id: string | number;
  key: string;
  cliente: string;
  guiaIngreso: string;
  tipo: string;
  estado: string;
  guiaUnica: string;
  creacion: string;
  cedis: string;
  fechaEntrada: string;
  guiaInternacional: string;
  peso: string;
  costo: string;
  tipoCambio: string;
  medidas: string;
  raw: any;
}

const ESTADO_MAP: Record<string, string> = {
  '0': 'Archivado',
  '1': 'Pendiente',
  '2': 'En tránsito',
  '3': 'En bodega',
  '4': 'Listo para entrega',
  '5': 'Informacion de envio recibida',
  '6': 'Entregado',
};

const formatDate = (val: string) => {
  if (!val) return <span style={{ color: '#aaa' }}>—</span>;
  const d = dayjs(val);
  if (!d.isValid()) return <span>{val}</span>;
  return <span title={d.format('DD/MM/YYYY HH:mm')}>{d.format('DD MMM YYYY')}</span>;
};

function mapRows(items: any[]): GuiaArchivadaRow[] {
  if (!Array.isArray(items)) return [];
  return items.map((r, idx) => {
    const alto   = r.alto   ?? '';
    const ancho  = r.ancho  ?? '';
    const largo  = r.largo  ?? '';
    const medidas = (alto && ancho && largo) ? `${largo} X ${ancho} X ${alto}` : '—';
    const estado = r.edox ?? ESTADO_MAP[String(r.estado ?? '')] ?? String(r.estado ?? '');

    return {
      id:                r.id ?? idx,
      key:               String(r.id ?? idx),
      cliente:           r.iud ?? r.idc ?? r.mid ?? r.cliente ?? '',
      guiaIngreso:       r.guiaingreso ?? r.guia_ingreso ?? '',
      tipo:              r.tipo ?? r.tipi ?? r.tipocotizacion ?? '',
      estado,
      guiaUnica:         r.guiaunica ?? r.guia_unica ?? '',
      creacion:          r.created ?? r.creacion ?? '',
      cedis:             r.cadisid ?? r.cedisid ?? r.cedis ?? '',
      fechaEntrada:      r.fechaentrada ?? r.fecha_entrada ?? '',
      guiaInternacional: r.guiainternacional ?? r.guia_internacional ?? '',
      peso:              r.kilos ? `${r.kilos} Kg.` : '—',
      costo:             r.costo ? `$${Number(r.costo).toFixed(2)}` : '$0.00',
      tipoCambio:        r.tipodecambio ? `$${Number(r.tipodecambio).toFixed(2)}` : '$0.00',
      medidas,
      raw: r,
    };
  });
}

export const GuiasArchivadas = () => {
  const { user } = useAuthStore();
  const [loading, setLoading]             = useState(false);
  const [data, setData]                   = useState<GuiaArchivadaRow[]>([]);
  const [searchText, setSearchText]       = useState('');
  const [desarchivarId, setDesarchivarId] = useState<string | number | null>(null);

  const cargarDatos = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await operacionesService.getArchivedWaybills(user.id);
      const items = res?.data ?? res ?? [];
      setData(mapRows(Array.isArray(items) ? items : []));
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: '',
        text: e?.response?.data?.message ?? 'Error al cargar las guías archivadas.',
        showConfirmButton: false,
        timer: 4000,
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDesarchivar = async (row: GuiaArchivadaRow) => {
    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Desarchivar guía?',
      text: `¿Deseas desarchivar la guía ${row.guiaIngreso || row.id}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, desarchivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#F26522',
    });
    if (!confirm.isConfirmed) return;
    try {
      setDesarchivarId(row.id);
      const res = await operacionesService.desarchivedWaybill({ id: row.id, iduser: user?.id ?? '' });
      Swal.fire({
        icon: 'success',
        title: '',
        text: res?.message ?? 'Guía desarchivada correctamente.',
        showConfirmButton: false,
        timer: 3000,
      });
      cargarDatos();
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: '',
        text: e?.response?.data?.message ?? 'Error al desarchivar la guía.',
        showConfirmButton: false,
        timer: 4000,
      });
    } finally {
      setDesarchivarId(null);
    }
  };

  useEffect(() => {
    document.title = 'Sistema Entregax | Guías Archivadas';
    cargarDatos();
  }, []);

  const filtered = useMemo(() => {
    if (!searchText.trim()) return data;
    const q = searchText.toLowerCase();
    return data.filter((r) =>
      Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [data, searchText]);

  const columns: ColumnsType<GuiaArchivadaRow> = [
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
    },
    {
      title: 'Guia Ingreso',
      dataIndex: 'guiaIngreso',
      key: 'guiaIngreso',
      render: (val) => (
        <span style={{ color: '#F26522', fontWeight: 500, cursor: 'pointer' }}>{val || '—'}</span>
      ),
    },
    { title: 'Tipo',     dataIndex: 'tipo',    key: 'tipo' },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (val) => <span style={{ color: '#52c41a' }}>{val || '—'}</span>,
    },
    { title: 'Guia Única',        dataIndex: 'guiaUnica',         key: 'guiaUnica' },
    { title: 'Fecha de creación', dataIndex: 'creacion',          key: 'creacion',      render: formatDate },
    { title: 'CEDIS',             dataIndex: 'cedis',             key: 'cedis' },
    { title: 'Fecha de entrada',  dataIndex: 'fechaEntrada',      key: 'fechaEntrada',  render: formatDate },
    {
      title: 'Guia Internacional',
      dataIndex: 'guiaInternacional',
      key: 'guiaInternacional',
      render: (val) => val || <span style={{ color: '#aaa' }}>—</span>,
    },
    { title: 'Peso',           dataIndex: 'peso',       key: 'peso' },
    { title: 'Costo',          dataIndex: 'costo',      key: 'costo' },
    { title: 'Tipo de cambio', dataIndex: 'tipoCambio', key: 'tipoCambio' },
    { title: 'Medidas',        dataIndex: 'medidas',    key: 'medidas' },
    {
      title: 'Opciones',
      key: 'opciones',
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            style={{ backgroundColor: '#F26522', borderColor: '#F26522', color: '#fff', fontWeight: 600 }}
            loading={desarchivarId === row.id}
            onClick={() => handleDesarchivar(row)}
          >
            Desarchivar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Guías Archivadas</span>
            <Space>
              <span style={{ fontWeight: 500 }}>Buscar:</span>
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <Tooltip title="Recargar">
                <Button icon={<ReloadOutlined />} onClick={cargarDatos} />
              </Tooltip>
            </Space>
          </div>
        }
        style={{ borderLeft: '4px solid #F26522' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table<GuiaArchivadaRow>
            columns={columns}
            dataSource={filtered}
            rowKey="key"
            size="middle"
            bordered
            scroll={{ x: 'max-content' }}
            pagination={{
              showTotal: (total, range) =>
                `Mostrando ${range[0]} a ${range[1]} de ${total} Entradas`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100'],
              pageSize: 10,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default GuiasArchivadas;
