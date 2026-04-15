import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { serviciosService } from '@/services/serviciosService';
import { cuentasService } from '@/services/cuentasService';

interface ServicioModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  servicio?: {
    id: string | number;
    token?: string;
    name: string;
    ctz_ini?: string;
    idcta: string;
    salida: string;
    com: string;
  } | null;
}

export const ServicioModal: React.FC<ServicioModalProps> = ({ open, onCancel, onSuccess, servicio }) => {
  const [form] = Form.useForm();
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [loadingCuentas, setLoadingCuentas] = useState(false);
  const isEditing = !!servicio;

  useEffect(() => {
    if (open) {
      cargarCuentas();
    }
  }, [open]);

  useEffect(() => {
    if (open && cuentas.length > 0) {
      if (servicio) {
        // Cargar datos del servicio a editar
        setTimeout(() => {
          form.setFieldsValue({
            name: servicio.name,
            ctz_ini: servicio.ctz_ini || '',
            idcta: servicio.idcta,
            salida: servicio.salida === '1',
            com: servicio.com,
          });
        }, 100);
      } else {
        // Valores por defecto para nuevo servicio
        form.setFieldsValue({
          salida: false,
        });
      }
    }
  }, [open, servicio, cuentas, form]);

  const cargarCuentas = async () => {
    try {
      setLoadingCuentas(true);
      const response = await cuentasService.listCuentas();
      setCuentas(response);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      message.error('Error al cargar la lista de cuentas');
    } finally {
      setLoadingCuentas(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Convertir salida de boolean a string
      const dataToSend = {
        ...values,
        salida: values.salida ? '1' : '0',
      };
      
      if (isEditing && servicio) {
        // Actualizar servicio existente
        const response = await serviciosService.update(servicio.id, dataToSend);
        
        if (response.status === 'success') {
          message.success(response.message || 'Servicio actualizado correctamente');
          form.resetFields();
          onSuccess();
          onCancel();
        } else {
          message.error(response.message || 'Error al actualizar el servicio');
        }
      } else {
        // Crear nuevo servicio
        const response = await serviciosService.create(dataToSend);
        
        if (response.status === 'success') {
          message.success(response.message || 'Servicio creado correctamente');
          form.resetFields();
          onSuccess();
          onCancel();
        } else {
          message.error(response.message || 'Error al crear el servicio');
        }
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Error de validación de formulario
        return;
      }
      console.error('Error al guardar servicio:', error);
      const errorMessage = error?.response?.data?.message || (isEditing ? 'Error al actualizar el servicio' : 'Error al crear el servicio');
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isEditing ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        name="servicioForm"
        preserve={false}
      >
        <Form.Item
          name="name"
          label="Nombre"
          rules={[
            { required: true, message: 'Por favor ingrese el nombre del servicio' },
            { max: 200, message: 'El nombre no puede exceder 200 caracteres' },
          ]}
        >
          <Input placeholder="Nombre del servicio" />
        </Form.Item>

        <Form.Item
          name="ctz_ini"
          label="Inicio CTZ"
          rules={[
            { max: 50, message: 'El inicio CTZ no puede exceder 50 caracteres' },
          ]}
        >
          <Input placeholder="Inicio CTZ (opcional)" />
        </Form.Item>

        <Form.Item
          name="idcta"
          label="Cuenta"
          rules={[
            { required: true, message: 'Por favor seleccione una cuenta' },
          ]}
        >
          <Select
            placeholder="Seleccione una cuenta"
            loading={loadingCuentas}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={cuentas.map(cuenta => ({
              value: cuenta.id,
              label: cuenta.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="salida"
          label="¿Genera salida?"
          valuePropName="checked"
        >
          <Switch checkedChildren="Sí" unCheckedChildren="No" />
        </Form.Item>

        <Form.Item
          name="com"
          label="Comisión"
          rules={[
            { required: true, message: 'Por favor ingrese la comisión' },
            { max: 20, message: 'La comisión no puede exceder 20 caracteres' },
          ]}
        >
          <Input placeholder="Ej: 15% o 0.15" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
