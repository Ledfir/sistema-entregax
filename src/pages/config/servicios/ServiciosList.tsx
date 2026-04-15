import React, { useState, useEffect } from 'react';
import { Card, Table, Dropdown, Button, Input, message, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, DownOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import { serviciosService } from '@/services/serviciosService';
import { humanizarFecha } from '@/utils/dateUtils';
import { ServicioModal } from './ServicioModal';

interface Servicio {
  id: string | number;
  token?: string;
  name: string;
  ctz_ini?: string;
  idcta: string;
  idtp?: string;
  salida: string;
  desc?: string | null;
  resp?: string;
  state?: string;
  created?: string;
  com: string;
}

const ServiciosList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Servicio[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<Servicio[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    cargarServicios();
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

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const response = await serviciosService.list();
      setData(response);
      setPagination({ ...pagination, total: response.length });
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      message.error('Error al cargar los servicios');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (servicio: Servicio) => {
    setServicioSeleccionado(servicio);
    setModalOpen(true);
  };

  const handleEliminar = (servicio: Servicio) => {
    Modal.confirm({
      title: '¿Confirmar eliminación?',
      content: `¿Está seguro que desea eliminar el servicio "${servicio.name}"?`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const response = await serviciosService.delete(servicio.id);
          if (response.status === 'success') {
            message.success(response.message || 'Servicio eliminado correctamente');
            cargarServicios();
          } else {
            message.error(response.message || 'Error al eliminar el servicio');
          }
        } catch (error) {
          console.error('Error al eliminar servicio:', error);
          message.error('Error al eliminar el servicio');
        }
      },
    });
  };

  const handleAñadirServicio = () => {
    setServicioSeleccionado(null);
    setModalOpen(true);
  };

  const getMenuItems = (servicio: Servicio): MenuProps['items'] => [
    {
      key: 'editar',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => handleEditar(servicio),
    },
    {
      key: 'eliminar',
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleEliminar(servicio),
    },
  ];

  const columns: ColumnsType<Servicio> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: Servicio) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="primary" style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}>
            Acciones <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'Cuenta',
      dataIndex: 'cuenta',
      key: 'cuenta',
      width: 200,
    },
    {
      title: 'Genera salida',
      dataIndex: 'salida',
      key: 'salida',
      width: 150,
      align: 'center',
      render: (salida: string) => (salida === '1' ? 'Sí' : 'No'),
    },
    {
      title: 'Comisión',
      dataIndex: 'com',
      key: 'com',
      width: 120,
      align: 'center',
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'created',
      key: 'created',
      width: 200,
      align: 'center',
      render: (created: string) => created ? humanizarFecha(created) : '-',
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
      <Card title="Listado de servicios">
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, justifyContent: 'space-between' }}>
          <Input
            placeholder="Buscar servicio..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            size="large"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleAñadirServicio}
            style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}
          >
            Añadir servicio
          </Button>
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

      <ServicioModal
        open={modalOpen}
        servicio={servicioSeleccionado}
        onCancel={() => {
          setModalOpen(false);
          setServicioSeleccionado(null);
        }}
        onSuccess={() => {
          cargarServicios();
        }}
      />
    </div>
  );
};

export default ServiciosList;
