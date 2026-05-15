import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Modal, Form, Input, Select, message, Table, Spin, Dropdown } from 'antd';
import { PlusOutlined, SaveOutlined, CloseOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/store/authStore';

const { Title } = Typography;

const CatalogoClavesSat: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalEditarVisible, setModalEditarVisible] = useState<boolean>(false);
  const [servicios, setServicios] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingServicios, setLoadingServicios] = useState<boolean>(false);
  const [loadingGuardar, setLoadingGuardar] = useState<boolean>(false);
  const [loadingEditar, setLoadingEditar] = useState<boolean>(false);
  const [loadingBuscar, setLoadingBuscar] = useState<boolean>(false);
  const [claveSearch, setClaveSearch] = useState<string>('');
  const [tipoServicio, setTipoServicio] = useState<string>('');
  const [nombreSearch, setNombreSearch] = useState<string>('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [registroEditar, setRegistroEditar] = useState<any>(null);
  const [form] = Form.useForm();
  const [formEditar] = Form.useForm();
  const { user } = useAuthStore();

  useEffect(() => {
    loadServicios();
  }, []);

  const handleOpenModal = async () => {
    setModalVisible(true);
    await loadServicios();
  };

  const loadServicios = async () => {
    try {
      setLoadingServicios(true);
      const response = await apiClient.get('/dolars/list-services', {
        headers: { token: user?.token },
      });
      if (response.data && response.data.data) {
        setServicios(response.data.data);
      }
    } catch (error) {
      message.error('Error al cargar los servicios');
      console.error('Error loading services:', error);
    } finally {
      setLoadingServicios(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleLimpiar = () => {
    form.resetFields();
  };

  const handleGuardar = async (values: any) => {
    try {
      setLoadingGuardar(true);
      const response = await apiClient.post(
        '/dolars/facturacion/create-clave-sat',
        values,
        {
          headers: { token: user?.token },
        }
      );
      
      if (response.data) {
        if (response.data.message) {
          message.success(response.data.message);
        } else {
          message.success('Clave SAT guardada exitosamente');
        }
        handleCloseModal();
      }
    } catch (error: any) {
      console.error('Error al guardar clave SAT:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Error al guardar la clave SAT');
      }
    } finally {
      setLoadingGuardar(false);
    }
  };

  const handleBuscar = async () => {
    try {
      setLoadingBuscar(true);
      const response = await apiClient.post(
        '/dolars/facturacion/search-clave-sat',
        {
          clave: claveSearch,
          serv: tipoServicio,
          servicio: nombreSearch,
        },
        {
          headers: { token: user?.token },
        }
      );
      
      if (response.data) {
        if (response.data.message) {
          message.success(response.data.message);
        }
        if (response.data.data) {
          setResultados(response.data.data);
        } else {
          setResultados([]);
        }
      }
    } catch (error: any) {
      console.error('Error al buscar claves SAT:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Error al buscar claves SAT');
      }
      setResultados([]);
    } finally {
      setLoadingBuscar(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setClaveSearch('');
    setTipoServicio('');
    setNombreSearch('');
    setResultados([]);
    setCurrentPage(1);
    setPageSize(10);
  };

  const handleEditar = (record: any) => {
    setRegistroEditar(record);
    formEditar.setFieldsValue({
      nombre: record.nombre,
    });
    setModalEditarVisible(true);
  };

  const handleEliminar = (record: any) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar esta clave SAT?',
      content: `Se eliminará la clave "${record.clave}" - ${record.nombre}`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const response = await apiClient.post(
            '/dolars/facturacion/delete-clave-sat',
            { id: record.id },
            {
              headers: { token: user?.token },
            }
          );

          if (response.data) {
            if (response.data.message) {
              message.success(response.data.message);
            } else {
              message.success('Clave SAT eliminada exitosamente');
            }
            // Actualizar la lista después de eliminar
            handleBuscar();
          }
        } catch (error: any) {
          console.error('Error al eliminar clave SAT:', error);
          if (error.response?.data?.message) {
            message.error(error.response.data.message);
          } else if (error.message) {
            message.error(error.message);
          } else {
            message.error('Error al eliminar la clave SAT');
          }
        }
      },
    });
  };

  const handleCloseModalEditar = () => {
    setModalEditarVisible(false);
    formEditar.resetFields();
    setRegistroEditar(null);
  };

  const handleActualizar = async (values: any) => {
    try {
      setLoadingEditar(true);
      const response = await apiClient.post(
        '/dolars/facturacion/update-clave-sat',
        {
          id: registroEditar.id,
          nombre: values.nombre,
        },
        {
          headers: { token: user?.token },
        }
      );

      if (response.data) {
        if (response.data.message) {
          message.success(response.data.message);
        } else {
          message.success('Clave SAT actualizada exitosamente');
        }
        handleCloseModalEditar();
        handleBuscar();
      }
    } catch (error: any) {
      console.error('Error al actualizar clave SAT:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Error al actualizar la clave SAT');
      }
    } finally {
      setLoadingEditar(false);
    }
  };

  const getMenuItems = (record: any): MenuProps['items'] => [
    {
      key: 'editar',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => handleEditar(record),
    },
    {
      key: 'eliminar',
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleEliminar(record),
    },
  ];

  return (
    <div style={{ padding: 24, background: 'transparent' }}>
      <Card
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
          border: '1px solid #d9d9d9',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0, color: '#000' }}>
            Catálogo de CLAVES SAT
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleOpenModal}
          >
            Agregar nueva CLAVE SAT
          </Button>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: 12, 
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          marginBottom: 24 
        }}>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ marginBottom: 4, fontSize: 14, color: '#000' }}>Ingrese la CLAVE de servicio</div>
            <Input
              placeholder="CLAVE"
              size="large"
              value={claveSearch}
              onChange={(e) => setClaveSearch(e.target.value)}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <div style={{ marginBottom: 4, fontSize: 14, color: '#000' }}>Tipo de servicio</div>
            <Select
              placeholder=""
              size="large"
              style={{ width: '100%' }}
              value={tipoServicio || undefined}
              onChange={(value) => setTipoServicio(value)}
              loading={loadingServicios}
              options={servicios.map((servicio) => ({
                label: servicio.name,
                value: servicio.id,
              }))}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <div style={{ marginBottom: 4, fontSize: 14, color: '#000' }}>Busqueda por nombre</div>
            <Input
              placeholder="Servicio"
              size="large"
              value={nombreSearch}
              onChange={(e) => setNombreSearch(e.target.value)}
            />
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleBuscar}
            loading={loadingBuscar}
            disabled={loadingBuscar}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', minWidth: 120 }}
          >
            Buscar
          </Button>

          <Button
            danger
            size="large"
            onClick={handleLimpiarFiltros}
            disabled={loadingBuscar}
            style={{ minWidth: 120 }}
          >
            Limpiar
          </Button>
        </div>

        <hr style={{ width: '100%', margin: '24px 0', border: 'none', borderTop: '1px solid #d9d9d9' }} />

        {loadingBuscar ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Buscando..." />
          </div>
        ) : resultados.length > 0 ? (
          <div style={{ marginTop: 24 }}>
            <Table
              dataSource={resultados}
              rowKey={(record) => record.id || record.clave}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} registros`,
                onChange: (page, newPageSize) => {
                  setCurrentPage(page);
                  if (newPageSize !== pageSize) {
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                  }
                },
              }}
              scroll={{ x: 'max-content' }}
            >
              <Table.Column title="Clave" dataIndex="clave" key="clave" />
              <Table.Column title="Proveedor" dataIndex="proveedor" key="proveedor" />
              <Table.Column title="Nombre" dataIndex="nombre" key="nombre" />
              <Table.Column title="Servicio" dataIndex="tipo" key="tipo" />
              <Table.Column
                title="Acciones"
                key="acciones"
                fixed="right"
                width={100}
                render={(_, record) => (
                  <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                )}
              />
            </Table>
          </div>
        ) : null}
      </Card>

      <Modal
        title="Agregar nueva CLAVE SAT"
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGuardar}
        >
          <Form.Item
            label="Clave de registro"
            name="clave"
            rules={[{ required: true, message: 'Por favor ingrese la clave' }]}
          >
            <Input size="large" placeholder="Clave de registro" />
          </Form.Item>

          <Form.Item
            label="Proveedor"
            name="proveedor"
            rules={[{ required: true, message: 'Por favor seleccione un proveedor' }]}
          >
            <Select
              placeholder="-- Seleccione --"
              size="large"
              options={[
                { label: 'Trebol', value: 1 },
                { label: 'Japcem Global', value: 2 },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Nombre del registro:"
            name="nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input size="large" placeholder="Nombre del registro" />
          </Form.Item>

          <Form.Item
            label="Servicio del registro"
            name="servicio"
            rules={[{ required: true, message: 'Por favor seleccione un servicio' }]}
          >
            <Select
              placeholder=""
              size="large"
              loading={loadingServicios}
              options={servicios.map((servicio) => ({
                label: servicio.name,
                value: servicio.id,
              }))}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, textAlign: 'center' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={loadingGuardar}
              disabled={loadingGuardar}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', minWidth: 150, marginRight: 12 }}
            >
              Guardar
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              size="large"
              onClick={handleLimpiar}
              disabled={loadingGuardar}
              style={{ minWidth: 150 }}
            >
              Limpiar
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Editar CLAVE SAT"
        open={modalEditarVisible}
        onCancel={handleCloseModalEditar}
        footer={null}
        width={500}
      >
        <Form
          form={formEditar}
          layout="vertical"
          onFinish={handleActualizar}
        >
          <Form.Item
            label="Nombre del registro"
            name="nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input size="large" placeholder="Nombre del registro" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, textAlign: 'center' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={loadingEditar}
              disabled={loadingEditar}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', minWidth: 150, marginRight: 12 }}
            >
              Actualizar
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              size="large"
              onClick={handleCloseModalEditar}
              disabled={loadingEditar}
              style={{ minWidth: 150 }}
            >
              Cancelar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CatalogoClavesSat;
