import { useState } from 'react';
import { Card, Table, Button, Tag, Switch, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BellOutlined } from '@ant-design/icons';
import { humanizarFecha } from '@/utils';
import './PLsPendientes.css';

interface PLPendiente {
  key: string;
  bl: string;
  log: string;
  week: string;
  cliente: string;
  cbms: number;
  bultos: number;
  asesor: string;
  diasAtraso: number;
  fecha: string;
  cambioPLSi: boolean;
  accion: string;
}

const PLsPendientes = () => {
  const [loading] = useState(false);

  // Mock data para PLs Pendientes
  const [plsData, setPlsData] = useState<PLPendiente[]>([
    {
      key: '1',
      bl: 'MAEU123456789',
      log: 'LOG-2026-001',
      week: 'W12-2026',
      cliente: 'Importadora ABC S.A.',
      cbms: 45.5,
      bultos: 120,
      asesor: 'Juan Pérez',
      diasAtraso: 3,
      fecha: '2026-03-24T10:00:00',
      cambioPLSi: true,
      accion: 'Pendiente',
    },
    {
      key: '2',
      bl: 'MSCU987654321',
      log: 'LOG-2026-002',
      week: 'W12-2026',
      cliente: 'Distribuidora XYZ Corp',
      cbms: 38.2,
      bultos: 95,
      asesor: 'María García',
      diasAtraso: 1,
      fecha: '2026-03-26T14:30:00',
      cambioPLSi: false,
      accion: 'En proceso',
    },
    {
      key: '3',
      bl: 'CMAU456789123',
      log: 'LOG-2026-003',
      week: 'W13-2026',
      cliente: 'Comercializadora Global Inc',
      cbms: 52.8,
      bultos: 145,
      asesor: 'Carlos Rodríguez',
      diasAtraso: 5,
      fecha: '2026-03-22T09:15:00',
      cambioPLSi: true,
      accion: 'Urgente',
    },
    {
      key: '4',
      bl: 'HLCU789123456',
      log: 'LOG-2026-004',
      week: 'W13-2026',
      cliente: 'Exportaciones del Sur LLC',
      cbms: 41.3,
      bultos: 110,
      asesor: 'Ana Martínez',
      diasAtraso: 0,
      fecha: '2026-03-27T08:00:00',
      cambioPLSi: false,
      accion: 'Pendiente',
    },
    {
      key: '5',
      bl: 'COSU321654987',
      log: 'LOG-2026-005',
      week: 'W13-2026',
      cliente: 'Logística Internacional SA',
      cbms: 48.9,
      bultos: 132,
      asesor: 'Luis Hernández',
      diasAtraso: 2,
      fecha: '2026-03-25T16:45:00',
      cambioPLSi: true,
      accion: 'En proceso',
    },
    {
      key: '6',
      bl: 'TEST456789012',
      log: 'LOG-2026-006',
      week: 'W14-2026',
      cliente: 'Importaciones Express SA',
      cbms: 35.7,
      bultos: 88,
      asesor: 'Patricia López',
      diasAtraso: 7,
      fecha: '2026-03-20T11:20:00',
      cambioPLSi: false,
      accion: 'Urgente',
    },
  ]);

  const handleCambioPLToggle = (key: string, checked: boolean) => {
    const updatedData = plsData.map(item => 
      item.key === key ? { ...item, cambioPLSi: checked } : item
    );
    setPlsData(updatedData);
    message.success(`Cambio PL ${checked ? 'activado' : 'desactivado'}`);
  };

  const handleNotificar = (record: PLPendiente) => {
    message.info(`Notificación enviada para BL: ${record.bl}`);
  };

  const getTagColorByDiasAtraso = (dias: number) => {
    if (dias === 0) return 'green';
    if (dias <= 2) return 'orange';
    if (dias <= 5) return 'red';
    return 'purple';
  };

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case 'Pendiente':
        return 'default';
      case 'En proceso':
        return 'processing';
      case 'Urgente':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<PLPendiente> = [
    {
      title: 'BL',
      dataIndex: 'bl',
      key: 'bl',
      width: 150,
      fixed: 'left',
      sorter: (a, b) => a.bl.localeCompare(b.bl),
    },
    {
      title: 'LOG',
      dataIndex: 'log',
      key: 'log',
      width: 130,
      sorter: (a, b) => a.log.localeCompare(b.log),
    },
    {
      title: 'WEEK',
      dataIndex: 'week',
      key: 'week',
      width: 110,
      sorter: (a, b) => a.week.localeCompare(b.week),
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      width: 200,
      sorter: (a, b) => a.cliente.localeCompare(b.cliente),
    },
    {
      title: 'CBMs',
      dataIndex: 'cbms',
      key: 'cbms',
      width: 100,
      sorter: (a, b) => a.cbms - b.cbms,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Bultos',
      dataIndex: 'bultos',
      key: 'bultos',
      width: 100,
      sorter: (a, b) => a.bultos - b.bultos,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 150,
      sorter: (a, b) => a.asesor.localeCompare(b.asesor),
    },
    {
      title: 'Dias atraso',
      dataIndex: 'diasAtraso',
      key: 'diasAtraso',
      width: 120,
      sorter: (a, b) => a.diasAtraso - b.diasAtraso,
      render: (value: number) => (
        <Tag color={getTagColorByDiasAtraso(value)}>
          {value === 0 ? 'Al día' : `${value} día${value > 1 ? 's' : ''}`}
        </Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 180,
      sorter: (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
      render: (value: string) => humanizarFecha(value, true),
    },
    {
      title: 'Cambio PL Si',
      key: 'cambioPLSi',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.cambioPLSi}
          onChange={(checked) => handleCambioPLToggle(record.key, checked)}
        />
      ),
    },
    {
      title: 'Accion',
      dataIndex: 'accion',
      key: 'accion',
      width: 120,
      filters: [
        { text: 'Pendiente', value: 'Pendiente' },
        { text: 'En proceso', value: 'En proceso' },
        { text: 'Urgente', value: 'Urgente' },
      ],
      onFilter: (value, record) => record.accion === value,
      render: (value: string) => (
        <Tag color={getAccionColor(value)}>{value}</Tag>
      ),
    },
    {
      title: 'Notificar',
      key: 'notificar',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<BellOutlined />}
          onClick={() => handleNotificar(record)}
          size="small"
        >
          Notificar
        </Button>
      ),
    },
  ];

  return (
    <div className="pls-pendientes-wrapper">
      <Card 
        title="Pl's Pendientes"
        className="pls-pendientes-card"
      >
        <Table
          columns={columns}
          dataSource={plsData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} registros`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>
    </div>
  );
};

export default PLsPendientes;
