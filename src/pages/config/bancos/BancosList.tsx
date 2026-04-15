import React, { useState, useEffect } from 'react';
import { Card, Table, Dropdown, Button, Input, message, Modal, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, DownOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import { bancosService } from '@/services/bancosService';
import { BancoModal } from './BancoModal';
import { humanizarFecha } from '@/utils/dateUtils';

interface Banco {
  id: string | number;
  token?: string;
  name: string;
  desc?: string;
  icono?: string;
  logo?: string;
  created?: string;
  state?: string;
}

const BancosList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Banco[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<Banco[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [bancoSeleccionado, setBancoSeleccionado] = useState<Banco | null>(null);

  useEffect(() => {
    cargarBancos();
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

  const cargarBancos = async () => {
    try {
      setLoading(true);
      const response = await bancosService.list();
      setData(response);
      setPagination({ ...pagination, total: response.length });
    } catch (error) {
      console.error('Error al cargar bancos:', error);
      message.error('Error al cargar los bancos');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = async (banco: Banco) => {
    try {
      // Obtener datos completos del banco desde el API
      const response = await bancosService.get(banco.id);
      
      if (response.status === 'success' && response.data) {
        setBancoSeleccionado(response.data);
        setModalOpen(true);
      } else {
        // Si no hay endpoint específico, usar datos actuales
        setBancoSeleccionado(banco);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error al cargar datos del banco:', error);
      // En caso de error, usar datos actuales
      setBancoSeleccionado(banco);
      setModalOpen(true);
    }
  };

  const handleEliminar = (banco: Banco) => {
    Modal.confirm({
      title: '¿Confirmar eliminación?',
      content: `¿Está seguro que desea eliminar el banco "${banco.name}"?`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const response = await bancosService.delete(banco.id);
          
          if (response.status === 'success') {
            message.success(response.message || 'Banco eliminado correctamente');
            cargarBancos();
          } else {
            message.error(response.message || 'Error al eliminar el banco');
          }
        } catch (error) {
          console.error('Error al eliminar banco:', error);
          message.error('Error al eliminar el banco');
        }
      },
    });
  };

  const handleAñadirBanco = () => {
    setBancoSeleccionado(null);
    setModalOpen(true);
  };

  const getMenuItems = (banco: Banco): MenuProps['items'] => [
    {
      key: 'editar',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => handleEditar(banco),
    },
    {
      key: 'eliminar',
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleEliminar(banco),
    },
  ];

  const columns: ColumnsType<Banco> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: Banco) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="primary" style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}>
            Acciones <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'Banco',
      dataIndex: 'name',
      key: 'name',
      width: 300,
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 150,
      align: 'center',
      render: (logo: string) => (
        logo ? (
          <img src={logo} alt="Logo" style={{ maxWidth: 50, maxHeight: 30 }} />
        ) : (
          <span style={{ color: '#999' }}>Sin logo</span>
        )
      ),
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'created',
      key: 'created',
      width: 200,
      align: 'center',
      render: (created: string) => created ? humanizarFecha(created) : '-',
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      align: 'center',
      render: (state: string) => (
        <Tag color={state === '1' ? 'success' : 'error'}>
          {state === '1' ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
  ];

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Listado de bancos">
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, justifyContent: 'space-between' }}>
          <Input
            placeholder="Buscar banco..."
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
            onClick={handleAñadirBanco}
            style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}
          >
            Añadir banco
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

      <BancoModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={cargarBancos}
        banco={bancoSeleccionado}
      />
    </div>
  );
};

export default BancosList;
