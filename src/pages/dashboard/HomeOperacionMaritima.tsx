import { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { MoreOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { humanizarFecha } from '@/utils';
import './HomeOperacionMaritima.css';

interface BLDisponible {
  key: string;
  bl: string;
  week: string;
  plsPendientes: number;
  eta: string;
  tipo: string;
  fecha: string;
  estado: string;
}

export const HomeOperacionMaritima = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BLDisponible[]>([]);

  useEffect(() => {
    document.title = 'Sistema Entregax | Operación Marítima';
    loadBLsDisponibles();
  }, []);

  const loadBLsDisponibles = () => {
    setLoading(true);
    
    // Mock data - Reemplazar con llamada real a la API
    setTimeout(() => {
      const mockData: BLDisponible[] = [
        {
          key: '1',
          bl: 'MAEU123456789',
          week: 'W12-2026',
          plsPendientes: 5,
          eta: '2026-03-30',
          tipo: 'FCL',
          fecha: '2026-03-15',
          estado: 'En tránsito',
        },
        {
          key: '2',
          bl: 'CMDU987654321',
          week: 'W11-2026',
          plsPendientes: 0,
          eta: '2026-03-28',
          tipo: 'LCL',
          fecha: '2026-03-10',
          estado: 'En puerto',
        },
        {
          key: '3',
          bl: 'MSKU555444333',
          week: 'W13-2026',
          plsPendientes: 12,
          eta: '2026-04-05',
          tipo: 'FCL',
          fecha: '2026-03-20',
          estado: 'En tránsito',
        },
        {
          key: '4',
          bl: 'HLCU111222333',
          week: 'W12-2026',
          plsPendientes: 3,
          eta: '2026-03-29',
          tipo: 'LCL',
          fecha: '2026-03-14',
          estado: 'Pendiente documentos',
        },
        {
          key: '5',
          bl: 'OOLU789456123',
          week: 'W10-2026',
          plsPendientes: 0,
          eta: '2026-03-26',
          tipo: 'FCL',
          fecha: '2026-03-05',
          estado: 'Listo para despacho',
        },
      ];
      
      setData(mockData);
      setLoading(false);
    }, 500);
  };

  const getEstadoColor = (estado: string): string => {
    const estadosMap: Record<string, string> = {
      'En tránsito': 'blue',
      'En puerto': 'cyan',
      'Pendiente documentos': 'orange',
      'Listo para despacho': 'green',
      'Despachado': 'default',
    };
    return estadosMap[estado] || 'default';
  };

  const getTipoColor = (tipo: string): string => {
    return tipo === 'FCL' ? 'purple' : 'geekblue';
  };

  const getMenuItems = (record: BLDisponible): MenuProps['items'] => [
    {
      key: 'detalles',
      label: 'Detalles',
      icon: <EyeOutlined />,
      onClick: () => handleDetalles(record),
    },
    {
      key: 'ocultar',
      label: 'Ocultar',
      icon: <EyeInvisibleOutlined />,
      onClick: () => handleOcultar(record),
    },
  ];

  const columns: ColumnsType<BLDisponible> = [
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
      title: 'BL',
      dataIndex: 'bl',
      key: 'bl',
      width: 150,
      sorter: (a, b) => a.bl.localeCompare(b.bl),
    },
    {
      title: 'WEEK',
      dataIndex: 'week',
      key: 'week',
      width: 120,
      sorter: (a, b) => a.week.localeCompare(b.week),
    },
    {
      title: 'PLs Pendientes',
      dataIndex: 'plsPendientes',
      key: 'plsPendientes',
      width: 140,
      align: 'center',
      sorter: (a, b) => a.plsPendientes - b.plsPendientes,
      render: (value: number) => (
        <Tag color={value > 0 ? 'red' : 'green'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'ETA',
      dataIndex: 'eta',
      key: 'eta',
      width: 180,
      sorter: (a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime(),
      render: (value: string) => humanizarFecha(value),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 100,
      align: 'center',
      filters: [
        { text: 'FCL', value: 'FCL' },
        { text: 'LCL', value: 'LCL' },
      ],
      onFilter: (value, record) => record.tipo === value,
      render: (tipo: string) => (
        <Tag color={getTipoColor(tipo)}>{tipo}</Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 180,
      sorter: (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
      render: (value: string) => humanizarFecha(value),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 180,
      filters: [
        { text: 'En tránsito', value: 'En tránsito' },
        { text: 'En puerto', value: 'En puerto' },
        { text: 'Pendiente documentos', value: 'Pendiente documentos' },
        { text: 'Listo para despacho', value: 'Listo para despacho' },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado: string) => (
        <Tag color={getEstadoColor(estado)}>{estado}</Tag>
      ),
    },
  ];

  const handleDetalles = (record: BLDisponible) => {
    console.log('Ver detalles:', record);
    // TODO: Implementar navegación o modal con detalles
  };

  const handleOcultar = (record: BLDisponible) => {
    console.log('Ocultar BL:', record);
    // TODO: Implementar lógica para ocultar el BL
  };

  return (
    <div className="home-operacion-maritima">
      <Card 
        title="BL's disponibles"
        className="bls-card"
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} BLs`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default HomeOperacionMaritima;
