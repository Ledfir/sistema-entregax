import { useState, useEffect } from 'react';
import { Form, Input, Button, Spin, Modal } from 'antd';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { operacionesService } from '@/services/operacionesService';
import Swal from 'sweetalert2';

export const EditarGuiaDHL = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waybillData, setWaybillData] = useState<any>(null);
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();

  useEffect(() => {
    document.title = 'Sistema Entregax | Editar guía DHL';
  }, []);

  const formatDateToSpanish = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  const handleSearch = async (values: any) => {
    try {
      setLoading(true);
      
      const data = {
        guia: values.guia,
      };
      
      const response = await operacionesService.searchDHLWaybill(data);
      
      if (response.status === 'success' && response.data) {
        setWaybillData(response.data);
        modalForm.setFieldsValue({
          guia_ingreso: response.data.guiaingreso || '',
          guia_unica: response.data.guiaunica || '',
        });
        setIsModalOpen(true);
      }
      
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || 'Error al buscar la guía';
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

  const handleUpdate = async () => {
    try {
      const values = await modalForm.validateFields();
      setLoading(true);
      
      const data = {
        id: waybillData.id,
        guia_ingreso: values.guia_ingreso,
        guia_unica: values.guia_unica,
      };
      
      const response = await operacionesService.updateDHLWaybill(data);
      
      Swal.fire({
        icon: 'success',
        title: '',
        text: response.message || 'Guía actualizada correctamente',
        showConfirmButton: false,
        timer: 3500
      });
      
      setIsModalOpen(false);
      form.resetFields();
      
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || 'Error al actualizar la guía';
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

  const handleCancel = () => {
    setIsModalOpen(false);
    modalForm.resetFields();
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
            Editar guía DHL
          </h1>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ padding: '32px' }}>
            <p style={{ 
              marginBottom: '24px', 
              fontSize: '14px',
              color: '#666'
            }}>
              Ingrese la guía de ingreso o la guía única.
            </p>

            <Form
              form={form}
              onFinish={handleSearch}
              layout="vertical"
            >
              <Form.Item
                name="guia"
                rules={[
                  { required: true, message: 'Por favor ingrese la guía' },
                ]}
              >
                <Input 
                  placeholder="..." 
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  size="large"
                  style={{ 
                    backgroundColor: '#333',
                    borderColor: '#333',
                    minWidth: '120px'
                  }}
                >
                  Buscar
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>

      <Modal
        title="Editar guía DHL"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form 
          form={modalForm} 
          layout="vertical"
          onFinish={handleUpdate}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="guia_ingreso"
            label="Guía Ingreso"
            rules={[{ required: true, message: 'Por favor ingrese la guía de ingreso' }]}
          >
            <Input 
              placeholder="Guía de ingreso"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="guia_unica"
            label="Guía Única"
            rules={[{ required: true, message: 'Por favor ingrese la guía única' }]}
          >
            <Input 
              placeholder="Guía única"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="SUITE"
          >
            <Input
              value={waybillData?.suite || '-'}
              disabled
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Quien ingresó"
          >
            <Input
              value={waybillData?.quien_ingreso || '-'}
              disabled
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Fecha de ingreso"
          >
            <Input
              value={formatDateToSpanish(waybillData?.created)}
              disabled
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button 
              style={{ marginRight: '8px' }}
              onClick={handleCancel}
              size="large"
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SyncOutlined />}
              loading={loading}
              size="large"
              style={{
                backgroundColor: '#ff6600',
                borderColor: '#ff6600',
              }}
            >
              Actualizar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EditarGuiaDHL;
