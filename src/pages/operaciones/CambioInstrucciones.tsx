import { useState, useEffect } from 'react';
import { Form, Input, Button, Spin, Select } from 'antd';
import { BarcodeOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';

const BUSCAR_POR_OPTIONS = [
  { label: 'Guia', value: 'guia' },
  { label: 'CTZ', value: 'ctz' },
  { label: 'LOG', value: 'log' },
];

const TIPO_OPTIONS = [
  { label: 'Maritimo', value: '1' },
  { label: 'TDI - USA - DHL', value: '2' },
];

export const CambioInstrucciones = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = 'Sistema Entregax | Cambio de Instrucciones';
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      console.log('Datos a buscar:', values);
      
      // TODO: Aquí irá la llamada al servicio para buscar la guía/CTZ
      // const response = await operacionesService.buscarInstrucciones(values);
      
      // Por ahora solo mostramos un mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: '',
        text: 'Búsqueda realizada correctamente',
        showConfirmButton: false,
        timer: 3500
      });
      
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || 'Error al buscar la información';
      Swal.fire({
        icon: 'error',
        title: '',
        text: errorMessage,
        showConfirmButton: false,
        timer: 3500
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          backgroundColor: '#4a4a4a', 
          color: 'white',
          padding: '24px',
        }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Cambio de Instrucciones
          </h1>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ padding: '32px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              initialValues={{
                buscar_por: 'guia',
                tipo: 'maritimo'
              }}
            >
              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 600 }}>CTZ o Guia</span>}
                name="ctz_guia"
                rules={[
                  { required: true, message: 'Este campo es requerido' }
                ]}
              >
                <Input 
                  prefix={<BarcodeOutlined style={{ color: '#999', fontSize: '18px' }} />}
                  style={{ fontSize: '16px', padding: '10px' }}
                  placeholder="Ingrese CTZ o Guía"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 600 }}>Buscar por</span>}
                name="buscar_por"
                rules={[
                  { required: true, message: 'Este campo es requerido' }
                ]}
              >
                <Select
                  style={{ fontSize: '16px' }}
                  placeholder="Seleccione una opción"
                  options={BUSCAR_POR_OPTIONS}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 600 }}>TIPO</span>}
                name="tipo"
                rules={[
                  { required: true, message: 'Este campo es requerido' }
                ]}
              >
                <Select
                  style={{ fontSize: '16px' }}
                  placeholder="Seleccione el tipo"
                  options={TIPO_OPTIONS}
                />
              </Form.Item>

              <Form.Item style={{ textAlign: 'center', marginTop: '30px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    backgroundColor: '#ff6600',
                    borderColor: '#ff6600',
                    fontSize: '18px',
                    height: '50px',
                    minWidth: '200px',
                    fontWeight: 600
                  }}
                >
                  Buscar
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CambioInstrucciones;
