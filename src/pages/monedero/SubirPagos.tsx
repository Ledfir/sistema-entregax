import { useState } from 'react';
import { Card, Form, InputNumber, Select, DatePicker, Upload, Button, Alert, message, Row, Col, Typography } from 'antd';
import { UploadOutlined, SaveOutlined, DeleteOutlined, FileTextOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

interface FormValues {
  monto: number;
  cuenta: string;
  fechaPago: any;
  cliente: string;
  requireFactura: string;
  tipo: string;
  bancoProveniente: string;
  datosFiscales?: string;
  usoCfdi?: string;
}

export const SubirPagos = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | ''>('');
  const [loading, setLoading] = useState(false);
  const [mostrarCamposFiscales, setMostrarCamposFiscales] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    if (fileList.length === 0) {
      message.error('Debe seleccionar un comprobante de pago');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar llamada al API
      const formData = new FormData();
      formData.append('monto', values.monto.toString());
      formData.append('cuenta', values.cuenta);
      formData.append('fechaPago', values.fechaPago.format('YYYY-MM-DD'));
      formData.append('cliente', values.cliente);
      formData.append('requireFactura', values.requireFactura);
      formData.append('tipo', values.tipo);
      formData.append('bancoProveniente', values.bancoProveniente);
      
      if (fileList[0]?.originFileObj) {
        formData.append('comprobante', fileList[0].originFileObj);
      }

      // await monederoService.uploadPayment(formData);

      message.success('Pago subido correctamente');
      handleLimpiar();
    } catch (error) {
      console.error('Error al subir pago:', error);
      message.error('Error al subir el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    form.resetFields();
    setFileList([]);
    setPreviewImage('');
    setPreviewType('');
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setPreviewImage('');
      setPreviewType('');
    },
    beforeUpload: (file: File) => {
      const isValidType = file.type === 'image/jpeg' || 
                         file.type === 'image/png' || 
                         file.type === 'image/jpg' ||
                         file.type === 'application/pdf';
      
      if (!isValidType) {
        message.error('Solo se permiten archivos JPG, PNG o PDF');
        return false;
      }

      const isLt10M = (file.size || 0) / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('El archivo debe ser menor a 10MB');
        return false;
      }

      // Crear el UploadFile object
      const uploadFile: UploadFile = {
        uid: Date.now().toString(),
        name: file.name,
        status: 'done',
        originFileObj: file as any,
      };
      
      setFileList([uploadFile]);
      
      // Generar vista previa
      const reader = new FileReader();
      
      if (file.type?.startsWith('image/')) {
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
          setPreviewType('image');
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setPreviewImage(file.name);
        setPreviewType('pdf');
      }
      
      return false;
    },
    fileList,
    showUploadList: false,
  };

  // Datos de ejemplo para los selects
  const cuentasOptions = [
    { value: 'bbva', label: 'BBVA BANCOMER' },
    { value: 'santander', label: 'SANTANDER' },
    { value: 'hsbc', label: 'HSBC' },
    { value: 'banamex', label: 'BANAMEX' }
  ];

  const clientesOptions = [
    { value: 'S2528', label: 'S2528 - ACME Corporation' },
    { value: 'C1520', label: 'C1520 - Tech Solutions SA' },
    { value: 'D2340', label: 'D2340 - Global Imports' }
  ];

  const requireFacturaOptions = [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' }
  ];

  const tipoOptions = [
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'deposito', label: 'Depósito' },
    { value: 'cheque', label: 'Cheque' }
  ];

  const bancosOptions = [
    { value: 'bbva', label: 'BBVA' },
    { value: 'santander', label: 'Santander' },
    { value: 'hsbc', label: 'HSBC' },
    { value: 'banamex', label: 'Banamex' },
    { value: 'scotiabank', label: 'Scotiabank' },
    { value: 'banorte', label: 'Banorte' }
  ];

  const datosFiscalesOptions = [
    { value: 'datos1', label: 'RFC123456789 - Empresa SA de CV' },
    { value: 'datos2', label: 'RFC987654321 - Comercio XYZ' },
    { value: 'datos3', label: 'RFC456789123 - Servicios ABC' }
  ];

  const usoCfdiOptions = [
    { value: 'G01', label: 'G01 - Adquisición de mercancías' },
    { value: 'G03', label: 'G03 - Gastos en general' },
    { value: 'P01', label: 'P01 - Por definir' },
    { value: 'D01', label: 'D01 - Honorarios médicos, dentales y gastos hospitalarios' },
    { value: 'S01', label: 'S01 - Sin efectos fiscales' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Subir pago" bordered={false}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Title level={4} style={{ textAlign: 'center', color: '#5b5fc7', marginBottom: '8px' }}>
            Formulario para subir pago
          </Title>
          <p style={{ textAlign: 'center', color: '#5b5fc7', marginBottom: '24px' }}>
            (Todos los campos son obligatorios)
          </p>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Alert
              message="Escriba monto exacto con centavos de su comprobante de pago"
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            <Form.Item
              name="monto"
              rules={[{ required: true, message: 'El monto es obligatorio' }]}
            >
              <InputNumber
                prefix="$"
                placeholder="0.00"
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                precision={2}
                controls={false}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Cuenta"
                  name="cuenta"
                  rules={[{ required: true, message: 'Seleccione una cuenta' }]}
                >
                  <Select
                    placeholder="Selecciona una opción"
                    options={cuentasOptions}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Fecha de pago del ticket"
                  name="fechaPago"
                  rules={[{ required: true, message: 'Seleccione una fecha' }]}
                  initialValue={dayjs()}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="MMMM D, YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Cliente:"
              name="cliente"
              rules={[{ required: true, message: 'Seleccione un cliente' }]}
            >
              <Select
                placeholder="Favor de seleccionar una opción."
                options={clientesOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Title level={5} style={{ color: '#5b5fc7', marginTop: '24px', marginBottom: '16px' }}>
              Datos de facturación
            </Title>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="¿Require factura?"
                  name="requireFactura"
                  rules={[{ required: true, message: 'Seleccione una opción' }]}
                >
                  <Select
                    placeholder="Selecciona una opción"
                    options={requireFacturaOptions}
                    onChange={(value) => {
                      setMostrarCamposFiscales(value === 'si');
                      if (value === 'no') {
                        form.setFieldsValue({
                          datosFiscales: undefined,
                          usoCfdi: undefined
                        });
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Tipo"
                  name="tipo"
                  rules={[{ required: true, message: 'Seleccione un tipo' }]}
                >
                  <Select
                    placeholder="Selecciona una opción"
                    options={tipoOptions}
                  />
                </Form.Item>
              </Col>
            </Row>

            {mostrarCamposFiscales && (
              <>
                <Form.Item
                  label="Datos fiscales:"
                  name="datosFiscales"
                  rules={[{ required: true, message: 'Seleccione datos fiscales' }]}
                >
                  <Select
                    placeholder="Selecciona una opción"
                    options={datosFiscalesOptions}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Alert
                  message="(En caso de estar el campo vacío favor de agregar datos fiscales y/o verificar la cédula fiscal para poder facturar)"
                  type="info"
                  showIcon={false}
                  style={{ marginBottom: '16px', fontSize: '12px' }}
                />

                <Form.Item
                  label="Uso de CFDI:"
                  name="usoCfdi"
                  rules={[{ required: true, message: 'Seleccione uso de CFDI' }]}
                >
                  <Select
                    placeholder="Selecciona una opción"
                    options={usoCfdiOptions}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </>
            )}

            <Form.Item
              label="Banco proveniente"
              name="bancoProveniente"
              rules={[{ required: true, message: 'Seleccione un banco' }]}
            >
              <Select
                placeholder="Selecciona una opción"
                options={bancosOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              label="Subir comprobante de pago (ticket):"
              required
            >
              <Upload {...uploadProps} maxCount={1}>
                <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
              </Upload>
              {fileList.length === 0 ? (
                <span style={{ marginLeft: '12px', color: '#999' }}>
                  Sin archivos seleccionados
                </span>
              ) : (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  border: '1px solid #d9d9d9', 
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}>
                  {previewType === 'image' && (
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={previewImage} 
                        alt="Vista previa" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px', 
                          display: 'block',
                          margin: '0 auto',
                          borderRadius: '4px'
                        }} 
                      />
                      <Button
                        type="text"
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => {
                          setFileList([]);
                          setPreviewImage('');
                          setPreviewType('');
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  )}
                  {previewType === 'pdf' && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileTextOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                            {previewImage}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            Documento PDF
                          </div>
                        </div>
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => {
                          setFileList([]);
                          setPreviewImage('');
                          setPreviewType('');
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Form.Item>

            <Form.Item style={{ marginTop: '32px' }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    block
                    size="large"
                  >
                    Subir pago
                  </Button>
                </Col>
                <Col xs={24} sm={12}>
                  <Button
                    htmlType="button"
                    icon={<DeleteOutlined />}
                    onClick={handleLimpiar}
                    block
                    size="large"
                    style={{ backgroundColor: '#ffc107', borderColor: '#ffc107', color: '#000' }}
                  >
                    Borrar pago
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};
