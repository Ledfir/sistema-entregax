import { useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, message, Row, Col, Upload } from 'antd';
import { SaveOutlined, CloseCircleOutlined, FileTextOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

interface FormValues {
  cliente: string;
  cantidadCajas: number;
  cbm: string;
  valorFactura: number;
  tipoRuta: string;
}

interface ArchivoState {
  fileList: UploadFile[];
  previewUrl: string;
  previewType: 'image' | 'pdf' | 'excel' | '';
}

export const GenerarPoliza = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const [facturaArchivo, setFacturaArchivo] = useState<ArchivoState>({
    fileList: [],
    previewUrl: '',
    previewType: ''
  });
  
  const [plArchivo, setPlArchivo] = useState<ArchivoState>({
    fileList: [],
    previewUrl: '',
    previewType: ''
  });

  const handleSubmit = async (values: FormValues) => {
    if (facturaArchivo.fileList.length === 0) {
      message.error('Debe cargar la factura');
      return;
    }
    
    if (plArchivo.fileList.length === 0) {
      message.error('Debe cargar el archivo PL');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar llamada al API
      const formData = new FormData();
      formData.append('cliente', values.cliente);
      formData.append('cantidadCajas', values.cantidadCajas.toString());
      formData.append('cbm', values.cbm);
      formData.append('valorFactura', values.valorFactura.toString());
      formData.append('tipoRuta', values.tipoRuta);
      
      if (facturaArchivo.fileList[0]?.originFileObj) {
        formData.append('factura', facturaArchivo.fileList[0].originFileObj);
      }
      
      if (plArchivo.fileList[0]?.originFileObj) {
        formData.append('archivoPL', plArchivo.fileList[0].originFileObj);
      }

      // await polizasService.createPoliza(formData);

      message.success('Póliza generada correctamente');
      handleLimpiar();
    } catch (error) {
      console.error('Error al generar póliza:', error);
      message.error('Error al generar la póliza');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    form.resetFields();
    setFacturaArchivo({ fileList: [], previewUrl: '', previewType: '' });
    setPlArchivo({ fileList: [], previewUrl: '', previewType: '' });
  };

  const createUploadProps = (
    archivo: ArchivoState,
    setArchivo: React.Dispatch<React.SetStateAction<ArchivoState>>
  ) => ({
    onRemove: () => {
      setArchivo({ fileList: [], previewUrl: '', previewType: '' });
    },
    beforeUpload: (file: File) => {
      const isValidType = file.type === 'image/jpeg' || 
                         file.type === 'image/png' || 
                         file.type === 'image/jpg' ||
                         file.type === 'application/pdf' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      if (!isValidType) {
        message.error('Solo se permiten archivos JPG, PNG, PDF o XLSX');
        return false;
      }

      const isLt10M = (file.size || 0) / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('El archivo debe ser menor a 10MB');
        return false;
      }

      const uploadFile: UploadFile = {
        uid: Date.now().toString(),
        name: file.name,
        status: 'done',
        originFileObj: file as any,
      };
      
      // Generar vista previa
      const reader = new FileReader();
      
      if (file.type?.startsWith('image/')) {
        reader.onload = (e) => {
          setArchivo({
            fileList: [uploadFile],
            previewUrl: e.target?.result as string,
            previewType: 'image'
          });
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setArchivo({
          fileList: [uploadFile],
          previewUrl: file.name,
          previewType: 'pdf'
        });
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setArchivo({
          fileList: [uploadFile],
          previewUrl: file.name,
          previewType: 'excel'
        });
      }
      
      return false;
    },
    fileList: archivo.fileList,
    showUploadList: false,
  });

  const renderPreview = (
    archivo: ArchivoState,
    setArchivo: React.Dispatch<React.SetStateAction<ArchivoState>>
  ) => {
    if (archivo.fileList.length === 0) {
      return (
        <span style={{ marginLeft: '12px', color: '#999', fontSize: '14px' }}>
          Buscar documento
        </span>
      );
    }

    return (
      <div style={{ 
        marginTop: '12px', 
        padding: '12px', 
        border: '1px solid #d9d9d9', 
        borderRadius: '8px',
        backgroundColor: '#fafafa'
      }}>
        {archivo.previewType === 'image' && (
          <div style={{ position: 'relative' }}>
            <img 
              src={archivo.previewUrl} 
              alt="Vista previa" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px', 
                display: 'block',
                margin: '0 auto',
                borderRadius: '4px'
              }} 
            />
            <Button
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setArchivo({ fileList: [], previewUrl: '', previewType: '' })}
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
        {archivo.previewType === 'pdf' && (
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
                  {archivo.previewUrl}
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
              onClick={() => setArchivo({ fileList: [], previewUrl: '', previewType: '' })}
            >
              Eliminar
            </Button>
          </div>
        )}
        {archivo.previewType === 'excel' && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileExcelOutlined style={{ fontSize: '48px', color: '#217346' }} />
              <div>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                  {archivo.previewUrl}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Archivo Excel
                </div>
              </div>
            </div>
            <Button
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setArchivo({ fileList: [], previewUrl: '', previewType: '' })}
            >
              Eliminar
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Datos de ejemplo para los selects
  const clientesOptions = [
    { value: 'S2528', label: 'S2528 - ACME Corporation' },
    { value: 'C1520', label: 'C1520 - Tech Solutions SA' },
    { value: 'D2340', label: 'D2340 - Global Imports' },
    { value: 'A1234', label: 'A1234 - Comercial XYZ' }
  ];

  const tipoRutaOptions = [
    { value: 'maritimo', label: 'Marítimo' },
    { value: 'aereo', label: 'Aéreo' },
    { value: 'terrestre', label: 'Terrestre' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Crear póliza de garantía extendida" bordered={false}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              label="CLIENTE:"
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

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="CANTIDAD DE CAJAS:"
                  name="cantidadCajas"
                  rules={[{ required: true, message: 'Ingrese la cantidad de cajas' }]}
                >
                  <InputNumber
                    placeholder="Cantidad de cajas"
                    style={{ width: '100%' }}
                    min={1}
                    precision={0}
                    controls={false}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="CBM:"
                  name="cbm"
                  rules={[{ required: true, message: 'Ingrese el CBM' }]}
                >
                  <Input
                    placeholder="Volumen/CBM"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="VALOR DE FACTURA (USD):"
                  name="valorFactura"
                  rules={[{ required: true, message: 'Ingrese el valor de la factura' }]}
                >
                  <InputNumber
                    placeholder="Valor de factura en dólares"
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                    precision={2}
                    controls={false}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="RUTA Tipo de ruta/servicio:"
                  name="tipoRuta"
                  rules={[{ required: true, message: 'Seleccione el tipo de ruta' }]}
                >
                  <Select
                    placeholder="Seleccione tipo de ruta"
                    options={tipoRutaOptions}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Cargar Factura:"
                  required
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Upload {...createUploadProps(facturaArchivo, setFacturaArchivo)} maxCount={1}>
                      <Button
                        style={{ 
                          minWidth: '100px',
                          backgroundColor: '#6c757d',
                          borderColor: '#6c757d',
                          color: 'white'
                        }}
                      >
                        Buscar
                      </Button>
                    </Upload>
                    {facturaArchivo.fileList.length === 0 && (
                      <span style={{ marginLeft: '12px', color: '#999', fontSize: '14px' }}>
                        Buscar documento
                      </span>
                    )}
                  </div>
                  {renderPreview(facturaArchivo, setFacturaArchivo)}
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Cargar Archivo PL"
                  required
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Upload {...createUploadProps(plArchivo, setPlArchivo)} maxCount={1}>
                      <Button
                        style={{ 
                          minWidth: '100px',
                          backgroundColor: '#6c757d',
                          borderColor: '#6c757d',
                          color: 'white'
                        }}
                      >
                        Buscar
                      </Button>
                    </Upload>
                    {plArchivo.fileList.length === 0 && (
                      <span style={{ marginLeft: '12px', color: '#999', fontSize: '14px' }}>
                        Buscar documento
                      </span>
                    )}
                  </div>
                  {renderPreview(plArchivo, setPlArchivo)}
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: '32px', textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
                style={{
                  minWidth: '200px',
                  backgroundColor: '#28a745',
                  borderColor: '#28a745'
                }}
              >
                Generar Póliza
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};
