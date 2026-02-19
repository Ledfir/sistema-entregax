import { useState, useEffect } from 'react';
import { Button, Spin, Input, Modal, Form } from 'antd';
import { EditOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import { operacionesService } from '@/services/operacionesService';
import Swal from 'sweetalert2';
import './Descuentos.css';

export const OperacionMaritima = () => {
  const [loading, setLoading] = useState(false);
  const [operaciones, setOperaciones] = useState<any[]>([]);
  const [filteredOperaciones, setFilteredOperaciones] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOperacion, setSelectedOperacion] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = 'Sistema Entregax | Operación Marítima';
    loadOperaciones();
  }, []);

  const loadOperaciones = async () => {
    try {
      setLoading(true);
      const data = await operacionesService.getMaritimeQuotes();
      
      // Parsear los números que vienen como strings
      const parsedData = data.map((item: any) => ({
        ...item,
        costo: parseFloat(item.costo) || 0,
        tc: parseFloat(item.tc) || 0,
        costopaq: parseFloat(item.costopaq) || 0,
        total: parseFloat(item.total) || 0
      }));
      
      setOperaciones(parsedData);
      setFilteredOperaciones(parsedData);
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al cargar las operaciones marítimas',
        showConfirmButton: false,
        timer: 3500
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOperaciones(operaciones);
    } else {
      const needle = searchTerm.toLowerCase();
      const filtered = operaciones.filter((op) => 
        String(op.ctz ?? '').toLowerCase().includes(needle) ||
        String(op.suite ?? '').toLowerCase().includes(needle)
      );
      setFilteredOperaciones(filtered);
    }
    setPage(1);
  }, [searchTerm, operaciones]);

  const handleEdit = (operacion: any) => {
    setSelectedOperacion(operacion);
    form.setFieldsValue({
      ctz: operacion.ctz,
      costo: operacion.costo,
      tc: operacion.tc,
      costopaq: operacion.costopaq
    });
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedOperacion(null);
    form.resetFields();
  };

  const handleModalSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const response = await operacionesService.updateMaritimeQuote({
        token: selectedOperacion.token,
        costo: values.costo,
        tc: values.tc,
        costopaq: values.costopaq
      });

      const isSuccess = response?.status === 'success';
      const message = response?.message || (isSuccess ? 'Operación actualizada correctamente' : 'Error al actualizar la operación');

      setIsModalVisible(false);
      setSelectedOperacion(null);
      form.resetFields();

      if (isSuccess) {
        await loadOperaciones();
      }

      Swal.fire({
        icon: isSuccess ? 'success' : 'error',
        title: '',
        text: message,
        showConfirmButton: false,
        timer: 3500
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || 'Error al actualizar la operación';
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

  // Calcular datos paginados
  const totalRecords = filteredOperaciones.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = filteredOperaciones.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalRecords / pageSize);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        maxWidth: '1400px', 
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
            Opciones de la tabla marítimo
          </h1>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            {/* Búsqueda */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center',
              marginBottom: '20px',
              gap: '8px'
            }}>
              <span style={{ fontWeight: 500, color: '#666' }}>Buscar:</span>
              <Input
                placeholder="Buscar por CTZ o SUITE..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '300px' }}
                size="large"
              />
            </div>

            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>CTZ</th>
                    <th>SUITE</th>
                    <th>COSTO</th>
                    <th>COSTO PAQ</th>
                    <th>TC</th>
                    <th>TOTAL</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No hay registros para mostrar
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((operacion) => (
                      <tr key={operacion.token}>
                        <td style={{ padding: '12px 16px', color: '#333' }}>
                          {operacion.ctz}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#333' }}>
                          {operacion.suite}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#333' }}>
                          {formatCurrency(operacion.costo)}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#333' }}>
                          {formatCurrency(operacion.costopaq)}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#333' }}>
                          ${operacion.tc}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#333', fontWeight: 600 }}>
                          {formatCurrency(operacion.total)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(operacion)}
                            style={{
                              backgroundColor: '#ff6600',
                              borderColor: '#ff6600',
                            }}
                          >
                            Editar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalRecords > 0 && (
              <div className="table-footer">
                <div className="records-info">
                  Mostrando {totalRecords > 0 ? startIndex + 1 : 0} a {endIndex} de {totalRecords} registros
                </div>
                <div className="pagination-buttons">
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      <Modal
        title="Editar Operación Marítima"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="CTZ"
            name="ctz"
          >
            <Input
              prefix={<FileTextOutlined />}
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </Form.Item>

          <Form.Item
            label="COSTO USD"
            name="costo"
            rules={[
              { required: true, message: 'Por favor ingrese el costo USD' }
            ]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el costo en USD"
            />
          </Form.Item>

          <Form.Item
            label="TIPO DE CAMBIO"
            name="tc"
            rules={[
              { required: true, message: 'Por favor ingrese el tipo de cambio' }
            ]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el tipo de cambio"
            />
          </Form.Item>

          <Form.Item
            label="Paquetería"
            name="costopaq"
            rules={[
              { required: true, message: 'Por favor ingrese el costo de paquetería' }
            ]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el costo de paquetería"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              type="primary"
              onClick={handleModalSave}
              loading={loading}
              style={{
                backgroundColor: '#ff6600',
                borderColor: '#ff6600',
                fontWeight: 500,
                height: '40px',
                padding: '0 40px'
              }}
            >
              Editar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OperacionMaritima;
