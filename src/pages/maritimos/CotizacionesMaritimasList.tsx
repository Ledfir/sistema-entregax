import { useEffect, useState } from 'react';
import { Card, Table, Tag, Dropdown, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { MoreOutlined, EyeOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { humanizarFecha } from '@/utils';
import './CotizacionesMaritimasList.css';

interface CotizacionMaritima {
  key: string;
  estado: string;
  cotizacion: string;
  week: string;
  suite: string;
  asesor: string;
  cbms: number;
  tipoCambio: number;
  costo: number;
  costoPaqueteria: number;
  fechaAprobado: string;
  fechaCreacion: string;
}

export const CotizacionesMaritimasList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CotizacionMaritima[]>([]);

  useEffect(() => {
    document.title = 'Sistema Entregax | Cotizaciones Marítimas';
    loadCotizaciones();
  }, []);

  const loadCotizaciones = () => {
    setLoading(true);
    
    // Mock data - Reemplazar con llamada real a la API
    setTimeout(() => {
      const mockData: CotizacionMaritima[] = [
        {
          key: '1',
          estado: 'Aprobado',
          cotizacion: 'CTZ-MAR-001',
          week: 'W12-2026',
          suite: 'STE-001',
          asesor: 'Juan Pérez',
          cbms: 25.5,
          tipoCambio: 17.85,
          costo: 1250.00,
          costoPaqueteria: 350.00,
          fechaAprobado: '2026-03-20',
          fechaCreacion: '2026-03-15',
        },
        {
          key: '2',
          estado: 'Pendiente',
          cotizacion: 'CTZ-MAR-002',
          week: 'W11-2026',
          suite: 'STE-002',
          asesor: 'María González',
          cbms: 18.3,
          tipoCambio: 17.90,
          costo: 980.00,
          costoPaqueteria: 280.00,
          fechaAprobado: '',
          fechaCreacion: '2026-03-10',
        },
        {
          key: '3',
          estado: 'En revisión',
          cotizacion: 'CTZ-MAR-003',
          week: 'W13-2026',
          suite: 'STE-003',
          asesor: 'Ana López',
          cbms: 42.8,
          tipoCambio: 17.75,
          costo: 2100.00,
          costoPaqueteria: 520.00,
          fechaAprobado: '',
          fechaCreacion: '2026-03-18',
        },
        {
          key: '4',
          estado: 'Aprobado',
          cotizacion: 'CTZ-MAR-004',
          week: 'W12-2026',
          suite: 'STE-004',
          asesor: 'Pedro Ramírez',
          cbms: 31.2,
          tipoCambio: 17.80,
          costo: 1580.00,
          costoPaqueteria: 410.00,
          fechaAprobado: '2026-03-22',
          fechaCreacion: '2026-03-16',
        },
        {
          key: '5',
          estado: 'Rechazado',
          cotizacion: 'CTZ-MAR-005',
          week: 'W10-2026',
          suite: 'STE-005',
          asesor: 'Laura Torres',
          cbms: 15.6,
          tipoCambio: 17.95,
          costo: 750.00,
          costoPaqueteria: 190.00,
          fechaAprobado: '',
          fechaCreacion: '2026-03-05',
        },
        {
          key: '6',
          estado: 'Aprobado',
          cotizacion: 'CTZ-MAR-006',
          week: 'W13-2026',
          suite: 'STE-006',
          asesor: 'Juan Pérez',
          cbms: 38.4,
          tipoCambio: 17.82,
          costo: 1920.00,
          costoPaqueteria: 480.00,
          fechaAprobado: '2026-03-24',
          fechaCreacion: '2026-03-19',
        },
      ];
      
      setData(mockData);
      setLoading(false);
    }, 500);
  };

  const getEstadoColor = (estado: string): string => {
    const estadosMap: Record<string, string> = {
      'Aprobado': 'green',
      'Pendiente': 'orange',
      'En revisión': 'blue',
      'Rechazado': 'red',
    };
    return estadosMap[estado] || 'default';
  };

  const getMenuItems = (record: CotizacionMaritima): MenuProps['items'] => [
    {
      key: 'detalles',
      label: 'Detalles',
      icon: <EyeOutlined />,
      onClick: () => handleDetalles(record),
    },
    {
      key: 'editar',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => handleEditar(record),
    },
    {
      key: 'aprobar',
      label: 'Aprobar',
      icon: <CheckCircleOutlined />,
      onClick: () => handleAprobar(record),
      disabled: record.estado === 'Aprobado',
    },
  ];

  const handleDetalles = (record: CotizacionMaritima) => {
    console.log('Ver detalles:', record);
    // TODO: Implementar navegación o modal con detalles
  };

  const handleEditar = (record: CotizacionMaritima) => {
    console.log('Editar:', record);
    // TODO: Implementar navegación o modal de edición
  };

  const handleAprobar = (record: CotizacionMaritima) => {
    console.log('Aprobar cotización:', record);
    // TODO: Implementar lógica de aprobación
  };

  const columns: ColumnsType<CotizacionMaritima> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      fixed: 'left',
      align: 'center',
      render: (_, record) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: '18px' }} />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 130,
      filters: [
        { text: 'Aprobado', value: 'Aprobado' },
        { text: 'Pendiente', value: 'Pendiente' },
        { text: 'En revisión', value: 'En revisión' },
        { text: 'Rechazado', value: 'Rechazado' },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado: string) => (
        <Tag color={getEstadoColor(estado)}>{estado}</Tag>
      ),
    },
    {
      title: 'Cotizacion',
      dataIndex: 'cotizacion',
      key: 'cotizacion',
      width: 150,
      sorter: (a, b) => a.cotizacion.localeCompare(b.cotizacion),
    },
    {
      title: 'Week',
      dataIndex: 'week',
      key: 'week',
      width: 120,
      sorter: (a, b) => a.week.localeCompare(b.week),
    },
    {
      title: 'Suite',
      dataIndex: 'suite',
      key: 'suite',
      width: 120,
      sorter: (a, b) => a.suite.localeCompare(b.suite),
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 150,
      sorter: (a, b) => a.asesor.localeCompare(b.asesor),
    },
    {
      title: 'CBMs',
      dataIndex: 'cbms',
      key: 'cbms',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.cbms - b.cbms,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Tipo de cambio',
      dataIndex: 'tipoCambio',
      key: 'tipoCambio',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.tipoCambio - b.tipoCambio,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Costo',
      dataIndex: 'costo',
      key: 'costo',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.costo - b.costo,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Costo Paqueteria',
      dataIndex: 'costoPaqueteria',
      key: 'costoPaqueteria',
      width: 150,
      align: 'right',
      sorter: (a, b) => a.costoPaqueteria - b.costoPaqueteria,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Fecha aprobado',
      dataIndex: 'fechaAprobado',
      key: 'fechaAprobado',
      width: 180,
      sorter: (a, b) => a.fechaAprobado.localeCompare(b.fechaAprobado),
      render: (value: string) => value ? humanizarFecha(value) : '-',
    },
    {
      title: 'Fecha de creacion',
      dataIndex: 'fechaCreacion',
      key: 'fechaCreacion',
      width: 180,
      sorter: (a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion),
      render: (value: string) => humanizarFecha(value),
    },
  ];

  return (
    <div className="cotizaciones-maritimas-list">
      <Card 
        title="Cotizaciones Maritimas"
        className="cotizaciones-card"
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} cotizaciones`,
          }}
          scroll={{ x: 1800 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default CotizacionesMaritimasList;
