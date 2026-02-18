import { useState, useEffect } from 'react';
import { Form, Input, Button, Spin } from 'antd';
import { operacionesService } from '@/services/operacionesService';
import Swal from 'sweetalert2';

export const ActualizarCostoKiloTC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = 'Sistema Entregax | Actualizar precio x kilo - Tipo de cambio';
    loadCurrentValues();
  }, []);

  const loadCurrentValues = async () => {
    try {
      setLoading(true);
      const data = await operacionesService.getTdi();
      
      form.setFieldsValue({
        costo_kilo_generico: data.generico,
        costo_kilo_logo: data.logo,
        tipo_cambio: data.tc,
        costo_kilo_tdi_dhl: data.tdidhl,
        tipo_cambio_tdi_dhl: data.tdidhltc,
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al cargar los valores actuales',
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
      
      // Mapear los campos del formulario al formato del backend
      const data = {
        generico: values.costo_kilo_generico,
        logo: values.costo_kilo_logo,
        tc: values.tipo_cambio,
        tdidhl: values.costo_kilo_tdi_dhl,
        tdidhltc: values.tipo_cambio_tdi_dhl,
      };
      
      const response = await operacionesService.updateTdi(data);
      
      // Mostrar mensaje del servidor
      const successMessage = response?.message || 'Valores actualizados correctamente';
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
      const errorMessage = error?.response?.data?.message || 'Error al actualizar los valores';
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
    <div className="clientes-container" style={{ padding: '24px' }}>
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
            Actualizar precio x kilo - Tipo de cambio
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
              label={<span style={{ fontSize: '16px', fontWeight: 600 }}>Costo x kilo GENERICO</span>}
              name="costo_kilo_generico"
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
                placeholder="15.6"
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontSize: '16px', fontWeight: 600 }}>Costo x kilo LOGO</span>}
              name="costo_kilo_logo"
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
                placeholder="16.6"
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontSize: '16px', fontWeight: 600 }}>Tipo de cambio</span>}
              name="tipo_cambio"
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
                placeholder="17.80"
              />
            </Form.Item>

            <div style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '20px', 
              marginBottom: '8px',
              marginTop: '24px',
              borderRadius: '6px',
              border: '1px solid #e8e8e8'
            }}>
              <p style={{ 
                margin: '0 0 20px 0', 
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                Los siguientes dos módulos de costos estarán inactivos hasta que se realice la autorización para el servicio TDI - DHL.
              </p>

              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 600 }}>Costo x kilo TDI - DHL</span>}
                name="costo_kilo_tdi_dhl"
                rules={[
                  { required: true, message: 'Este campo es requerido' },
                  { 
                    pattern: /^\d+(\.\d{1,2})?$/, 
                    message: 'Ingrese un número válido' 
                  }
                ]}
                style={{ marginBottom: '15px' }}
              >
                <Input 
                  type="number" 
                  step="0.01"
                  style={{ fontSize: '16px', padding: '10px' }}
                  placeholder="18.99"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 600 }}>Tipo de cambio TDI - DHL</span>}
                name="tipo_cambio_tdi_dhl"
                rules={[
                  { required: true, message: 'Este campo es requerido' },
                  { 
                    pattern: /^\d+(\.\d{1,2})?$/, 
                    message: 'Ingrese un número válido' 
                  }
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input 
                  type="number" 
                  step="0.01"
                  style={{ fontSize: '16px', padding: '10px' }}
                  placeholder="17.80"
                />
              </Form.Item>
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

export default ActualizarCostoKiloTC;
