import React, { useState, useEffect } from 'react';
import { Card, Table, Dropdown, Button, Input, message, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, DownOutlined, EyeOutlined, DownloadOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import { humanizarFecha } from '@/utils/dateUtils';
import { cotizacionesService } from '@/services/cotizacionesService';

interface CotizacionMaritima {
  id: string | number;
  ctz: string;
  week: string;
  suite: string;
  asesor: string;
  cbm: string | number;
  tipo_cambio: string | number;
  costo: string | number;
  costo_paqueteria: string | number;
  estado: string;
  fecha_aprobacion?: string;
  fecha_subida: string;
}

const CotizacionesMaritimas: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CotizacionMaritima[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<CotizacionMaritima[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
      setPagination({ ...pagination, current: 1 });
    } else {
      setFilteredData(data);
    }
  }, [searchText, data]);

  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      const response = await cotizacionesService.listMaritimas();
      
      // Mapear datos de la API al formato del componente
      const dataMapeada: CotizacionMaritima[] = response.map((item: any) => ({
        id: item.id,
        ctz: item.ctz || '-',
        week: item.week || '-',
        suite: item.suite || '-',
        asesor: item.resp || '-', // TODO: Mapear ID de asesor a nombre si es necesario
        cbm: item.cbm || 0,
        tipo_cambio: item.tc || 0,
        costo: item.costo || 0,
        costo_paqueteria: item.costopaq || 0,
        estado: mapearEstado(item.state),
        fecha_aprobacion: item.aprobed || '',
        fecha_subida: item.created || '',
      }));
      
      setData(dataMapeada);
      setPagination({ ...pagination, total: dataMapeada.length });
    } catch (error) {
      console.error('Error al cargar cotizaciones marítimas:', error);
      message.error('Error al cargar las cotizaciones');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Mapear el estado numérico a texto
  const mapearEstado = (state: string | number): string => {
    const stateNum = typeof state === 'string' ? parseInt(state) : state;
    switch (stateNum) {
      case 1:
        return 'Aprobado';
      case 0:
        return 'Pendiente';
      case 2:
        return 'En revisión';
      case 3:
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  const handleDetalles = (cotizacion: CotizacionMaritima) => {
    message.info(`Ver detalles de cotización: ${cotizacion.ctz}`);
    // TODO: Implementar vista de detalles
  };

  const handleDescargarPDF = (cotizacion: CotizacionMaritima) => {
    message.info(`Descargar PDF de cotización: ${cotizacion.ctz}`);
    // TODO: Implementar descarga de PDF
  };

  const handlePagos = (cotizacion: CotizacionMaritima) => {
    message.info(`Ver pagos de cotización: ${cotizacion.ctz}`);
    // TODO: Implementar gestión de pagos
  };

  const getMenuItems = (cotizacion: CotizacionMaritima): MenuProps['items'] => [
    {
      key: 'detalles',
      label: 'Detalles',
      icon: <EyeOutlined />,
      onClick: () => handleDetalles(cotizacion),
    },
    {
      key: 'descargar-pdf',
      label: 'Descargar PDF',
      icon: <DownloadOutlined />,
      onClick: () => handleDescargarPDF(cotizacion),
    },
    {
      key: 'pagos',
      label: 'Pagos',
      icon: <DollarOutlined />,
      onClick: () => handlePagos(cotizacion),
    },
  ];

  const getEstadoColor = (estado: string): string => {
    switch (estado.toLowerCase()) {
      case 'aprobado':
        return 'green';
      case 'pendiente':
        return 'orange';
      case 'en revisión':
        return 'blue';
      case 'rechazado':
        return 'red';
      default:
        return 'default';
    }
  };

  const formatMoney = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const columns: ColumnsType<CotizacionMaritima> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: CotizacionMaritima) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="primary" style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}>
            Acciones <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'CTZ',
      dataIndex: 'ctz',
      key: 'ctz',
      width: 150,
    },
    {
      title: 'WEEK',
      dataIndex: 'week',
      key: 'week',
      width: 120,
      align: 'center',
    },
    {
      title: 'Suite',
      dataIndex: 'suite',
      key: 'suite',
      width: 120,
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 180,
    },
    {
      title: 'CBM',
      dataIndex: 'cbm',
      key: 'cbm',
      width: 100,
      align: 'right',
      render: (cbm: string | number) => Number(cbm).toFixed(2),
    },
    {
      title: 'Tipo de cambio',
      dataIndex: 'tipo_cambio',
      key: 'tipo_cambio',
      width: 140,
      align: 'right',
      render: (tipoCambio: string | number) => `$${Number(tipoCambio).toFixed(2)}`,
    },
    {
      title: 'Costo',
      dataIndex: 'costo',
      key: 'costo',
      width: 130,
      align: 'right',
      render: (costo: string | number) => formatMoney(costo),
    },
    {
      title: 'Costo paqueteria',
      dataIndex: 'costo_paqueteria',
      key: 'costo_paqueteria',
      width: 150,
      align: 'right',
      render: (costoPaqueteria: string | number) => formatMoney(costoPaqueteria),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 130,
      align: 'center',
      render: (estado: string) => (
        <Tag color={getEstadoColor(estado)}>{estado}</Tag>
      ),
    },
    {
      title: 'Fecha de aprobacion',
      dataIndex: 'fecha_aprobacion',
      key: 'fecha_aprobacion',
      width: 180,
      align: 'center',
      render: (fecha: string) => fecha ? humanizarFecha(fecha) : '-',
    },
    {
      title: 'Fecha de subida',
      dataIndex: 'fecha_subida',
      key: 'fecha_subida',
      width: 180,
      align: 'center',
      render: (fecha: string) => fecha ? humanizarFecha(fecha) : '-',
    },
  ];

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Cotizaciones Maritimas">
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar cotización..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            size="large"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Card>
    </div>
  );
};

export default CotizacionesMaritimas;
