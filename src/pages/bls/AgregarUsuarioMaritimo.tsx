import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { userService } from '@/services/userService';

const AgregarUsuarioMaritimo: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Llamar al endpoint para crear usuario marítimo
      const response = await userService.createUserMaritimo({
        nombre: values.nombre,
        telefono: values.telefono,
        email: values.email,
      });
      
      // Mostrar mensaje de la API
      if (response.status === 'success') {
        message.success(response.message || 'Usuario marítimo creado correctamente');
        form.resetFields();
      } else {
        message.error(response.message || 'Error al crear el usuario marítimo');
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.message || 
                           'Error al crear el usuario marítimo';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Agregar nuevo usuario marítimo">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600, margin: '0 auto' }}
        >
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[
              { required: true, message: 'Por favor ingrese el nombre' },
              { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
            ]}
          >
            <Input placeholder="Nombre" size="large" />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="telefono"
            rules={[
              { required: true, message: 'Por favor ingrese el teléfono' }
            ]}
          >
            <Input placeholder="..." size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Por favor ingrese el email' },
              { type: 'email', message: 'Por favor ingrese un email válido' }
            ]}
          >
            <Input placeholder="Email" size="large" type="email" />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, textAlign: 'center' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<UserAddOutlined />}
              loading={loading}
              size="large"
              style={{ minWidth: 200, backgroundColor: '#ff6600', borderColor: '#ff6600' }}
            >
              Crear usuario
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AgregarUsuarioMaritimo;
