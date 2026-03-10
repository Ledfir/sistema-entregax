import { useState, useEffect, useMemo } from 'react';
import { Button, Card, Input, Select, Space, Spin, Table, Tag, Tooltip } from 'antd';
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

interface InstruccionRow {
  id: string | number;
  token: string;
  suite: string;   // mid / idc
  cliente: string;
  cedis: string;
  cartones: number;
  idtp: string;    // tipo de cotización
  checked: number; // asignados
  resto: number;   // pendientes
  raw: any;
}

interface Seccion {
  key: string;
  titulo: string;
  headerColor: string;
  cedisLabel: string;
  data: InstruccionRow[];
}

interface PendienteRow {
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

const SECCIONES_CONFIG: Omit<Seccion, 'data'>[] = [
  { key: 'usa',        titulo: 'Instrucciones Pendientes en USA/Cedis Usa',      headerColor: '#26A69A', cedisLabel: 'USA' },
  { key: 'tdi',        titulo: 'Instrucciones Pendientes en TDI/Cedis china',    headerColor: '#FFC107', cedisLabel: 'China' },
  { key: 'dhl',        titulo: 'Instrucciones Pendientes en DHL/Cedis X',        headerColor: '#8D7136', cedisLabel: 'DHL' },
  { key: 'tdi_express',titulo: 'Instrucciones Pendientes en TDI - DHL EXPRESS',  headerColor: '#F26522', cedisLabel: 'TDI - DHL EXPRESS' },
];

function mapRows(items: any[]): InstruccionRow[] {
  if (!Array.isArray(items)) return [];
  return items.map((r) => ({
    id: r.id ?? r.token ?? '',
    token: r.token ?? '',
    suite: r.mid ?? r.idc ?? r.suite ?? '',
    cliente: r.nomx ?? r.nombre ?? r.cliente ?? '',
    cedis: r.cedisid ?? r.cedis ?? '',
    cartones: Number(r.total ?? r.cartones ?? 0),
    idtp: String(r.idtp ?? r.idtpc ?? ''),
    checked: Number(r.checked ?? 0),
    resto: Number(r.resto ?? 0),
    raw: r,
  }));
}

function mapPendienteRows(items: any[]): PendienteRow[] {
  if (!Array.isArray(items)) return [];
  return items.map((r, idx) => {
    const alto   = r.alto   ?? '';
    const ancho  = r.ancho  ?? '';
    const largo  = r.largo  ?? '';
    const medidas = (alto && ancho && largo) ? `${largo} X ${ancho} X ${alto}` : '—';
    // edox ya viene como texto descriptivo del estado desde el backend
    const estado = r.edox ?? ESTADO_MAP[String(r.estado ?? '')] ?? String(r.estado ?? '');

    return {
      id:                r.id ?? idx,
      key:               String(r.id ?? idx),
      cliente:           r.iud ?? r.mid ?? r.idc ?? '',
      guiaIngreso:       r.guiaingreso ?? r.guia_ingreso ?? '',
      tipo:              r.tipi ?? r.tipo ?? r.tipocotizacion ?? '',
      estado,
      guiaUnica:         r.guiaunica ?? r.guia_unica ?? '',
      creacion:          r.created ?? r.creacion ?? '',
      cedis:             r.cedisid ?? r.cedis ?? '',
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

export const Instrucciones = () => {
  const { user } = useAuthStore();

  // ── Vista activa ────────────────────────────────────────────
  type View = 'list' | 'pendientes' | 'asignar';
  const [view, setView] = useState<View>('list');

  // ── Secciones ──────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [secciones, setSecciones] = useState<Seccion[]>([]);

  // ── Vista Pendientes ────────────────────────────────────────
  const [pendientesLoading, setPendientesLoading] = useState(false);
  const [pendientesRecord, setPendientesRecord] = useState<InstruccionRow | null>(null);
  const [pendientesData, setPendientesData] = useState<PendienteRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');

  // ── Vista Asignar ───────────────────────────────────────────
  const [asignarLoading, setAsignarLoading] = useState(false);
  const [asignarRecord, setAsignarRecord] = useState<InstruccionRow | null>(null);
  const [asignarData, setAsignarData] = useState<PendienteRow[]>([]);
  const [asignarSelectedKeys, setAsignarSelectedKeys] = useState<React.Key[]>([]);
  const [asignarSearch, setAsignarSearch] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState<string | undefined>(undefined);
  const [selectedPaqueteria, setSelectedPaqueteria] = useState<string | undefined>(undefined);
  const [direcciones, setDirecciones] = useState<{ value: string; label: string }[]>([]);
  const [paqueterias, setPaqueterias] = useState<{ value: string; label: string }[]>([]);
  const [asignarSubmitting, setAsignarSubmitting] = useState(false);

  // ── Carga principal ─────────────────────────────────────────
  const cargarDatos = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await operacionesService.getPendingInstructions(user.id);
      const data = res?.data ?? {};
      setSecciones(SECCIONES_CONFIG.map((s) => ({ ...s, data: mapRows(data[s.key] ?? []) })));
    } catch (e: any) {
      console.error(e);
      Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al cargar instrucciones pendientes', showConfirmButton: false, timer: 4000 });
      setSecciones(SECCIONES_CONFIG.map((s) => ({ ...s, data: [] })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Sistema Entregax | Instrucciones Pendientes';
    cargarDatos();
  }, []);

  // ── Acciones ────────────────────────────────────────────────
  const handleAsignarInstrucciones = async () => {
    if (!asignarSelectedKeys.length) {
      Swal.fire({ icon: 'warning', title: '', text: 'Selecciona al menos un registro.', showConfirmButton: false, timer: 3000 });
      return;
    }
    if (!selectedDireccion) {
      Swal.fire({ icon: 'warning', title: '', text: 'Selecciona una dirección de entrega.', showConfirmButton: false, timer: 3000 });
      return;
    }
    if (!selectedPaqueteria) {
      Swal.fire({ icon: 'warning', title: '', text: 'Selecciona una paquetería.', showConfirmButton: false, timer: 3000 });
      return;
    }
    try {
      setAsignarSubmitting(true);
      const res = await operacionesService.updateInstruction({
        ids: asignarSelectedKeys.map(String),
        direccion: selectedDireccion,
        paqueteria: selectedPaqueteria,
        iduser: String(user?.id ?? ''),
        idtp: String(asignarRecord?.idtp ?? ''),
      });
      const msg = res?.message ?? res?.data?.message ?? 'Instrucciones asignadas correctamente.';
      Swal.fire({ icon: 'success', title: '¡Listo!', text: msg, showConfirmButton: false, timer: 3500 });
      handleVolver();
      cargarDatos();
    } catch (e: any) {
      const errMsg = e?.response?.data?.message ?? e?.message ?? 'Error al asignar instrucciones.';
      Swal.fire({ icon: 'error', title: '', text: errMsg, showConfirmButton: false, timer: 4000 });
    } finally {
      setAsignarSubmitting(false);
    }
  };

  const cargarAsignar = async (record: InstruccionRow) => {
    setAsignarRecord(record);
    setAsignarSelectedKeys([]);
    setAsignarSearch('');
    setSelectedDireccion(undefined);
    setSelectedPaqueteria(undefined);
    try {
      setAsignarLoading(true);
      const idc  = record.suite || record.raw?.idc || record.id;
      const idtp = record.idtp  || record.raw?.idtp || '';
      const res = await operacionesService.getReadyForInstructions(idc, idtp);
      const items = res?.data ?? res ?? [];
      setAsignarData(mapPendienteRows(Array.isArray(items) ? items : []));
      // Cargar direcciones de entrega del cliente
      try {
        const resDirs = await operacionesService.getBillingAddressForQuote(idc);
        const dirs: any[] = resDirs?.data ?? [];
        setDirecciones(dirs.map((d: any) => ({
          value: String(d.id),
          label: `${d.quienrecibe} — ${d.calle}${d.numeroext ? ` #${d.numeroext}` : ''}`,
        })));
      } catch {
        setDirecciones([]);
      }
      // Cargar paqueterías
      try {
        const resPaq = await operacionesService.getPackings();
        const paq: any[] = resPaq?.data ?? [];
        setPaqueterias(paq.map((p: any) => ({
          value: String(p.id),
          label: String(p.nombre ?? '').trim(),
        })));
      } catch {
        setPaqueterias([]);
      }
    } catch (e: any) {
      console.error(e);
      Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al cargar la lista', showConfirmButton: false, timer: 4000 });
      setAsignarData([]);
    } finally {
      setAsignarLoading(false);
    }
  };

  const handleVerListas = (record: InstruccionRow) => {
    setView('asignar');
    cargarAsignar(record);
  };

  const cargarPendientes = async (record: InstruccionRow) => {
    setPendientesRecord(record);
    setSelectedRowKeys([]);
    setSearchText('');
    try {
      setPendientesLoading(true);
      const idc  = record.suite || record.raw?.idc || record.id;
      const idtp = record.idtp  || record.raw?.idtp || '';
      const res = await operacionesService.getPendingInstructionsList(idc, idtp);
      const items = res?.data ?? res ?? [];
      setPendientesData(mapPendienteRows(Array.isArray(items) ? items : []));
    } catch (e: any) {
      console.error(e);
      Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al cargar la lista de pendientes', showConfirmButton: false, timer: 4000 });
      setPendientesData([]);
    } finally {
      setPendientesLoading(false);
    }
  };

  const handleVerPendientes = async (record: InstruccionRow) => {
    setView('pendientes');
    await cargarPendientes(record);
  };

  const handleVerTarimas = (record: InstruccionRow) => {
    console.log('Ver Tarimas', record);
  };

  const handleArchivar = async (row: PendienteRow) => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Archivar registro?',
      text: `Se archivará la guía ${row.guiaIngreso || row.id}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, archivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#F26522',
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await operacionesService.archivedWaybill({
        id: String(row.id),
        iduser: String(user?.id ?? ''),
      });
      const msg = res?.message ?? res?.data?.message ?? 'Registro archivado correctamente.';
      Swal.fire({ icon: 'success', title: '¡Listo!', text: msg, showConfirmButton: false, timer: 3000 });
      if (pendientesRecord) cargarPendientes(pendientesRecord);
    } catch (e: any) {
      const errMsg = e?.response?.data?.message ?? e?.message ?? 'Error al archivar el registro.';
      Swal.fire({ icon: 'error', title: '', text: errMsg, showConfirmButton: false, timer: 4000 });
    }
  };

  const handleVolver = () => {
    setView('list');
    setPendientesData([]);
    setSelectedRowKeys([]);
    setSearchText('');
    setAsignarData([]);
    setAsignarSelectedKeys([]);
    setAsignarSearch('');
    setSelectedDireccion(undefined);
    setSelectedPaqueteria(undefined);
  };

  // ── Filtro de búsqueda ──────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return pendientesData;
    const q = searchText.toLowerCase();
    return pendientesData.filter((r) =>
      Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [pendientesData, searchText]);

  // ── Columnas vista Pendientes ───────────────────────────────
  const pendientesColumns: ColumnsType<PendienteRow> = [
    { title: 'Cliente',            dataIndex: 'cliente',           key: 'cliente'},
    {
      title: 'Guia de ingreso',    dataIndex: 'guiaIngreso',       key: 'guiaIngreso',
      render: (val) => <span style={{ color: '#F26522', fontWeight: 500, cursor: 'pointer' }}>{val}</span>,
    },
    {
      title: 'Estado',             dataIndex: 'estado',            key: 'estado',
      render: (val) => <span style={{ color: '#52c41a' }}>{val}</span>,
    },
    { title: 'Guia unica',         dataIndex: 'guiaUnica',         key: 'guiaUnica'},
    { title: 'Creacion',           dataIndex: 'creacion',          key: 'creacion',       render: formatDate },
    { title: 'CEDIS',              dataIndex: 'cedis',             key: 'cedis'},
    { title: 'Fecha de entrada',   dataIndex: 'fechaEntrada',      key: 'fechaEntrada',   render: formatDate },
    {
      title: 'Guia Internacional', dataIndex: 'guiaInternacional', key: 'guiaInternacional',
      render: (val) => val || <span style={{ color: '#aaa' }}>—</span>,
    },
    { title: 'Peso',               dataIndex: 'peso',              key: 'peso'},
    { title: 'Costo',              dataIndex: 'costo',             key: 'costo'},
    { title: 'Tipo de cambio',     dataIndex: 'tipoCambio',        key: 'tipoCambio'},
    { title: 'Medidas',            dataIndex: 'medidas',           key: 'medidas'},
    {
      title: 'Archivar', key: 'archivar', fixed: 'right' as const, align: 'center' as const,
      render: (_, row) => (
        <Button size="small" onClick={() => handleArchivar(row)}
          style={{ backgroundColor: '#F26522', borderColor: '#F26522', color: '#fff', fontWeight: 600 }}>
          Archivar
        </Button>
      ),
    },
  ];

  const rowSelection: TableRowSelection<PendienteRow> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // ── Columnas de las cards ───────────────────────────────────
  const baseColumns: ColumnsType<InstruccionRow> = [
    { title: 'Suite',    dataIndex: 'suite',    key: 'suite',    width: 100, render: (val) => <strong>{val}</strong> },
    { title: 'Cliente',  dataIndex: 'cliente',  key: 'cliente' },
    { title: 'CEDIS',    dataIndex: 'cedis',    key: 'cedis',    width: 130, render: (val) => val ? <Tag>{val}</Tag> : '—' },
    { title: 'Cartones', dataIndex: 'cartones', key: 'cartones', width: 100, align: 'center', render: (val) => <Tag color="blue">{val}</Tag> },
    {
      title: 'Ver Listas', key: 'ver_listas', width: 130, align: 'center',
      render: (_, record) => (
        <Button size="small" onClick={() => handleVerListas(record)}
          disabled={!record.checked}
          style={{ backgroundColor: record.checked ? '#E8806A' : undefined, borderColor: record.checked ? '#E8806A' : undefined, color: record.checked ? '#fff' : undefined, fontWeight: 600 }}>
          Asignar ({record.checked})
        </Button>
      ),
    },
    {
      title: 'Ver Pendientes', key: 'ver_pendientes', width: 155, align: 'center',
      render: (_, record) => (
        <Button size="small" onClick={() => handleVerPendientes(record)}
          disabled={!record.resto}
          style={{ backgroundColor: record.resto ? '#F26522' : undefined, borderColor: record.resto ? '#F26522' : undefined, color: record.resto ? '#fff' : undefined, fontWeight: 600 }}>
          Pendientes ({record.resto})
        </Button>
      ),
    },
  ];

  const usaColumns: ColumnsType<InstruccionRow> = [
    ...baseColumns,
    {
      title: 'Ver Tarimas', key: 'ver_tarimas', width: 120, align: 'center',
      render: (_, record) => (
        <Button size="small" onClick={() => handleVerTarimas(record)}
          style={{ backgroundColor: '#26A69A', borderColor: '#26A69A', color: '#fff', fontWeight: 600 }}>
          Tarimas
        </Button>
      ),
    },
  ];

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>;
  }

  // ── Vista: Lista de secciones ───────────────────────────────
  if (view === 'list') {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {secciones.map((seccion) => (
          <Card
            key={seccion.key}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', backgroundColor: seccion.headerColor, flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>{seccion.titulo}</span>
                <Tag color={seccion.headerColor} style={{ marginLeft: 'auto', fontWeight: 600 }}>
                  {seccion.data.length} registro{seccion.data.length !== 1 ? 's' : ''}
                </Tag>
              </div>
            }
            style={{ borderLeft: `4px solid ${seccion.headerColor}` }}
          >
            {seccion.data.length === 0 ? (
              <p style={{ margin: 0, color: '#666' }}>No hay cartones pendientes en {seccion.cedisLabel}</p>
            ) : (
              <Table<InstruccionRow>
                columns={seccion.key === 'usa' ? usaColumns : baseColumns}
                dataSource={seccion.data}
                rowKey={(r) => String(r.id)}
                pagination={false}
                size="middle"
                bordered
                scroll={{ x: 'max-content' }}
              />
            )}
          </Card>
        ))}
      </div>
    );
  }

  // ── Vista: Detalle de pendientes ────────────────────────────
  if (view === 'pendientes') {
    return (
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleVolver}
              size="small"
              style={{ flexShrink: 0 }}
            >
              Volver
            </Button>
            <span style={{ fontWeight: 600 }}>
              Pendientes — Suite <strong>{pendientesRecord?.suite}</strong>
              {pendientesRecord?.cliente ? ` · ${pendientesRecord.cliente}` : ''}
            </span>
          </div>
        }
        style={{ borderLeft: '4px solid #F26522' }}
      >
        {pendientesLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
        ) : (
          <>
            {/* Barra de acciones */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <Space wrap>
                <Button
                  onClick={() => {
                    if (selectedRowKeys.length === filteredData.length && filteredData.length > 0) {
                      setSelectedRowKeys([]);
                    } else {
                      setSelectedRowKeys(filteredData.map((r) => r.key));
                    }
                  }}
                  style={{ backgroundColor: '#F26522', borderColor: '#F26522', color: '#fff', fontWeight: 600 }}
                >
                  {selectedRowKeys.length === filteredData.length && filteredData.length > 0
                    ? 'Deseleccionar todas'
                    : 'Seleccionar todas'}
                </Button>
                <Tooltip title="Recargar">
                  <Button icon={<ReloadOutlined />} onClick={() => pendientesRecord && cargarPendientes(pendientesRecord)} />
                </Tooltip>
              </Space>

              <Space>
                <span style={{ fontWeight: 500 }}>Buscar:</span>
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  style={{ width: 220 }}
                />
              </Space>
            </div>

            <Table<PendienteRow>
              rowSelection={rowSelection}
              columns={pendientesColumns}
              dataSource={filteredData}
              rowKey="key"
              size="middle"
              bordered
              scroll={{ x: 'max-content' }}
              pagination={{
                showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} Entradas`,
                showSizeChanger: false,
                pageSize: 10,
              }}
            />
          </>
        )}
      </Card>
    );
  }

  // ── Vista: Asignar ──────────────────────────────────────────
  const asignarFiltered = asignarSearch.trim()
    ? asignarData.filter((r: PendienteRow) =>
        Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(asignarSearch.toLowerCase()))
      )
    : asignarData;

  const asignarRowSelection: TableRowSelection<PendienteRow> = {
    selectedRowKeys: asignarSelectedKeys,
    onChange: (keys) => setAsignarSelectedKeys(keys),
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={handleVolver} size="small" style={{ flexShrink: 0 }}>
              Volver
            </Button>
            <span style={{ fontWeight: 600 }}>
              Asignar — Suite <strong>{asignarRecord?.suite}</strong>
              {asignarRecord?.cliente ? ` · ${asignarRecord.cliente}` : ''}
            </span>
          </div>
        }
        style={{ borderLeft: '4px solid #E8806A' }}
      >
        {asignarLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
        ) : (
          <>
            {/* Barra de acciones */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <Space wrap>
                <Button
                  onClick={() => {
                    if (asignarSelectedKeys.length === asignarFiltered.length && asignarFiltered.length > 0) {
                      setAsignarSelectedKeys([]);
                    } else {
                      setAsignarSelectedKeys(asignarFiltered.map((r) => r.key));
                    }
                  }}
                  style={{ backgroundColor: '#E8806A', borderColor: '#E8806A', color: '#fff', fontWeight: 600 }}
                >
                  {asignarSelectedKeys.length === asignarFiltered.length && asignarFiltered.length > 0
                    ? 'Deseleccionar todas'
                    : 'Seleccionar todas'}
                </Button>
                <Tooltip title="Recargar">
                  <Button icon={<ReloadOutlined />} onClick={() => asignarRecord && cargarAsignar(asignarRecord)} />
                </Tooltip>
              </Space>
              <Space>
                <span style={{ fontWeight: 500 }}>Buscar:</span>
                <Input
                  value={asignarSearch}
                  onChange={(e) => setAsignarSearch(e.target.value)}
                  allowClear
                  style={{ width: 220 }}
                />
              </Space>
            </div>

            <Table<PendienteRow>
              rowSelection={asignarRowSelection}
              columns={pendientesColumns}
              dataSource={asignarFiltered}
              rowKey="key"
              size="middle"
              bordered
              scroll={{ x: 'max-content' }}
              pagination={{
                showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} Entradas`,
                showSizeChanger: false,
                pageSize: 10,
              }}
            />

            {/* Selects de asignación */}
            <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Direccion de entrega</div>
                <Select
                  placeholder="Selecciona una dirección"
                  style={{ width: '100%' }}
                  value={selectedDireccion}
                  onChange={(v) => setSelectedDireccion(v)}
                  options={direcciones}
                  allowClear
                  showSearch
                  filterOption={(input, opt) =>
                    String(opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Paqueteria</div>
                <Select
                  placeholder="Selecciona una paquetería"
                  style={{ width: '100%' }}
                  value={selectedPaqueteria}
                  onChange={(v) => setSelectedPaqueteria(v)}
                  options={paqueterias}
                  allowClear
                  showSearch
                  filterOption={(input, opt) =>
                    String(opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
            </div>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                style={{ backgroundColor: '#F26522', borderColor: '#F26522', fontWeight: 600 }}
                onClick={handleAsignarInstrucciones}
                loading={asignarSubmitting}
                disabled={!asignarSelectedKeys.length || !selectedDireccion || !selectedPaqueteria}
              >
                Asignar Instrucciones
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Instrucciones;
