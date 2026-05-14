import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/store/authStore';

const { Title } = Typography;

const CatalogoClavesSat: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [servicios, setServicios] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingServicios, setLoadingServicios] = useState<boolean>(false);
  const [claveSearch, setClaveSearch] = useState<string>('');
  const [tipoServicio, setTipoServicio] = useState<string>('');
  const [nombreSearch, setNombreSearch] = useState<string>('');
  const [form] = Form.useForm();
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
    console.log('Valores del formulario:', values);
    // TODO: Implementar guardado
  };

  const handleBuscar = () => {
    // TODO: Implementar búsqueda con los filtros
    console.log('Buscar:', { claveSearch, tipoServicio, nombreSearch });
  };

  const handleLimpiarFiltros = () => {
    setClaveSearch('');
    setTipoServicio('');
    setNombreSearch('');
  };

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
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', minWidth: 120 }}
          >
            Buscar
          </Button>

          <Button
            danger
            size="large"
            onClick={handleLimpiarFiltros}
            style={{ minWidth: 120 }}
          >
            Limpiar
          </Button>
        </div>
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
                { label: 'Constructoras', value: 'constructoras' },
                { label: 'Servicios', value: 'servicios' },
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
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', minWidth: 150, marginRight: 12 }}
            >
              Guardar
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              size="large"
              onClick={handleLimpiar}
              style={{ minWidth: 150 }}
            >
              Limpiar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CatalogoClavesSat;
