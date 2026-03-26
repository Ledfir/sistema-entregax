import { useState } from 'react';
import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { humanizarFecha } from '@/utils/dateUtils';

interface Poliza {
  key: string;
  id: string;
  cliente: string;
  valorFactura: number;
  fechaCreacion: string;
  cajas: number;
  cbm: string;
  estado: 'activa' | 'vencida' | 'pendiente' | 'cancelada';
}

export const MisPolizas = () => {
  // Datos de ejemplo
  const [data] = useState<Poliza[]>([
    {
      key: '1',
      id: 'POL-2026-001',
      cliente: 'S2528 - ACME Corporation',
      valorFactura: 15000.50,
      fechaCreacion: '2026-03-20T10:30:00',
      cajas: 120,
      cbm: '15.5',
      estado: 'activa'
    },
    {
      key: '2',
      id: 'POL-2026-002',
      cliente: 'C1520 - Tech Solutions SA',
      valorFactura: 8500.00,
      fechaCreacion: '2026-03-18T14:20:00',
      cajas: 85,
      cbm: '10.2',
      estado: 'activa'
    },
    {
      key: '3',
      id: 'POL-2026-003',
      cliente: 'D2340 - Global Imports',
      valorFactura: 22000.75,
      fechaCreacion: '2026-03-15T09:15:00',
      cajas: 200,
      cbm: '25.8',
      estado: 'pendiente'
    },
    {
      key: '4',
      id: 'POL-2025-098',
      cliente: 'A1234 - Comercial XYZ',
      valorFactura: 5000.00,
      fechaCreacion: '2025-12-10T16:45:00',
      cajas: 45,
      cbm: '6.3',
      estado: 'vencida'
    },
    {
      key: '5',
      id: 'POL-2026-004',
      cliente: 'S2528 - ACME Corporation',
      valorFactura: 12500.00,
      fechaCreacion: '2026-03-22T11:00:00',
      cajas: 110,
      cbm: '13.7',
      estado: 'activa'
    },
    {
      key: '6',
      id: 'POL-2026-005',
      cliente: 'B5678 - Logistics Co.',
      valorFactura: 3200.00,
      fechaCreacion: '2026-02-28T13:30:00',
      cajas: 30,
      cbm: '4.5',
      estado: 'cancelada'
    }
  ]);

  const estadoColors: Record<string, string> = {
    activa: 'success',
    vencida: 'error',
    pendiente: 'warning',
    cancelada: 'default'
  };

  const estadoLabels: Record<string, string> = {
    activa: 'Activa',
    vencida: 'Vencida',
    pendiente: 'Pendiente',
    cancelada: 'Cancelada'
  };

  const columns: ColumnsType<Poliza> = [
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      sorter: (a, b) => a.cliente.localeCompare(b.cliente),
      width: 250
    },
    {
      title: 'Valor de factura',
      dataIndex: 'valorFactura',
      key: 'valorFactura',
      render: (valor: number) => `$${valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
      sorter: (a, b) => a.valorFactura - b.valorFactura,
      width: 150
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'fechaCreacion',
      key: 'fechaCreacion',
      render: (fecha: string) => humanizarFecha(fecha, true),
      sorter: (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime(),
      width: 180
    },
    {
      title: 'Cajas',
      dataIndex: 'cajas',
      key: 'cajas',
      sorter: (a, b) => a.cajas - b.cajas,
      width: 100,
      align: 'center'
    },
    {
      title: 'CBM',
      dataIndex: 'cbm',
      key: 'cbm',
      sorter: (a, b) => parseFloat(a.cbm) - parseFloat(b.cbm),
      width: 100,
      align: 'center'
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => (
        <Tag color={estadoColors[estado]}>
          {estadoLabels[estado].toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Activa', value: 'activa' },
        { text: 'Vencida', value: 'vencida' },
        { text: 'Pendiente', value: 'pendiente' },
        { text: 'Cancelada', value: 'cancelada' }
      ],
      onFilter: (value, record) => record.estado === value,
      width: 120
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Mis pólizas" bordered={false}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} pólizas`
          }}
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
};
