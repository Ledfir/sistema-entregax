import { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import './ConsignatariosMaritima.css';
import axios from '@/api/axios';

interface Consignatario {
  key: string;
  nombre: string;
  razonSocial: string;
  extras: string;
}

export const ConsignatariosMaritima = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Consignatario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = 'Sistema Entregax | Consignatarios';
    loadConsignatarios();
  }, []);

  const loadConsignatarios = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/operation-maritime/consignatarios');
      if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        const mapped: Consignatario[] = res.data.data.map((it: any) => ({
          key: it.token || it.id || String(Math.random()),
          nombre: it.name || it.nombre || '',
          razonSocial: it.business_name || it.razonSocial || '',
          extras: it.description || it.extras || '',
        }));
        setData(mapped);
      } else {
        setData([]);
        message.error('No se recibieron consignatarios desde el servidor');
      }
    } catch (err) {
      console.error('Error cargando consignatarios', err);
      message.error('Error al cargar consignatarios');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        name: values.nombre,
        business_name: values.razonSocial,
        description: values.extras || '',
      };
      try {
        const res = await axios.post('/operation-maritime/save-consignatario', payload);
        const serverMsg = res?.data?.message;
        if (res.data?.status === 'success') {
          message.success(serverMsg || 'Consignatario guardado correctamente');
          setIsModalOpen(false);
          form.resetFields();
          await loadConsignatarios();
        } else {
          // mostrar mensaje de error retornado por la API
          if (serverMsg) {
            message.error(serverMsg);
          } else if (res.data?.errors) {
            const errs = Array.isArray(res.data.errors) ? res.data.errors.join(', ') : JSON.stringify(res.data.errors);
            message.error(errs);
          } else {
            message.error('Error al guardar consignatario');
          }
        }
      } catch (apiErr: any) {
        console.error('API error saving consignatario', apiErr);
        const serverMsg = apiErr?.response?.data?.message || apiErr?.response?.data?.error;
        if (serverMsg) message.error(serverMsg);
        else message.error('Error de red al guardar consignatario');
      }
    } catch (error) {
      console.error('Error al validar formulario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<Consignatario> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 200,
      align: 'center',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Razon Social',
      dataIndex: 'razonSocial',
      key: 'razonSocial',
      width: 300,
      align: 'center',
      sorter: (a, b) => a.razonSocial.localeCompare(b.razonSocial),
    },
    {
      title: 'Extras',
      dataIndex: 'extras',
      key: 'extras',
      width: 250,
      align: 'center',
      sorter: (a, b) => a.extras.localeCompare(b.extras),
    },
  ];

  return (
    <div className="consignatarios-maritima">
      <div className="consignatarios-header">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          size="large"
        >
          Agregar nuevo consignatario
        </Button>
      </div>

      <Card 
        title="Consignatarios"
        className="consignatarios-card"
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} consignatarios`,
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>

      <Modal
        title="Agregar nuevo consignatario"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Guardar"
        cancelText="Cancelar"
        width={600}
        confirmLoading={submitting}
      >
        <Form
          form={form}
          layout="vertical"
          name="consignatarioForm"
        >
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[
              { required: true, message: 'Por favor ingrese el nombre' },
              { min: 3, message: 'El nombre debe tener mínimo 3 caracteres' },
            ]}
          >
            <Input placeholder="Ingrese el nombre del consignatario" />
          </Form.Item>

          <Form.Item
            name="razonSocial"
            label="Razón Social"
            rules={[
              { required: true, message: 'Por favor ingrese la razón social' },
              { min: 5, message: 'La razón social debe tener mínimo 5 caracteres' },
            ]}
          >
            <Input placeholder="Ingrese la razón social completa" />
          </Form.Item>

          <Form.Item
            name="extras"
            label="Extras"
            rules={[
              { max: 200, message: 'Los extras no pueden exceder 200 caracteres' },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Información adicional (opcional)"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConsignatariosMaritima;
