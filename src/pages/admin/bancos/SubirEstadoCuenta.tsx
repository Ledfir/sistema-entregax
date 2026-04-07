import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Select, Button, Input, Upload, DatePicker, message, InputNumber, Table } from 'antd';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import * as XLSX from 'xlsx';
import { cuentasService } from '@/services/cuentasService';
import './SubirEstadoCuenta.css';

const { Option } = Select;
const { TextArea } = Input;

interface Cuenta {
  id: number | string;
  name: string;
}

const SubirEstadoCuenta: React.FC = () => {
  const [formArchivo] = Form.useForm();
  const [formLinea] = Form.useForm();
  const [loadingCuentas, setLoadingCuentas] = useState(false);
  const [loadingArchivo, setLoadingArchivo] = useState(false);
  const [loadingLinea, setLoadingLinea] = useState(false);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [activeTab, setActiveTab] = useState('archivo');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Cargar cuentas al montar el componente
  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    try {
      setLoadingCuentas(true);
      const data = await cuentasService.list();
      setCuentas(data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      message.error(getErrorMessage(error));
    } finally {
      setLoadingCuentas(false);
    }
  };

  // Función para extraer mensaje de error del API
  const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Ha ocurrido un error inesperado';
  };

  const handleSubirArchivo = async (values: any) => {
    try {
      if (fileList.length === 0) {
        message.warning('Por favor seleccione un archivo');
        return;
      }

      setLoadingArchivo(true);

      const formData = new FormData();
      formData.append('cuenta', values.cuenta);
      formData.append('archivo', fileList[0].originFileObj as File);

      const response = await cuentasService.subirEstadoCuenta(formData);
      
      // Mostrar mensaje de éxito del API
      const successMessage = response?.message || 'Estado de cuenta subido exitosamente';
      message.success(successMessage);
      
      // Limpiar formulario y previsualización
      formArchivo.resetFields();
      setFileList([]);
      setPreviewData([]);
      setPreviewColumns([]);
      setPagination({ current: 1, pageSize: 10 });
    } catch (error) {
      console.error('Error al subir archivo:', error);
      message.error(getErrorMessage(error));
    } finally {
      setLoadingArchivo(false);
    }
  };

  const handleEnviarLinea = async (values: any) => {
    try {
      setLoadingLinea(true);

      const payload = {
        cuenta: values.cuenta,
        cantidad: values.cantidad,
        motivo: values.motivo,
        fecha: values.fecha.format('DD/MM/YYYY'),
      };

      const response = await cuentasService.saveLineaManual(payload);
      
      // Mostrar mensaje de éxito del API
      const successMessage = response?.message || 'Línea manual enviada exitosamente';
      message.success(successMessage);
      
      // Limpiar formulario
      formLinea.resetFields();
    } catch (error) {
      console.error('Error al enviar línea:', error);
      message.error(getErrorMessage(error));
    } finally {
      setLoadingLinea(false);
    }
  };

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList];
    // Limitar a un solo archivo
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);

    // Leer y previsualizar el archivo Excel
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const file = newFileList[0].originFileObj;
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Definir columnas para la previsualización
          const columns = [
            {
              title: 'Día',
              dataIndex: 'dia',
              key: 'dia',
              width: 100,
            },
            {
              title: 'Concepto/Referencia',
              dataIndex: 'concepto',
              key: 'concepto',
              width: 250,
            },
            {
              title: 'Cargo',
              dataIndex: 'cargo',
              key: 'cargo',
              width: 120,
              align: 'right' as const,
            },
            {
              title: 'Abono',
              dataIndex: 'abono',
              key: 'abono',
              width: 120,
              align: 'right' as const,
            },
            {
              title: 'Saldo',
              dataIndex: 'saldo',
              key: 'saldo',
              width: 120,
              align: 'right' as const,
            },
          ];

          // Mapear los datos (asumiendo que la primera fila son headers)
          const dataRows = (jsonData as any[]).slice(1).map((row: any[], index: number) => ({
            key: index,
            dia: row[0] || '',
            concepto: row[1] || '',
            cargo: row[2] || '',
            abono: row[3] || '',
            saldo: row[4] || '',
          }));

          setPreviewColumns(columns);
          setPreviewData(dataRows);
          setPagination({ current: 1, pageSize: 10 }); // Resetear paginación
        } catch (error) {
          console.error('Error al leer el archivo Excel:', error);
          message.error('Error al previsualizar el archivo');
          setPreviewData([]);
          setPreviewColumns([]);
          setPagination({ current: 1, pageSize: 10 });
        }
      };

      reader.readAsBinaryString(file);
    } else {
      // Limpiar previsualización si no hay archivo
      setPreviewData([]);
      setPreviewColumns([]);
      setPagination({ current: 1, pageSize: 10 });
    }
  };

  const beforeUpload = () => {
    // Prevenir el upload automático
    return false;
  };

  const tabItems = [
    {
      key: 'archivo',
      label: 'Archivo',
      children: (
        <div className="tab-content">
          <h3 className="form-title">Formulario para subir estado de cuenta</h3>
          <p className="form-subtitle">Seleccione una cuenta y archivo</p>

          <Form
            form={formArchivo}
            layout="vertical"
            onFinish={handleSubirArchivo}
            className="upload-form"
          >
            <Form.Item
              label="Cuenta"
              name="cuenta"
              rules={[{ required: true, message: 'Seleccione una cuenta' }]}
            >
              <Select 
                placeholder="Seleccione una cuenta"
                showSearch
                loading={loadingCuentas}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {cuentas.map((cuenta) => (
                  <Option key={cuenta.id} value={cuenta.id}>
                    {cuenta.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="upload-section">
              <p className="upload-label">Seleccione Estado de Cuenta</p>
              <Upload
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={beforeUpload}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>
                  Seleccionar archivo
                </Button>
              </Upload>
              {fileList.length === 0 && (
                <p className="no-file-text">Sin archivos seleccionados</p>
              )}
            </div>

            <Form.Item className="submit-section">
              <Button
                type="primary"
                htmlType="submit"
                icon={<UploadOutlined />}
                loading={loadingArchivo}
                size="large"
                className="submit-btn"
              >
                Subir EDO Cuenta
              </Button>
            </Form.Item>
          </Form>

          {/* Tabla de previsualización del archivo Excel */}
          {previewData.length > 0 && (
            <div className="preview-section">
              <h4 className="preview-title">Previsualización del archivo</h4>
              <Table
                columns={previewColumns}
                dataSource={previewData}
                pagination={{ 
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total) => `Total ${total} registros`,
                  onChange: (page, pageSize) => {
                    setPagination({ current: page, pageSize: pageSize || 10 });
                  },
                }}
                scroll={{ x: 'max-content' }}
                size="small"
                bordered
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'linea',
      label: 'Línea',
      children: (
        <div className="tab-content">
          <h3 className="form-title">Formulario para subir Línea Manual</h3>
          <p className="form-subtitle">Seleccione cuenta é Información</p>

          <Form
            form={formLinea}
            layout="vertical"
            onFinish={handleEnviarLinea}
            className="linea-form"
          >
            <div className="form-row-two">
              <Form.Item
                label="Cuenta"
                name="cuenta"
                rules={[{ required: true, message: 'Seleccione una cuenta' }]}
                className="form-item-half"
              >
                <Select 
                  placeholder="Seleccione una cuenta"
                  showSearch
                  loading={loadingCuentas}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {cuentas.map((cuenta) => (
                    <Option key={cuenta.id} value={cuenta.id}>
                      {cuenta.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Cantidad"
                name="cantidad"
                rules={[{ required: true, message: 'Ingrese la cantidad' }]}
                className="form-item-half"
                initialValue={0}
              >
                <InputNumber
                  placeholder="0.00"
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  precision={2}
                />
              </Form.Item>
            </div>

            <div className="form-row-two">
              <Form.Item
                label="Motivo"
                name="motivo"
                rules={[{ required: true, message: 'Ingrese el motivo' }]}
                className="form-item-half"
              >
                <TextArea
                  placeholder="Motivo"
                  rows={3}
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                label="Fecha En FORMATO DD/MM/YYYY"
                name="fecha"
                rules={[{ required: true, message: 'Seleccione la fecha' }]}
                className="form-item-half"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="dd/mm/aaaa"
                />
              </Form.Item>
            </div>

            <Form.Item className="submit-section">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loadingLinea}
                size="large"
                className="submit-btn"
              >
                Enviar línea
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <div className="subir-estado-cuenta-wrapper">
      <Card 
        title="Subir Estado de Cuenta" 
        className="subir-estado-cuenta-card"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

export default SubirEstadoCuenta;
