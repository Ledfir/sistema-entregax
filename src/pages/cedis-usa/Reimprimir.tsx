import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Select, DatePicker, Table, message, Space, Typography, Form } from 'antd';
import { SearchOutlined, SettingOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import apiClient from '@/api/axios';
import { clienteService } from '@/services/clienteService';

const { Title } = Typography;
const { Option } = Select;

interface ReimpresionRecord {
  id: number;
  guia: string;
  asesor: string;
  cliente: string;
  categoria: string;
  estado: string;
  fecha_ingreso: string;
}

const Reimprimir: React.FC = () => {
  const [form] = Form.useForm();
  const [guiaBusqueda, setGuiaBusqueda] = useState('');
  const [clientes, setClientes] = useState<any[]>([]);
  const [clientesLoading, setClientesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReimpresionRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

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

  const handleBusquedaRapida = async () => {
    const guia = guiaBusqueda.trim();
    if (!guia) {
      message.warning('Ingresa una guía para buscar');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await apiClient.post('/cedis-usa/reimprimir/buscar-guia', { guia });
      const results = response.data?.data || [];
      setData(Array.isArray(results) ? results : []);
      
      if (results.length === 0) {
        message.info('No se encontraron resultados para esta guía');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Error al buscar la guía';
      message.error(msg);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBusquedaDetallada = async () => {
    const values = form.getFieldsValue();
    
    if (!values.cliente && !values.fecha_inicio && !values.fecha_fin) {
      message.warning('Selecciona al menos un criterio de búsqueda');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const payload: any = {};
      if (values.cliente) payload.cliente = values.cliente;
      if (values.fecha_inicio) payload.fecha_inicio = values.fecha_inicio.format('YYYY-MM-DD');
      if (values.fecha_fin) payload.fecha_fin = values.fecha_fin.format('YYYY-MM-DD');

      const response = await apiClient.post('/cedis-usa/reimprimir/buscar', payload);
      const results = response.data?.data || [];
      setData(Array.isArray(results) ? results : []);
      
      if (results.length === 0) {
        message.info('No se encontraron resultados con los criterios seleccionados');
      } else {
        message.success(`Se encontraron ${results.length} registros`);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Error al realizar la búsqueda';
      message.error(msg);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    form.resetFields();
    setGuiaBusqueda('');
    setData([]);
    setHasSearched(false);
  };

  const handleReimprimir = async (record: ReimpresionRecord) => {
    try {
      const response = await apiClient.post(
        '/cedis-usa/reimprimir/generar',
        { guia: record.guia },
        { responseType: 'blob' }
      );

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reimpresion_${record.guia}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Reimpresión generada correctamente');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Error al generar la reimpresión';
      message.error(msg);
    }
  };

  const columns: ColumnsType<ReimpresionRecord> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Guía',
      dataIndex: 'guia',
      key: 'guia',
      width: 150,
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 150,
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      width: 200,
    },
    {
      title: 'Categoría',
      dataIndex: 'categoria',
      key: 'categoria',
      width: 150,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      render: (estado: string) => (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            backgroundColor: estado === 'Activo' ? '#d4edda' : '#f8d7da',
            color: estado === 'Activo' ? '#155724' : '#721c24',
          }}
        >
          {estado}
        </span>
      ),
    },
    {
      title: 'Fecha de ingreso',
      dataIndex: 'fecha_ingreso',
      key: 'fecha_ingreso',
      width: 150,
      render: (fecha: string) => (fecha ? dayjs(fecha).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleReimprimir(record)}>
          Reimprimir
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, textTransform: 'uppercase' }}>
              Reimprimir
            </Title>
          </div>
        }
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ textAlign: 'center', color: '#666', fontWeight: 400 }}>
            LISTADO DE REIMPRESIÓN
          </Title>
        </div>

        {/* Búsqueda rápida */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <SearchOutlined style={{ color: '#1890ff' }} />
            <label style={{ fontWeight: 500 }}>Escanea aquí para buscar guía:</label>
          </div>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Guía de ingreso US.."
              value={guiaBusqueda}
              onChange={(e) => setGuiaBusqueda(e.target.value)}
              onPressEnter={handleBusquedaRapida}
              size="large"
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleBusquedaRapida}
              loading={loading}
              size="large"
            />
          </Space.Compact>
        </div>

        {/* Búsqueda detallada */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <SettingOutlined style={{ color: '#faad14', fontSize: 18 }} />
            <Title level={5} style={{ margin: 0, color: '#faad14' }}>
              Búsqueda detallada
            </Title>
          </div>

          <Form form={form} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <Form.Item name="cliente" label="Buscar por cliente:">
                <Select
                  placeholder="Favor de seleccionar cliente"
                  loading={clientesLoading}
                  showSearch
                  optionFilterProp="label"
                  size="large"
                  allowClear
                >
                  {clientes.map((c) => {
                    const token = c.token ?? c.token_id ?? c.id ?? c.suite;
                    const nombre = c.name ?? c.nombre ?? c.business_name ?? 'Sin nombre';
                    const clave = c.suite ?? c.clavecliente ?? c.client_key;
                    const label = `${nombre}${clave ? ` (${clave})` : ''}`;
                    return (
                      <Option key={String(token)} value={token} label={label}>
                        {label}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>

              <Form.Item name="fecha_inicio" label="Fecha inicio:">
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="dd/mm/aaaa"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                  size="large"
                />
              </Form.Item>

              <Form.Item name="fecha_fin" label="Fecha final:">
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="dd/mm/aaaa"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                  size="large"
                />
              </Form.Item>
            </div>

            <Space style={{ marginTop: 8 }}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleBusquedaDetallada}
                loading={loading}
                size="large"
                style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
              >
                Buscar
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleLimpiar}
                size="large"
              >
                Limpiar
              </Button>
            </Space>
          </Form>
        </div>

        {/* Tabla de resultados */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: hasSearched ? 'No se encontraron resultados' : 'Favor de realizar búsqueda',
          }}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} registros`,
          }}
        />
      </Card>
    </div>
  );
};

export default Reimprimir;
