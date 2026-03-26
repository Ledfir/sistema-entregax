import { useState, useEffect } from 'react';
import { Card, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { humanizarFecha } from '@/utils/dateUtils';

interface PanelPL {
  key: string;
  id: string;
  log: string;
  pl: string;
  instrucciones: string;
  week: string;
  eta: string;
  cambiosEta: number;
  detalles: string;
  fechaCierreWeek: string;
  tipo: string;
  cliente: string;
  logo: string;
  sensible: boolean;
  cbm: number;
  cajas: number;
  estado: 'pendiente' | 'proceso' | 'completado' | 'cerrado' | 'cancelado';
}

export const PanelPLInstrucciones = () => {
  const [panelData, setPanelData] = useState<PanelPL[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // TODO: Reemplazar con llamada real al API
      // const response = await maritimosService.getPanelPLInstructions();
      // setPanelData(response.data);
      
      // Datos de ejemplo
      const datosEjemplo: PanelPL[] = [
        {
          key: '1',
          id: '1',
          log: 'LOG-001',
          pl: 'PL-2026-001',
          instrucciones: 'Carga completa, verificar documentación',
          week: 'W12',
          eta: '2026-04-15',
          cambiosEta: 0,
          detalles: 'Sin observaciones',
          fechaCierreWeek: '2026-04-10',
          tipo: 'FCL',
          cliente: 'ACME Corporation',
          logo: 'ACME-LOG',
          sensible: true,
          cbm: 28.5,
          cajas: 120,
          estado: 'proceso'
        },
        {
          key: '2',
          id: '2',
          log: 'LOG-002',
          pl: 'PL-2026-002',
          instrucciones: 'Carga consolidada',
          week: 'W13',
          eta: '2026-04-22',
          cambiosEta: 2,
          detalles: 'Retraso por clima',
          fechaCierreWeek: '2026-04-17',
          tipo: 'LCL',
          cliente: 'Distribuidora XYZ',
          logo: 'XYZ-LOG',
          sensible: false,
          cbm: 12.3,
          cajas: 45,
          estado: 'completado'
        },
        {
          key: '3',
          id: '3',
          log: 'LOG-003',
          pl: 'PL-2026-003',
          instrucciones: 'Carga refrigerada, manejar con cuidado',
          week: 'W14',
          eta: '2026-04-28',
          cambiosEta: 1,
          detalles: 'Carga especial',
          fechaCierreWeek: '2026-04-24',
          tipo: 'REEFER',
          cliente: 'Fresh Imports SA',
          logo: 'FRESH-LOG',
          sensible: true,
          cbm: 35.8,
          cajas: 200,
          estado: 'pendiente'
        }
      ];
      
      setPanelData(datosEjemplo);
    } catch (error) {
      console.error('Error al cargar datos del panel:', error);
      message.error('Error al cargar los datos del panel');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: PanelPL['estado']): string => {
    const colores: Record<PanelPL['estado'], string> = {
      pendiente: 'default',
      proceso: 'processing',
      completado: 'success',
      cerrado: 'warning',
      cancelado: 'error'
    };
    return colores[estado];
  };

  const getEstadoTexto = (estado: PanelPL['estado']): string => {
    const textos: Record<PanelPL['estado'], string> = {
      pendiente: 'Pendiente',
      proceso: 'En Proceso',
      completado: 'Completado',
      cerrado: 'Cerrado',
      cancelado: 'Cancelado'
    };
    return textos[estado];
  };

  const columns: ColumnsType<PanelPL> = [
    {
      title: 'LOG',
      dataIndex: 'log',
      key: 'log',
      width: 110,
      fixed: 'left'
    },
    {
      title: 'PL',
      dataIndex: 'pl',
      key: 'pl',
      width: 130,
      fixed: 'left'
    },
    {
      title: 'Instrucciones',
      dataIndex: 'instrucciones',
      key: 'instrucciones',
      width: 250,
      ellipsis: true
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
      title: 'ETA',
      dataIndex: 'eta',
      key: 'eta',
      width: 150,
      sorter: (a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime(),
      render: (fecha: string) => humanizarFecha(fecha)
    },
    {
      title: 'Cambios ETA',
      dataIndex: 'cambiosEta',
      key: 'cambiosEta',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.cambiosEta - b.cambiosEta,
      render: (cambios: number) => (
        cambios > 0 ? (
          <Tag color="warning">{cambios}</Tag>
        ) : (
          <Tag color="success">{cambios}</Tag>
        )
      )
    },
    {
      title: 'Detalles',
      dataIndex: 'detalles',
      key: 'detalles',
      width: 200,
      ellipsis: true
    },
    {
      title: 'Fecha cierre WEEK',
      dataIndex: 'fechaCierreWeek',
      key: 'fechaCierreWeek',
      width: 180,
      sorter: (a, b) => new Date(a.fechaCierreWeek).getTime() - new Date(b.fechaCierreWeek).getTime(),
      render: (fecha: string) => humanizarFecha(fecha)
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 100,
      filters: [
        { text: 'FCL', value: 'FCL' },
        { text: 'LCL', value: 'LCL' },
        { text: 'REEFER', value: 'REEFER' }
      ],
      onFilter: (value, record) => record.tipo === value
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      width: 200,
      ellipsis: true
    },
    {
      title: 'LOGO',
      dataIndex: 'logo',
      key: 'logo',
      width: 120
    },
    {
      title: 'Sensible',
      dataIndex: 'sensible',
      key: 'sensible',
      width: 100,
      align: 'center',
      filters: [
        { text: 'Sí', value: true },
        { text: 'No', value: false }
      ],
      onFilter: (value, record) => record.sensible === value,
      render: (sensible: boolean) => (
        sensible ? (
          <Tag color="red">SÍ</Tag>
        ) : (
          <Tag color="default">NO</Tag>
        )
      )
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
      title: 'Cajas',
      dataIndex: 'cajas',
      key: 'cajas',
      width: 90,
      align: 'center',
      sorter: (a, b) => a.cajas - b.cajas
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      fixed: 'right',
      filters: [
        { text: 'Pendiente', value: 'pendiente' },
        { text: 'En Proceso', value: 'proceso' },
        { text: 'Completado', value: 'completado' },
        { text: 'Cerrado', value: 'cerrado' },
        { text: 'Cancelado', value: 'cancelado' }
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado: PanelPL['estado']) => (
        <Tag color={getEstadoColor(estado)}>
          {getEstadoTexto(estado)}
        </Tag>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Panel de PL - Instrucciones" 
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={panelData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} registros`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 2000 }}
        />
      </Card>
    </div>
  );
};
