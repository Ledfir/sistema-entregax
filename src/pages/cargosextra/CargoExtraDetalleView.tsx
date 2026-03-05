import { useEffect, useState } from 'react';
import { Card, Table, Button, Spin, Divider, Select, Alert, Modal, Input } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useSnackbar } from 'notistack';
import axios from '@/api/axios';
import './CargoExtra.css';

interface CargoDetalleCargo {
  concepto: string;
  monto: string | number;
}

interface PagoUtilizado {
  id: string;
  url?: string | null;
  cantidad: string | number;
  paid: string | null;
  concepto: string;
}

interface PagoDisponible {
  token: string;
  cantidad: string | number;
  paid: string | null;
}

interface CargoCharge {
  id?: string;
  idce?: string;
  suite?: string;
  cliente?: string;
  cuenta?: string;
  num_cuenta?: string;
  [key: string]: unknown;
}

interface CargoExtraDetalle {
  charge?: CargoCharge;
  detalles: CargoDetalleCargo[];
  pagosUtilizados: PagoUtilizado[];
  pagosDisponibles: PagoDisponible[];
}

export interface CargoExtraDetalleViewProps {
  token: string;
  idce: string;
  suite?: string;
  clienteName: string;
  monto: string | number;
  fechap: string | null;
  state?: number | string;
  pagado?: number | string;
  onBack: () => void;
}

const formatMonto = (value: string | number) => {
  const num = parseFloat(String(value));
  if (isNaN(num)) return '—';
  return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatFecha = (fecha: string | null) => {
  if (!fecha || fecha.startsWith('0000')) return '—';
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

export const CargoExtraDetalleView = ({
  token,
  idce,
  suite,
  clienteName,
  monto,
  fechap,
  state,
  pagado,
  onBack,
}: CargoExtraDetalleViewProps) => {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();

  const [detailData, setDetailData] = useState<CargoExtraDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);
  const [selectedPagoToken, setSelectedPagoToken] = useState<string | null>(null);
  const [searchPagos, setSearchPagos] = useState('');

  const authToken = () => user?.token || localStorage.getItem('token') || '';

  useEffect(() => {
    fetchDetail();
  }, [token]);

  const fetchDetail = async () => {
    setLoadingDetail(true);
    setDetailData(null);
    setSelectedPagoToken(null);
    try {
      const res = await axios.get(`/extra-charges/detail/${token}`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      const payload = res.data;
      const raw = payload?.status === 'success' ? payload.data : payload;
      if (raw) {
        setDetailData({
          charge: raw.charge,
          detalles: Array.isArray(raw.detalles) ? raw.detalles : [],
          pagosUtilizados: Array.isArray(raw.pagosUtilizados) ? raw.pagosUtilizados : [],
          pagosDisponibles: Array.isArray(raw.pagosDisponibles) ? raw.pagosDisponibles : [],
        });
      }
    } catch {
      setDetailData(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const removePayment = async (id: string) => {
    try {
      const res = await axios.post(
        '/extra-charges/remove-payment',
        { id },
        { headers: { Authorization: `Bearer ${authToken()}` } }
      );
      const payload = res.data;
      const msg = payload?.message ?? payload?.msg ?? 'Operación completada';
      if (payload?.status === 'success') {
        enqueueSnackbar(msg, { variant: 'success' });
        fetchDetail();
      } else {
        enqueueSnackbar(msg, { variant: 'error' });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; msg?: string } }; message?: string };
      enqueueSnackbar(e?.response?.data?.message ?? e?.response?.data?.msg ?? e?.message ?? 'Error al remover el pago', { variant: 'error' });
    }
  };

  const generatePdf = async () => {
    setLoadingPdf(true);
    try {
      const res = await axios.get(`/extra-charges/generate-pdf/${idce}`, {
        headers: { Authorization: `Bearer ${authToken()}` },
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
      setLoadingPdf(false);
    }
  };

  const addPayment = async () => {
    if (!selectedPagoToken || !detailData?.charge?.id) return;
    try {
      const res = await axios.post(
        '/extra-charges/add-payment',
        { id: detailData.charge.id, token: selectedPagoToken },
        { headers: { Authorization: `Bearer ${authToken()}` } }
      );
      const payload = res.data;
      const msg = payload?.message ?? payload?.msg ?? 'Pago agregado correctamente';
      if (payload?.status === 'success') {
        enqueueSnackbar(msg, { variant: 'success' });
        fetchDetail();
      } else {
        enqueueSnackbar(msg, { variant: 'error' });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; msg?: string } }; message?: string };
      enqueueSnackbar(e?.response?.data?.message ?? e?.response?.data?.msg ?? e?.message ?? 'Error al agregar el pago', { variant: 'error' });
    }
  };

  const resolveEstado = () => {
    const val = state !== undefined ? Number(state) : Number(pagado);
    switch (val) {
      case 0: return { label: 'Eliminado',   color: 'error',      hex: '#ff4d4f' };
      case 1: return { label: 'Nuevo',        color: 'processing', hex: '#1677ff' };
      case 2: return { label: 'Pagado',       color: 'success',    hex: '#52c41a' };
      case 3: return { label: 'Cancelado',    color: 'default',    hex: '#888'    };
      default: return { label: 'Desconocido', color: 'default',    hex: '#888'    };
    }
  };

  const pagosUtilizadosFiltrados = (detailData?.pagosUtilizados ?? []).filter((p) => {
    if (!searchPagos) return true;
    const q = searchPagos.toLowerCase();
    return (
      p.concepto?.toLowerCase().includes(q) ||
      String(p.cantidad).includes(q) ||
      (p.paid ?? '').toLowerCase().includes(q)
    );
  });

  const pagosColumns: import('antd/es/table').ColumnsType<PagoUtilizado> = [
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      render: (v) => <span style={{ fontWeight: 600 }}>{formatMonto(v)}</span>,
    },
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      key: 'concepto',
    },
    {
      title: 'Fecha de pago',
      dataIndex: 'paid',
      key: 'paid',
      width: 160,
      render: (v) => formatFecha(v),
    },
    {
      title: 'Comprobante',
      dataIndex: 'url',
      key: 'url',
      align: 'center',
      width: 110,
      render: (v) =>
        v ? (
          <Button
            size="small"
            type="text"
            icon={<FilePdfOutlined style={{ color: '#1a237e', fontSize: 18 }} />}
            onClick={() => setComprobanteUrl(v)}
          />
        ) : '—',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'center',
      width: 140,
      render: (_, record) => (
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removePayment(record.id)}
        >
          Remover pago
        </Button>
      ),
    },
  ];

  const { label, hex } = resolveEstado();
  const totalUtilizado = (detailData?.pagosUtilizados ?? []).reduce(
    (acc, p) => acc + (parseFloat(String(p.cantidad)) || 0),
    0
  );
  const montoTotal = parseFloat(String(monto)) || 0;
  const saldoFavor = totalUtilizado - montoTotal;
  const puedesPagar = totalUtilizado >= montoTotal;

  return (
    <>
      <Card
        title={
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.4, textAlign: 'center', display: 'block' }}>
            DETALLES DEL CARGO EXTRA {idce}
          </span>
        }
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Regresar
          </Button>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
      >
        <Spin spinning={loadingDetail}>
          {/* ── Info centrada ── */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 15, marginBottom: 4 }}>
              <span style={{ color: '#1677ff', fontWeight: 500 }}>Cliente: </span>
              <span style={{ fontWeight: 600 }}>
                {suite ? `(${suite}) ` : ''}
                {clienteName}
              </span>
            </div>
            {detailData?.charge?.cuenta && (
              <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>
                Cuenta: <strong>{detailData.charge.cuenta}</strong>
                {detailData.charge.num_cuenta && (
                  <> - No. Cuenta: <strong>{detailData.charge.num_cuenta}</strong></>
                )}
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: 14 }}>
              <span style={{ color: '#ff4d4f', marginRight: 24 }}>
                Monto total: <strong>{formatMonto(monto)}</strong>
              </span>
              <span>
                Fecha límite de pago: <strong>{formatFecha(fechap)}</strong>
              </span>
            </div>
            <div style={{ marginTop: 14 }}>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                style={{ background: '#1a237e', borderColor: '#1a237e' }}
                loading={loadingPdf}
                onClick={generatePdf}
              >
                Descargar PDF
              </Button>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
                ESTADO: <span style={{ color: hex }}>{label.toUpperCase()}</span>
              </div>
              {Number(state ?? pagado) === 2 && fechap && (
                <div style={{ color: '#52c41a', fontSize: 13, marginTop: 4 }}>
                  Pagado el: {formatFecha(fechap)}
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* ── Listado de cargos ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 10, fontSize: 14 }}>
              Listado de cargos
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 400 }}>
                <thead>
                  <tr>
                    <th style={{ background: '#2da58e', color: '#fff', padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>
                      Concepto
                    </th>
                    <th style={{ background: '#2da58e', color: '#fff', padding: '8px 12px', textAlign: 'right', fontWeight: 600, width: 130 }}>
                      Cantidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(detailData?.detalles ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', padding: '12px', color: '#aaa' }}>
                        Sin cargos registrados
                      </td>
                    </tr>
                  ) : (
                    detailData!.detalles.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e8e8e8' }}>
                        <td style={{ padding: '8px 12px' }}>{c.concepto}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>{formatMonto(c.monto)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Divider />

          {/* ── Lista de pagos asociados a CE ── */}
          <div>
            <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 10, fontSize: 14 }}>
              Lista de pagos asociados a CE
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <Input
                placeholder="Buscar:"
                prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                value={searchPagos}
                onChange={(e) => setSearchPagos(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
            </div>
            <Table
              columns={pagosColumns}
              dataSource={pagosUtilizadosFiltrados}
              rowKey={(r) => r.id ?? String(Math.random())}
              size="small"
              pagination={{
                pageSize: 10,
                showTotal: (t, r) => `Mostrando ${r[0]} a ${r[1]} de ${t} Entradas`,
              }}
              className="detail-pagos-table"
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: 'Sin pagos registrados' }}
            />

            {/* ── Pagos disponibles / Pagar ── */}
            <Divider />
            {puedesPagar ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                {saldoFavor > 0 && (
                  <div style={{ fontSize: 14, marginBottom: 14, color: '#555' }}>
                    Saldo a favor de{' '}
                    <span style={{ color: '#52c41a', fontWeight: 700 }}>{formatMonto(saldoFavor)}</span>
                  </div>
                )}
                <Button
                  type="primary"
                  size="large"
                  style={{ background: '#2da58e', borderColor: '#2da58e', minWidth: 180 }}
                  onClick={() => console.log('Pagar cargo extra:', token)}
                >
                  Pagar cargo extra
                </Button>
              </div>
            ) : (
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  Asignar pago disponible
                </div>
                {(detailData?.pagosDisponibles ?? []).length === 0 ? (
                  <Alert message="Sin pagos disponibles" type="warning" showIcon style={{ borderRadius: 8 }} />
                ) : (
                  <>
                    <Select
                      placeholder="Seleccionar pago disponible..."
                      style={{ width: '100%', maxWidth: 480 }}
                      allowClear
                      value={selectedPagoToken}
                      onChange={(val) => setSelectedPagoToken(val ?? null)}
                      options={detailData!.pagosDisponibles.map((p) => ({
                        value: p.token,
                        label: `${formatMonto(p.cantidad)} — Pagado el: ${formatFecha(p.paid)}`,
                      }))}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Button
                        type="primary"
                        disabled={!selectedPagoToken}
                        style={{ background: '#2da58e', borderColor: '#2da58e', minWidth: 160 }}
                        onClick={addPayment}
                      >
                        Agregar pago
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Spin>
      </Card>

      {/* Modal comprobante */}
      <Modal
        open={!!comprobanteUrl}
        onCancel={() => setComprobanteUrl(null)}
        footer={[
          <Button key="open" type="link" href={comprobanteUrl ?? ''} target="_blank">
            Abrir en nueva pestaña
          </Button>,
          <Button key="close" onClick={() => setComprobanteUrl(null)}>
            Cerrar
          </Button>,
        ]}
        title="Comprobante"
        width={800}
        centered
        destroyOnClose
      >
        {comprobanteUrl && (
          /\.pdf(\?.*)?$/i.test(comprobanteUrl) ? (
            <iframe
              src={comprobanteUrl}
              style={{ width: '100%', height: 520, border: 'none', borderRadius: 4 }}
              title="Comprobante PDF"
            />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <img
                src={comprobanteUrl}
                alt="Comprobante"
                style={{ maxWidth: '100%', maxHeight: 520, objectFit: 'contain', borderRadius: 4 }}
              />
            </div>
          )
        )}
      </Modal>
    </>
  );
};
