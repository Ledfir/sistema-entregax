import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Form, message } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { cedisMaritimoService } from '@/services/cedisMaritimoService';
import { useAuthStore } from '@/store/authStore';

const IngresarLogs: React.FC = () => {
  const [form] = Form.useForm();
  const [scanValue, setScanValue] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    focusInput();

    const handleClick = () => {
      setTimeout(focusInput, 0);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanValue(e.target.value);
  };

  const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scanValue.trim() && !loading) {
      const guide = scanValue.trim();
      setLoading(true);

      try {
        const response = await cedisMaritimoService.postRecepcion(user?.token || '', guide);

        if (response.status === 'success') {
          message.success(response.message || 'LOG ingresado correctamente');
        } else {
          message.error(response.message || 'Error al ingresar el LOG');
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message ||
          error?.message ||
          'Error al ingresar el LOG';
        message.error(errorMessage);
      } finally {
        setScanValue('');
        setLoading(false);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 0);
      }
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Ingreso de LOGs Maritimos">
        <Form form={form} layout="vertical">
          <Form.Item label="Capture LOG/QR">
            <Input
              ref={inputRef}
              size="large"
              prefix={<QrcodeOutlined />}
              placeholder="Escanea o ingresa el LOG/QR"
              value={scanValue}
              onChange={handleChange}
              onKeyPress={handleSubmit}
              autoFocus
              disabled={loading}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default IngresarLogs;
