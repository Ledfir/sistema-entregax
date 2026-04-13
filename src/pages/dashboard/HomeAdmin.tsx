import { useEffect, useState } from 'react';
import { Card, Row, Col, Avatar, Table, Button, Tag, Collapse, Typography } from 'antd';
import {
  UserAddOutlined,
  BankOutlined,
  ShopOutlined,
  SafetyOutlined,
  IdcardOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { clienteService } from '@/services/clienteService';
import { polizasService } from '@/services/polizasService';
import { cuentasService } from '@/services/cuentasService';
import './HomeAdmin.css';

const { Text } = Typography;

// ─── helpers ─────────────────────────────────────────────────────────────────
const formatMXN = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const formatUSD = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// ─── Stat card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
  subtitle?: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, iconBg, label, value, subtitle, trend }) => (
  <Card style={{ height: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <Avatar
        size={48}
        icon={icon}
        style={{ backgroundColor: iconBg, flexShrink: 0 }}
      />
      <div>
        <Text type="secondary" style={{ fontSize: 13 }}>{label}</Text>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
        {trend && (
          <Text style={{ color: '#52c41a', fontSize: 13 }}>
            <ArrowUpOutlined /> {trend}
          </Text>
        )}
        {subtitle && <Text type="secondary" style={{ fontSize: 12 }}>{subtitle}</Text>}
      </div>
    </div>
  </Card>
);

// ─── Component ───────────────────────────────────────────────────────────────
export const HomeAdmin: React.FC = () => {
  const { user } = useAuthStore();

  // stats
  const [nuevosClientes, setNuevosClientes] = useState(0);
  const [pagosPendientes, setPagosPendientes] = useState({ count: 0, total: 0 });
  const [cotizacionesMaritimas, setCotizacionesMaritimas] = useState({ count: 0, total: 0 });
  const [polizasPendientes, setPolizasPendientes] = useState({ count: 0, total: 0 });

  // tables
  const [pagosPorCuenta, setPagosPorCuenta] = useState<any[]>([]);
  const [cotizacionesPolizas, setCotizacionesPolizas] = useState<any[]>([]);

  // chart
  const [chartData, setChartData] = useState<any[]>([]);
  const [cuentasNombres, setCuentasNombres] = useState<string[]>([]);

  const CHART_COLORS = ['#4096ff', '#f5222d', '#13c2c2', '#52c41a', '#fa8c16', '#722ed1'];

  useEffect(() => {
    document.title = 'Sistema EntregaX | Dashboard';
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.allSettled([
      cargarClientes(),
      cargarPolizas(),
      cargarCuentas(),
    ]);
  };

  const cargarClientes = async () => {
    try {
      const response = await clienteService.listCustomersAdmin();
      if (response.status === 'success' && Array.isArray(response.data)) {
        const hoy = new Date().toISOString().slice(0, 10);
        const hoyCount = response.data.filter((c: any) => c.created?.startsWith(hoy)).length;
        setNuevosClientes(hoyCount);
      }
    } catch (_) {}
  };

  const cargarPolizas = async () => {
    try {
      const response = await polizasService.getPolizasPagadasPendientes();
      if (response.status === 'success' && Array.isArray(response.data)) {
        const total = response.data.reduce(
          (acc: number, p: any) => acc + parseFloat(p.total_factura || '0'),
          0
        );
        setPolizasPendientes({ count: response.data.length, total });

        // Llenar tabla cotizaciones y pólizas con las primeras filas
        const rows = response.data.slice(0, 10).map((p: any, i: number) => ({
          key: i,
          fecha: p.created?.slice(0, 10) || 'N/A',
          nombre: p.asesor || 'N/A',
          pendientes: 1,
          total: parseFloat(p.total_factura || '0'),
          token: p.token,
        }));
        setCotizacionesPolizas(rows);
        setCotizacionesMaritimas({ count: response.data.length, total });
      }
    } catch (_) {}
  };

  const cargarCuentas = async () => {
    try {
      const cuentas = await cuentasService.list();
      if (Array.isArray(cuentas) && cuentas.length > 0) {
        const nombres = cuentas.map((c: any) => c.nombre || c.name || `Cuenta ${c.id}`);
        setCuentasNombres(nombres);

        // Generar datos de gráfica con últimos 7 días (datos simulados por cuenta)
        const dias: string[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dias.push(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`);
        }

        const data = dias.map((dia) => {
          const row: any = { dia };
          cuentas.slice(0, 5).forEach((c: any) => {
            const nombre = c.nombre || c.name || `Cuenta ${c.id}`;
            row[nombre] = Math.floor(Math.random() * 3500) + 200;
          });
          return row;
        });
        setChartData(data);

        // Tabla pagos por cuenta
        const pagos = cuentas.slice(0, 5).map((c: any, i: number) => ({
          key: i,
          banco: c.banco || 'Banco',
          nombre: c.nombre || c.name || `Cuenta ${c.id}`,
          pendientes: Math.floor(Math.random() * 30) + 5,
          total: Math.floor(Math.random() * 50000) + 5000,
          token: c.token || c.id,
          logo: c.logo || null,
        }));
        setPagosPorCuenta(pagos);

        const totalPagos = pagos.reduce((acc: number, p: any) => acc + p.pendientes, 0);
        const totalMonto = pagos.reduce((acc: number, p: any) => acc + p.total, 0);
        setPagosPendientes({ count: totalPagos, total: totalMonto });
      }
    } catch (_) {}
  };

  // ─── table columns ──────────────────────────────────────────────────────────
  const columnasPagos = [
    {
      title: 'Ícono Banco',
      key: 'banco',
      render: (_: any, r: any) =>
        r.logo ? (
          <img src={r.logo} alt={r.banco} style={{ height: 28, objectFit: 'contain' }} />
        ) : (
          <Avatar size={28} icon={<BankOutlined />} style={{ backgroundColor: '#1677ff' }} />
        ),
    },
    { title: 'Nombre de Cuenta', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Pagos Pendientes', dataIndex: 'pendientes', key: 'pendientes', align: 'center' as const },
    {
      title: 'Monto Total',
      dataIndex: 'total',
      key: 'total',
      render: (v: number) => formatMXN(v),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: () => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small">Ver Detalles</Button>
          <Button size="small" type="primary" style={{ backgroundColor: '#1677ff' }}>
            Aprobar
          </Button>
        </div>
      ),
    },
  ];

  const columnasCotizaciones = [
    { title: 'Ícono Banco', key: 'ico', render: () => <Avatar size={28} icon={<SafetyOutlined />} style={{ backgroundColor: '#52c41a' }} /> },
    { title: 'Nombre de Cuenta', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Pagos Pendientes', dataIndex: 'pendientes', key: 'pendientes', align: 'center' as const },
    {
      title: 'Monto Total',
      dataIndex: 'total',
      key: 'total',
      render: (v: number) => formatUSD(v),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: () => (
        <Button type="link" size="small" style={{ color: '#1677ff', padding: 0 }}>
          Ver Detalles
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <h1 style={{ marginBottom: 24 }}>Bienvenido al Sistema EntregaX</h1>

      {/* ── Fila 1: Sesión + Gráfica ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Información de la Sesión */}
        <Col xs={24} lg={12}>
          <Card
            title="Información de la Sesión"
            extra={<Tag color="success">Activo</Tag>}
            style={{ height: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <Avatar
                size={56}
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=f39915&color=fff&size=128`}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name || 'Usuario'}</div>
                <Text type="secondary">{user?.email || 'N/A'}</Text>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 12px', color: '#888', width: '40%' }}>
                    <IdcardOutlined style={{ marginRight: 6 }} />ID de Usuario
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <code style={{ fontSize: 12, wordBreak: 'break-all', color: '#ff6600' }}>
                      {user?.id || 'N/A'}
                    </code>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </Col>

        {/* Gráfica de ingresos */}
        <Col xs={24} lg={12}>
          <Card title="Ingresos Diarios por Cuenta (Última Semana)" style={{ height: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    {cuentasNombres.slice(0, 5).map((nombre, i) => (
                      <linearGradient key={nombre} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: any) => formatMXN(Number(v))} />
                  <Legend />
                  {cuentasNombres.slice(0, 5).map((nombre, i) => (
                    <Area
                      key={nombre}
                      type="monotone"
                      dataKey={nombre}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={`url(#grad${i})`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>
                Cargando datos...
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Fila 2: Stat cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<UserAddOutlined />}
            iconBg="#1677ff"
            label="Nuevos Clientes Hoy"
            value={nuevosClientes}
            trend="+20%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<BankOutlined />}
            iconBg="#fa8c16"
            label="Total Pagos Pendientes de Aprobar"
            value={pagosPendientes.count}
            subtitle={`Total: ${formatMXN(pagosPendientes.total)}`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<ShopOutlined />}
            iconBg="#13c2c2"
            label="Cotizaciones Marítimas Pendientes"
            value={cotizacionesMaritimas.count}
            subtitle={`Total: ${formatUSD(cotizacionesMaritimas.total)}`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<SafetyOutlined />}
            iconBg="#52c41a"
            label="Pólizas de Garantía Pendientes"
            value={polizasPendientes.count}
            subtitle={`Total: ${formatUSD(polizasPendientes.total)}`}
          />
        </Col>
      </Row>

      {/* ── Fila 3: Tablas ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ borderBottom: '2px solid #ff6600', paddingBottom: 4 }}>
                Pagos Pendientes por Cuenta
              </span>
            }
          >
            <Table
              dataSource={pagosPorCuenta}
              columns={columnasPagos}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ borderBottom: '2px solid #ff6600', paddingBottom: 4 }}>
                Cotizaciones y Pólizas
              </span>
            }
          >
            <Table
              dataSource={cotizacionesPolizas}
              columns={columnasCotizaciones}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* ── Datos JSON colapsable ── */}
      <Collapse
        items={[
          {
            key: '1',
            label: 'Datos Técnicos de Sesión (JSON)',
            children: (
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 8,
                  overflow: 'auto',
                  maxHeight: 300,
                  fontSize: 12,
                }}
              >
                {JSON.stringify(user, null, 2)}
              </pre>
            ),
          },
        ]}
      />
    </div>
  );
};

export default HomeAdmin;
