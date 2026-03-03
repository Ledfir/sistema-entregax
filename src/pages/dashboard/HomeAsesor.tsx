import { useEffect, useState } from 'react';
import { Card, Spin, Typography, Divider, Empty, Row, Col, Statistic, Tag } from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Dot,
} from 'recharts';
import axios from '@/api/axios';
import { useAuthStore } from '@/store/authStore';
import './HomeAsesor.css';

const { Title, Text } = Typography;

interface NewsLog {
  tipo: string;
  text: string;
}

interface Comunicado {
  id: string | number;
  title: string;
  text: string;
  resp: string;
  created_at: string;
  logs: NewsLog[];
}

interface CtzPeriod {
  actual: number;
  last_month: number;
  last_2months: number;
  last_3months: number;
}

interface CtzFechas {
  actual: string;
  last_month: string;
  last_2months: string;
  last_3months: string;
}

interface CtzData {
  fechas: CtzFechas;
  inst: CtzPeriod;
  maritime: CtzPeriod;
}

interface PaymentEntry {
  total: string | null;
}

type PaymentsData = {
  actual: PaymentEntry[];
  last_month: PaymentEntry[];
  last_2months: PaymentEntry[];
  last_3months: PaymentEntry[];
  last_4months: PaymentEntry[];
  last_5months: PaymentEntry[];
  last_6months: PaymentEntry[];
  last_7months: PaymentEntry[];
  last_8months: PaymentEntry[];
  last_9months: PaymentEntry[];
  last_10months: PaymentEntry[];
  last_11months: PaymentEntry[];
};

interface EstadisticasAsesor {
  clientes: number | string;
  cotizaciones: number | string;
  pendientes_cotizar: number | string;
  pagos: number | string;
  ctz?: CtzData;
  payments?: PaymentsData;
}

const defaultStats: EstadisticasAsesor = {
  clientes: 0,
  cotizaciones: 0,
  pendientes_cotizar: 0,
  pagos: 0,
};

export const HomeAsesor = () => {
  const { user } = useAuthStore();
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAsesor>(defaultStats);
  const [loadingComunicados, setLoadingComunicados] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    document.title = 'Sistema Entregax | Home';
    fetchComunicados();
    fetchEstadisticas();
  }, []);

  const fetchComunicados = async () => {
    try {
      const token = user?.token || localStorage.getItem('token') || '';
      const res = await axios.get('/news/last-updates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data;
      if (payload?.status === 'success' && Array.isArray(payload.data)) {
        setComunicados(payload.data);
      } else if (Array.isArray(payload)) {
        setComunicados(payload);
      }
    } catch {
      setComunicados([]);
    } finally {
      setLoadingComunicados(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const token = user?.token || localStorage.getItem('token') || '';
      const res = await axios.post(
        '/get-data-advisor-panel',
        { id: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const payload = res.data;
      if (payload?.status === 'success' && payload.data && typeof payload.data === 'object') {
        setEstadisticas({ ...defaultStats, ...payload.data });
      }
    } catch {
      setEstadisticas(defaultStats);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return fecha;
    }
  };

  const formatMes = (yyyymm: string) => {
    if (!yyyymm) return yyyymm;
    const [year, month] = yyyymm.split('-');
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
  };

  const buildChartData = (fechas: CtzFechas, values: CtzPeriod) => {
    const keys: (keyof CtzFechas)[] = ['last_3months', 'last_2months', 'last_month', 'actual'];
    return keys.map((k) => ({
      mes: formatMes(fechas[k]),
      cantidad: Number(values[k as keyof CtzPeriod]) || 0,
    }));
  };

  const buildPaymentsChartData = (payments: PaymentsData, actualYyyymm: string) => {
    const [y, m] = actualYyyymm.split('-').map(Number);
    const keys: (keyof PaymentsData)[] = [
      'last_11months', 'last_10months', 'last_9months', 'last_8months',
      'last_7months', 'last_6months', 'last_5months', 'last_4months',
      'last_3months', 'last_2months', 'last_month', 'actual',
    ];
    return keys.map((key, i) => {
      const monthsBack = 11 - i;
      const d = new Date(y, m - 1 - monthsBack, 1);
      const label = d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
      const entry = payments[key]?.[0];
      const total = entry?.total ? parseFloat(entry.total) : 0;
      return { mes: label, total };
    });
  };

  return (
    <div className="home-asesor-container">
      <Row gutter={[20, 20]} style={{ height: '100%' }}>
        {/* ── ESTADÍSTICAS (2/3) ──────────────────────────────── */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <span className="home-asesor-card-title">
                Estadísticas
              </span>
            }
            className="home-asesor-card home-asesor-stats-card"
            bordered={false}
          >
            {loadingStats ? (
              <div className="home-asesor-spinner">
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <div className="stat-box stat-green">
                      <TeamOutlined className="stat-icon" />
                      <Statistic
                        title="Clientes"
                        value={estadisticas.clientes}
                        valueStyle={{ color: '#52c41a', fontWeight: 700 }}
                      />
                    </div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="stat-box stat-blue">
                      <FileTextOutlined className="stat-icon" />
                      <Statistic
                        title="CTZ's pendientes de pago"
                        value={estadisticas.cotizaciones}
                        valueStyle={{ color: '#1677ff', fontWeight: 700 }}
                      />
                    </div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="stat-box stat-orange">
                      <ShoppingCartOutlined className="stat-icon" />
                      <Statistic
                        title="Pendientes de cotizar"
                        value={estadisticas.pendientes_cotizar}
                        valueStyle={{ color: '#f39915', fontWeight: 700 }}
                      />
                    </div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="stat-box stat-purple">
                      <DollarOutlined className="stat-icon" />
                      <Statistic
                        title="Pagos de este mes"
                        value={estadisticas.pagos}
                        prefix="$"
                        precision={2}
                        valueStyle={{ color: '#722ed1', fontWeight: 700 }}
                      />
                    </div>
                  </Col>
                </Row>

                <Divider style={{ margin: '24px 0 16px' }} />

                {estadisticas.ctz ? (
                  <>
                    <Row gutter={[16, 0]}>
                      {/* Gráfica Aéreo */}
                      <Col xs={24} sm={12}>
                        <p className="chart-label">CTZ's TDI, USA y DHL pagadas por mes</p>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart
                            data={buildChartData(estadisticas.ctz.fechas, estadisticas.ctz.inst)}
                            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip
                              formatter={(v: number | undefined) => [v ?? 0, "CTZ's"]}
                              contentStyle={{ fontSize: 12 }}
                            />
                            <Bar dataKey="cantidad" fill="#1677ff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Col>

                      {/* Gráfica Marítimo */}
                      <Col xs={24} sm={12}>
                        <p className="chart-label">CTZ's marítimo pagadas por mes</p>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart
                            data={buildChartData(estadisticas.ctz.fechas, estadisticas.ctz.maritime)}
                            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip
                              formatter={(v: number | undefined) => [v ?? 0, "CTZ's"]}
                              contentStyle={{ fontSize: 12 }}
                            />
                            <Bar dataKey="cantidad" fill="#f39915" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Col>
                    </Row>

                    {/* Gráfica Pagos 12 meses */}
                    {estadisticas.payments && (
                      <>
                        <Divider style={{ margin: '20px 0 14px' }} />
                        <p className="chart-label">Total cobrado por mes (MXN)</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart
                            data={buildPaymentsChartData(estadisticas.payments, estadisticas.ctz.fechas.actual)}
                            margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                            <YAxis
                              tickFormatter={(v: number) =>
                                v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                              }
                              tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                              formatter={(v: number | undefined) => [
                                `$${(v ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                'Total pagos',
                              ]}
                              contentStyle={{ fontSize: 12 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="total"
                              stroke="#52c41a"
                              strokeWidth={2.5}
                              dot={<Dot r={4} fill="#52c41a" />}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </>
                    )}
                  </>
                ) : (
                  <div className="stats-chart-placeholder">
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Sin datos de cotizaciones para graficar
                    </Text>
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>

        {/* ── CENTRO DE INFORMACIÓN (1/3) ─────────────────────── */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="home-asesor-card-title">
                Centro de información
              </span>
            }
            className="home-asesor-card home-asesor-info-card"
            bordered={false}
          >
            {loadingComunicados ? (
              <div className="home-asesor-spinner">
                <Spin />
              </div>
            ) : comunicados.length === 0 ? (
              <Empty
                description="Sin comunicados disponibles"
                imageStyle={{ height: 60 }}
              />
            ) : (
              <div className="comunicados-list">
                {comunicados.map((c, idx) => (
                  <div key={c.id ?? idx} className="comunicado-item">
                    <div className="comunicado-header">
                      <Title level={5} className="comunicado-titulo">
                        {c.title}
                      </Title>
                      <Text type="secondary" className="comunicado-fecha">
                        {formatFecha(c.created_at)}
                      </Text>
                    </div>

                    <div
                      className="comunicado-cuerpo"
                      dangerouslySetInnerHTML={{ __html: c.text }}
                    />

                    {c.resp && (
                      <Text type="secondary" className="comunicado-resp">
                        — {c.resp.trim()}
                      </Text>
                    )}

                    {c.logs && c.logs.length > 0 && (
                      <div className="comunicado-logs">
                        {c.logs.map((log, li) => (
                          <div key={li} className="comunicado-log-item">
                            <Tag
                              color={
                                log.tipo === 'Agregado'
                                  ? 'green'
                                  : log.tipo === 'Mejorado'
                                  ? 'blue'
                                  : log.tipo === 'Corregido'
                                  ? 'orange'
                                  : log.tipo === 'Eliminado'
                                  ? 'red'
                                  : 'default'
                              }
                              style={{ fontSize: 11, marginBottom: 2 }}
                            >
                              {log.tipo}
                            </Tag>
                            <Text style={{ fontSize: 12, color: '#555' }}>
                              {log.text}
                            </Text>
                          </div>
                        ))}
                      </div>
                    )}

                    {idx < comunicados.length - 1 && (
                      <Divider style={{ margin: '14px 0' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
