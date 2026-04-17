import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Modal } from 'antd';
import { PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { examService } from '@/services/examService';

const GenerarPin: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleGenerarPin = async (values: any) => {
    try {
      setLoading(true);
      
      const response = await examService.savePin(values.nombre, values.telefono);
      
      if (response.status === 'success') {
        const exam_code = response.exam_code || response.pin || '';
        
        Modal.success({
          title: 'PIN Generado',
          width: 600,
          content: (
            <div>
              <p>Se ha enviado el PIN de ingreso para el examen al asesor, al teléfono <strong>{values.telefono}</strong></p>
              <p>En caso de no recibir el PIN mandarlos manualmente.</p>
              <p><strong>PIN:</strong> {exam_code}</p>
              <p><strong>Liga:</strong> https://sistemaentregax.com/quiz</p>
            </div>
          ),
        });
        
        form.resetFields();
      } else {
        message.error(response.message || 'Error al generar el PIN');
      }
      
    } catch (error: any) {
      console.error('Error al generar PIN:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al generar el PIN';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Generar PIN"
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerarPin}
          autoComplete="off"
        >
          <Form.Item
            label="Nombre de la persona"
            name="nombre"
            rules={[
              { required: true, message: 'Por favor ingrese el nombre' },
              { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ingrese el nombre completo"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Número de teléfono"
            name="telefono"
            rules={[
              { required: true, message: 'Por favor ingrese el número de teléfono' },
              { 
                pattern: /^[0-9]{10}$/, 
                message: 'El número debe tener 10 dígitos' 
              }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Ingrese el número de teléfono (10 dígitos)"
              size="large"
              maxLength={10}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              style={{
                backgroundColor: '#ff6600',
                borderColor: '#ff6600'
              }}
            >
              Generar PIN
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default GenerarPin;
