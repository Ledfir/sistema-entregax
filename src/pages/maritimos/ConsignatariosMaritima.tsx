import { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import './ConsignatariosMaritima.css';

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
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = 'Sistema Entregax | Consignatarios';
    loadConsignatarios();
  }, []);

  const loadConsignatarios = () => {
    setLoading(true);
    
    // Mock data - Reemplazar con llamada real a la API
    setTimeout(() => {
      const mockData: Consignatario[] = [
        {
          key: '1',
          nombre: 'ABC Logística',
          razonSocial: 'ABC Logística Internacional S.A. de C.V.',
          extras: 'Especializado en carga refrigerada',
        },
        {
          key: '2',
          nombre: 'TransMar',
          razonSocial: 'Transportes Marítimos del Pacífico S.A.',
          extras: 'Manejo de contenedores FCL/LCL',
        },
        {
          key: '3',
          nombre: 'Global Freight',
          razonSocial: 'Global Freight Solutions Mexico',
          extras: 'Servicios de consolidación',
        },
        {
          key: '4',
          nombre: 'Ocean Cargo',
          razonSocial: 'Ocean Cargo Management S. de R.L.',
          extras: 'Transporte marítimo internacional',
        },
        {
          key: '5',
          nombre: 'Maritime Express',
          razonSocial: 'Maritime Express Logistics Corp.',
          extras: 'Carga general y especializada',
        },
      ];
      
      setData(mockData);
      setLoading(false);
    }, 500);
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
      console.log('Datos del formulario:', values);
      
      // TODO: Aquí iría la llamada a la API para guardar el consignatario
      // await consignatariosService.create(values);
      
      // Agregar el nuevo consignatario a la tabla (mock)
      const newConsignatario: Consignatario = {
        key: String(data.length + 1),
        nombre: values.nombre,
        razonSocial: values.razonSocial,
        extras: values.extras || '',
      };
      
      setData([...data, newConsignatario]);
      message.success('Consignatario agregado exitosamente');
      
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Error al validar formulario:', error);
    }
  };

  const columns: ColumnsType<Consignatario> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 200,
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Razon Social',
      dataIndex: 'razonSocial',
      key: 'razonSocial',
      width: 300,
      sorter: (a, b) => a.razonSocial.localeCompare(b.razonSocial),
    },
    {
      title: 'Extras',
      dataIndex: 'extras',
      key: 'extras',
      width: 250,
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
