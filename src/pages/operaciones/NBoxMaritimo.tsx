import { useState, useEffect } from 'react';
import { Button, Select, Spin, Table, Dropdown, Input, Modal, Form, Popover, Checkbox } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, TeamOutlined, EditOutlined, EyeOutlined, MoreOutlined, SearchOutlined, SwapOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import apiClient from '@/api/axios';
import Swal from 'sweetalert2';
import './Descuentos.css';

export const NBoxMaritimo = () => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [asesores, setAsesores] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string | undefined>(undefined);
  const [selectedAsesor, setSelectedAsesor] = useState<string | undefined>(undefined);
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name', 'ctz', 'bl', 'asesor', 'suite', 'created', 'arrived', 'instrucciones',
    'estadotxt', 'week', 'cbm', 'bultos', 'peso', 'ingreso_date', 'salida_fecha', 'guiasalida'
  ]);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedClienteForReassign, setSelectedClienteForReassign] = useState<string | undefined>(undefined);
  const [recordToReassign, setRecordToReassign] = useState<any>(null);

  useEffect(() => {
    document.title = 'Sistema Entregax | N.B.O.X. Marítimo';
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
      const response = await apiClient.post('/operations/search-nbox-maritime', {
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
      const response = await apiClient.post('/operations/search-nbox-maritime', {
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

  const handleViewAll = async (record: any) => {
    try {
      setLoadingDetail(true);
      setIsModalOpen(true);
      const response = await apiClient.get(`/operations/get-data-log/${record.name}`);

      if (response.data.status === 'success') {
        setDetailData(response.data.data);
      } else {
        Swal.fire({
          icon: 'error',
          title: '',
          text: response.data.message || 'Error al obtener los detalles',
          showConfirmButton: false,
          timer: 3500
        });
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error('Error al obtener detalles:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: error.response?.data?.message || 'Error al obtener los detalles',
        showConfirmButton: false,
        timer: 3500
      });
      setIsModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleReassignLog = (record: any) => {
    setRecordToReassign(record);
    setSelectedClienteForReassign(undefined);
    setIsReassignModalOpen(true);
  };

  const handleSaveReassign = async () => {
    if (!selectedClienteForReassign) {
      Swal.fire({
        icon: 'warning',
        title: '',
        text: 'Por favor seleccione un cliente',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    try {
      const response = await apiClient.post('/operations/update-customer-log-maritime', {
        id: recordToReassign.id,
        customer_id: selectedClienteForReassign
      });

      if (response.data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: '',
          text: response.data.message || 'LOG reasignado correctamente',
          showConfirmButton: false,
          timer: 2000
        });

        setIsReassignModalOpen(false);
        setSelectedClienteForReassign(undefined);
        setRecordToReassign(null);
        
        // Recargar la tabla
        await reloadTableData();
      } else {
        Swal.fire({
          icon: 'error',
          title: '',
          text: response.data.message || 'Error al reasignar el LOG',
          showConfirmButton: false,
          timer: 3500
        });
      }
    } catch (error: any) {
      console.error('Error al reasignar LOG:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: error.response?.data?.message || 'Error al reasignar el LOG',
        showConfirmButton: false,
        timer: 3500
      });
    }
  };

  const reloadTableData = async () => {
    if (selectedCliente) {
      try {
        setSearching(true);
        const response = await apiClient.post('/operations/search-nbox-maritime', {
          input: selectedCliente,
          tipo: 1
        });

        if (response.data.status === 'success') {
          const data = response.data?.data ?? [];
          setTableData(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error al recargar datos:', error);
      } finally {
        setSearching(false);
      }
    } else if (selectedAsesor) {
      try {
        setSearching(true);
        const response = await apiClient.post('/operations/search-nbox-maritime', {
          input: selectedAsesor,
          tipo: 2
        });

        if (response.data.status === 'success') {
          const data = response.data?.data ?? [];  
          setTableData(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error al recargar datos:', error);
      } finally {
        setSearching(false);
      }
    }
  };

  const handleDeleteInstructions = async (record: any) => {
    // Mostrar confirmación primero
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar las instrucciones de este registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await apiClient.post('/operations/delete-instructions', {
        id: record.id,
        idu: record.idu
      });

      if (response.data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: '',
          text: response.data.message || 'Instrucciones eliminadas correctamente',
          showConfirmButton: false,
          timer: 3500
        });
        // Recargar la tabla
        await reloadTableData();
      } else {
        Swal.fire({
          icon: 'error',
          title: '',
          text: response.data.message || 'Error al eliminar las instrucciones',
          showConfirmButton: false,
          timer: 3500
        });
      }
    } catch (error: any) {
      console.error('Error al eliminar instrucciones:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: error.response?.data?.message || 'Error al eliminar las instrucciones',
        showConfirmButton: false,
        timer: 3500
      });
    }
  };

  const getActionItems = (record: any): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'editar',
        icon: <EditOutlined />,
        label: 'Editar',
        onClick: () => {
          setSelectedRecord(record);
          editForm.setFieldsValue({
            cbm: record.cbm || '',
            bultos: record.bultos || '',
            peso: record.peso || '',
          });
          setIsEditModalOpen(true);
        },
      },
      {
        key: 'ver-todo',
        icon: <EyeOutlined />,
        label: 'Ver todo',
        onClick: () => {
          handleViewAll(record);
        },
      },
      {
        key: 'reasignar-log',
        icon: <SwapOutlined />,
        label: 'Reasignar LOG',
        onClick: () => {
          handleReassignLog(record);
        },
      },
    ];

    // Agregar "Eliminar CTZ" solo si el registro tiene cotización
    if (record.ctz && record.ctz !== '') {
      items.push({
        key: 'eliminar-ctz',
        icon: <DeleteOutlined />,
        label: 'Eliminar CTZ',
        onClick: () => {
          // TODO: Implementar eliminar CTZ
          console.log('Eliminar CTZ:', record);
        },
      });
    }

    return items;
  };

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      
      const response = await apiClient.post('/operations/update-waybill-nbox-maritime', {
        id: selectedRecord.id,
        ...values
      });
      
      if (response.data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: '',
          text: response.data.message || 'Cambios guardados exitosamente',
          showConfirmButton: false,
          timer: 2000
        });
        
        // Actualizar los datos en la tabla
        setTableData(prevData => 
          prevData.map(item => 
            item.id === selectedRecord.id ? { ...item, ...values } : item
          )
        );
        
        setIsEditModalOpen(false);
        editForm.resetFields();
      } else {
        Swal.fire({
          icon: 'error',
          title: '',
          text: response.data.message || 'Error al guardar cambios',
          showConfirmButton: false,
          timer: 3500
        });
      }
    } catch (error: any) {
      console.error('Error al guardar cambios:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: error.response?.data?.message || 'Error al guardar los cambios',
        showConfirmButton: false,
        timer: 3500
      });
    }
  };

  const handleDownloadCtz = async (idco: string) => {
    try {
      const response = await apiClient.get(`/operations/download-ctz-maritime/${idco}`, {
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

  // Función helper para formatear fechas
  const formatDate = (value: string) => {
    if (!value || value === '0000-00-00 00:00:00' || value === '0000-00-00') {
      return '';
    }
    
    try {
      const date = new Date(value);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return value; // Si no es válida, retornar el valor original
      }
      
      // Verificar si incluye hora (diferente de 00:00:00)
      const hasTime = value.includes(':') && !(value.includes('00:00:00') && value.includes(' '));
      
      if (hasTime) {
        // Formato con fecha y hora: "23 feb 2026, 14:30"
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        // Formato solo fecha: "23/02/2026"
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch (error) {
      return value; // En caso de error, retornar el valor original
    }
  };

  const allColumns: ColumnsType<any> = [
    {
      title: 'OPCIONES',
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
      title: 'LOG',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: 'COTIZACION',
      dataIndex: 'ctz',
      key: 'ctz',
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
      title: 'BL',
      dataIndex: 'bl',
      key: 'bl',
      align: 'center',
    },
    {
      title: 'ASESOR',
      dataIndex: 'asesor',
      key: 'asesor',
      align: 'center',
    },
    {
      title: 'CLIENTE',
      dataIndex: 'suite',
      key: 'suite',
      align: 'center',
      render: (value) => <span style={{ fontWeight: 'bold' }}>{value}</span>,
    },
    {
      title: 'FECHA DE CREACION',
      dataIndex: 'created',
      key: 'created',
      align: 'center',
      render: (value) => formatDate(value),
    },
    {
      title: 'FECHA PROXIMA DE LLEGADA',
      dataIndex: 'arrived',
      key: 'arrived',
      align: 'center',
      render: (value) => formatDate(value),
    },
    {
      title: 'INSTRUCCIONES',
      dataIndex: 'instrucciones',
      key: 'instrucciones',
      align: 'center',
      render: (value, record) => {
        if (value == 1) {
          if (!record.ctz || record.ctz === '') {
            return (
              <Button
                type="primary"
                danger
                size="small"
                onClick={() => {
                  handleDeleteInstructions(record);
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
      title: 'ESTADO',
      dataIndex: 'estadotxt',
      key: 'estadotxt',
      align: 'center',
    },
    {
      title: 'WEEK',
      dataIndex: 'week',
      key: 'week',
      align: 'center',
    },
    {
      title: 'CBM',
      dataIndex: 'cbm',
      key: 'cbm',
      align: 'center',
      render: (value) => value ? parseFloat(value).toFixed(2) : '-',
    },
    {
      title: 'BULTOS',
      dataIndex: 'bultos',
      key: 'bultos',
      align: 'center',
    },
    {
      title: 'PESO',
      dataIndex: 'peso',
      key: 'peso',
      align: 'center',
      render: (value) => value ? `${parseFloat(value).toFixed(2)} kg` : '-',
    },
    {
      title: 'FECHA DE INGRESO',
      dataIndex: 'ingreso_date',
      key: 'ingreso_date',
      align: 'center',
      render: (value) => formatDate(value),
    },
    {
      title: 'FECHA DE SALIDA',
      dataIndex: 'salida_fecha',
      key: 'salida_fecha',
      align: 'center',
      render: (value) => formatDate(value),
    },
    {
      title: 'GUIA DE SALIDA',
      dataIndex: 'guiasalida',
      key: 'guiasalida',
      align: 'center',
    },
  ];

  // Filtrar columnas según visibilidad
  const columns = allColumns.filter(col => 
    col.key === 'acciones' || visibleColumns.includes(col.key as string)
  );

  const columnOptions = [
    { label: 'LOG', value: 'name' },
    { label: 'COTIZACION', value: 'ctz' },
    { label: 'BL', value: 'bl' },
    { label: 'ASESOR', value: 'asesor' },
    { label: 'CLIENTE', value: 'suite' },
    { label: 'FECHA DE CREACION', value: 'created' },
    { label: 'FECHA PROXIMA DE LLEGADA', value: 'arrived' },
    { label: 'INSTRUCCIONES', value: 'instrucciones' },
    { label: 'ESTADO', value: 'estadotxt' },
    { label: 'WEEK', value: 'week' },
    { label: 'CBM', value: 'cbm' },
    { label: 'BULTOS', value: 'bultos' },
    { label: 'PESO', value: 'peso' },
    { label: 'FECHA DE INGRESO', value: 'ingreso_date' },
    { label: 'FECHA DE SALIDA', value: 'salida_fecha' },
    { label: 'GUIA DE SALIDA', value: 'guiasalida' },
  ];

  const columnSelectorContent = (
    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
      <Checkbox.Group
        options={columnOptions}
        value={visibleColumns}
        onChange={(checkedValues) => setVisibleColumns(checkedValues)}
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      />
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
        <Button 
          size="small" 
          onClick={() => setVisibleColumns(columnOptions.map(col => col.value))}
          style={{ marginRight: '8px' }}
        >
          Seleccionar todas
        </Button>
        <Button 
          size="small" 
          onClick={() => setVisibleColumns([])}
        >
          Deseleccionar todas
        </Button>
      </div>
    </div>
  );

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
            Nuevo Recepcion Box Maritimo
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
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                  <Input
                    placeholder="Buscar en la tabla..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="large"
                    style={{ flex: 1 }}
                    allowClear
                  />
                  <Popover
                    content={columnSelectorContent}
                    title="Seleccionar columnas"
                    trigger="click"
                    placement="bottomRight"
                  >
                    <Button 
                      size="large" 
                      icon={<SettingOutlined />}
                    >
                      Columnas
                    </Button>
                  </Popover>
                </div>
                <Table
                  columns={columns}
                  dataSource={tableData.filter(item => {
                    if (!searchTerm) return true;
                    const searchLower = searchTerm.toLowerCase();
                    return (
                      item.name?.toString().toLowerCase().includes(searchLower) ||
                      item.ctz?.toString().toLowerCase().includes(searchLower) ||
                      item.log?.toString().toLowerCase().includes(searchLower) ||
                      item.idco?.toString().toLowerCase().includes(searchLower) ||
                      item.bl?.toLowerCase().includes(searchLower) ||
                      item.asesor?.toLowerCase().includes(searchLower) ||
                      item.suite?.toLowerCase().includes(searchLower) ||
                      item.fechacreacion?.toLowerCase().includes(searchLower) ||
                      item.fechallegada?.toLowerCase().includes(searchLower) ||
                      item.estadotxt?.toLowerCase().includes(searchLower) ||
                      item.week?.toString().toLowerCase().includes(searchLower) ||
                      item.bultos?.toString().toLowerCase().includes(searchLower) ||
                      item.fechaingreso?.toLowerCase().includes(searchLower) ||
                      item.fechasalida?.toLowerCase().includes(searchLower) ||
                      item.guiasalida?.toLowerCase().includes(searchLower)
                    );
                  })}
                  rowKey={(record) => record.id || record.bl || Math.random()}
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

      {/* Modal Ver Todo */}
      <Modal
        title="Información"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setDetailData(null);
        }}
        footer={[
          <Button 
            key="close" 
            danger
            onClick={() => {
              setIsModalOpen(false);
              setDetailData(null);
            }}
          >
            Cancelar
          </Button>
        ]}
        width={600}
      >
        {loadingDetail ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : detailData ? (
          <div style={{ padding: '20px 0' }}>
            {/* Cotización y Estado */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Cotizacion
                </div>
                <div style={{ fontSize: '14px', color: '#000', fontWeight: 600 }}>
                  {detailData.quote?.ctz || ''}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Estado de la cotización
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600,
                  color: detailData.quote?.state === '1' ? '#1890ff' :
                         detailData.quote?.state === '2' ? '#faad14' :
                         detailData.quote?.state === '3' ? '#52c41a' :
                         detailData.quote?.state === '4' ? '#f5222d' :
                         '#000'
                }}>
                  {detailData.quote?.state ? (
                    detailData.quote.state === '1' ? 'Pendiente de pago' :
                    detailData.quote.state === '2' ? 'Pendiente de aprobación' :
                    detailData.quote.state === '3' ? 'Completada' :
                    detailData.quote.state === '4' ? 'Cancelada' :
                    `Estado ${detailData.quote.state}`
                  ) : ''}
                </div>
              </div>
            </div>

            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px 30px', marginBottom: '15px' }}>
                {/* LOG destacado */}
                <div>
                    <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                        LOG
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, }}>
                        {detailData.log?.name || ''}
                    </div>
                </div>
                {/* BL */}
                <div>
                    <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                        BL
                    </div>
                    <div style={{ fontSize: '14px', color: '#000' }}>
                        {detailData.log?.bl || ''}
                    </div>
                </div>
            </div>

            {/* Información en dos columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px 30px', marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Cliente
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {detailData.customer?.clavecliente || ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Asesor
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {detailData.user?.name || ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Estado
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {detailData.log?.estadotxt || ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Guía de salida
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {detailData.log?.guiasalida || ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  CEDIS
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {detailData.log?.cedis || ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  CBM
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {detailData.log?.cbm || ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Fecha de creacion
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {formatDate(detailData.log?.created) || ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Bultos
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {detailData.log?.bultos || ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Fecha de llegada aproximada
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {formatDate(detailData.log?.arrived) || ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Peso
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {detailData.log?.peso + ' KG'|| ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Instrucciones
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: detailData.log?.instrucciones == '1' ? '#52c41a' : '#ff4d4f' }}>
                  {detailData.log?.instrucciones == '1' ? 'SI' : 'NO'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  Paquetería
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {detailData.log?.paqueteria || ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>
                  WEEK
                </div>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  {detailData.log?.week || ''}
                </div>
              </div>
            </div>

            {/* Dirección de entrega */}
            {detailData.address && (
              <div style={{ 
                marginTop: '20px', 
                paddingTop: '15px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#000' }}>
                  Dirección de entrega
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#000' }}>
                  <div>
                    <strong>¿Quien recibe?:</strong> {detailData.address.quienrecibe || ''}
                  </div>
                  <div>
                    <strong>Calle:</strong> {detailData.address.calle || ''} #{detailData.address.numeroext || ''} 
                    {detailData.address.numeroint && ` Numero interior: ${detailData.address.numeroint}`}
                  </div>
                  <div>
                    <strong>Colonia:</strong> {detailData.address.colonia || ''}
                  </div>
                  <div>
                    <strong>CP:</strong> {detailData.address.cp || ''}
                  </div>
                  <div>
                    <strong>Municipio:</strong> {detailData.address.municipio || ''}
                  </div>
                  <div>
                    <strong>Estado:</strong> {detailData.address.estado || ''}
                  </div>
                  <div>
                    <strong>País:</strong> {detailData.address.pais || 'México'}
                  </div>
                  <div>
                    <strong>Teléfono:</strong> {detailData.address.telefono || ''}
                  </div>
                  <div>
                    <strong>Móvil:</strong> {detailData.address.movil || ''}
                  </div>
                  {detailData.address.refe && (
                    <div>
                      <strong>Referencias:</strong> {detailData.address.refe}
                    </div>
                  )}
                  <div>
                    <strong>Ciudad:</strong> {detailData.address.ciudad || ''}
                  </div>
                  <div>
                    <strong>Lugar de entrega:</strong> {detailData.address.lugarentrega || ''}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Modal Editar */}
      <Modal
        title="Editar Registro"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="CBMs"
            name="cbm"
            rules={[{ required: false, message: 'Ingrese los CBMs del LOG' }]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese los CBMs del LOG"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Bultos"
            name="bultos"
            rules={[{ required: false, message: 'Ingrese los bultos del LOG' }]}
          >
            <Input
              type="number"
              step="1"
              placeholder="Ingrese los bultos del LOG"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Peso"
            name="peso"
            rules={[{ required: false, message: 'Ingrese el peso del LOG' }]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el peso del LOG"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            marginTop: '24px'
          }}>
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
              }}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 24px',
                fontSize: '16px'
              }}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              onClick={handleSaveEdit}
              style={{
                backgroundColor: '#ff6600',
                borderColor: '#ff6600',
                padding: '8px 24px',
                fontSize: '16px'
              }}
            >
              Guardar cambios
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Reasignar LOG */}
      <Modal
        title="Reasignar LOG"
        open={isReassignModalOpen}
        onCancel={() => {
          setIsReassignModalOpen(false);
          setSelectedClienteForReassign(undefined);
          setRecordToReassign(null);
        }}
        footer={null}
        width={600}
      >
        <div style={{ marginTop: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px',
            fontSize: '15px',
            fontWeight: 500,
            color: '#333'
          }}>
            Seleccione el nuevo cliente
          </label>
          <Select
            showSearch
            placeholder="Seleccione un cliente"
            value={selectedClienteForReassign}
            onChange={setSelectedClienteForReassign}
            style={{ width: '100%', marginBottom: '24px' }}
            size="large"
            suffixIcon={<UserOutlined />}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={clientes.map((cliente) => ({
              value: cliente.id,
              label: `(${cliente.clave}) ${cliente.nombre}`
            }))}
          />

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            marginTop: '24px'
          }}>
            <Button
              onClick={() => {
                setIsReassignModalOpen(false);
                setSelectedClienteForReassign(undefined);
                setRecordToReassign(null);
              }}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 24px',
                fontSize: '16px'
              }}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              onClick={handleSaveReassign}
              style={{
                backgroundColor: '#ff6600',
                borderColor: '#ff6600',
                padding: '8px 24px',
                fontSize: '16px'
              }}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NBoxMaritimo;
