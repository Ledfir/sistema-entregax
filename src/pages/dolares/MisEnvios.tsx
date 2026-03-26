import { useState, useEffect } from 'react';
import { Card, Table, Dropdown, Button, Tag, message } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined, EyeOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Swal from 'sweetalert2';
import { humanizarFecha } from '@/utils/dateUtils';

interface Envio {
  key: string;
  id: string;
  fecha: string;
  cotizacion: string;
  cliente: string;
  total: number;
  estado: 'pendiente' | 'procesando' | 'completado' | 'archivado' | 'cancelado';
}

export const MisEnvios = () => {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarEnvios();
  }, []);

  const cargarEnvios = async () => {
    setLoading(true);
    try {
      // TODO: Reemplazar con llamada real al API
      // const response = await operacionesService.getMyDollarShipments();
      // setEnvios(response.data);
      
      // Datos de ejemplo
      const datosEjemplo: Envio[] = [
        {
          key: '1',
          id: '1',
          fecha: '2026-03-20',
          cotizacion: 'COT-2026-001',
          cliente: 'ACME Corporation',
          total: 15000.00,
          estado: 'completado'
        },
        {
          key: '2',
          id: '2',
          fecha: '2026-03-22',
          cotizacion: 'COT-2026-002',
          cliente: 'Tech Solutions SA',
          total: 25000.00,
          estado: 'procesando'
        },
        {
          key: '3',
          id: '3',
          fecha: '2026-03-25',
          cotizacion: 'COT-2026-003',
          cliente: 'Global Imports',
          total: 8500.00,
          estado: 'pendiente'
        }
      ];
      
      setEnvios(datosEjemplo);
    } catch (error) {
      console.error('Error al cargar envíos:', error);
      message.error('Error al cargar los envíos');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalles = (record: Envio) => {
    // TODO: Implementar vista de detalles
    message.info(`Ver detalles del envío ${record.cotizacion}`);
  };

  const handleBorrar = async (record: Envio) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas borrar el envío ${record.cotizacion}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        // TODO: Implementar llamada al API
        // await operacionesService.deleteDollarShipment(record.id);
        
        setEnvios(envios.filter(e => e.key !== record.key));
        
        Swal.fire({
          title: 'Eliminado',
          text: 'El envío ha sido eliminado correctamente',
          icon: 'success'
        });
      } catch (error) {
        console.error('Error al borrar envío:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el envío',
          icon: 'error'
        });
      }
    }
  };

  const handleArchivar = async (record: Envio) => {
    const result = await Swal.fire({
      title: '¿Archivar envío?',
      text: `¿Deseas archivar el envío ${record.cotizacion}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, archivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        // TODO: Implementar llamada al API
        // await operacionesService.archiveDollarShipment(record.id);
        
        setEnvios(envios.map(e => 
          e.key === record.key ? { ...e, estado: 'archivado' } : e
        ));
        
        Swal.fire({
          title: 'Archivado',
          text: 'El envío ha sido archivado correctamente',
          icon: 'success'
        });
      } catch (error) {
        console.error('Error al archivar envío:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo archivar el envío',
          icon: 'error'
        });
      }
    }
  };

  const getMenuItems = (record: Envio): MenuProps['items'] => [
    {
      key: 'detalles',
      label: 'Detalles',
      icon: <EyeOutlined />,
      onClick: () => handleVerDetalles(record)
    },
    {
      key: 'borrar',
      label: 'Borrar',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleBorrar(record)
    },
    {
      key: 'archivar',
      label: 'Archivar',
      icon: <InboxOutlined />,
      onClick: () => handleArchivar(record),
      disabled: record.estado === 'archivado'
    }
  ];

  const getEstadoColor = (estado: Envio['estado']): string => {
    const colores: Record<Envio['estado'], string> = {
      pendiente: 'default',
      procesando: 'processing',
      completado: 'success',
      archivado: 'warning',
      cancelado: 'error'
    };
    return colores[estado];
  };

  const getEstadoTexto = (estado: Envio['estado']): string => {
    const textos: Record<Envio['estado'], string> = {
      pendiente: 'Pendiente',
      procesando: 'Procesando',
      completado: 'Completado',
      archivado: 'Archivado',
      cancelado: 'Cancelado'
    };
    return textos[estado];
  };

  const columns: ColumnsType<Envio> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      fixed: 'left',
      render: (_, record) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 150,
      sorter: (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
      render: (fecha: string) => humanizarFecha(fecha)
    },
    {
      title: 'Cotización',
      dataIndex: 'cotizacion',
      key: 'cotizacion',
      width: 150
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      ellipsis: true
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      align: 'right',
      sorter: (a, b) => a.total - b.total,
      render: (total: number) => `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 130,
      filters: [
        { text: 'Pendiente', value: 'pendiente' },
        { text: 'Procesando', value: 'procesando' },
        { text: 'Completado', value: 'completado' },
        { text: 'Archivado', value: 'archivado' },
        { text: 'Cancelado', value: 'cancelado' }
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado: Envio['estado']) => (
        <Tag color={getEstadoColor(estado)}>
          {getEstadoTexto(estado)}
        </Tag>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Mis envíos" 
        bordered={false}
        extra={
          <Button type="primary" onClick={cargarEnvios}>
            Actualizar
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={envios}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} envíos`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};
