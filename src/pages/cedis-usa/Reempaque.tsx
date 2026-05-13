import React, { useEffect, useState } from 'react';
import { Card, Form, Select, InputNumber, Input, Button, Table, message, Typography, Space, Statistic } from 'antd';
import { SaveOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import apiClient from '@/api/axios';
import { clienteService } from '@/services/clienteService';

const { Title } = Typography;
const { Option } = Select;

const TIPOS_RUTA = [
  { value: 1, label: 'Ruta 1 (Ruta normal)' },
  { value: 2, label: 'Ruta 2 (Ruta para productos especiales)' },
];

interface Paquete {
  guia_nacional: string;
  largo: number;
  alto: number;
  ancho: number;
  peso: number;
  cbm: number;
}

const Reempaque: React.FC = () => {
  const [formCaja] = Form.useForm();
  const [formPaquete] = Form.useForm();
  const [clientes, setClientes] = useState<any[]>([]);
  const [clientesLoading, setClientesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);

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

  const calcularCBM = (largo: number, alto: number, ancho: number): number => {
    return (largo * alto * ancho) / 1000000;
  };

  const handleAgregarPaquete = (values: any) => {
    const cbm = calcularCBM(values.largo, values.alto, values.ancho);
    const nuevoPaquete: Paquete = {
      guia_nacional: values.guia_nacional,
      largo: values.largo,
      alto: values.alto,
      ancho: values.ancho,
      peso: values.peso,
      cbm: parseFloat(cbm.toFixed(6)),
    };

    setPaquetes([...paquetes, nuevoPaquete]);
    formPaquete.resetFields();
    message.success('Paquete agregado correctamente');
  };

  const handleResetearPaquete = () => {
    formPaquete.resetFields();
  };

  const handleGuardar = async (values: any) => {
    if (paquetes.length === 0) {
      message.warning('Debes agregar al menos un paquete');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...values,
        paquetes,
      };
      await apiClient.post('/cedis-usa/reempaque', payload);
      message.success('Reempaque registrado correctamente');
      formCaja.resetFields();
      setPaquetes([]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Error al guardar el reempaque';
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<Paquete> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Guía USR',
      dataIndex: 'guia_nacional',
      key: 'guia_nacional',
      width: 150,
    },
    {
      title: 'Largo',
      dataIndex: 'largo',
      key: 'largo',
      width: 100,
      render: (val) => val.toFixed(2),
    },
    {
      title: 'Alto',
      dataIndex: 'alto',
      key: 'alto',
      width: 100,
      render: (val) => val.toFixed(2),
    },
    {
      title: 'Ancho',
      dataIndex: 'ancho',
      key: 'ancho',
      width: 100,
      render: (val) => val.toFixed(2),
    },
    {
      title: 'Peso',
      dataIndex: 'peso',
      key: 'peso',
      width: 100,
      render: (val) => val.toFixed(2),
    },
    {
      title: 'CBM',
      dataIndex: 'cbm',
      key: 'cbm',
      width: 120,
      render: (val) => val.toFixed(6),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Reempaque">
        {/* Sección 1: Información de la caja */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Title
              level={5}
              style={{
                textAlign: 'center',
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#5b8fa8',
                margin: 0,
                flex: 1,
              }}
            >
              Información necesaria para enviar caja
            </Title>
            <div
              style={{
                backgroundColor: '#f0f0f0',
                padding: '12px 24px',
                borderRadius: 4,
                textAlign: 'center',
                minWidth: 200,
              }}
            >
              <div style={{ fontSize: 12, color: '#ff4d4f', fontWeight: 600, marginBottom: 4 }}>
                PAQUETES AGREGADOS
              </div>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#262626' }}>{paquetes.length}</div>
            </div>
          </div>

          <Form
            form={formCaja}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
                    return parts.length > 2 ? `${parts[0]}.${parts[1]}` : (clean as any);
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
                    return parts.length > 2 ? `${parts[0]}.${parts[1]}` : (clean as any);
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
                    return parts.length > 2 ? `${parts[0]}.${parts[1]}` : (clean as any);
                  }}
                />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
                    return parts.length > 2 ? `${parts[0]}.${parts[1]}` : (clean as any);
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<strong>GUÍA NACIONAL:</strong>}
                name="guia_nacional"
                rules={[{ required: true, message: 'Ingresa la guía nacional' }]}
              >
                <Input placeholder="Guía Nacional" />
              </Form.Item>

              <Form.Item
                label={<strong>Tipo de ruta:</strong>}
                name="tipo_ruta"
                rules={[{ required: true, message: 'Selecciona el tipo de ruta' }]}
              >
                <Select placeholder="Selecciona tipo de ruta">
                  {TIPOS_RUTA.map((tipo) => (
                    <Option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                size="large"
                style={{ backgroundColor: '#28a745', borderColor: '#28a745', minWidth: 150 }}
              >
                Guardar
              </Button>
            </div>
          </Form>
        </div>

        {/* Sección 2: Agregar paquetes */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '2px solid #f0f0f0' }}>
          <Title
            level={5}
            style={{
              textAlign: 'center',
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: '#5b8fa8',
              marginBottom: 24,
            }}
          >
            Agregar paquete USR
          </Title>

          <Form form={formPaquete} layout="vertical" onFinish={handleAgregarPaquete}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <Form.Item
                label={
                  <span>
                    <strong>Guía Nacional:</strong> <span style={{ color: 'red' }}>*</span>
                  </span>
                }
                name="guia_nacional"
                rules={[{ required: true, message: 'Ingresa la guía nacional' }]}
              >
                <Input placeholder="Guía Nacional" />
              </Form.Item>

              <Form.Item
                label={<strong>Largo:</strong>}
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
                    return parts.length > 2 ? `${parts[0]}.${parts[1]}` : (clean as any);
                  }}
                />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <Form.Item
                label={<strong>Alto:</strong>}
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
                    return parts.length > 2 ? `${parts[0]}.${parts[1]}` : (clean as any);
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<strong>Ancho:</strong>}
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
                    return parts.length > 2 ? `${parts[0]}.${parts[1]}` : (clean as any);
                  }}
                />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <Form.Item
                label={<strong>Peso:</strong>}
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
                    return parts.length > 2 ? `${parts[0]}.${parts[1]}` : (clean as any);
                  }}
                />
              </Form.Item>
              <div></div>
            </div>

            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                size="large"
                style={{ backgroundColor: '#ff6600', borderColor: '#ff6600', minWidth: 150 }}
              >
                Agregar
              </Button>
              <Button
                danger
                icon={<RedoOutlined />}
                onClick={handleResetearPaquete}
                size="large"
                style={{ minWidth: 150 }}
              >
                Resetear
              </Button>
            </Space>
          </Form>

          {/* Tabla de paquetes agregados */}
          <div style={{ marginTop: 24 }}>
            <Table
              columns={columns}
              dataSource={paquetes}
              rowKey={(record, index) => `${record.guia_nacional}-${index}`}
              locale={{
                emptyText: 'Favor de agregar al menos una caja',
              }}
              pagination={false}
              scroll={{ x: 800 }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reempaque;
