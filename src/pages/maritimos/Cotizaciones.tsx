import { useState, useEffect } from 'react';
import { Card, Table, Button, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { humanizarFecha } from '@/utils/dateUtils';

interface Cotizacion {
  key: string;
  id: string;
  cotizacion: string;
  suite: string;
  costoUS: number;
  tc: number;
  costoPaqMX: number;
  totalMX: number;
  week: string;
  cbm: number;
  bultos: number;
  fecha: string;
}

export const Cotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const cargarCotizaciones = async () => {
    setLoading(true);
    try {
      // TODO: Reemplazar con llamada real al API
      // const response = await maritimosService.getQuotations();
      // setCotizaciones(response.data);
      
      // Datos de ejemplo
      const datosEjemplo: Cotizacion[] = [
        {
          key: '1',
          id: '1',
          cotizacion: 'MAR-2026-001',
          suite: 'STE-001',
          costoUS: 1500.00,
          tc: 17.50,
          costoPaqMX: 26250.00,
          totalMX: 30450.00,
          week: 'W12',
          cbm: 2.5,
          bultos: 10,
          fecha: '2026-03-20'
        },
        {
          key: '2',
          id: '2',
          cotizacion: 'MAR-2026-002',
          suite: 'STE-002',
          costoUS: 2800.00,
          tc: 17.45,
          costoPaqMX: 48860.00,
          totalMX: 56677.60,
          week: 'W13',
          cbm: 4.8,
          bultos: 15,
          fecha: '2026-03-22'
        },
        {
          key: '3',
          id: '3',
          cotizacion: 'MAR-2026-003',
          suite: 'STE-003',
          costoUS: 950.00,
          tc: 17.55,
          costoPaqMX: 16672.50,
          totalMX: 19340.10,
          week: 'W12',
          cbm: 1.2,
          bultos: 8,
          fecha: '2026-03-25'
        }
      ];
      
      setCotizaciones(datosEjemplo);
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      message.error('Error al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalles = (record: Cotizacion) => {
    // TODO: Implementar vista de detalles
    message.info(`Ver detalles de la cotización ${record.cotizacion}`);
  };

  const columns: ColumnsType<Cotizacion> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      fixed: 'left',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleVerDetalles(record)}
        >
          Ver detalles
        </Button>
      )
    },
    {
      title: 'Cotización',
      dataIndex: 'cotizacion',
      key: 'cotizacion',
      width: 140
    },
    {
      title: 'Suite',
      dataIndex: 'suite',
      key: 'suite',
      width: 100
    },
    {
      title: 'Costo US',
      dataIndex: 'costoUS',
      key: 'costoUS',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.costoUS - b.costoUS,
      render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      title: 'TC',
      dataIndex: 'tc',
      key: 'tc',
      width: 90,
      align: 'right',
      sorter: (a, b) => a.tc - b.tc,
      render: (value: number) => value.toFixed(2)
    },
    {
      title: 'Costo paq MX',
      dataIndex: 'costoPaqMX',
      key: 'costoPaqMX',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.costoPaqMX - b.costoPaqMX,
      render: (value: number) => `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      title: 'Total MX',
      dataIndex: 'totalMX',
      key: 'totalMX',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.totalMX - b.totalMX,
      render: (value: number) => `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      title: 'WEEK',
      dataIndex: 'week',
      key: 'week',
      width: 80,
      filters: [
        { text: 'W12', value: 'W12' },
        { text: 'W13', value: 'W13' },
        { text: 'W14', value: 'W14' },
        { text: 'W15', value: 'W15' }
      ],
      onFilter: (value, record) => record.week === value
    },
    {
      title: 'CBM',
      dataIndex: 'cbm',
      key: 'cbm',
      width: 90,
      align: 'right',
      sorter: (a, b) => a.cbm - b.cbm,
      render: (value: number) => value.toFixed(2)
    },
    {
      title: 'Bultos',
      dataIndex: 'bultos',
      key: 'bultos',
      width: 90,
      align: 'center',
      sorter: (a, b) => a.bultos - b.bultos
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 150,
      sorter: (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
      render: (fecha: string) => humanizarFecha(fecha)
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Cotizaciones" 
        bordered={false}
        extra={
          <Button type="primary" onClick={cargarCotizaciones}>
            Actualizar
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={cotizaciones}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} cotizaciones`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};
