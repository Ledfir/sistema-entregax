import { useState, useEffect } from 'react';
import { Form, Input, Button, Spin, Select } from 'antd';
import { operacionesService } from '@/services/operacionesService';
import Swal from 'sweetalert2';

const { TextArea } = Input;

// Tipos de costo predefinidos
const TIPOS_COSTO = [
  { label: 'Costo POR kilos ej. 13.5', value: 1 },
  { label: 'T.C.', value: 2 },
  { label: 'Costo NETO USD EJ. 200 TDI - USA', value: 3 },
];

export const ActualizarTCCosto = () => {
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = 'Sistema Entregax | Cambio de Costo / T.C.';
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Cargar usuarios (advisors)
      const usuariosData = await operacionesService.listAdvisors();
      setUsuarios(usuariosData);
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al cargar los datos iniciales',
        showConfirmButton: false,
        timer: 3500
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const data = {
        guias: values.guias,
        costo: values.costo,
        tipo: values.tipo,
        usuario: values.usuario,
      };
      
      const response = await operacionesService.updateTCCosto(data);
      
      // Mostrar mensaje del servidor
      const successMessage = response?.message || 'Cambio de costo/TC actualizado correctamente';
      Swal.fire({
        icon: 'success',
        title: '',
        text: successMessage,
        showConfirmButton: false,
        timer: 3500
      });
      
      // Limpiar el formulario después de enviar
      form.resetFields();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || 'Error al actualizar el costo/TC';
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
            Cambio de Costo / T.C.
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
            >
              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 600 }}>Guías</span>}
                name="guias"
                rules={[
                  { required: true, message: 'Este campo es requerido' }
                ]}
              >
                <TextArea
                  rows={6}
                  style={{ 
                    fontSize: '14px',
                    borderColor: '#ff8c42',
                    borderWidth: '2px'
                  }}
                  placeholder="Ej. TDI-4-TRN8278287723 o TRN-5-88377827872"
                />
              </Form.Item>

              <div style={{ 
                fontSize: '13px', 
                color: '#666',
                marginTop: '-16px',
                marginBottom: '24px'
              }}>
                Ej. TDI-4-TRN8278287723 o TRN-5-88377827872
              </div>

              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 600 }}>Costo</span>}
                name="costo"
                rules={[
                  { required: true, message: 'Este campo es requerido' },
                  { 
                    pattern: /^\d+(\.\d{1,2})?$/, 
                    message: 'Ingrese un número válido' 
                  }
                ]}
              >
                <Input 
                  type="number" 
                  step="0.01"
                  style={{ fontSize: '16px', padding: '10px' }}
                  placeholder="Ingrese el costo"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 600 }}>Tipo</span>}
                name="tipo"
                rules={[
                  { required: true, message: 'Este campo es requerido' }
                ]}
              >
                <Select
                  style={{ fontSize: '16px' }}
                  placeholder="Seleccione el tipo de costo"
                  options={TIPOS_COSTO}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 600 }}>Usuario</span>}
                name="usuario"
                rules={[
                  { required: true, message: 'Este campo es requerido' }
                ]}
              >
                <Select
                  style={{ fontSize: '16px' }}
                  placeholder="Seleccione un usuario"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={usuarios.map(usuario => ({
                    label: usuario.name,
                    value: usuario.id
                  }))}
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
                  Actualizar 
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActualizarTCCosto;
