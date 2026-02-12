import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, Space, Dropdown, Menu, Modal, Form, Select, DatePicker, Spin } from 'antd';
import { SearchOutlined, MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import cargoExtraService from '../../services/cargoExtraService';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import './CargoExtra.css';

const { Search } = Input;
const { Option } = Select;

interface CargoExtra {
  token: string;
  idce: string;
  cliente: string;
  SUITE: string;
  CLIENTE: string;
  created: string;
  pagado: number;
  paid: string | null;
  cta: string;
  tokenCuenta: string;
  fechap: string | null;
}

interface Cuenta {
  token: string;
  name: string;
}

export const CargoExtraList = () => {
  const [loading, setLoading] = useState(false);
  const [cargosExtras, setCargosExtras] = useState<CargoExtra[]>([]);
  const [filteredData, setFilteredData] = useState<CargoExtra[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CargoExtra | null>(null);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loadingCuentas, setLoadingCuentas] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCargosExtras();
    fetchCuentas();
  }, [currentPage, pageSize]);

  useEffect(() => {
    filterData();
  }, [searchText, cargosExtras]);

  const fetchCargosExtras = async () => {
    try {
      setLoading(true);
      const { items, total: totalItems } = await cargoExtraService.list('', currentPage, pageSize);
      setCargosExtras(items);
      setTotal(totalItems || 0);
    } catch (error) {
      console.error('Error al cargar cargos extras:', error);
      
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.response?.data?.error || 
                           (error as any)?.message || 
                           'No se pudieron cargar los cargos extras';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCuentas = async () => {
    try {
      setLoadingCuentas(true);
      const data = await cargoExtraService.getCuentas();
      setCuentas(data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    } finally {
      setLoadingCuentas(false);
    }
  };

  const filterData = () => {
    if (!searchText.trim()) {
      setFilteredData(cargosExtras);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = cargosExtras.filter((item) => {
      const idceMatch = item.idce?.toLowerCase().includes(searchLower);
      const suiteMatch = item.SUITE?.toLowerCase().includes(searchLower);
      const clienteMatch = item.CLIENTE?.toLowerCase().includes(searchLower);
      const combinedClient = `(${item.SUITE}) ${item.CLIENTE}`.toLowerCase().includes(searchLower);
      
      return idceMatch || suiteMatch || clienteMatch || combinedClient;
    });
    
    setFilteredData(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleView = (record: CargoExtra) => {
    // Implementar vista de detalle
    console.log('Ver:', record);
  };

  const handleEdit = (record: CargoExtra) => {
    setEditingRecord(record);
    form.setFieldsValue({
      cuenta: record.tokenCuenta,
      fecha_pago: record.fechap && record.fechap !== '0000-00-00 00:00:00' ? dayjs(record.fechap) : null,
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Crear FormData para enviar como form-data
      const formData = new FormData();
      formData.append('token', editingRecord?.token || '');
      formData.append('tokenCuenta', values.cuenta);
      if (values.fecha_pago) {
        formData.append('fechap', values.fecha_pago.format('YYYY-MM-DD HH:mm:ss'));
      }

      const response = await cargoExtraService.update(formData);
      
      // Verificar respuesta exitosa
      if (response?.success || response?.status === 'success' || response) {
        // Primero cerrar el modal
        handleModalCancel();
        
        // Actualizar la tabla
        await fetchCargosExtras();
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El cargo extra ha sido actualizado correctamente',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      
      const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.message || 
                           'No se pudo actualizar el cargo extra';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        showConfirmButton: true,
      });
    }
  };

  const handleDelete = async (record: CargoExtra) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await cargoExtraService.delete(record.token);
          
          // Actualizar la tabla inmediatamente
          await fetchCargosExtras();
          
          // Mostrar mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El cargo extra ha sido eliminado',
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 
                               error?.response?.data?.error || 
                               error?.message || 
                               'No se pudo eliminar el cargo extra';
          
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            showConfirmButton: true,
          });
        }
      }
    });
  };

  const getMenu = (record: CargoExtra) => (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleView(record)}>
        Ver detalles
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
        Editar
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)}>
        Eliminar
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'OPCIONES',
      key: 'opciones',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: CargoExtra) => (
        <Dropdown overlay={getMenu(record)} trigger={['click']}>
          <Button type="link" icon={<MoreOutlined />}>
            Opciones
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'CLAVE',
      dataIndex: 'idce',
      key: 'idce',
      width: 150,
      align: 'center' as const,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Filtrar clave"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    },
    {
      title: 'CLIENTE',
      key: 'cliente',
      align: 'center' as const,
      render: (_: any, record: CargoExtra) => {
        const suite = record.SUITE || '';
        const cliente = record.CLIENTE || '';
        return `(${suite}) ${cliente}`;
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Filtrar cliente"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    },
    {
      title: 'FECHA DE CREACIÓN',
      dataIndex: 'created',
      key: 'created',
      width: 180,
      align: 'center' as const,
      render: (fecha: string) => {
        if (!fecha) return '-';
        const date = new Date(fecha);
        return date.toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      title: 'PAGADO',
      dataIndex: 'pagado',
      key: 'pagado',
      width: 100,
      align: 'center' as const,
      render: (pagado: any) =>
        Number(pagado) === 1 || pagado === '1' ? (
          <Tag color="green">Sí</Tag>
        ) : (
          <Tag color="red">No</Tag>
        ),
    },
    {
      title: 'FECHA PAGADO',
      dataIndex: 'paid',
      key: 'paid',
      width: 180,
      align: 'center' as const,
      render: (fecha: string | null) => {
        if (!fecha || fecha === '0000-00-00 00:00:00') return 'Pendiente';
        const date = new Date(fecha);
        return date.toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <span>CARGOS EXTRAS</span>
          </div>
          <Button
            type="primary"
            onClick={() => navigate('/cargos-extras/crear')}
            style={{ backgroundColor: '#ff6b2c', borderColor: '#ff6b2c' }}
          >
            + Crear cargo extra
          </Button>
        </div>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Search
            placeholder="Buscar registro..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            enterButton={<SearchOutlined />}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="token"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: searchText ? filteredData.length : total,
            showSizeChanger: true,
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
            locale: {
              items_per_page: '/ página',
              jump_to: 'Ir a',
              page: '',
            },
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No hay cargos extras registrados',
            filterConfirm: 'Filtrar',
            filterReset: 'Limpiar',
            selectAll: 'Seleccionar todo',
            selectInvert: 'Invertir selección',
          }}
        />
      </Space>

      <Modal
        title="Editar Cargo Extra"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Guardar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            label="Cuenta:"
            name="cuenta"
            rules={[{ required: true, message: 'Favor de seleccionar una cuenta.' }]}
          >
            <Select
              placeholder="Favor de seleccionar una cuenta."
              showSearch
              loading={loadingCuentas}
              notFoundContent={loadingCuentas ? <Spin size="small" /> : 'No hay cuentas'}
              filterOption={(input, option) => {
                const name = cuentas.find(c => c.token === option?.value)?.name || '';
                return name.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {cuentas.map((cuenta) => (
                <Option key={cuenta.token} value={cuenta.token}>
                  {cuenta.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Fecha de Pago:"
            name="fecha_pago"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="Seleccionar fecha de pago"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CargoExtraList;
