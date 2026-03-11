import { useState, useEffect, useMemo } from 'react';
import { Button, Card, Input, Space, Spin, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import Swal from 'sweetalert2';
import operacionesService from '@/services/operacionesService';
import { useAuthStore } from '@/store/authStore';

dayjs.locale('es');

const formatDate = (val: string) => {
  if (!val) return <span style={{ color: '#aaa' }}>—</span>;
  const d = dayjs(val);
  if (!d.isValid()) return <span>{val}</span>;
  return <span title={d.format('DD/MM/YYYY HH:mm')}>{d.format('DD MMM YYYY')}</span>;
};

interface PendienteCotizarRow {
  key: string;
  id: string | number;
  cliente: string;
  cantidad: string | number;
  tipo: string;
  guiaIngreso: string;
  contenido: string;
  raw: any;
}

interface DetalleRow {
  key: string;
  id: string | number;
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
  '5': 'Información de envío recibida',
  '6': 'Entregado',
};

function mapRows(items: any[]): PendienteCotizarRow[] {
  if (!Array.isArray(items)) return [];
  return items.map((r, idx) => ({
    key:         String(r.id ?? idx),
    id:          r.id ?? idx,
    cliente:     r.cliente ?? r.idc ?? '',
    cantidad:    r.cantidad ?? r.total ?? '—',
    tipo:        r.tipo ?? r.tipoc ?? r.tipi ?? '',
    guiaIngreso: r.guiaingreso ?? r.guia_ingreso ?? '',
    contenido:   r.contenido ?? '',
    raw: r,
  }));
}

function mapDetalleRows(items: any[]): DetalleRow[] {
  if (!Array.isArray(items)) return [];
  return items.map((r, idx) => {
    const alto  = r.alto  ?? '';
    const ancho = r.ancho ?? '';
    const largo = r.largo ?? '';
    const medidas = (alto && ancho && largo) ? `${largo} X ${ancho} X ${alto}` : '—';
    const estado = r.txtestado ?? r.ubic ?? ESTADO_MAP[String(r.estado ?? '')] ?? String(r.estado ?? '');
    return {
      key:               String(r.id ?? idx),
      id:                r.id ?? idx,
      cliente:           r.cliente ?? r.idc ?? '',
      guiaIngreso:       r.guiaingreso ?? r.guia_ingreso ?? '',
      tipo:              r.tipo ?? r.tipoc ?? r.tipi ?? '',
      estado,
      guiaUnica:         r.guiaunica ?? r.guia_unica ?? '',
      creacion:          r.created ?? r.creacion ?? '',
      cedis:             r.cedisid ?? r.cadisid ?? r.cedis ?? '',
      fechaEntrada:      r.fechaentrada ?? r.fecha_entrada ?? '',
      guiaInternacional: r.guiainternacional ?? r.guiaus ?? r.guia_internacional ?? '',
      peso:              r.kilos ? `${r.kilos} Kg.` : '—',
      costo:             r.costo ? `$${Number(r.costo).toFixed(2)}` : '$0.00',
      tipoCambio:        r.tipodecambio ? `$${Number(r.tipodecambio).toFixed(2)}` : '$0.00',
      medidas,
      raw: r,
    };
  });
}

export const PendientesCotizar = () => {
  const { user } = useAuthStore();

  type View = 'list' | 'detalle';
  const [view, setView] = useState<View>('list');

  // ── Vista lista ─────────────────────────────────────────────
  const [loading, setLoading]       = useState(false);
  const [data, setData]             = useState<PendienteCotizarRow[]>([]);
  const [searchText, setSearchText] = useState('');

  // ── Vista detalle ───────────────────────────────────────────
  const [detalleLoading, setDetalleLoading]   = useState(false);
  const [detalleRecord, setDetalleRecord]     = useState<PendienteCotizarRow | null>(null);
  const [detalleData, setDetalleData]         = useState<DetalleRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detalleSearch, setDetalleSearch]     = useState('');
  const [generando, setGenerando]             = useState(false);

  // ── Carga lista ─────────────────────────────────────────────
  const cargarDatos = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await operacionesService.getPendingQuotes(user.id);
      const items = res?.data ?? res ?? [];
      setData(mapRows(Array.isArray(items) ? items : []));
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al cargar los pendientes.', showConfirmButton: false, timer: 4000 });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Sistema Entregax | Pendientes de cotizar';
    cargarDatos();
  }, []);

  const filtered = useMemo(() => {
    if (!searchText.trim()) return data;
    const q = searchText.toLowerCase();
    return data.filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q)));
  }, [data, searchText]);

  // ── Carga detalle ───────────────────────────────────────────
  const cargarDetalle = async (record: PendienteCotizarRow) => {
    setDetalleRecord(record);
    setSelectedRowKeys([]);
    setDetalleSearch('');
    try {
      setDetalleLoading(true);
      const suite = record.raw?.idc ?? record.raw?.mid ?? record.id;
      const idtp  = record.raw?.idtp ?? record.raw?.idtpc ?? '';
      const res = await operacionesService.getListPendingQuotes(suite, idtp);
      const items = res?.data ?? res ?? [];
      setDetalleData(mapDetalleRows(Array.isArray(items) ? items : []));
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al cargar el detalle.', showConfirmButton: false, timer: 4000 });
      setDetalleData([]);
    } finally {
      setDetalleLoading(false);
    }
  };

  const handleVer = (row: PendienteCotizarRow) => {
    setView('detalle');
    cargarDetalle(row);
  };

  const handleVolver = () => {
    setView('list');
    setDetalleData([]);
    setSelectedRowKeys([]);
    setDetalleSearch('');
  };

  const handleGenerarCotizacion = async () => {
    if (!selectedRowKeys.length) {
      Swal.fire({ icon: 'warning', title: '', text: 'Selecciona al menos un registro.', showConfirmButton: false, timer: 3000 });
      return;
    }
    const idtp = detalleRecord?.raw?.idtp ?? detalleRecord?.raw?.idtpc ?? '';
    const idc  = detalleRecord?.raw?.idc ?? detalleRecord?.raw?.mid ?? detalleRecord?.id ?? '';
    setGenerando(true);
    try {
      const res = await operacionesService.generateQuote({
        ids: selectedRowKeys as (string | number)[],
        idtp,
        iduser: user?.id ?? '',
        idc,
      });
      Swal.fire({ icon: 'success', title: '', text: res?.message ?? 'Cotización generada correctamente.', showConfirmButton: false, timer: 3000 });
      setSelectedRowKeys([]);
      detalleRecord && cargarDetalle(detalleRecord);
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al generar la cotización.', showConfirmButton: false, timer: 4000 });
    } finally {
      setGenerando(false);
    }
  };

  // ── Filtro detalle ──────────────────────────────────────────
  const detalleFiltered = useMemo(() => {
    if (!detalleSearch.trim()) return detalleData;
    const q = detalleSearch.toLowerCase();
    return detalleData.filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q)));
  }, [detalleData, detalleSearch]);

  const rowSelection: TableRowSelection<DetalleRow> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // ── Columnas lista ──────────────────────────────────────────
  const listColumns: ColumnsType<PendienteCotizarRow> = [
    { title: 'Cliente',  dataIndex: 'cliente',  key: 'cliente' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', align: 'center' },
    { title: 'Tipo',     dataIndex: 'tipo',     key: 'tipo' },
    {
      title: 'Opciones',
      key: 'opciones',
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_, row) => (
        <Button
          size="small"
          style={{ backgroundColor: '#F26522', borderColor: '#F26522', color: '#fff', fontWeight: 600 }}
          onClick={() => handleVer(row)}
        >
          Ver
        </Button>
      ),
    },
  ];

  // ── Columnas detalle ────────────────────────────────────────
  const detalleColumns: ColumnsType<DetalleRow> = [
    { title: 'Cliente',           dataIndex: 'cliente',          key: 'cliente' },
    {
      title: 'Guia de ingreso',   dataIndex: 'guiaIngreso',      key: 'guiaIngreso',
      render: (val) => <span style={{ color: '#F26522', fontWeight: 500 }}>{val || '—'}</span>,
    },
    { title: 'Tipo',              dataIndex: 'tipo',             key: 'tipo' },
    {
      title: 'Estado',            dataIndex: 'estado',           key: 'estado',
      render: (val) => <span style={{ color: '#52c41a' }}>{val || '—'}</span>,
    },
    { title: 'Guia unica',        dataIndex: 'guiaUnica',        key: 'guiaUnica' },
    { title: 'Creacion',          dataIndex: 'creacion',         key: 'creacion',       render: formatDate },
    { title: 'CEDIS',             dataIndex: 'cedis',            key: 'cedis' },
    { title: 'Fecha de entrada',  dataIndex: 'fechaEntrada',     key: 'fechaEntrada',   render: formatDate },
    {
      title: 'Guia Internacional', dataIndex: 'guiaInternacional', key: 'guiaInternacional',
      render: (val) => val || <span style={{ color: '#aaa' }}>—</span>,
    },
    { title: 'Peso',          dataIndex: 'peso',       key: 'peso' },
    { title: 'Costo',         dataIndex: 'costo',      key: 'costo' },
    { title: 'Tipo de cambio', dataIndex: 'tipoCambio', key: 'tipoCambio' },
    { title: 'Medidas',       dataIndex: 'medidas',    key: 'medidas' },
  ];

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════

  // ── Vista: lista ────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div style={{ padding: 24 }}>
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Pendientes de cotizar</span>
              <Space>
                <span style={{ fontWeight: 500 }}>Buscar:</span>
                <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear style={{ width: 220 }} />
                <Tooltip title="Recargar">
                  <Button icon={<ReloadOutlined />} onClick={cargarDatos} />
                </Tooltip>
              </Space>
            </div>
          }
          style={{ borderLeft: '4px solid #F26522' }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
          ) : (
            <Table<PendienteCotizarRow>
              columns={listColumns}
              dataSource={filtered}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: 'Sin registros pendientes' }}
            />
          )}
        </Card>
      </div>
    );
  }

  // ── Vista: detalle ───────────────────────────────────────────
  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={handleVolver} size="small" style={{ flexShrink: 0 }}>
              Volver
            </Button>
            <span style={{ fontWeight: 600 }}>
              Pendientes de cotizar
              {detalleRecord?.cliente ? ` — ${detalleRecord.cliente}` : ''}
            </span>
          </div>
        }
        style={{ borderLeft: '4px solid #F26522' }}
      >
        {detalleLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
        ) : (
          <>
            {/* Barra de acciones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <Space>
                <span style={{ fontWeight: 500 }}>Buscar:</span>
                <Input value={detalleSearch} onChange={(e) => setDetalleSearch(e.target.value)} allowClear style={{ width: 220 }} />
                <Tooltip title="Recargar">
                  <Button icon={<ReloadOutlined />} onClick={() => detalleRecord && cargarDetalle(detalleRecord)} />
                </Tooltip>
              </Space>
            </div>

            <Table<DetalleRow>
              rowSelection={rowSelection}
              columns={detalleColumns}
              dataSource={detalleFiltered}
              rowKey="key"
              size="middle"
              bordered
              scroll={{ x: 'max-content' }}
              pagination={{
                showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} Entradas`,
                showSizeChanger: true,
                pageSizeOptions: ['10', '25', '50'],
                pageSize: 10,
              }}
              locale={{ emptyText: 'Sin registros' }}
            />

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                style={{ backgroundColor: '#F26522', borderColor: '#F26522', fontWeight: 600 }}
                onClick={handleGenerarCotizacion}
                loading={generando}
                disabled={!selectedRowKeys.length}
              >
                Generar cotización
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

