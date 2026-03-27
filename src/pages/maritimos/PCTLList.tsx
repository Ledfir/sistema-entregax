import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Space, List } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EyeOutlined, DeleteOutlined, CommentOutlined } from '@ant-design/icons';
import { humanizarFecha } from '@/utils';
import './PCTLList.css';

const { TextArea } = Input;

interface NotaGestion {
  id: string;
  usuario: string;
  fecha: string;
  nota: string;
}

interface PCTL {
  key: string;
  bl: string;
  consignatario: string;
  naviera: string;
  puerto: string;
  contenedor: string;
  peso: number;
  bultos: number;
  eta: string;
  fecha: string;
  js: string;
  notas: string;
  gestion: string;
  direccion: string;
  coordenadas?: string;
  notasGestion?: NotaGestion[];
}

const PCTLList = () => {
  const [form] = Form.useForm();
  const [direccionForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDireccionModalVisible, setIsDireccionModalVisible] = useState(false);
  const [isViewDireccionModalVisible, setIsViewDireccionModalVisible] = useState(false);
  const [isNotasGestionModalVisible, setIsNotasGestionModalVisible] = useState(false);
  const [selectedPCTL, setSelectedPCTL] = useState<PCTL | null>(null);
  const [loading] = useState(false);

  // Mock data para PCTL
  const [pctlData, setPctlData] = useState<PCTL[]>([
    {
      key: '1',
      bl: 'MAEU123456789',
      consignatario: 'Importadora ABC S.A.',
      naviera: 'Maersk Line',
      puerto: 'Puerto de Miami',
      contenedor: 'MSCU1234567',
      peso: 18500,
      bultos: 245,
      eta: '2026-03-28T10:00:00',
      fecha: '2026-03-27T14:30:00',
      js: 'JS-2026-001',
      notas: 'Mercancía frágil - Manejar con cuidado',
      gestion: 'En proceso',
      direccion: 'Calle 123, Edificio 45, Miami, FL 33130',
      notasGestion: [
        {
          id: '1',
          usuario: 'Juan Pérez',
          fecha: '2026-03-27T10:00:00',
          nota: 'Se confirmó la recepción del contenedor. Todo en orden.',
        },
        {
          id: '2',
          usuario: 'María García',
          fecha: '2026-03-27T14:00:00',
          nota: 'Pendiente de inspección por parte del cliente.',
        },
      ],
    },
    {
      key: '2',
      bl: 'MSCU987654321',
      consignatario: 'Distribuidora XYZ Corp',
      naviera: 'MSC Mediterranean Shipping Company',
      puerto: 'Puerto de Los Ángeles',
      contenedor: 'CMAU9876543',
      peso: 22300,
      bultos: 310,
      eta: '2026-03-29T15:00:00',
      fecha: '2026-03-26T09:15:00',
      js: 'JS-2026-002',
      notas: 'Requiere inspección aduanera',
      gestion: 'Pendiente',
      direccion: '456 Ocean Blvd, Los Angeles, CA 90001',
      notasGestion: [
        {
          id: '1',
          usuario: 'Carlos Rodríguez',
          fecha: '2026-03-26T16:30:00',
          nota: 'Esperando documentación adicional del proveedor.',
        },
      ],
    },
    {
      key: '3',
      bl: 'CMAU456789123',
      consignatario: 'Comercializadora Global Inc',
      naviera: 'CMA CGM Group',
      puerto: 'Puerto de Houston',
      contenedor: 'HLCU4567891',
      peso: 19800,
      bultos: 278,
      eta: '2026-03-30T08:30:00',
      fecha: '2026-03-25T16:45:00',
      js: 'JS-2026-003',
      notas: 'Carga refrigerada - Mantener temperatura',
      gestion: 'Completado',
      direccion: '789 Port Road, Houston, TX 77001',
      notasGestion: [
        {
          id: '1',
          usuario: 'Ana Martínez',
          fecha: '2026-03-25T11:00:00',
          nota: 'Carga completamente verificada y despachada.',
        },
        {
          id: '2',
          usuario: 'Luis Hernández',
          fecha: '2026-03-25T18:00:00',
          nota: 'Cliente satisfecho con el servicio.',
        },
        {
          id: '3',
          usuario: 'Patricia López',
          fecha: '2026-03-26T09:00:00',
          nota: 'Caso cerrado exitosamente.',
        },
      ],
    },
    {
      key: '4',
      bl: 'HLCU789123456',
      consignatario: 'Exportaciones del Sur LLC',
      naviera: 'Hapag-Lloyd',
      puerto: 'Puerto de Newark',
      contenedor: 'COSU7891234',
      peso: 21500,
      bultos: 295,
      eta: '2026-03-31T12:00:00',
      fecha: '2026-03-24T11:20:00',
      js: 'JS-2026-004',
      notas: 'Documentación completa - Listo para despacho',
      gestion: 'En revisión',
      direccion: '321 Harbor Ave, Newark, NJ 07102',
    },
    {
      key: '5',
      bl: 'COSU321654987',
      consignatario: 'Logística Internacional SA',
      naviera: 'COSCO Shipping Lines',
      puerto: 'Puerto de Long Beach',
      contenedor: 'MAEU3216549',
      peso: 20100,
      bultos: 260,
      eta: '2026-04-01T10:30:00',
      fecha: '2026-03-23T13:50:00',
      js: 'JS-2026-005',
      notas: 'Mercancía general - Sin restricciones',
      gestion: 'En proceso',
      direccion: '',
    },
    {
      key: '6',
      bl: 'TEST123456789',
      consignatario: 'Sin Dirección Example',
      naviera: 'Maersk Line',
      puerto: 'Puerto de Miami',
      contenedor: 'TEST1234567',
      peso: 15000,
      bultos: 200,
      eta: '2026-04-02T09:00:00',
      fecha: '2026-03-22T10:00:00',
      js: 'JS-2026-006',
      notas: 'Pendiente de asignar dirección',
      gestion: 'Pendiente',
      direccion: '',
    },
  ]);

  const handleAgregar = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const newPCTL: PCTL = {
        key: String(pctlData.length + 1),
        ...values,
      };
      
      setPctlData([...pctlData, newPCTL]);
      message.success('PCTL agregado exitosamente');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error al validar:', error);
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleVerDireccion = (record: PCTL) => {
    setSelectedPCTL(record);
    setIsViewDireccionModalVisible(true);
  };

  const handleAgregarDireccion = (record: PCTL) => {
    setSelectedPCTL(record);
    setIsDireccionModalVisible(true);
  };

  const handleDireccionModalOk = async () => {
    try {
      const values = await direccionForm.validateFields();
      
      // Actualizar el registro con la nueva dirección
      const updatedData = pctlData.map(item => 
        item.key === selectedPCTL?.key 
          ? { ...item, direccion: values.direccion, coordenadas: values.coordenadas || '' }
          : item
      );
      
      setPctlData(updatedData);
      message.success('Dirección guardada exitosamente');
      direccionForm.resetFields();
      setIsDireccionModalVisible(false);
      setSelectedPCTL(null);
    } catch (error) {
      console.error('Error al validar:', error);
    }
  };

  const handleDireccionModalCancel = () => {
    direccionForm.resetFields();
    setIsDireccionModalVisible(false);
    setSelectedPCTL(null);
  };

  const handleViewDireccionModalCancel = () => {
    setIsViewDireccionModalVisible(false);
    setSelectedPCTL(null);
  };

  const handleVerNotasGestion = (record: PCTL) => {
    setSelectedPCTL(record);
    setIsNotasGestionModalVisible(true);
  };

  const handleNotasGestionModalCancel = () => {
    setIsNotasGestionModalVisible(false);
    setSelectedPCTL(null);
  };

  const handleEliminarRegistro = (record: PCTL) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este registro?',
      content: `Se eliminará el registro del BL: ${record.bl}`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        setPctlData(pctlData.filter(item => item.key !== record.key));
        message.success('Registro eliminado exitosamente');
      },
    });
  };

  const columns: ColumnsType<PCTL> = [
    {
      title: 'BL',
      dataIndex: 'bl',
      key: 'bl',
      width: 150,
      fixed: 'left',
      sorter: (a, b) => a.bl.localeCompare(b.bl),
    },
    {
      title: 'Consignatario',
      dataIndex: 'consignatario',
      key: 'consignatario',
      width: 200,
      sorter: (a, b) => a.consignatario.localeCompare(b.consignatario),
    },
    {
      title: 'Naviera',
      dataIndex: 'naviera',
      key: 'naviera',
      width: 180,
      sorter: (a, b) => a.naviera.localeCompare(b.naviera),
    },
    {
      title: 'Puerto',
      dataIndex: 'puerto',
      key: 'puerto',
      width: 180,
      sorter: (a, b) => a.puerto.localeCompare(b.puerto),
    },
    {
      title: 'Contenedor',
      dataIndex: 'contenedor',
      key: 'contenedor',
      width: 150,
      sorter: (a, b) => a.contenedor.localeCompare(b.contenedor),
    },
    {
      title: 'Peso',
      dataIndex: 'peso',
      key: 'peso',
      width: 120,
      sorter: (a, b) => a.peso - b.peso,
      render: (value: number) => `${value.toLocaleString()} kg`,
    },
    {
      title: 'Bultos',
      dataIndex: 'bultos',
      key: 'bultos',
      width: 100,
      sorter: (a, b) => a.bultos - b.bultos,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'ETA',
      dataIndex: 'eta',
      key: 'eta',
      width: 180,
      sorter: (a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime(),
      render: (value: string) => humanizarFecha(value, true),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 180,
      sorter: (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
      render: (value: string) => humanizarFecha(value, true),
    },
    {
      title: 'JS',
      dataIndex: 'js',
      key: 'js',
      width: 130,
      sorter: (a, b) => a.js.localeCompare(b.js),
    },
    {
      title: 'Notas',
      dataIndex: 'notas',
      key: 'notas',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Gestion',
      key: 'gestion',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            icon={<CommentOutlined style={{ fontSize: '18px', color: '#1890ff' }} />}
            onClick={() => handleVerNotasGestion(record)}
            title="Ver notas de gestión"
            style={{ border: 'none', background: 'transparent' }}
          />
          <Button
            type="default"
            danger
            icon={<DeleteOutlined style={{ fontSize: '18px' }} />}
            onClick={() => handleEliminarRegistro(record)}
            title="Eliminar registro"
            style={{ border: 'none', background: 'transparent' }}
          />
        </Space>
      ),
    },
    {
      title: 'Direccion',
      key: 'direccion',
      width: 120,
      align: 'center',
      render: (_, record) => (
        record.direccion ? (
          <Button
            type="default"
            icon={<EyeOutlined style={{ fontSize: '20px', color: '#52c41a' }} />}
            onClick={() => handleVerDireccion(record)}
            style={{ border: 'none', background: 'transparent' }}
          />
        ) : (
          <Button
            type="default"
            icon={<PlusOutlined style={{ fontSize: '20px', color: '#52c41a' }} />}
            onClick={() => handleAgregarDireccion(record)}
            style={{ 
              border: 'none', 
              background: 'transparent',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        )
      ),
    },
  ];

  return (
    <div className="pctl-list-wrapper">
      <Card 
        title="PCTL"
        className="pctl-list-card"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAgregar}
          >
            Agregar PCTL
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={pctlData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} registros`,
          }}
          scroll={{ x: 2200 }}
        />
      </Card>

      <Modal
        title="Agregar Nuevo PCTL"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Agregar"
        cancelText="Cancelar"
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_pctl"
        >
          <Form.Item
            name="bl"
            label="BL"
            rules={[
              { required: true, message: 'Por favor ingresa el BL' },
              { min: 5, message: 'El BL debe tener al menos 5 caracteres' },
            ]}
          >
            <Input placeholder="Ingresa el número de BL" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="consignatario"
            label="Consignatario"
            rules={[{ required: true, message: 'Por favor ingresa el consignatario' }]}
          >
            <Input placeholder="Ingresa el consignatario" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="naviera"
            label="Naviera"
            rules={[{ required: true, message: 'Por favor selecciona la naviera' }]}
          >
            <Select placeholder="Selecciona una naviera">
              <Select.Option value="Maersk Line">Maersk Line</Select.Option>
              <Select.Option value="MSC Mediterranean Shipping Company">MSC Mediterranean Shipping Company</Select.Option>
              <Select.Option value="CMA CGM Group">CMA CGM Group</Select.Option>
              <Select.Option value="COSCO Shipping Lines">COSCO Shipping Lines</Select.Option>
              <Select.Option value="Hapag-Lloyd">Hapag-Lloyd</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="puerto"
            label="Puerto"
            rules={[{ required: true, message: 'Por favor selecciona el puerto' }]}
          >
            <Select placeholder="Selecciona un puerto">
              <Select.Option value="Puerto de Miami">Puerto de Miami</Select.Option>
              <Select.Option value="Puerto de Los Ángeles">Puerto de Los Ángeles</Select.Option>
              <Select.Option value="Puerto de Houston">Puerto de Houston</Select.Option>
              <Select.Option value="Puerto de Newark">Puerto de Newark</Select.Option>
              <Select.Option value="Puerto de Long Beach">Puerto de Long Beach</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="contenedor"
            label="Contenedor"
            rules={[{ required: true, message: 'Por favor ingresa el número de contenedor' }]}
          >
            <Input placeholder="Ingresa el número de contenedor" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="peso"
            label="Peso (kg)"
            rules={[{ required: true, message: 'Por favor ingresa el peso' }]}
          >
            <Input type="number" placeholder="Ingresa el peso en kg" />
          </Form.Item>

          <Form.Item
            name="bultos"
            label="Bultos"
            rules={[{ required: true, message: 'Por favor ingresa el número de bultos' }]}
          >
            <Input type="number" placeholder="Ingresa el número de bultos" />
          </Form.Item>

          <Form.Item
            name="eta"
            label="ETA"
            rules={[{ required: true, message: 'Por favor ingresa el ETA' }]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item
            name="fecha"
            label="Fecha"
            rules={[{ required: true, message: 'Por favor ingresa la fecha' }]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item
            name="js"
            label="JS"
            rules={[{ required: true, message: 'Por favor ingresa el JS' }]}
          >
            <Input placeholder="Ingresa el código JS" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="notas"
            label="Notas"
          >
            <TextArea 
              placeholder="Ingresa notas adicionales" 
              rows={3} 
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="gestion"
            label="Gestión"
            rules={[{ required: true, message: 'Por favor selecciona el estado de gestión' }]}
          >
            <Select placeholder="Selecciona el estado">
              <Select.Option value="En proceso">En proceso</Select.Option>
              <Select.Option value="Pendiente">Pendiente</Select.Option>
              <Select.Option value="Completado">Completado</Select.Option>
              <Select.Option value="En revisión">En revisión</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="direccion"
            label="Dirección"
            rules={[{ required: true, message: 'Por favor ingresa la dirección' }]}
          >
            <TextArea 
              placeholder="Ingresa la dirección completa" 
              rows={2} 
              maxLength={300}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para ver dirección existente */}
      <Modal
        title="Dirección"
        open={isViewDireccionModalVisible}
        onCancel={handleViewDireccionModalCancel}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '8px', fontWeight: 600 }}>Dirección</h4>
          <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.65)' }}>
            {selectedPCTL?.direccion || 'Sin dirección'}
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontWeight: 600 }}>Coordenadas</h4>
          <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.65)' }}>
            {selectedPCTL?.coordenadas || 'Sin coordenadas disponible para mostrar'}
          </p>
        </div>
      </Modal>

      {/* Modal para agregar/editar dirección */}
      <Modal
        title="Dirección"
        open={isDireccionModalVisible}
        onOk={handleDireccionModalOk}
        onCancel={handleDireccionModalCancel}
        okText="Guarda dirección"
        cancelText="Cancelar"
        width={600}
        okButtonProps={{ style: { backgroundColor: '#ff5722' } }}
      >
        <Form
          form={direccionForm}
          layout="vertical"
          name="form_direccion"
        >
          <p style={{ marginBottom: '16px', color: 'rgba(0, 0, 0, 0.65)' }}>
            Porfavor indicanos la dirección del PCTL
          </p>
          <Form.Item
            name="direccion"
            rules={[
              { required: true, message: 'Por favor ingresa la dirección' },
            ]}
          >
            <TextArea 
              placeholder="Escribe la dirección del PCTL, también puedes añadir referencias"
              rows={4}
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="coordenadas"
            label="Coordenadas geográficas (Opcional)"
          >
            <Input 
              placeholder="Escribe las coordenadas geográficas"
              maxLength={100}
            />
          </Form.Item>
          
          <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.65)' }}>
            Puedes consultar el dato desde{' '}
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#1890ff' }}
            >
              Google Maps
            </a>
          </p>
        </Form>
      </Modal>

      {/* Modal para ver notas de gestión */}
      <Modal
        title="Notas de Gestión"
        open={isNotasGestionModalVisible}
        onCancel={handleNotasGestionModalCancel}
        footer={[
          <Button key="close" onClick={handleNotasGestionModalCancel}>
            Cerrar
          </Button>,
        ]}
        width={700}
      >
        {selectedPCTL?.notasGestion && selectedPCTL.notasGestion.length > 0 ? (
          <List
            dataSource={selectedPCTL.notasGestion}
            renderItem={(nota) => (
              <List.Item key={nota.id}>
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>{nota.usuario}</span>
                      <span style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                        {humanizarFecha(nota.fecha, true)}
                      </span>
                    </div>
                  }
                  description={
                    <p style={{ margin: '8px 0 0 0', color: 'rgba(0, 0, 0, 0.65)' }}>
                      {nota.nota}
                    </p>
                  }
                />
              </List.Item>
            )}
            style={{ maxHeight: '400px', overflowY: 'auto' }}
          />
        ) : (
          <p style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)', padding: '40px 0' }}>
            No hay notas de gestión para este registro
          </p>
        )}
      </Modal>
    </div>
  );
};

export default PCTLList;
