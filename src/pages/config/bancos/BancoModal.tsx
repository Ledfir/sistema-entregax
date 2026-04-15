import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { bancosService } from '@/services/bancosService';

interface BancoModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  banco?: {
    id: string | number;
    name: string;
    logo?: string;
    state?: string;
  } | null;
}

export const BancoModal: React.FC<BancoModalProps> = ({ open, onCancel, onSuccess, banco }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const isEditing = !!banco;

  useEffect(() => {
    if (open) {
      if (banco) {
        // Cargar datos del banco a editar
        setTimeout(() => {
          form.setFieldsValue({
            name: banco.name,
          });
          
          // Si tiene logo, mostrar en fileList
          if (banco.logo) {
            setFileList([
              {
                uid: '-1',
                name: 'logo.svg',
                status: 'done',
                url: banco.logo,
              },
            ]);
          } else {
            setFileList([]);
          }
        }, 50);
      } else {
        // Valores por defecto para nuevo banco
        form.resetFields();
        setFileList([]);
      }
    }
  }, [open, banco, form]);

  const beforeUpload = (file: File) => {
    const isSVG = file.type === 'image/svg+xml';
    if (!isSVG) {
      message.error('Solo se permiten archivos SVG');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('El archivo debe ser menor a 5MB');
      return Upload.LIST_IGNORE;
    }
    return false; // No subir automáticamente
  };

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1)); // Solo permitir un archivo
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Preparar datos para enviar
      const formData = new FormData();
      formData.append('name', values.name);
      
      // Si hay un archivo nuevo, agregarlo al FormData
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('logo', fileList[0].originFileObj);
      }
      
      if (isEditing && banco) {
        // Actualizar banco existente
        formData.append('id', String(banco.id));
        const response = await bancosService.update(banco.id, formData);
        
        if (response.status === 'success') {
          message.success(response.message || 'Banco actualizado correctamente');
          form.resetFields();
          setFileList([]);
          onSuccess();
          onCancel();
        } else {
          message.error(response.message || 'Error al actualizar el banco');
        }
      } else {
        // Crear nuevo banco
        const response = await bancosService.create(formData);
        
        if (response.status === 'success') {
          message.success(response.message || 'Banco creado correctamente');
          form.resetFields();
          setFileList([]);
          onSuccess();
          onCancel();
        } else {
          message.error(response.message || 'Error al crear el banco');
        }
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Error de validación de formulario
        return;
      }
      console.error('Error al guardar banco:', error);
      const errorMessage = error?.response?.data?.message || (isEditing ? 'Error al actualizar el banco' : 'Error al crear el banco');
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title={isEditing ? 'Editar Banco' : 'Nuevo Banco'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isEditing ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        name="bancoForm"
        preserve={false}
      >
        <Form.Item
          name="name"
          label="Nombre del Banco"
          rules={[
            { required: true, message: 'Por favor ingrese el nombre del banco' },
            { max: 200, message: 'El nombre no puede exceder 200 caracteres' },
          ]}
        >
          <Input placeholder="Nombre completo del banco" />
        </Form.Item>

        <Form.Item
          name="logo"
          label="Logo del Banco (SVG)"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleUploadChange}
            accept=".svg,image/svg+xml"
            maxCount={1}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Seleccionar archivo SVG</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};
