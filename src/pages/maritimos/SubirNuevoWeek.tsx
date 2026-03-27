import React, { useState } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Table, message, Space, Upload } from 'antd';
import { UploadOutlined, ClearOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import * as XLSX from 'xlsx';
import './SubirNuevoWeek.css';

const { Option } = Select;

interface ExcelRow {
  [key: string]: any;
}

const SubirNuevoWeek: React.FC = () => {
  const [form] = Form.useForm();
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [excelColumns, setExcelColumns] = useState<any[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Procesar archivo Excel
  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length > 0) {
          // Generar columnas dinámicamente desde las keys del primer objeto
          const columns = Object.keys(jsonData[0]).map((key) => ({
            title: key,
            dataIndex: key,
            key: key,
            width: 150,
            ellipsis: true,
          }));

          setExcelColumns(columns);
          setExcelData(jsonData);
          message.success('Archivo cargado correctamente');
        } else {
          message.warning('El archivo Excel está vacío');
        }
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
      setExcelColumns([]);
    },
  };

  // Limpiar formulario y previsualización
  const handleLimpiar = () => {
    form.resetFields();
    setFileList([]);
    setExcelData([]);
    setExcelColumns([]);
    message.info('Formulario limpiado');
  };

  // Enviar week
  const handleSubirWeek = async () => {
    try {
      const values = await form.validateFields();
      
      if (excelData.length === 0) {
        message.warning('Debes cargar un archivo Excel');
        return;
      }

      // TODO: Implementar lógica de envío al backend
      console.log('Datos del formulario:', values);
      console.log('Datos del Excel:', excelData);
      
      message.success('Week subido exitosamente');
      handleLimpiar();
    } catch (error) {
      console.error('Error en validación:', error);
      message.error('Por favor completa todos los campos requeridos');
    }
  };

  return (
    <div className="subir-week-wrapper">
      <Card title="Subir nuevo BL" className="subir-week-card">
        <Form
          form={form}
          layout="vertical"
          className="subir-week-form"
        >
          <Form.Item
            name="bl"
            label="BL"
            rules={[{ required: true, message: 'Ingresa el número de BL' }]}
          >
            <Input placeholder="Ingresa el número de BL" />
          </Form.Item>

          <Form.Item
            name="week"
            label="Week"
            rules={[{ required: true, message: 'Ingresa el week' }]}
          >
            <Input placeholder="Ingresa el week" />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: 'Selecciona el tipo' }]}
          >
            <Select placeholder="Selecciona el tipo">
              <Option value="LCL - WEEK">LCL - WEEK</Option>
              <Option value="FCL - CONTENEDOR DEDICADO">FCL - CONTENEDOR DEDICADO</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="eta"
            label="ETA"
            rules={[{ required: true, message: 'Selecciona la fecha ETA' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Selecciona fecha ETA"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="archivoBL"
            label="Archivo BL"
            rules={[{ required: true, message: 'Carga el archivo Excel' }]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>
                Seleccionar archivo Excel
              </Button>
            </Upload>
          </Form.Item>
        </Form>

        <Space className="subir-week-buttons">
          <Button 
            type="primary" 
            onClick={handleSubirWeek}
            size="large"
          >
            Subir Week
          </Button>
          <Button 
            icon={<ClearOutlined />}
            onClick={handleLimpiar}
            size="large"
          >
            Limpiar
          </Button>
        </Space>

        {excelData.length > 0 && (
          <div className="excel-preview">
            <h3>Previsualización del archivo Excel</h3>
            <Table
              columns={excelColumns}
              dataSource={excelData.map((row, index) => ({ ...row, key: index }))}
              scroll={{ x: 'max-content', y: 400 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} registros`,
              }}
              bordered
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default SubirNuevoWeek;
