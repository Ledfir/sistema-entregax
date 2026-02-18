import { useState, useEffect } from 'react';
import { Form, Input, Button, Spin } from 'antd';
import { operacionesService } from '@/services/operacionesService';
import Swal from 'sweetalert2';

export const ActualizarTCAumentoMaritimo = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = 'Sistema Entregax | Actualizar TC aumento marítimo';
    loadCurrentValues();
  }, []);

  const loadCurrentValues = async () => {
    try {
      setLoading(true);
      const data = await operacionesService.getAumentoMaritimo();
      
      form.setFieldsValue({
        aumento_tc: data.name,
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al cargar el valor actual',
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
        aumento_tc: values.aumento_tc,
      };
      
      const response = await operacionesService.updateAumentoMaritimo(data);
      
      // Mostrar mensaje del servidor
      const successMessage = response?.message || 'Aumento de TC actualizado correctamente';
      Swal.fire({
        icon: 'success',
        title: '',
        text: successMessage,
        showConfirmButton: false,
        timer: 3500
      });
      
      // Recargar los valores actualizados
      await loadCurrentValues();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || 'Error al actualizar el aumento de TC';
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
            Actualizar TC aumento marítimo
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
                label={
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    Aumento de pesos al valor del TC en CTZ marítimas al momento de crearse.
                  </span>
                }
                name="aumento_tc"
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
                  placeholder="1.2"
                />
              </Form.Item>

              <div style={{ 
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f9f9f9',
                borderRadius: '6px',
                border: '1px solid #e8e8e8'
              }}>
                <p style={{ 
                  margin: 0, 
                  color: '#666',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  lineHeight: '1.6'
                }}>
                  *El monto ingresado sera sumado al TC de la cotizacion. Ejemplo: "TC proporcionado por Banxico 17.5, aumento de 1.2, TC final en CTZ sera de 18.7"*
                </p>
              </div>

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
                    minWidth: '250px',
                    fontWeight: 600
                  }}
                >
                  Guardar aumento de TC
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActualizarTCAumentoMaritimo;
