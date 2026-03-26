import { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Select, 
  Input, 
  Button, 
  Table, 
  Upload, 
  Space, 
  message,
  Row,
  Col,
  Divider
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { 
  TeamOutlined, 
  TagOutlined, 
  CheckSquareOutlined, 
  GlobalOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import clienteService from '@/services/clienteService';
import ticketsService from '@/services/ticketsService';
import './Tickets.css';

const { TextArea } = Input;
const { Option } = Select;

interface Cliente {
  id: number;
  name: string;
  razon_social?: string;
}

interface Referencia {
  numero: string;
  referencia: string;
}

interface Evidencia {
  numero: number;
  nombre: string;
  extension: string;
  file?: File;
}

export const TicketCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [referenciaInput, setReferenciaInput] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    document.title = 'Crear Ticket de Soporte';
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const response = await clienteService.getAll();
      setClientes(response);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      message.error('Error al cargar la lista de clientes');
    }
  };

  const handleAgregarReferencia = () => {
    if (!referenciaInput.trim()) {
      message.warning('Ingrese una referencia válida');
      return;
    }

    const nuevaReferencia: Referencia = {
      numero: (referencias.length + 1).toString(),
      referencia: referenciaInput.trim(),
    };

    setReferencias([...referencias, nuevaReferencia]);
    setReferenciaInput('');
    message.success('Referencia agregada');
  };

  const handleEliminarReferencia = (numero: string) => {
    setReferencias(referencias.filter(ref => ref.numero !== numero));
    message.success('Referencia eliminada');
  };

  const beforeUpload = (file: File) => {
    const validExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'xls', 'xlsx', 'csv'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (!validExtensions.includes(fileExtension)) {
      message.error(`Formato no válido. Use: ${validExtensions.join(', ')}`);
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      message.error('El archivo no debe superar los 10MB');
      return false;
    }

    const nuevaEvidencia: Evidencia = {
      numero: evidencias.length + 1,
      nombre: file.name,
      extension: fileExtension,
      file: file,
    };

    setEvidencias([...evidencias, nuevaEvidencia]);
    message.success('Evidencia agregada');
    
    return false; // Prevent auto upload
  };

  const handleEliminarEvidencia = (numero: number) => {
    setEvidencias(evidencias.filter(ev => ev.numero !== numero));
    message.success('Evidencia eliminada');
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Validar que haya al menos una referencia
      if (referencias.length === 0) {
        message.warning('Debe agregar al menos una referencia');
        return;
      }

      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('cliente_id', values.cliente);
      formData.append('categoria', values.categoria);
      formData.append('requerimiento', values.requerimiento);
      formData.append('estado_pais', values.estado_pais);
      formData.append('descripcion', values.descripcion);
      formData.append('referencias', JSON.stringify(referencias));

      // Agregar archivos de evidencia
      evidencias.forEach((evidencia, index) => {
        if (evidencia.file) {
          formData.append(`evidencias[${index}]`, evidencia.file);
        }
      });

      const response = await ticketsService.crearTicket(formData);

      if (response.status === 'success') {
        message.success('Ticket creado exitosamente');
        handleResetear();
        navigate('/tickets/mis-tickets');
      } else {
        message.error(response.message || 'Error al crear el ticket');
      }
    } catch (error: any) {
      console.error('Error al crear ticket:', error);
      message.error('Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleResetear = () => {
    form.resetFields();
    setReferencias([]);
    setEvidencias([]);
    setReferenciaInput('');
    setFileList([]);
    message.info('Formulario reseteado');
  };

  const columnasReferencias = [
    {
      title: 'Número referencia',
      dataIndex: 'numero',
      key: 'numero',
      width: 150,
    },
    {
      title: 'Referencia anexada',
      dataIndex: 'referencia',
      key: 'referencia',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      render: (_: any, record: Referencia) => (
        <Button 
          type="link" 
          danger 
          onClick={() => handleEliminarReferencia(record.numero)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  const columnasEvidencias = [
    {
      title: 'Número evidencia',
      dataIndex: 'numero',
      key: 'numero',
      width: 150,
    },
    {
      title: 'Evidencia anexada',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Extensión evidencia',
      dataIndex: 'extension',
      key: 'extension',
      width: 150,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      render: (_: any, record: Evidencia) => (
        <Button 
          type="link" 
          danger 
          onClick={() => handleEliminarEvidencia(record.numero)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div className="tickets-container">
      <Card 
        className="tickets-card"
        title="Crear ticket de soporte"
      >
        <div style={{ 
          background: '#fff9f0', 
          border: '1px solid #ffd591',
          borderRadius: '4px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#d46b08' }}>
            ¿Estás experimentando dificultades con el sistema?
          </h3>
          <p style={{ margin: 0, color: '#8c5c1a' }}>
            Por favor, proporcione los detalles necesarios para crear un ticket de soporte y poder ayudarle de manera efectiva.
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="cliente"
                label={
                  <span>
                    <TeamOutlined style={{ marginRight: 8 }} />
                    Cliente comercial
                  </span>
                }
                rules={[{ required: true, message: 'Seleccione un cliente' }]}
              >
                <Select
                  showSearch
                  placeholder="Favor de seleccionar una opción"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={clientes.map(cliente => ({
                    value: cliente.id,
                    label: cliente.razon_social || cliente.name,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="requerimiento"
                label={
                  <span>
                    <CheckSquareOutlined style={{ marginRight: 8 }} />
                    Requerimiento
                  </span>
                }
                rules={[{ required: true, message: 'Seleccione un requerimiento' }]}
              >
                <Select placeholder="Selecciona una opción">
                  <Option value="urgente">Urgente</Option>
                  <Option value="alta">Alta</Option>
                  <Option value="media">Media</Option>
                  <Option value="baja">Baja</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="categoria"
                label={
                  <span>
                    <TagOutlined style={{ marginRight: 8 }} />
                    Categoría de soporte
                  </span>
                }
                rules={[{ required: true, message: 'Seleccione una categoría' }]}
              >
                <Select placeholder="Selecciona una opción">
                  <Option value="tecnico">Técnico</Option>
                  <Option value="operativo">Operativo</Option>
                  <Option value="administrativo">Administrativo</Option>
                  <Option value="comercial">Comercial</Option>
                  <Option value="otro">Otro</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="estado_pais"
                label={
                  <span>
                    <GlobalOutlined style={{ marginRight: 8 }} />
                    Estado o país
                  </span>
                }
                rules={[{ required: true, message: 'Seleccione un estado o país' }]}
              >
                <Select placeholder="Selecciona una opción">
                  <Option value="monterrey">Monterrey</Option>
                  <Option value="guadalajara">Guadalajara</Option>
                  <Option value="cdmx">Ciudad de México</Option>
                  <Option value="china">China</Option>
                  <Option value="usa">USA</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="descripcion"
            label={
              <span>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Descripción
              </span>
            }
            rules={[{ required: true, message: 'Ingrese una descripción del problema' }]}
          >
            <TextArea
              rows={4}
              placeholder="Detalle la información sobre el problema que estás experimentando (Oprime Alt + T)"
            />
          </Form.Item>

          <Divider orientation="left">Referencias</Divider>
          
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: '#666', marginBottom: 12 }}>
              Proporcione las referencias relacionadas con el ticket que estás generando, pueden ser guías de paquetería, 
              cotizaciones, códigos de envío, entre otros ejemplos.
            </p>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Escribe la referencia a anexar en ticket (Oprime Alt + R)"
                value={referenciaInput}
                onChange={(e) => setReferenciaInput(e.target.value)}
                onPressEnter={handleAgregarReferencia}
              />
              <Button 
                type="primary" 
                onClick={handleAgregarReferencia}
                style={{ background: '#f39915', borderColor: '#f39915' }}
              >
                Anexar
              </Button>
            </Space.Compact>
          </div>

          <Table
            columns={columnasReferencias}
            dataSource={referencias}
            rowKey="numero"
            locale={{ emptyText: 'Sin referencias anexadas.' }}
            pagination={false}
            style={{ marginBottom: 24 }}
          />

          <Divider orientation="left">Evidencias</Divider>

          <div style={{ marginBottom: 16 }}>
            <p style={{ color: '#666', marginBottom: 12 }}>
              Sube los archivos relacionados como evidencia del ticket, los consideraremos como archivos adjuntos. 
              Asegúrate de que estén en formato .jpg, .jpeg, .png, .pdf, .xls, .xlsx, o .csv.
            </p>
            <Upload
              beforeUpload={beforeUpload}
              fileList={fileList}
              showUploadList={false}
            >
              <Button icon={<FileTextOutlined />}>
                Seleccionar archivo
              </Button>
            </Upload>
            <span style={{ marginLeft: 12, color: '#999' }}>Sin archivos seleccionados</span>
          </div>

          <Table
            columns={columnasEvidencias}
            dataSource={evidencias}
            rowKey="numero"
            locale={{ emptyText: 'Sin referencias anexadas.' }}
            pagination={false}
            style={{ marginBottom: 24 }}
          />

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{ background: '#f39915', borderColor: '#f39915' }}
              >
                Generar ticket
              </Button>
              <Button onClick={handleResetear}>
                Resetear ticket
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
