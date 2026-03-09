import { useState, useEffect } from 'react';
import { Button, Card, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Swal from 'sweetalert2';
import operacionesService from '@/services/operacionesService';
import { useAuthStore } from '@/store/authStore';

interface InstruccionRow {
  id: string | number;
  token: string;
  suite: string;   // mid
  cliente: string; // nomx
  cedis: string;   // cedisid
  cartones: number; // total
  raw: any;
}

interface Seccion {
  key: string;
  titulo: string;
  headerColor: string;
  cedisLabel: string;
  data: InstruccionRow[];
}

const SECCIONES_CONFIG: Omit<Seccion, 'data'>[] = [
  {
    key: 'usa',
    titulo: 'Instrucciones Pendientes en USA/Cedis Usa',
    headerColor: '#26A69A',
    cedisLabel: 'USA',
  },
  {
    key: 'tdi',
    titulo: 'Instrucciones Pendientes en TDI/Cedis china',
    headerColor: '#FFC107',
    cedisLabel: 'China',
  },
  {
    key: 'dhl',
    titulo: 'Instrucciones Pendientes en DHL/Cedis X',
    headerColor: '#8D7136',
    cedisLabel: 'DHL',
  },
  {
    key: 'tdi_express',
    titulo: 'Instrucciones Pendientes en TDI - DHL EXPRESS',
    headerColor: '#F26522',
    cedisLabel: 'TDI - DHL EXPRESS',
  },
];

function mapRows(items: any[]): InstruccionRow[] {
  if (!Array.isArray(items)) return [];
  return items.map((r) => ({
    id: r.id ?? r.token ?? '',
    token: r.token ?? '',
    suite: r.mid ?? r.suite ?? '',
    cliente: r.nomx ?? r.nombre ?? r.cliente ?? '',
    cedis: r.cedisid ?? r.cedis ?? '',
    cartones: Number(r.total ?? r.cartones ?? 0),
    raw: r,
  }));
}

export const Instrucciones = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [secciones, setSecciones] = useState<Seccion[]>([]);

  const cargarDatos = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await operacionesService.getPendingInstructions(user.id);
      const data = res?.data ?? {};

      setSecciones(
        SECCIONES_CONFIG.map((s) => ({
          ...s,
          data: mapRows(data[s.key] ?? []),
        }))
      );
    } catch (e: any) {
      console.error(e);
      Swal.fire({
        icon: 'error',
        title: '',
        text: e?.response?.data?.message ?? 'Error al cargar instrucciones pendientes',
        showConfirmButton: false,
        timer: 4000,
      });
      setSecciones(SECCIONES_CONFIG.map((s) => ({ ...s, data: [] })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Sistema Entregax | Instrucciones Pendientes';
    cargarDatos();
  }, []);

  const handleVerListas = (record: InstruccionRow) => {
    console.log('Ver Listas', record);
    // TODO: navegar o abrir modal
  };

  const handleVerPendientes = (record: InstruccionRow) => {
    console.log('Ver Pendientes', record);
    // TODO: navegar o abrir modal
  };

  const handleVerTarimas = (record: InstruccionRow) => {
    console.log('Ver Tarimas', record);
    // TODO: navegar o abrir modal
  };

  const baseColumns: ColumnsType<InstruccionRow> = [
    {
      title: 'Suite',
      dataIndex: 'suite',
      key: 'suite',
      width: 100,
      render: (val) => <strong>{val}</strong>,
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
    },
    {
      title: 'CEDIS',
      dataIndex: 'cedis',
      key: 'cedis',
      width: 130,
      render: (val) => val ? <Tag>{val}</Tag> : '—',
    },
    {
      title: 'Cartones',
      dataIndex: 'cartones',
      key: 'cartones',
      width: 100,
      align: 'center',
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: 'Ver Listas',
      key: 'ver_listas',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => handleVerListas(record)}
          style={{
            backgroundColor: '#E8806A',
            borderColor: '#E8806A',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          Asignar
        </Button>
      ),
    },
    {
      title: 'Ver Pendientes',
      key: 'ver_pendientes',
      width: 155,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => handleVerPendientes(record)}
          style={{
            backgroundColor: '#F26522',
            borderColor: '#F26522',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          Pendientes ({record.cartones})
        </Button>
      ),
    },
  ];

  const usaColumns: ColumnsType<InstruccionRow> = [
    ...baseColumns,
    {
      title: 'Ver Tarimas',
      key: 'ver_tarimas',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => handleVerTarimas(record)}
          style={{
            backgroundColor: '#26A69A',
            borderColor: '#26A69A',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          Tarimas
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {secciones.map((seccion) => (
            <Card
              key={seccion.key}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: seccion.headerColor,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 600 }}>{seccion.titulo}</span>
                  <Tag color={seccion.headerColor} style={{ marginLeft: 'auto', fontWeight: 600 }}>
                    {seccion.data.length} registro{seccion.data.length !== 1 ? 's' : ''}
                  </Tag>
                </div>
              }
              style={{ borderLeft: `4px solid ${seccion.headerColor}` }}
            >
              {seccion.data.length === 0 ? (
                <p style={{ margin: 0, color: '#666' }}>
                  No hay cartones pendientes en {seccion.cedisLabel}
                </p>
              ) : (
                <Table<InstruccionRow>
                  columns={seccion.key === 'usa' ? usaColumns : baseColumns}
                  dataSource={seccion.data}
                  rowKey={(r) => String(r.id)}
                  pagination={false}
                  size="middle"
                  bordered
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Instrucciones;

