import React, { useState, useEffect } from 'react';
import { Card, Table, Dropdown, Button, Input, message, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, DownOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import { cuentasService } from '@/services/cuentasService';
import CuentaModal from './CuentaModal';

interface Cuenta {
  id: string | number;
  token?: string;
  name: string;
  banco: string;
  cuenta: string;
  clabe: string;
  tarjeta?: string;
  rfc?: string;
  corto: string;
  desc?: string | null;
  state?: string;
  created?: string;
}

const CuentasList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Cuenta[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<Cuenta[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<Cuenta | null>(null);

  useEffect(() => {
    cargarCuentas();
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

  const cargarCuentas = async () => {
    try {
      setLoading(true);
      const response = await cuentasService.list();
      setData(response);
      setPagination({ ...pagination, total: response.length });
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      message.error('Error al cargar las cuentas');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (cuenta: Cuenta) => {
    setCuentaSeleccionada(cuenta);
    setModalOpen(true);
  };

  const handleEliminar = (cuenta: Cuenta) => {
    Modal.confirm({
      title: '¿Confirmar eliminación?',
      content: `¿Está seguro que desea eliminar la cuenta "${cuenta.corto}"?`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await cuentasService.delete(cuenta.id);
          message.success('Cuenta eliminada correctamente');
          cargarCuentas();
        } catch (error) {
          console.error('Error al eliminar cuenta:', error);
          message.error('Error al eliminar la cuenta');
        }
      },
    });
  };

  const handleAñadirCuenta = () => {
    setCuentaSeleccionada(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setCuentaSeleccionada(null);
  };

  const handleModalSuccess = () => {
    cargarCuentas();
  };

  const getMenuItems = (cuenta: Cuenta): MenuProps['items'] => [
    {
      key: 'editar',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => handleEditar(cuenta),
    },
    {
      key: 'eliminar',
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleEliminar(cuenta),
    },
  ];

  const columns: ColumnsType<Cuenta> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: Cuenta) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="primary" style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}>
            Acciones <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'Beneficiario',
      dataIndex: 'name',
      key: 'name',
      width: 300,
    },
    {
      title: 'Banco',
      dataIndex: 'banco',
      key: 'banco',
      width: 150,
    },
    {
      title: 'Cuenta',
      dataIndex: 'cuenta',
      key: 'cuenta',
      width: 150,
      align: 'center',
    },
    {
      title: 'Clabe',
      dataIndex: 'clabe',
      key: 'clabe',
      width: 200,
      align: 'center',
    },
    {
      title: 'Nombre Corto',
      dataIndex: 'corto',
      key: 'corto',
      width: 200,
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
      <Card title="Listado de cuentas">
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, justifyContent: 'space-between' }}>
          <Input
            placeholder="Buscar cuenta..."
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
            onClick={handleAñadirCuenta}
            style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}
          >
            Añadir cuenta
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

      <CuentaModal
        open={modalOpen}
        onCancel={handleModalClose}
        onSuccess={handleModalSuccess}
        cuenta={cuentaSeleccionada}
      />
    </div>
  );
};

export default CuentasList;
