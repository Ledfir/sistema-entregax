import { useState, useEffect } from 'react';
import { Button, Spin, Dropdown, Menu, Modal, Form, Select, Input } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { operacionesService } from '@/services/operacionesService';
import { useAuthStore } from '@/store/authStore';
import Swal from 'sweetalert2';
import './Descuentos.css';

export const Descuentos = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [descuentos, setDescuentos] = useState<any[]>([]);
  const [filteredDescuentos, setFilteredDescuentos] = useState<any[]>([]);
  const [filterCliente, setFilterCliente] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = 'Sistema Entregax | Descuentos Costos';
    loadDescuentos();
  }, []);

  const loadDescuentos = async () => {
    try {
      setLoading(true);
      const data = await operacionesService.listDiscounts();
      setDescuentos(data);
      setFilteredDescuentos(data);
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al cargar los descuentos',
        showConfirmButton: false,
        timer: 3500
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de cliente
  useEffect(() => {
    if (filterCliente.trim() === '') {
      setFilteredDescuentos(descuentos);
    } else {
      const needle = filterCliente.toLowerCase();
      const filtered = descuentos.filter((d) => 
        String(d.nombre_cliente ?? '').toLowerCase().includes(needle)
      );
      setFilteredDescuentos(filtered);
    }
    setPage(1);
  }, [filterCliente, descuentos]);

  const handleEdit = (descuento: any) => {
    console.log('Editar descuento:', descuento);
    // TODO: Implementar lógica de edición
    Swal.fire({
      icon: 'info',
      title: '',
      text: 'Función de edición próximamente',
      showConfirmButton: true,
    });
  };

  const handleDelete = (descuento: any) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Está seguro?',
      text: '¿Desea eliminar este descuento?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff6600',
      cancelButtonColor: '#6c757d',
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Implementar lógica de eliminación
        console.log('Eliminar descuento:', descuento);
        Swal.fire({
          icon: 'success',
          title: '',
          text: 'Descuento eliminado correctamente',
          showConfirmButton: false,
          timer: 3500
        });
      }
    });
  };

  const loadModalData = async () => {
    try {
      const data = await operacionesService.getDataCreateDiscount();
      setProductos(data.products || []);
      setClientes(data.clients || []);
    } catch (error) {
      console.error('Error al cargar datos del modal:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al cargar datos del formulario',
        showConfirmButton: false,
        timer: 3500
      });
    }
  };

  const showModal = async () => {
    setIsModalOpen(true);
    await loadModalData();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (!user?.id) {
        Swal.fire({
          icon: 'error',
          title: '',
          text: 'Error: No se pudo obtener el usuario de la sesión',
          showConfirmButton: false,
          timer: 3500
        });
        return;
      }

      setLoading(true);
      
      const dataToSend = {
        producto: values.producto,
        cliente: values.cliente,
        costo: values.costo,
        usuario: user.id
      };
      
      const response = await operacionesService.createDiscount(dataToSend);
      
      setIsModalOpen(false);
      form.resetFields();
      
      // Recargar la tabla de descuentos
      await loadDescuentos();
      
      Swal.fire({
        icon: 'success',
        title: '',
        text: response.message || 'Descuento agregado correctamente',
        showConfirmButton: false,
        timer: 3500
      });
      
    } catch (error: any) {
      console.error('Error al guardar descuento:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar el descuento';
      Swal.fire({
        icon: 'error',
        title: '',
        text: errorMessage,
        showConfirmButton: false,
        timer: 3500
      });
      setLoading(false);
    }
  };

  const getMenu = (descuento: any) => (
    <Menu>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />} 
        onClick={() => handleEdit(descuento)}
      >
        Editar
      </Menu.Item>
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />} 
        onClick={() => handleDelete(descuento)}
        danger
      >
        Eliminar
      </Menu.Item>
    </Menu>
  );

  // Calcular datos paginados
  const totalRecords = filteredDescuentos.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = filteredDescuentos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          backgroundColor: '#4a4a4a', 
          color: 'white',
          padding: '24px',
        }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Descuentos Costos
          </h1>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={showModal}
                style={{ backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}
              >
                Agregar nuevo descuento
              </Button>
            </div>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>CLIENTE</th>
                    <th>PRODUCTO</th>
                    <th>COSTO</th>
                    <th>ACCIONES</th>
                  </tr>
                  <tr className="filter-row">
                    <th>
                      <input
                        type="text"
                        placeholder="Filtrar cliente"
                        value={filterCliente}
                        onChange={(e) => setFilterCliente(e.target.value)}
                        className="filter-input"
                      />
                    </th>
                    <th></th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="no-data">
                        No hay información de registros
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((descuento) => (
                      <tr key={descuento.token}>
                        <td>{descuento.nombre_cliente} ({descuento.suite})</td>
                        <td>{descuento.producto}</td>
                        <td>${parseFloat(descuento.costo).toFixed(2)}</td>
                        <td>
                          <Dropdown overlay={getMenu(descuento)} trigger={['click']}>
                            <Button type="link" icon={<MoreOutlined />}>
                              Opciones
                            </Button>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalRecords > 0 && (
              <div className="table-footer">
                <div className="records-info">
                  Mostrando {totalRecords > 0 ? startIndex + 1 : 0} a {endIndex} de {totalRecords} registros
                </div>
                <div className="pagination-buttons">
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        title="AGREGAR DESCUENTO"
        open={isModalOpen}
        onOk={handleSave}
        onCancel={handleCancel}
        okText="Guardar"
        cancelText="Cancelar"
        okButtonProps={{ 
          style: { backgroundColor: '#17a2b8', borderColor: '#17a2b8' }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="producto"
            label="PRODUCTO"
            rules={[{ required: true, message: 'Por favor seleccione un producto' }]}
          >
            <Select 
              placeholder="Seleccione un producto"
              showSearch
              optionFilterProp="children"
            >
              {productos.map((producto) => (
                <Select.Option key={producto.id} value={producto.id}>
                  {producto.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="cliente"
            label="CLIENTE"
            rules={[{ required: true, message: 'Por favor seleccione un cliente' }]}
          >
            <Select 
              placeholder="Favor de ingresar el cliente"
              showSearch
              optionFilterProp="children"
            >
              {clientes.map((cliente) => (
                <Select.Option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} ({cliente.clavecliente})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="costo"
            label="COSTO"
            rules={[
              { required: true, message: 'Por favor ingrese el costo' },
              { pattern: /^\d+(\.\d{1,2})?$/, message: 'Ingrese un costo válido' }
            ]}
          >
            <Input 
              type="number" 
              step="0.01"
              placeholder="0.00"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Descuentos;
