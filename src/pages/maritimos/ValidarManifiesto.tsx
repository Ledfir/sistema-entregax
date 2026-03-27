import React, { useState } from 'react';
import { Card, Form, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import * as XLSX from 'xlsx';
import './ValidarManifiesto.css';

const ValidarManifiesto: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [excelData, setExcelData] = useState<any[]>([]);

  // Procesar archivo Excel
  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        setExcelData(jsonData);
        message.success('Archivo cargado correctamente');
      } catch (error) {
        message.error('Error al procesar el archivo Excel');
        console.error(error);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Configuración del Upload
  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.xlsx, .xls',
    maxCount: 1,
    fileList: fileList,
    beforeUpload: (file) => {
      const isExcel = 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';
      
      if (!isExcel) {
        message.error('Solo puedes subir archivos Excel (.xlsx, .xls)');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('El archivo debe ser menor a 10MB');
        return false;
      }

      handleFileChange(file);
      setFileList([file]);
      return false; // Prevenir upload automático
    },
    onRemove: () => {
      setFileList([]);
      setExcelData([]);
    },
  };

  // Validar manifiesto
  const handleValidar = async () => {
    if (fileList.length === 0) {
      message.warning('Por favor selecciona un archivo Excel');
      return;
    }

    if (excelData.length === 0) {
      message.warning('El archivo no contiene datos válidos');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implementar lógica de validación del manifiesto
      console.log('Datos a validar:', excelData);
      
      // Simulación de validación
      setTimeout(() => {
        setLoading(false);
        message.success(`Manifiesto validado correctamente. ${excelData.length} registros procesados`);
      }, 1500);
    } catch (error) {
      setLoading(false);
      message.error('Error al validar el manifiesto');
      console.error(error);
    }
  };

  return (
    <div className="validar-manifiesto-wrapper">
      <Card title="Validar manifiesto" className="validar-manifiesto-card">
        <Form
          form={form}
          layout="vertical"
          className="validar-manifiesto-form"
        >
          <Form.Item
            name="archivoManifiesto"
            label="Archivo del Manifiesto"
            rules={[{ required: true, message: 'Por favor carga el archivo Excel' }]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} size="large">
                Seleccionar archivo Excel
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              onClick={handleValidar}
              loading={loading}
              className="validar-btn"
            >
              Validar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ValidarManifiesto;
