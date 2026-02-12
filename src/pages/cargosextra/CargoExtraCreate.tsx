import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Table, Upload, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import cargoExtraService from '../../services/cargoExtraService';
import { clienteService } from '../../services/clienteService';
import Swal from 'sweetalert2';
import { FaSave, FaTrash, FaPlus } from 'react-icons/fa';
import { Document, Page, pdfjs } from 'react-pdf';
import './CargoExtra.css';

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const { Option } = Select;

interface Concepto {
  key: string;
  concepto: string;
  monto: string;
}

interface Cliente {
  token: string;
  nombre: string;
  clavecliente: string;
}

interface Cuenta {
  token: string;
  name: string;
}

export const CargoExtraCreate = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [conceptoInput, setConceptoInput] = useState('');
  const [montoInput, setMontoInput] = useState('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loadingCuentas, setLoadingCuentas] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const navigate = useNavigate();

  // Cargar clientes y cuentas al montar el componente
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoadingClientes(true);
        const data = await clienteService.getAll();
        setClientes(data);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los clientes',
          showConfirmButton: false,
          timer: 2500,
        });
      } finally {
        setLoadingClientes(false);
      }
    };

    const fetchCuentas = async () => {
      try {
        setLoadingCuentas(true);
        const data = await cargoExtraService.getCuentas();
        setCuentas(data);
      } catch (error) {
        console.error('Error al cargar cuentas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las cuentas',
          showConfirmButton: false,
          timer: 2500,
        });
      } finally {
        setLoadingCuentas(false);
      }
    };
    
    fetchClientes();
    fetchCuentas();
  }, []);


  const handleAddConcepto = () => {
    if (!conceptoInput.trim() || !montoInput.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '',
        text: 'Por favor completa concepto y monto',
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const newConcepto: Concepto = {
      key: Date.now().toString(),
      concepto: conceptoInput,
      monto: montoInput,
    };

    setConceptos([...conceptos, newConcepto]);
    setConceptoInput('');
    setMontoInput('');
  };

  const handleDeleteConcepto = (key: string) => {
    setConceptos(conceptos.filter(c => c.key !== key));
  };

  const handleBorrar = () => {
    form.resetFields();
    setConceptos([]);
    setConceptoInput('');
    setMontoInput('');
    setFileList([]);
    setPreviewUrl(null);
    setFileType(null);
  };

  const handleFileChange = (file: any) => {
    const fileObj = file;
    const type = fileObj.type;

    if (type.startsWith('image/')) {
      const url = URL.createObjectURL(fileObj);
      setPreviewUrl(url);
      setFileType('image');
    } else if (type === 'application/pdf') {
      const url = URL.createObjectURL(fileObj);
      setPreviewUrl(url);
      setFileType('pdf');
    } else {
      setPreviewUrl(null);
      setFileType(null);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onFinish = async (values: any) => {
    if (conceptos.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '',
        text: 'Debes agregar al menos un concepto',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (fileList.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '',
        text: 'Debes seleccionar un archivo',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    try {
      setSaving(true);
      
      // Obtener el ID del usuario de la sesión
      const authData = localStorage.getItem('auth-storage');
      let userId = '';
      if (authData) {
        const { state } = JSON.parse(authData);
        userId = state?.user?.id || state?.user?.user_id || '';
      }
      
      const formData = new FormData();
      formData.append('cliente', values.cliente ?? '');
      formData.append('cuenta', values.cuenta ?? '');
      formData.append('conceptos', JSON.stringify(conceptos));
      formData.append('user_id', userId);
      
      // Agregar archivo
      if (fileList.length > 0) {
        const file = fileList[0].originFileObj || fileList[0];
        formData.append('archivo', file);
      }

      const res = await cargoExtraService.create(formData);
      
      const ok = Boolean(
        res && (
          res.success === true ||
          String(res.status).toLowerCase() === 'success' ||
          res.ok === true
        )
      );

      if (ok) {
        Swal.fire({
          icon: 'success',
          title: '',
          text: res?.message ?? 'Cargo extra creado exitosamente',
          showConfirmButton: false,
          timer: 2500,
        });
        
        setTimeout(() => {
          navigate('/cargos-extras/lista');
        }, 1500);
      } else {
        const serverMsg = res?.message ?? res?.error ?? 'No se pudo crear el cargo extra';
        Swal.fire({
          icon: 'error',
          title: '',
          text: serverMsg,
          showConfirmButton: false,
          timer: 3500,
        });
      }
      
    } catch (e: any) {
      console.error(e);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al crear cargo extra',
        showConfirmButton: false,
        timer: 3500,
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      key: 'concepto',
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto: string) => `$${monto}`,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Concepto) => (
        <Button 
          type="link" 
          danger 
          onClick={() => handleDeleteConcepto(record.key)}
          icon={<FaTrash />}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span>CREAR CARGO EXTRA</span>
        </div>
      }
      style={{ maxWidth: 900, margin: '0 auto' }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="cargo-extra-form">
          <Form.Item 
            label="Cliente:" 
            name="cliente"
            rules={[{ required: true, message: 'Favor de seleccionar un cliente.' }]}
          >
            <Select 
              placeholder="Favor de seleccionar un cliente."
              showSearch
              loading={loadingClientes}
              notFoundContent={loadingClientes ? <Spin size="small" /> : 'No hay clientes'}
              filterOption={(input, option) => {
                const nombre = clientes.find(c => c.token === option?.value)?.nombre || '';
                const clave = clientes.find(c => c.token === option?.value)?.clavecliente || '';
                const searchText = `${nombre} ${clave}`.toLowerCase();
                return searchText.includes(input.toLowerCase());
              }}
            >
              {clientes.map((cliente) => (
                <Option key={cliente.token} value={cliente.token}>
                  {cliente.nombre} ({cliente.clavecliente})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label="Cuenta:" 
            name="cuenta"
            rules={[{ required: true, message: 'Favor de seleccionar una cuenta.' }]}
          >
            <Select 
              placeholder="Favor de seleccionar una cuenta."
              showSearch
              loading={loadingCuentas}
              notFoundContent={loadingCuentas ? <Spin size="small" /> : 'No hay cuentas'}
              filterOption={(input, option) => {
                const name = cuentas.find(c => c.token === option?.value)?.name || '';
                return name.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {cuentas.map((cuenta) => (
                <Option key={cuenta.token} value={cuenta.token}>
                  {cuenta.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <a 
              href="#conceptos" 
              style={{ color: '#1890ff', textDecoration: 'underline' }}
            >
              Favor de cargar lo cargos o conceptos(detalles)
            </a>
          </div>

          <div className="concepto-row">
            <div className="concepto-input">
              <label>💰 Concepto:</label>
              <Input 
                placeholder="....."
                value={conceptoInput}
                onChange={(e) => setConceptoInput(e.target.value)}
              />
            </div>
            <div className="monto-input">
              <label>$ Monto:</label>
              <Input 
                placeholder="...."
                value={montoInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  setMontoInput(value);
                }}
              />
            </div>
            <Button 
              type="primary" 
              onClick={handleAddConcepto}
              icon={<FaPlus />}
              className="add-concepto-btn"
            >
              Añadir
            </Button>
          </div>

          {conceptos.length > 0 && (
            <div style={{ marginTop: 16, marginBottom: 24 }}>
              <Table 
                columns={columns} 
                dataSource={conceptos} 
                pagination={false}
                size="small"
              />
              <div style={{ marginTop: 8, fontWeight: 'bold', textAlign: 'right' }}>
                Conceptos
              </div>
            </div>
          )}

          <div className="archivo-section">
            <h4>Archivo <span style={{ color: 'red' }}>*</span></h4>
            <div style={{ marginTop: 16 }}>
              <Upload
                fileList={fileList}
                beforeUpload={(file) => {
                  setFileList([file]);
                  handleFileChange(file);
                  return false;
                }}
                onRemove={() => {
                  setFileList([]);
                  setPreviewUrl(null);
                  setFileType(null);
                }}
                maxCount={1}
                accept="image/*,.pdf"
              >
                <Button>Seleccionar archivo</Button>
              </Upload>
              {fileList.length === 0 && (
                <span style={{ marginLeft: 12, color: '#999' }}>
                  Sin archivos seleccionados
                </span>
              )}

              {/* Previsualización de archivos */}
              {previewUrl && (
                <div style={{ marginTop: 16, border: '1px solid #d9d9d9', padding: 16, borderRadius: 8 }}>
                  <h4 style={{ marginBottom: 12 }}>Previsualización:</h4>
                  {fileType === 'image' && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }}
                    />
                  )}
                  {fileType === 'pdf' && (
                    <div style={{ maxHeight: 500, overflow: 'auto' }}>
                      <Document 
                        file={previewUrl} 
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<Spin />}
                      >
                        {Array.from(new Array(numPages), (_, index) => (
                          <Page 
                            key={`page_${index + 1}`} 
                            pageNumber={index + 1}
                            width={Math.min(window.innerWidth * 0.6, 600)}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                          />
                        ))}
                      </Document>
                      <p style={{ textAlign: 'center', marginTop: 8 }}>
                        Página(s): {numPages}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions" style={{alignContent: 'center', justifyContent: 'center', display: 'flex', gap: 16, marginTop: 24}}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving}
              icon={<FaSave />}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Guardar
            </Button>
            <Button 
              danger
              onClick={handleBorrar}
              icon={<FaTrash />}
            >
              Borrar
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default CargoExtraCreate;
