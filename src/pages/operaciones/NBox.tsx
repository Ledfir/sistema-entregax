import { useState, useEffect } from 'react';
import { Button, Select, Spin, Table, Dropdown, Input } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, TeamOutlined, EditOutlined, HistoryOutlined, EyeOutlined, MoreOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import apiClient from '@/api/axios';
import Swal from 'sweetalert2';
import './Descuentos.css';

export const NBox = () => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [asesores, setAsesores] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string | undefined>(undefined);
  const [selectedAsesor, setSelectedAsesor] = useState<string | undefined>(undefined);
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    document.title = 'Sistema Entregax | N.B.O.X';
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadClientes(), loadAsesores()]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const response = await apiClient.get('/customers/list');
      const data = response.data?.data ?? response.data;
      setClientes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error al cargar clientes:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al cargar la lista de clientes',
        showConfirmButton: false,
        timer: 3500
      });
    }
  };

  const loadAsesores = async () => {
    try {
      const response = await apiClient.get('/users/list-advisors');
      const data = response.data?.data ?? response.data;
      setAsesores(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error al cargar asesores:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al cargar la lista de asesores',
        showConfirmButton: false,
        timer: 3500
      });
    }
  };

  const handleMostrarCliente = async () => {
    if (!selectedCliente) {
      Swal.fire({
        icon: 'warning',
        title: '',
        text: 'Por favor seleccione un cliente',
        showConfirmButton: false,
        timer: 2500
      });
      return;
    }

    try {
      setSearching(true);
      const response = await apiClient.post('/operations/search-nbox', {
        input: selectedCliente,
        tipo: 1
      });

      if (response.data.status === 'success') {
        const data = response.data?.data ?? [];
        setTableData(Array.isArray(data) ? data : []);
        
        if (data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: '',
            text: 'No se encontraron resultados',
            showConfirmButton: false,
            timer: 2500
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: '',
          text: response.data.message || 'Error al buscar',
          showConfirmButton: false,
          timer: 3500
        });
        setTableData([]);
      }
    } catch (error: any) {
      console.error('Error al buscar cliente:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: error.response?.data?.message || 'Error al realizar la búsqueda',
        showConfirmButton: false,
        timer: 3500
      });
      setTableData([]);
    } finally {
      setSearching(false);
    }
  };

  const handleMostrarAsesor = async () => {
    if (!selectedAsesor) {
      Swal.fire({
        icon: 'warning',
        title: '',
        text: 'Por favor seleccione un asesor',
        showConfirmButton: false,
        timer: 2500
      });
      return;
    }

    try {
      setSearching(true);
      const response = await apiClient.post('/operations/search-nbox', {
        input: selectedAsesor,
        tipo: 2
      });

      if (response.data.status === 'success') {
        const data = response.data?.data ?? [];
        setTableData(Array.isArray(data) ? data : []);
        
        if (data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: '',
            text: 'No se encontraron resultados',
            showConfirmButton: false,
            timer: 2500
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: '',
          text: response.data.message || 'Error al buscar',
          showConfirmButton: false,
          timer: 3500
        });
        setTableData([]);
      }
    } catch (error: any) {
      console.error('Error al buscar asesor:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: error.response?.data?.message || 'Error al realizar la búsqueda',
        showConfirmButton: false,
        timer: 3500
      });
      setTableData([]);
    } finally {
      setSearching(false);
    }
  };

  const getActionItems = (record: any): MenuProps['items'] => [
    {
      key: 'editar',
      icon: <EditOutlined />,
      label: 'Editar',
      onClick: () => {
        // TODO: Implementar edición
        console.log('Editar:', record);
      },
    },
    {
      key: 'ver-todo',
      icon: <EyeOutlined />,
      label: 'Ver todo',
      onClick: () => {
        // TODO: Implementar ver todo
        console.log('Ver todo:', record);
      },
    },
    {
      key: 'ver-instrucciones',
      icon: <FileTextOutlined />,
      label: 'Ver instrucciones',
      onClick: () => {
        // TODO: Implementar ver instrucciones
        console.log('Ver instrucciones:', record);
      },
    },
    {
      key: 'historial',
      icon: <HistoryOutlined />,
      label: 'Historial',
      onClick: () => {
        // TODO: Implementar historial
        console.log('Historial:', record);
      },
    },
  ];

  const handleDownloadCtz = async (idco: string) => {
    try {
      const response = await apiClient.get(`/operations/download-ctz/${idco}`, {
        responseType: 'blob'
      });

      // Verificar si la respuesta es un PDF
      const contentType = response.headers['content-type'];
      
      if (contentType && contentType.includes('application/json')) {
        // Si es JSON, es un error
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        Swal.fire({
          icon: 'error',
          title: '',
          text: errorData.message || 'Error al descargar la cotización',
          showConfirmButton: false,
          timer: 3500
        });
      } else {
        // Si es PDF, descargarlo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${idco}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      console.error('Error al descargar cotización:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: error.response?.data?.message || 'Error al descargar la cotización',
        showConfirmButton: false,
        timer: 3500
      });
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'left',
      align: 'center',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionItems(record) }} placement="bottomLeft">
          <Button type="primary" icon={<MoreOutlined />}>
            Acciones
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'Cotización',
      dataIndex: 'idco',
      key: 'idco',
      align: 'center',
      render: (value) => {
        if (value && value !== '') {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => handleDownloadCtz(value)}
            >
              {value}
            </Button>
          );
        }
        return '';
      },
    },
    {
      title: 'Guía de ingreso',
      dataIndex: 'guiaingreso',
      key: 'guiaingreso',
      align: 'center',
    },
    {
      title: 'Cliente',
      dataIndex: 'suite',
      key: 'suite',
      align: 'center',
      render: (value) => <span style={{ fontWeight: 'bold' }}>{value}</span>,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      align: 'center',
    },
    {
      title: 'Estado',
      dataIndex: 'estadotxt',
      key: 'estadotxt',
      align: 'center',
    },
    {
      title: 'Guía única',
      dataIndex: 'guiaunica',
      key: 'guiaunica',
      align: 'center',
    },
    {
      title: 'Instrucciones',
      dataIndex: 'instruccion',
      key: 'instruccion',
      align: 'center',
      render: (value, record) => {
        if (value == 1) {
          if (!record.idco || record.idco === '') {
            return (
              <Button
                type="primary"
                danger
                size="small"
                onClick={() => {
                  // TODO: Implementar eliminar instrucciones
                  console.log('Eliminar instrucciones:', record);
                }}
              >
                Eliminar instrucciones
              </Button>
            );
          } else {
            return <span style={{ fontWeight: 'bold', color: '#52c41a' }}>Si</span>;
          }
        } else {
          return <span style={{ color: '#ff4d4f' }}>No</span>;
        }
      },
    },
    {
      title: 'CEDIS',
      dataIndex: 'cedisid',
      key: 'cedisid',
      align: 'center',
    },
    {
      title: 'Fecha de recepción CHINA',
      dataIndex: 'dsrecepcion',
      key: 'dsrecepcion',
      align: 'center',
    },
    {
      title: 'Fecha de entrada',
      dataIndex: 'fechaentrada',
      key: 'fechaentrada',
      align: 'center',
    },
    {
      title: 'Fecha de salida',
      dataIndex: 'fechasalida',
      key: 'fechasalida',
      align: 'center',
    },
    {
      title: 'Paquetería de salida',
      dataIndex: 'paqueteriasalidad',
      key: 'paqueteriasalidad',
      align: 'center',
    },
    {
      title: 'Guía de salida',
      dataIndex: 'regsa',
      key: 'regsa',
      align: 'center',
    },
    {
      title: 'Costo',
      dataIndex: 'costo',
      key: 'costo',
      align: 'center',
      render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-',
    },
    {
      title: 'Tipo de cambio',
      dataIndex: 'tipodecambio',
      key: 'tipodecambio',
      align: 'center',
      render: (value) => value ? parseFloat(value).toFixed(2) : '-',
    },
    {
      title: 'Costo de envío',
      dataIndex: 'costoenvio',
      key: 'costoenvio',
      align: 'center',
      render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-',
    },
    {
      title: 'Medidas',
      key: 'medidas',
      align: 'center',
      render: (_, record) => {
        const largo = record.largo || '0';
        const ancho = record.ancho || '0';
        const alto = record.alto || '0';
        return `${largo} x ${ancho} x ${alto}`;
      }
    },
    {
      title: 'Guía US',
      dataIndex: 'guiaalas',
      key: 'guiaalas',
      align: 'center',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        maxWidth: '100%', 
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
            Nuevo Recepcion Box
          </h1>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              {/* Selección de Cliente */}
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '12px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#333'
                }}>
                  Seleccione la cliente.
                </label>
                <Select
                  showSearch
                  placeholder="Seleccione un cliente"
                  value={selectedCliente}
                  onChange={setSelectedCliente}
                  style={{ width: '100%', marginBottom: '12px' }}
                  size="large"
                  suffixIcon={<UserOutlined />}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={clientes.map(cliente => ({
                    value: cliente.id,
                    label: `(${cliente.suite || cliente.clave}) ${cliente.nombre || ''} ${cliente.apellido || ''}`,
                  }))}
                />
                <Button
                  type="primary"
                  onClick={handleMostrarCliente}
                  size="large"
                  style={{
                    backgroundColor: '#ff6600',
                    borderColor: '#ff6600',
                    fontWeight: 500,
                    width: '100%'
                  }}
                >
                  Mostrar
                </Button>
              </div>

              {/* Selección de Asesor */}
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '12px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#333'
                }}>
                  Seleccione al asesor.
                </label>
                <Select
                  showSearch
                  placeholder="Seleccione un asesor"
                  value={selectedAsesor}
                  onChange={setSelectedAsesor}
                  style={{ width: '100%', marginBottom: '12px' }}
                  size="large"
                  suffixIcon={<TeamOutlined />}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={asesores.map(asesor => ({
                    value: asesor.token,
                    label: `${asesor.nombre || asesor.name ||''}`,
                  }))}
                />
                <Button
                  type="primary"
                  onClick={handleMostrarAsesor}
                  size="large"
                  style={{
                    backgroundColor: '#ff6600',
                    borderColor: '#ff6600',
                    fontWeight: 500,
                    width: '100%'
                  }}
                >
                  Mostrar
                </Button>
              </div>
            </div>

            {/* Tabla de resultados */}
            {searching ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Spin size="large" tip="Buscando..." />
              </div>
            ) : tableData.length > 0 ? (
              <div style={{ marginTop: '32px' }}>
                <Input
                  placeholder="Buscar en la tabla..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="large"
                  style={{ marginBottom: '16px' }}
                  allowClear
                />
                <Table
                  columns={columns}
                  dataSource={tableData.filter(item => {
                    if (!searchTerm) return true;
                    const searchLower = searchTerm.toLowerCase();
                    return (
                      item.guiaingreso?.toLowerCase().includes(searchLower) ||
                      item.suite?.toLowerCase().includes(searchLower) ||
                      item.guiaunica?.toLowerCase().includes(searchLower) ||
                      item.instruccion?.toLowerCase().includes(searchLower) ||
                      item.state?.toLowerCase().includes(searchLower) ||
                      item.tipgl?.toLowerCase().includes(searchLower) ||
                      item.idco?.toLowerCase().includes(searchLower) ||
                      item.guiaalas?.toLowerCase().includes(searchLower) ||
                      item.cedisid?.toLowerCase().includes(searchLower)
                    );
                  })}
                  rowKey={(record) => record.id || record.guia_ingreso}
                  scroll={{ x: 'max-content' }}
                  pagination={{
                    pageSize: pageSize,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} registros`,
                    onChange: (_page, size) => {
                      setPageSize(size);
                    },
                  }}
                  className="custom-table"
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default NBox;
