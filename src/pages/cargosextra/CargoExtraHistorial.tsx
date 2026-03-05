import { useEffect, useState } from 'react';
import { Card, Table, Tag, Input, Button, Dropdown, Space, Spin, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { SearchOutlined, MoreOutlined, EyeOutlined, FilePdfOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import axios from '@/api/axios';
import './CargoExtra.css';

interface CargoExtraHistorialItem {
  token: string;
  idce: string;
  CLIENTE: string;
  suite: string;
  monto: string | number;
  fechap: string | null;
  pagado: number | string;
  paid?: string | null;
  estado?: string;
  state?: number | string;
}

interface CargoDetalleCargo {
  concepto: string;
  monto: string | number;
}

interface CargoDetallePago {
  cantidad: string | number;
  concepto: string;
  fecha_pago: string | null;
  comprobante?: string | null;
}

interface CargoExtraDetalle {
  charge?: { cuenta?: string; num_cuenta?: string; [key: string]: unknown };
  cuenta?: string;
  detalles: CargoDetalleCargo[];
  pagos: CargoDetallePago[];
}

export const CargoExtraHistorial = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CargoExtraHistorialItem[]>([]);
  const [filtered, setFiltered] = useState<CargoExtraHistorialItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<CargoExtraHistorialItem | null>(null);
  const [detailData, setDetailData] = useState<CargoExtraDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    document.title = 'Sistema Entregax | Historial de Cargos Extras';
    if (user?.id) fetchHistorial();
  }, [user?.id]);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const token = user?.token || localStorage.getItem('token') || '';
      const res = await axios.get(`/extra-charges/historial/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data;
      let list: CargoExtraHistorialItem[] = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (payload?.data && Array.isArray(payload.data)) {
        list = payload.data;
      } else if (payload?.status === 'success' && Array.isArray(payload.data)) {
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

  const fetchDetail = async (token: string) => {
    setLoadingDetail(true);
    setDetailData(null);
    try {
      const authToken = user?.token || localStorage.getItem('token') || '';
      const res = await axios.get(`/extra-charges/detail/${token}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const payload = res.data;
      if (payload?.data) {
        const raw = payload.data;
        setDetailData({
          charge: raw.charge,
          cuenta: raw.charge?.cuenta,
          detalles: Array.isArray(raw.detalles) ? raw.detalles : [],
          pagos: Array.isArray(raw.pagos) ? raw.pagos : [],
        });
      } else if (payload?.detalles || payload?.pagos) {
        setDetailData({
          charge: payload.charge,
          cuenta: payload.charge?.cuenta ?? payload.cuenta,
          detalles: Array.isArray(payload.detalles) ? payload.detalles : [],
          pagos: Array.isArray(payload.pagos) ? payload.pagos : [],
        });
      }
    } catch {
      setDetailData(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const q = value.toLowerCase();
    setFiltered(
      data.filter(
        (r) =>
          r.idce?.toLowerCase().includes(q) ||
          r.CLIENTE?.toLowerCase().includes(q) ||
          String(r.monto)?.includes(q)
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
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return fecha;
    }
  };

  const resolveEstado = (row: CargoExtraHistorialItem) => {
    const val = row.state !== undefined ? Number(row.state) : Number(row.estado);
    switch (val) {
      case 0: return { label: 'Eliminado',  color: 'error'      };
      case 1: return { label: 'Nuevo',       color: 'processing' };
      case 2: return { label: 'Pagado',      color: 'success'    };
      case 3: return { label: 'Cancelado',   color: 'default'    };
      default: return { label: 'Desconocido', color: 'default'   };
    }
  };

  const pagosColumns: import('antd/es/table').ColumnsType<CargoDetallePago> = [
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: 110,
      render: (v) => <span style={{ fontWeight: 600 }}>{formatMonto(v)}</span>,
    },
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      key: 'concepto',
    },
    {
      title: 'Fecha de pago',
      dataIndex: 'fecha_pago',
      key: 'fecha_pago',
      width: 130,
      render: (v) => formatFecha(v),
    },
    {
      title: 'Comprobante',
      dataIndex: 'comprobante',
      key: 'comprobante',
      align: 'center',
      width: 110,
      render: (v) =>
        v ? (
          <Button
            size="small"
            type="text"
            icon={<FilePdfOutlined style={{ color: '#1a237e', fontSize: 18 }} />}
            href={v}
            target="_blank"
          />
        ) : '—',
    },
  ];

  const columns: ColumnsType<CargoExtraHistorialItem> = [
    {
      title: 'ACCIONES',
      key: 'acciones',
      align: 'center',
      width: 90,
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'detalles',
            icon: <EyeOutlined />,
            label: 'Detalles',
            onClick: () => { setSelectedRecord(record); fetchDetail(record.token); },
          },
          {
            key: 'pdf',
            icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
            label: 'Descargar PDF',
            onClick: () => console.log('Descargar PDF:', record.token),
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
      title: 'CE',
      dataIndex: 'idce',
      key: 'idce',
      align: 'center',
      render: (v) => <strong>{v || '—'}</strong>,
    },
    {
      title: 'CLIENTE',
      dataIndex: 'SUITE',
      key: 'SUITE',
      align: 'center',
      render: (v, record) => (v ? <span style={{ fontWeight: 500 }}>({v}) {record.CLIENTE}</span> : '—'),
    },
    {
      title: 'MONTO',
      dataIndex: 'monto',
      key: 'monto',
      align: 'center',
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{formatMonto(v)}</span>
      ),
    },
    {
      title: 'FECHA DE PAGO',
      dataIndex: 'fechap',
      key: 'fechap',
      align: 'center',
      render: (v) => formatFecha(v),
    },
    {
      title: 'ESTADO',
      key: 'estado',
      align: 'center',
      render: (_, record) => {
        const { label, color } = resolveEstado(record);
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      {selectedRecord ? (
        <Card
          title={
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.4, textAlign: 'center', display: 'block' }}>
              DETALLES DEL CARGO EXTRA {selectedRecord.idce}
            </span>
          }
          extra={
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => { setSelectedRecord(null); setDetailData(null); }}
            >
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
                  {selectedRecord.suite ? `(${selectedRecord.suite}) ` : ''}
                  {selectedRecord.CLIENTE}
                </span>
              </div>
              {detailData?.cuenta && (
                <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>
                  Cuenta: <strong>{detailData.cuenta}</strong>
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 14 }}>
                <span style={{ color: '#ff4d4f', marginRight: 24 }}>
                  Monto total:{' '}
                  <strong>{formatMonto(selectedRecord.monto)}</strong>
                </span>
                <span>
                  Fecha límite de pago:{' '}
                  <strong>{formatFecha(selectedRecord.fechap)}</strong>
                </span>
              </div>
              <div style={{ marginTop: 14 }}>
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  style={{ background: '#1a237e', borderColor: '#1a237e' }}
                  onClick={() => console.log('PDF:', selectedRecord.token)}
                >
                  Descargar PDF
                </Button>
              </div>
              {(() => {
                const { label, color } = resolveEstado(selectedRecord);
                const colorMap: Record<string, string> = {
                  error: '#ff4d4f',
                  processing: '#1677ff',
                  success: '#52c41a',
                  default: '#888',
                };
                const hex = colorMap[color] ?? '#888';
                return (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
                      ESTADO:{' '}
                      <span style={{ color: hex }}>{label.toUpperCase()}</span>
                    </div>
                    {Number(selectedRecord.state ?? selectedRecord.pagado) === 2 &&
                      selectedRecord.fechap && (
                        <div style={{ color: '#52c41a', fontSize: 13, marginTop: 4 }}>
                          Pagado el: {formatFecha(selectedRecord.fechap)}
                        </div>
                      )}
                  </div>
                );
              })()}
            </div>

            <Divider />

            {/* ── Listado de cargos ── */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 10, fontSize: 14 }}>
                Listado de cargos
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        background: '#2da58e',
                        color: '#fff',
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontWeight: 600,
                      }}
                    >
                      Concepto
                    </th>
                    <th
                      style={{
                        background: '#2da58e',
                        color: '#fff',
                        padding: '8px 12px',
                        textAlign: 'right',
                        fontWeight: 600,
                        width: 130,
                      }}
                    >
                      Cantidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(detailData?.detalles ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        style={{ textAlign: 'center', padding: '12px', color: '#aaa' }}
                      >
                        Sin cargos registrados
                      </td>
                    </tr>
                  ) : (
                    detailData!.detalles.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e8e8e8' }}>
                        <td style={{ padding: '8px 12px' }}>{c.concepto}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                          {formatMonto(c.monto)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Divider />

            {/* ── Lista de pagos asociados a CE ── */}
            <div>
              <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 10, fontSize: 14 }}>
                Lista de pagos asociados a CE
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Space>
                  <Button
                    size="small"
                    style={{ background: '#e74c3c', color: '#fff', borderColor: '#e74c3c' }}
                  >
                    PDssF
                  </Button>
                  <Button
                    size="small"
                    style={{ background: '#27ae60', color: '#fff', borderColor: '#27ae60' }}
                  >
                    Excel
                  </Button>
                  <Button
                    size="small"
                    style={{ background: '#f39c12', color: '#fff', borderColor: '#f39c12' }}
                  >
                    Imprimir
                  </Button>
                </Space>
                <Input placeholder="Buscar:" style={{ width: 200 }} />
              </div>
              <Table
                columns={pagosColumns}
                dataSource={detailData?.pagos ?? []}
                rowKey={(_, i) => String(i)}
                size="small"
                pagination={{
                  pageSize: 10,
                  showTotal: (t, r) =>
                    `Mostrando ${r[0]} a ${r[1]} de ${t} Entradas`,
                }}
                className="detail-pagos-table"
                locale={{ emptyText: 'Sin pagos registrados' }}
              />
            </div>
          </Spin>
        </Card>
      ) : (
      <Card
        title={
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.4 }}>
            HISTORIAL DE CARGOS EXTRAS
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
          scroll={{ x: 700 }}
          size="middle"
          locale={{ emptyText: 'Sin registros en el historial' }}
        />
      </Card>
      )}
    </div>
  );
};
