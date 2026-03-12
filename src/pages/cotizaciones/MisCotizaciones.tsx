import { useState, useEffect, useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Button, Card, Col, Input, Modal, Row, Select, Space, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined, CalendarOutlined, ClockCircleOutlined,
  DeleteOutlined, DollarOutlined, DownloadOutlined,
  EyeOutlined, LockOutlined, MinusCircleOutlined,
  NumberOutlined, ReloadOutlined,
  TagOutlined, UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import Swal from 'sweetalert2';
import operacionesService from '@/services/operacionesService';
import { useAuthStore } from '@/store/authStore';

dayjs.locale('es');

const formatDate = (val: string): ReactNode => {
  if (!val) return <span style={{ color: '#aaa' }}>—</span>;
  const d = dayjs(val);
  if (!d.isValid()) return <span>{val}</span>;
  return <span title={d.format('DD/MM/YYYY HH:mm')}>{d.format('DD MMM YYYY')}</span>;
};

const fmtMoney = (v: any): string =>
  v != null && v !== '' ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00';

const InfoItem = ({ icon, value, valueStyle }: { icon: ReactNode; value: ReactNode; valueStyle?: CSSProperties }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', background: '#f0f2f5', borderRadius: 8, marginBottom: 8,
  }}>
    <span style={{ color: '#1d3557', fontSize: 17 }}>{icon}</span>
    <span style={{ fontWeight: 500, fontSize: 14, ...valueStyle }}>{value}</span>
  </div>
);

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
    creada:  r.created ?? '',  // raw; render applies formatDate
    costo:   r.costo      != null ? `$${Number(r.costo).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    envio:   r.costoenvio != null ? `$${Number(r.costoenvio).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    total:   r.total      != null ? `$${Number(r.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    raw: r,
  }));
}

export const MisCotizaciones = () => {
  const { user }   = useAuthStore();
  const navigate   = useNavigate();

  type View = 'list' | 'detalle';
  const [view, setView]             = useState<View>('list');
  const [loading, setLoading]       = useState(false);
  const [data, setData]             = useState<CotizacionRow[]>([]);
  const [searchText, setSearchText] = useState('');

  // detalle
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleData, setDetalleData]       = useState<any | null>(null);
  const [detalleRow, setDetalleRow]         = useState<CotizacionRow | null>(null);
  const [selectedPago, setSelectedPago]     = useState<string | undefined>(undefined);
  const [enviandoPago, setEnviandoPago]     = useState(false);
  const [descargando, setDescargando]       = useState(false);
  const [pdfUrl, setPdfUrl]                 = useState<string | null>(null);
  const [borrarModal, setBorrarModal]       = useState(false);
  const [motivoBorrar, setMotivoBorrar]     = useState('');
  const [borrandoCot, setBorrandoCot]       = useState(false);

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

  const handleDetalles = async (row: CotizacionRow) => {
    setDetalleLoading(true);
    setDetalleRow(row);
    try {
      const res = await operacionesService.getQuote(row.idco);
      if (res?.data) {
        setDetalleData(res.data);
        setView('detalle');
      } else {
        // Solo mensaje, sin datos
        Swal.fire({ icon: 'info', title: '', text: res?.message ?? 'Sin información disponible.', showConfirmButton: false, timer: 4000 });
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al obtener la cotización.', showConfirmButton: false, timer: 4000 });
    } finally {
      setDetalleLoading(false);
    }
  };

  const handleVolver = () => {
    setView('list');
    setDetalleData(null);
    setDetalleRow(null);
    setSelectedPago(undefined);
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

  const columns: ColumnsType<CotizacionRow> = [
    { title: 'Cliente', dataIndex: 'cliente', key: 'cliente', align: 'center' },
    { title: 'IDCO',    dataIndex: 'idco',    key: 'idco',    align: 'center' },
    { title: 'Creada',  dataIndex: 'creada',  key: 'creada',  align: 'center', render: (v) => formatDate(v) },
    { title: 'Costo',   dataIndex: 'costo',   key: 'costo',   align: 'center' },
    { title: 'Envio',   dataIndex: 'envio',   key: 'envio',   align: 'center' },
    { title: 'Total',   dataIndex: 'total',   key: 'total',   align: 'center', render: (val) => <strong>{val}</strong> },
    {
      title: 'Detalles',
      key: 'detalles',
      fixed: 'right',
      align: 'center',
      render: (_: any, row: CotizacionRow) => (
        <Button
          type="primary"
          size="small"
          loading={detalleLoading && detalleRow?.key === row.key}
          style={{ background: '#1d3557' }}
          onClick={() => handleDetalles(row)}
        >
          Detalles
        </Button>
      ),
    },
  ];

  // ── Vista detalle ────────────────────────────────────────────
  if (view === 'detalle' && detalleData) {
    const cot: any            = detalleData.cotizacion ?? detalleData;
    const cargosExtra: any[]   = Array.isArray(detalleData.cargos_extra)    ? detalleData.cargos_extra    : [];
    const pagos: any[]         = Array.isArray(detalleData.pagos)           ? detalleData.pagos           : [];
    const pagosVinculados: any[]= Array.isArray(detalleData.pagos_vinculados)? detalleData.pagos_vinculados: [];

    // Bloqueado si hay algún cargo con fechap ya vencida (hoy o antes)
    const cargosVencidos   = cargosExtra.filter((ce) => ce.fechap && !dayjs(ce.fechap).isAfter(dayjs(), 'day'));
    const cargosVigentes   = cargosExtra.filter((ce) => ce.fechap &&  dayjs(ce.fechap).isAfter(dayjs(), 'day'));
    const bloqueado = cargosVencidos.length > 0;
    const totalNum  = cot.total != null ? Number(cot.total) : 0;

    return (
      <>
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleVolver} size="small" />
            <span>Detalles y Acciones</span>
          </Space>
        }
      >
        <Row gutter={[24, 24]}>
          {/* ── Detalles ── */}
          <Col xs={24} md={12}>
            <Card
              title={<span style={{ color: '#1d3557', fontWeight: 600 }}>Detalles</span>}
              size="small"
              style={{ borderRadius: 10, height: '100%' }}
            >
              <InfoItem icon={<TagOutlined />}      value={`Ctz: ${cot.ctz ?? '—'}`} />
              <InfoItem icon={<UserOutlined />}     value={`SUITE: ${detalleRow?.cliente ?? cot.idc ?? '—'}`} />
              <InfoItem icon={<NumberOutlined />}   value={`Cliente: ${cot.idc ?? '—'}`} />
              <InfoItem icon={<CalendarOutlined />} value={<>Creada: {formatDate(cot.created ?? '')}</>} />
              <InfoItem
                icon={<DollarOutlined />}
                value={`Total: ${fmtMoney(cot.total)}`}
                valueStyle={{ color: '#F26522', fontWeight: 700, fontSize: 16 }}
              />
            </Card>
          </Col>

          {/* ── Acciones ── */}
          <Col xs={24} md={12}>
            <Card
              title={<span style={{ color: '#1d3557', fontWeight: 600 }}>Acciones</span>}
              size="small"
              style={{ borderRadius: 10, height: '100%' }}
            >
              {/* Descargar */}
              <Button
                block
                icon={<DownloadOutlined />}
                loading={descargando}
                style={{ background: '#1d3557', color: '#fff', border: 'none', marginBottom: 10, height: 42, borderRadius: 8 }}
                onClick={async () => {
                  try {
                    setDescargando(true);
                    const res = await operacionesService.getQuotePdf(cot.ctz);
                    if (res?.status === 'success' && res?.url) {
                      setPdfUrl(res.url);
                    } else {
                      Swal.fire({ icon: 'info', title: '', text: res?.message ?? 'No se pudo generar el PDF.', showConfirmButton: false, timer: 4000 });
                    }
                  } catch (e: any) {
                    Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al generar el PDF.', showConfirmButton: false, timer: 4000 });
                  } finally {
                    setDescargando(false);
                  }
                }}
              >
                Descargar Cotización
              </Button>

              {/* Borrar */}
              <Button
                block
                icon={<DeleteOutlined />}
                style={{ background: '#1d3557', color: '#fff', border: 'none', marginBottom: 10, height: 42, borderRadius: 8 }}
                onClick={() => { setMotivoBorrar(''); setBorrarModal(true); }}
              >
                Borrar Cotización
              </Button>

              {/* Pagar / Bloqueado */}
              {bloqueado ? (
                <>
                  {/* Botón bloqueado */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#b91c1c', color: '#fff', borderRadius: 8,
                    padding: '0 16px', height: 52, marginBottom: 10, cursor: 'not-allowed',
                  }}>
                    <LockOutlined style={{ fontSize: 18 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Pagar Cotización</div>
                      <div style={{ fontSize: 11, opacity: 0.85 }}>Bloqueado por cargos extra</div>
                    </div>
                  </div>

                  {/* Un bloque por cada cargo vencido */}
                  {cargosVencidos.map((ce) => (
                    <div key={ce.id} style={{ marginBottom: 10 }}>
                      {/* Badge CE + info vencimiento */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#fee2e2', border: '1px solid #fca5a5',
                        borderRadius: 8, padding: '8px 12px', marginBottom: 6,
                      }}>
                        <Button
                          size="small"
                          danger
                          icon={<WarningOutlined />}
                          style={{ fontWeight: 700, borderRadius: 6, flexShrink: 0 }}
                          onClick={() => navigate('/cargos-extras/pendientes')}
                        >
                          {ce.idce}
                        </Button>
                        <span style={{ fontSize: 12, color: '#991b1b' }}>
                          Vence: {ce.fechap}
                        </span>
                      </div>

                      {/* Solicitar 5 días más */}
                      <Button
                        block
                        danger
                        icon={<ClockCircleOutlined />}
                        style={{ height: 38, borderRadius: 8 }}
                        disabled={ce.extencion === '1'}
                        onClick={async () => {
                          try {
                            const res = await operacionesService.addDayToExtraCharge({ id: ce.id });
                            Swal.fire({ icon: res?.status === 'success' ? 'success' : 'info', title: '', text: res?.message ?? 'Solicitud enviada.', showConfirmButton: false, timer: 3000 });
                            if (res?.status === 'success' && detalleRow) handleDetalles(detalleRow);
                          } catch (e: any) {
                            Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al solicitar extensión.', showConfirmButton: false, timer: 4000 });
                          }
                        }}
                      >
                        {ce.extencion === '1' ? 'Extensión ya aplicada' : 'Solicitar 5 Días mas'}
                      </Button>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <Button
                    block
                    icon={<DollarOutlined />}
                    style={{ background: '#F26522', color: '#fff', border: 'none', height: 42, borderRadius: 8, marginBottom: cargosVigentes.length > 0 ? 10 : 0 }}
                    onClick={() => console.log('Pagar cotización', cot.ctz)}
                  >
                    Pagar Cotización
                  </Button>

                  {cargosVigentes.map((ce) => (
                    <div key={ce.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: '#fef9c3', border: '1px solid #fde047',
                      borderRadius: 8, padding: '8px 12px', marginBottom: 6,
                    }}>
                      <Button
                        size="small"
                        style={{ fontWeight: 700, borderRadius: 6, flexShrink: 0, background: '#eab308', border: 'none', color: '#fff' }}
                        icon={<WarningOutlined />}
                        onClick={() => navigate('/cargos-extras/pendientes')}
                      >
                        {ce.idce}
                      </Button>
                      <span style={{ fontSize: 12, color: '#854d0e' }}>
                        CE DE {ce.idc ?? detalleRow?.cliente ?? '—'} - vence el: {formatDate(ce.fechap)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </Card>
          </Col>
        </Row>

        {/* ── Pagos disponibles ── */}
        <Row gutter={[24, 16]} style={{ marginTop: 20 }}>
          <Col xs={24} md={12}>
            <Card
              title={<span style={{ color: '#1d3557', fontWeight: 600 }}>Pagos disponibles</span>}
              size="small"
              style={{ borderRadius: 10 }}
            >
              {pagos.length === 0 ? (
                <span style={{ color: '#aaa', fontSize: 13 }}>Sin pagos disponibles</span>
              ) : (
                <Space.Compact style={{ width: '100%' }}>
                  <Select
                    style={{ flex: 1 }}
                    placeholder="Seleccionar pago"
                    value={selectedPago}
                    onChange={(val) => setSelectedPago(val)}
                    options={pagos.map((p: any) => ({
                      label: (
                        <span>
                          <Tag color="green" style={{ marginRight: 8 }}>#{p.id}</Tag>
                          {fmtMoney(p.cantidad)}
                        </span>
                      ),
                      value: String(p.id),
                    }))}
                  />
                  <Button
                    type="primary"
                    disabled={!selectedPago}
                    loading={enviandoPago}
                    style={{ background: '#F26522', border: 'none' }}
                    onClick={async () => {
                      if (!selectedPago || !cot.ctz) return;
                      try {
                        setEnviandoPago(true);
                        const res = await operacionesService.addPayment({ id: selectedPago, ctz: cot.ctz });
                        Swal.fire({ icon: res?.status === 'success' ? 'success' : 'info', title: '', text: res?.message ?? 'Pago enviado.', showConfirmButton: false, timer: 3000 });
                        if (res?.status === 'success' && detalleRow) {
                          setSelectedPago(undefined);
                          handleDetalles(detalleRow);
                        }
                      } catch (e: any) {
                        Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al enviar el pago.', showConfirmButton: false, timer: 4000 });
                      } finally {
                        setEnviandoPago(false);
                      }
                    }}
                  >
                    Enviar pago
                  </Button>
                </Space.Compact>
              )}
            </Card>
          </Col>

          {/* ── Pagos vinculados ── */}
          <Col xs={24} md={12}>
            <Card
              title={<span style={{ color: '#1d3557', fontWeight: 600 }}>Pagos vinculados</span>}
              size="small"
              style={{ borderRadius: 10 }}
            >
              <Table
                size="small"
                pagination={false}
                dataSource={pagosVinculados.map((p: any, i: number) => ({ ...p, key: p.id ?? i }))}
                locale={{ emptyText: 'Sin pagos vinculados' }}
                columns={[
                  {
                    title: 'Cantidad',
                    dataIndex: 'cantidad',
                    key: 'cantidad',
                    align: 'center',
                    render: (v: any) => <strong>{fmtMoney(v)}</strong>,
                  },
                  {
                    title: 'Opciones',
                    key: 'opciones',
                    align: 'center',
                    render: (_: any, rec: any) => (
                      <Space size={6}>
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          style={{ background: '#1d3557', color: '#fff', border: 'none', borderRadius: 6 }}
                          onClick={() => rec.url && window.open(rec.url, '_blank', 'noopener,noreferrer')}
                        >
                          Ver comprobante
                        </Button>
                        <Button
                          size="small"
                          danger
                          icon={<MinusCircleOutlined />}
                          style={{ borderRadius: 6 }}
                          onClick={() => {
                            Swal.fire({
                              icon: 'warning',
                              title: '¿Quitar pago?',
                              text: `Se desvinculará el pago ${fmtMoney(rec.cantidad)} de esta cotización.`,
                              showCancelButton: true,
                              confirmButtonText: 'Quitar',
                              cancelButtonText: 'Cancelar',
                              confirmButtonColor: '#dc3545',
                            }).then(async (result) => {
                              if (!result.isConfirmed) return;
                              try {
                                const res = await operacionesService.removePayment({ id: rec.id });
                                Swal.fire({ icon: res?.status === 'success' ? 'success' : 'info', title: '', text: res?.message ?? 'Pago quitado.', showConfirmButton: false, timer: 3000 });
                                if (res?.status === 'success' && detalleRow) handleDetalles(detalleRow);
                              } catch (e: any) {
                                Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al quitar el pago.', showConfirmButton: false, timer: 4000 });
                              }
                            });
                          }}
                        >
                          Quitar pago
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

      </Card>

      {/* ── Modal PDF ── */}
      <Modal
        open={!!pdfUrl}
        onCancel={() => setPdfUrl(null)}
        footer={[
          <Button key="abrir" type="link" href={pdfUrl ?? ''} target="_blank" rel="noopener noreferrer">
            Abrir en nueva pestaña
          </Button>,
          <Button key="cerrar" onClick={() => setPdfUrl(null)}>Cerrar</Button>,
        ]}
        title="Cotización PDF"
        width="80vw"
        styles={{ body: { padding: 0, height: '75vh' } }}
        destroyOnClose
      >
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Cotización PDF"
          />
        )}
      </Modal>

      {/* ── Modal borrar cotización ── */}
      <Modal
        open={borrarModal}
        onCancel={() => setBorrarModal(false)}
        footer={null}
        centered
        width={520}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', padding: '16px 8px 8px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 500 }}>Esta a punto de eliminar la cotizacion</p>
          <p style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#dc3545' }}>{detalleData?.cotizacion?.ctz ?? ''}</p>
          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 14 }}>
            Cliente: ({detalleData?.cotizacion?.idc ?? ''}) {detalleRow?.raw?.idc ?? detalleRow?.cliente ?? ''}
          </p>
          <p style={{ margin: '0 0 16px', fontWeight: 600, fontSize: 14 }}>Esta accion no se puede deshacer. ¿Esta seguro de esto?</p>
          <p style={{ marginBottom: 6, color: '#dc3545', fontSize: 13 }}>Ingrese el <u>motivo de la eliminacion</u> de la cotización.</p>
          <textarea
            rows={4}
            value={motivoBorrar}
            onChange={(e) => setMotivoBorrar(e.target.value)}
            style={{ width: '100%', borderRadius: 6, border: '1px solid #d9d9d9', padding: '8px 10px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
          />
          <Button
            block
            danger
            icon={<DeleteOutlined />}
            loading={borrandoCot}
            disabled={!motivoBorrar.trim()}
            style={{ marginTop: 16, height: 42, fontWeight: 600 }}
            onClick={async () => {
              try {
                setBorrandoCot(true);
                console.log('Borrar cotización', detalleData?.cotizacion?.ctz, motivoBorrar);
                setBorrarModal(false);
              } finally {
                setBorrandoCot(false);
              }
            }}
          >
            Confirmar eliminación
          </Button>
        </div>
      </Modal>
      </>
    );
  }

  // ── Vista lista ──────────────────────────────────────────────
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
          columns={columns}
          dataSource={filtered}
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} registros` }}
        />
      </Spin>
    </Card>
  );
};
