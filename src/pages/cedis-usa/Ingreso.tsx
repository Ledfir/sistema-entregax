import React, { useEffect, useState } from 'react';
import { Card, Form, Select, InputNumber, Input, Button, Tooltip, message, Space, Typography } from 'antd';
import { SaveOutlined, DeleteOutlined, QuestionCircleFilled } from '@ant-design/icons';
import apiClient from '@/api/axios';
import { clienteService } from '@/services/clienteService';

const { Title } = Typography;
const { Option } = Select;

const TIPOS_RUTA = [
  { value: 1, label: 'Ruta 1 (Ruta normal)' },
  { value: 2, label: 'Ruta 2 (Ruta para productos especiales)' },
];

const Ingreso: React.FC = () => {
  const [form] = Form.useForm();
  const [clientes, setClientes] = useState<any[]>([]);
  const [clientesLoading, setClientesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClientes = async () => {
      setClientesLoading(true);
      try {
        const data = await clienteService.getAll();
        setClientes(data);
      } catch {
        message.error('No se pudo cargar la lista de clientes');
      } finally {
        setClientesLoading(false);
      }
    };
    fetchClientes();
  }, []);

  const handleGuardar = async (values: any) => {
    setSaving(true);
    try {
      await apiClient.post('/cedis-usa/ingreso', values);
      message.success('Paquete registrado correctamente');
      form.resetFields();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Error al guardar el paquete';
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleBorrar = () => {
    form.resetFields();
  };

  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <Card title="Ingreso" style={{ width: '100%', maxWidth: 700 }}>
        <Title
          level={5}
          style={{
            textAlign: 'center',
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: '#5b8fa8',
            marginBottom: 28,
          }}
        >
          Información necesaria para agregar un paquete
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleGuardar}
          initialValues={{ tipo_ruta: 1 }}
        >
          <Form.Item
            label={<strong>CLIENTE:</strong>}
            name="cliente_id"
            rules={[{ required: true, message: 'Favor de seleccionar cliente' }]}
          >
            <Select
              showSearch
              placeholder="Favor de seleccionar cliente"
              loading={clientesLoading}
              optionFilterProp="label"
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {clientes.map((c) => {
                const token = c.token ?? c.token_id ?? c.id ?? c.suite;
                const nombre = c.name ?? c.nombre ?? c.business_name ?? '';
                const clave = c.suite ?? c.clavecliente ?? c.client_key ?? '';
                const label = `${nombre}${clave ? ` (${clave})` : ''}`;
                return (
                  <Option key={String(token)} value={token} label={label}>
                    {label}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            label={<strong>PESO:</strong>}
            name="peso"
            rules={[{ required: true, message: 'Ingresa el peso' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              step={0.01}
              parser={(val) => {
                const clean = String(val ?? '').replace(/[^0-9.]/g, '');
                const parts = clean.split('.');
                return parts.length > 2 ? `${parts[0]}.${parts[1]}` : clean as any;
              }}
            />
          </Form.Item>

          <Form.Item
            label={<strong>LARGO:</strong>}
            name="largo"
            rules={[{ required: true, message: 'Ingresa el largo' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              step={0.01}
              parser={(val) => {
                const clean = String(val ?? '').replace(/[^0-9.]/g, '');
                const parts = clean.split('.');
                return parts.length > 2 ? `${parts[0]}.${parts[1]}` : clean as any;
              }}
            />
          </Form.Item>

          <Form.Item
            label={<strong>ALTO:</strong>}
            name="alto"
            rules={[{ required: true, message: 'Ingresa el alto' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              step={0.01}
              parser={(val) => {
                const clean = String(val ?? '').replace(/[^0-9.]/g, '');
                const parts = clean.split('.');
                return parts.length > 2 ? `${parts[0]}.${parts[1]}` : clean as any;
              }}
            />
          </Form.Item>

          <Form.Item
            label={<strong>ANCHO:</strong>}
            name="ancho"
            rules={[{ required: true, message: 'Ingresa el ancho' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              step={0.01}
              parser={(val) => {
                const clean = String(val ?? '').replace(/[^0-9.]/g, '');
                const parts = clean.split('.');
                return parts.length > 2 ? `${parts[0]}.${parts[1]}` : clean as any;
              }}
            />
          </Form.Item>

          <Form.Item
            label={<strong>GUÍA NACIONAL:</strong>}
            name="guia_nacional"
            rules={[{ required: true, message: 'Ingresa la guía nacional' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={
              <Space size={4}>
                <strong>Tipo de ruta</strong>
                <Tooltip title="Para mayor información de los productos de tipo especial comunicarse con Ricardo Mendez">
                  <QuestionCircleFilled style={{ color: '#ff4d4f', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            name="tipo_ruta"
            rules={[{ required: true, message: 'Selecciona el tipo de ruta' }]}
          >
            <Select>
              {TIPOS_RUTA.map((r) => (
                <Option key={r.value} value={r.value}>
                  {r.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginTop: 8 }}>
            <Space size={12}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
              >
                Guardar
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBorrar}
                disabled={saving}
              >
                Borrar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Ingreso;
