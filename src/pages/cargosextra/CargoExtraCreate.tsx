import { useState } from 'react';
import { Form, Input, Button, Select, Card, Table, Checkbox, Upload } from 'antd';
import { useNavigate } from 'react-router-dom';
import cargoExtraService from '../../services/cargoExtraService';
import Swal from 'sweetalert2';
import { FaSave, FaTrash, FaPlus } from 'react-icons/fa';
import './CargoExtra.css';

const { Option } = Select;

interface Concepto {
  key: string;
  concepto: string;
  monto: string;
}

export const CargoExtraCreate = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [conceptoInput, setConceptoInput] = useState('');
  const [montoInput, setMontoInput] = useState('');
  const [subirArchivo, setSubirArchivo] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const navigate = useNavigate();

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
    setSubirArchivo(false);
    setFileList([]);
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

    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append('cliente', values.cliente ?? '');
      formData.append('cuenta', values.cuenta ?? '');
      formData.append('conceptos', JSON.stringify(conceptos));
      
      if (subirArchivo && fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('archivo', fileList[0].originFileObj);
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
            rules={[{ required: true, message: 'Favor de ingresar el cliente.' }]}
          >
            <Input placeholder="Favor de ingresar el cliente." />
          </Form.Item>

          <Form.Item 
            label="Cuenta:" 
            name="cuenta"
            rules={[{ required: true, message: 'Favor de seleccionar una opción.' }]}
          >
            <Select placeholder="Favor de seleccionar una opción.">
              <Option value="cuenta1">Cuenta 1</Option>
              <Option value="cuenta2">Cuenta 2</Option>
              <Option value="cuenta3">Cuenta 3</Option>
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
            <h4>Archivo</h4>
            <Checkbox 
              checked={subirArchivo}
              onChange={(e) => setSubirArchivo(e.target.checked)}
            >
              subir archivo
            </Checkbox>

            {subirArchivo && (
              <div style={{ marginTop: 16 }}>
                <Upload
                  fileList={fileList}
                  beforeUpload={(file) => {
                    setFileList([file]);
                    return false;
                  }}
                  onRemove={() => {
                    setFileList([]);
                  }}
                  maxCount={1}
                >
                  <Button>Seleccionar archivo</Button>
                </Upload>
                {fileList.length === 0 && (
                  <span style={{ marginLeft: 12, color: '#999' }}>
                    Sin archivos seleccionados
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="form-actions">
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
