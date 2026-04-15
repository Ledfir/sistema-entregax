import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { cuentasService } from '@/services/cuentasService';

interface CuentaModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  cuenta?: {
    id: string | number;
    token?: string;
    name: string;
    banco: string;
    cuenta: string;
    clabe: string;
    tarjeta?: string;
    rfc?: string;
    corto: string;
  } | null;
}

export const CuentaModal: React.FC<CuentaModalProps> = ({ open, onCancel, onSuccess, cuenta }) => {
  const [form] = Form.useForm();
  const [bancos, setBancos] = useState<any[]>([]);
  const [loadingBancos, setLoadingBancos] = useState(false);
  const isEditing = !!cuenta;

  useEffect(() => {
    if (open) {
      cargarBancos();
    }
  }, [open]);

  useEffect(() => {
    if (open && bancos.length > 0) {
      if (cuenta) {
        // Esperar un momento para asegurar que el formulario esté listo
        setTimeout(() => {
          const valores = {
            name: cuenta.name,
            banco: cuenta.banco,
            cuenta: cuenta.cuenta,
            clabe: cuenta.clabe,
            tarjeta: cuenta.tarjeta || '',
            rfc: cuenta.rfc || '',
            corto: cuenta.corto,
          };
          form.setFieldsValue(valores);
        }, 100);
      } else {
        form.resetFields();
      }
    }
  }, [open, cuenta, bancos, form]);

  const cargarBancos = async () => {
    try {
      setLoadingBancos(true);
      const response = await cuentasService.listBanks();
      setBancos(response);
    } catch (error) {
      console.error('Error al cargar bancos:', error);
      message.error('Error al cargar la lista de bancos');
    } finally {
      setLoadingBancos(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEditing && cuenta) {
        // Actualizar cuenta existente
        const response = await cuentasService.update(cuenta.token!, values);
        
        if (response.status === 'success') {
          message.success(response.message || 'Cuenta actualizada correctamente');
          form.resetFields();
          onSuccess();
          onCancel();
        } else {
          message.error(response.message || 'Error al actualizar la cuenta');
        }
      } else {
        // Crear nueva cuenta
        const response = await cuentasService.create(values);
        
        if (response.status === 'success') {
          message.success(response.message || 'Cuenta creada correctamente');
          form.resetFields();
          onSuccess();
          onCancel();
        } else {
          message.error(response.message || 'Error al crear la cuenta');
        }
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Error de validación de formulario
        return;
      }
      console.error('Error al guardar cuenta:', error);
      const errorMessage = error?.response?.data?.message || (isEditing ? 'Error al actualizar la cuenta' : 'Error al crear la cuenta');
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEditing ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
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
        name="cuentaForm"
        preserve={false}
      >
        <Form.Item
          name="name"
          label="Beneficiario"
          rules={[
            { required: true, message: 'Por favor ingrese el beneficiario' },
            { max: 200, message: 'El beneficiario no puede exceder 200 caracteres' },
          ]}
        >
          <Input placeholder="Nombre completo del beneficiario" />
        </Form.Item>

        <Form.Item
          name="banco"
          label="Banco"
          rules={[
            { required: true, message: 'Por favor seleccione el banco' },
          ]}
        >
          <Select
            placeholder="Seleccione un banco"
            loading={loadingBancos}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={bancos.map(banco => ({
              value: banco.name,
              label: banco.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="cuenta"
          label="Número de Cuenta"
          rules={[
            { required: true, message: 'Por favor ingrese el número de cuenta' },
            { pattern: /^[0-9]{10,18}$/, message: 'El número de cuenta debe tener entre 10 y 18 dígitos' },
          ]}
        >
          <Input placeholder="Número de cuenta bancaria" maxLength={18} />
        </Form.Item>

        <Form.Item
          name="clabe"
          label="CLABE Interbancaria"
          rules={[
            { required: true, message: 'Por favor ingrese la CLABE' },
            { pattern: /^[0-9]{18}$/, message: 'La CLABE debe tener exactamente 18 dígitos' },
          ]}
        >
          <Input placeholder="CLABE de 18 dígitos" maxLength={18} />
        </Form.Item>

        <Form.Item
          name="tarjeta"
          label="Tarjeta"
          rules={[
            { pattern: /^[0-9]{0,16}$/, message: 'La tarjeta debe contener solo dígitos (máximo 16)' },
          ]}
        >
          <Input placeholder="Número de tarjeta (opcional)" maxLength={16} />
        </Form.Item>

        <Form.Item
          name="rfc"
          label="RFC"
          rules={[
            { pattern: /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, message: 'Formato de RFC inválido' },
            { max: 13, message: 'El RFC no puede exceder 13 caracteres' },
          ]}
        >
          <Input placeholder="RFC (opcional)" maxLength={13} style={{ textTransform: 'uppercase' }} />
        </Form.Item>

        <Form.Item
          name="corto"
          label="Nombre Corto"
          rules={[
            { required: true, message: 'Por favor ingrese un nombre corto' },
            { max: 100, message: 'El nombre corto no puede exceder 100 caracteres' },
          ]}
        >
          <Input placeholder="Nombre corto para identificación rápida" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CuentaModal;
