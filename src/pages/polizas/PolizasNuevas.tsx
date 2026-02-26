import { useEffect, useState } from 'react';
import { Card, Table, Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import './Polizas.css';

interface Poliza {
  id: string;
  gex: string;
  suite: string;
  cajas: string;
  volumen: string;
  ruta: string;
  valorFactura: string;
  total: string;
  fecha: string;
  pl: string;
  factura: string;
}

export const PolizasNuevas = () => {
  const [loading, setLoading] = useState(false);
  const [dataPolizas, setDataPolizas] = useState<Poliza[]>([]);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    document.title = 'Nuevas Pólizas por Aprobar';
    loadPolizas();
  }, []);

  const loadPolizas = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada al servicio
      // const response = await polizasService.getPolizasNuevas();
      // setDataPolizas(response.data);
      
      // Datos de ejemplo mientras se implementa el servicio
      setDataPolizas([
        {
          id: '1',
          gex: 'GEX001',
          suite: 'S1234',
          cajas: '5',
          volumen: '2.5',
          ruta: 'USA-MEX',
          valorFactura: '$1,500.00',
          total: '$2,000.00',
          fecha: '26-02-2026',
          pl: 'PL001',
          factura: 'FAC001',
        },
      ]);
    } catch (error) {
      console.error('Error al cargar pólizas:', error);
      setDataPolizas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (record: Poliza) => {
    console.log('Ver detalle de póliza:', record);
    // TODO: Implementar vista de detalle
  };

  const handleAprobar = (record: Poliza) => {
    console.log('Aprobar póliza:', record);
    // TODO: Implementar aprobar póliza
  };

  const handleRechazar = (record: Poliza) => {
    console.log('Rechazar póliza:', record);
    // TODO: Implementar rechazar póliza
  };

  const columnas: ColumnsType<Poliza> = [
    {
      title: 'GEX',
      dataIndex: 'gex',
      key: 'gex',
      width: 120,
      align: 'center',
    },
    {
      title: 'SUITE',
      dataIndex: 'suite',
      key: 'suite',
      width: 100,
      align: 'center',
    },
    {
      title: 'CAJAS',
      dataIndex: 'cajas',
      key: 'cajas',
      width: 80,
      align: 'center',
    },
    {
      title: 'VOLUMEN',
      dataIndex: 'volumen',
      key: 'volumen',
      width: 100,
      align: 'center',
      render: (value) => value ? `${value} m³` : '-',
    },
    {
      title: 'RUTA',
      dataIndex: 'ruta',
      key: 'ruta',
      width: 120,
      align: 'center',
    },
    {
      title: 'VALOR FACTURA',
      dataIndex: 'valorFactura',
      key: 'valorFactura',
      width: 150,
      align: 'center',
    },
    {
      title: 'TOTAL',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      align: 'center',
      render: (value) => (
        <span style={{ fontWeight: 'bold', color: '#ff6600' }}>{value}</span>
      ),
    },
    {
      title: 'FECHA',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 120,
      align: 'center',
    },
    {
      title: 'PL',
      dataIndex: 'pl',
      key: 'pl',
      width: 100,
      align: 'center',
      render: (value) => (
        <Tag color="blue">{value}</Tag>
      ),
    },
    {
      title: 'FACTURA',
      dataIndex: 'factura',
      key: 'factura',
      width: 120,
      align: 'center',
      render: (value) => (
        <Tag color="green">{value}</Tag>
      ),
    },
    {
      title: 'ACCIONES',
      key: 'acciones',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetalle(record)}
            size="small"
            style={{ background: '#1890ff', borderColor: '#1890ff' }}
            title="Ver detalle"
          />
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleAprobar(record)}
            size="small"
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            title="Aprobar"
          />
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleRechazar(record)}
            size="small"
            title="Rechazar"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="polizas-container">
      <Card 
        title={<h2 style={{ margin: 0 }}>Nuevas pólizas por aprobar</h2>}
        className="polizas-card"
      >
        <Table
          columns={columnas}
          dataSource={dataPolizas}
          loading={loading}
          rowKey={(record) => record.id}
          pagination={{
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total) => `Total: ${total} pólizas`,
            onShowSizeChange: (_, size) => setPageSize(size),
          }}
          scroll={{ x: 1600 }}
          className="tabla-polizas"
        />
      </Card>
    </div>
  );
};

export default PolizasNuevas;
