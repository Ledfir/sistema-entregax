import { useState, useEffect } from 'react';
import { Button, Select, Spin, Table, Dropdown, Input, Modal, Form, Popover, Checkbox } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, TeamOutlined, EditOutlined, HistoryOutlined, EyeOutlined, MoreOutlined, FileTextOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [qrError, setQrError] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [instructionsData, setInstructionsData] = useState<any>(null);
  const [loadingInstructions, setLoadingInstructions] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'idco', 'guiaingreso', 'suite', 'tipo', 'estadotxt', 'guiaunica', 'instruccion',
    'cedis', 'dsrecepcion', 'fechaentrada', 'fechasalida', 'paqueteriasalidad', 'regsa',
    'costo', 'tipodecambio', 'costoenvio', 'medidas', 'guiaus'
  ]);
  const [isGuiausModalOpen, setIsGuiausModalOpen] = useState(false);
  const [guiausForm] = Form.useForm();
  const [recordToEditGuiaus, setRecordToEditGuiaus] = useState<any>(null);

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

  const handleViewInstructions = async (record: any) => {
    try {
      setLoadingInstructions(true);
      const response = await apiClient.post('/operations/get-delivery-address', {
        id: record.id,
        idu: record.idu
      });

      if (response.data.status === 'success') {
        setInstructionsData(response.data.data || response.data);
        setIsInstructionsModalOpen(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: '',
          text: response.data.message || 'Error al obtener las instrucciones',
          showConfirmButton: false,
          timer: 3500
        });
      }
    } catch (error: any) {
      console.error('Error al obtener instrucciones:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: error.response?.data?.message || 'Error al obtener las instrucciones',
        showConfirmButton: false,
        timer: 3500
      });
    } finally {
      setLoadingInstructions(false);
    }
  };

  const reloadTableData = async () => {
    if (selectedCliente) {
      try {
        setSearching(true);
        const response = await apiClient.post('/operations/search-nbox', {
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
        const response = await apiClient.post('/operations/search-nbox', {
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

  const getActionItems = (record: any): MenuProps['items'] => [
    {
      key: 'editar',
      icon: <EditOutlined />,
      label: 'Editar',
      onClick: () => {
        setSelectedRecord(record);
        editForm.setFieldsValue({
          costo: record.costo || '',
          tipodecambio: record.tipodecambio || '',
          costoenvio: record.costoenvio || '',
          peso: record.kilos || '',
          largo: record.largo || '',
          ancho: record.ancho || '',
          alto: record.alto || ''
        });
        setIsEditModalOpen(true);
      },
    },
    {
      key: 'ver-todo',
      icon: <EyeOutlined />,
      label: 'Ver todo',
      onClick: () => {
        setSelectedRecord(record);
        setQrError(false);
        setIsModalOpen(true);
      },
    },
    {
      key: 'ver-instrucciones',
      icon: <FileTextOutlined />,
      label: 'Ver instrucciones',
      onClick: () => {
        handleViewInstructions(record);
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

  const handleDownloadQR = async (guiaunica: string, tipo: string) => {
    try {
      const tipoLower = tipo.toLowerCase();
      // Usar el backend como proxy para evitar problemas de CORS
      const response = await apiClient.get(`/operations/download-qr/${tipoLower}/${guiaunica}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `QR-${guiaunica}.svg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      Swal.fire({
        icon: 'success',
        title: '',
        text: 'QR descargado exitosamente',
        showConfirmButton: false,
        timer: 2000
      });
    } catch (error: any) {
      console.error('Error al descargar QR:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al descargar el archivo QR',
        showConfirmButton: false,
        timer: 3500
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      
      const response = await apiClient.post('/operations/update-waybill-nbox', {
        id: selectedRecord.id,
        idu: selectedRecord.idu,
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

  const handleOpenGuiausModal = (record: any) => {
    setRecordToEditGuiaus(record);
    guiausForm.setFieldsValue({
      guiaus: record.guiaus || ''
    });
    setIsGuiausModalOpen(true);
  };

  const handleSaveGuiaus = async () => {
    try {
      const values = await guiausForm.validateFields();
      
      const response = await apiClient.post('/operations/update-waybill-nbox', {
        id: recordToEditGuiaus.id,
        idu: recordToEditGuiaus.idu,
        guiaus: values.guiaus
      });
      
      if (response.data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: '',
          text: response.data.message || 'Guía US actualizada exitosamente',
          showConfirmButton: false,
          timer: 2000
        });
        
        // Actualizar los datos en la tabla
        setTableData(prevData => 
          prevData.map(item => 
            item.id === recordToEditGuiaus.id ? { ...item, guiaus: values.guiaus } : item
          )
        );
        
        setIsGuiausModalOpen(false);
        guiausForm.resetFields();
        setRecordToEditGuiaus(null);
      } else {
        Swal.fire({
          icon: 'error',
          title: '',
          text: response.data.message || 'Error al actualizar la Guía US',
          showConfirmButton: false,
          timer: 3500
        });
      }
    } catch (error: any) {
      console.error('Error al actualizar Guía US:', error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: error.response?.data?.message || 'Error al actualizar la Guía US',
        showConfirmButton: false,
        timer: 3500
      });
    }
  };

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

  const allColumns: ColumnsType<any> = [
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
      title: 'CEDIS',
      dataIndex: 'cedis',
      key: 'cedis',
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
      dataIndex: 'guiaus',
      key: 'guiaus',
      align: 'center',
      render: (value, record) => {
        if (value && value !== '') {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => handleOpenGuiausModal(record)}
            >
              {value}
            </Button>
          );
        }
        return '-';
      },
    },
  ];

  // Filtrar columnas según visibilidad
  const columns = allColumns.filter(col => 
    col.key === 'acciones' || visibleColumns.includes(col.key as string)
  );

  const columnOptions = [
    { label: 'Cotización', value: 'idco' },
    { label: 'Guía de ingreso', value: 'guiaingreso' },
    { label: 'Cliente', value: 'suite' },
    { label: 'Tipo', value: 'tipo' },
    { label: 'Estado', value: 'estadotxt' },
    { label: 'Guía única', value: 'guiaunica' },
    { label: 'Instrucciones', value: 'instruccion' },
    { label: 'CEDIS', value: 'cedis' },
    { label: 'Fecha de recepción CHINA', value: 'dsrecepcion' },
    { label: 'Fecha de entrada', value: 'fechaentrada' },
    { label: 'Fecha de salida', value: 'fechasalida' },
    { label: 'Paquetería de salida', value: 'paqueteriasalidad' },
    { label: 'Guía de salida', value: 'regsa' },
    { label: 'Costo', value: 'costo' },
    { label: 'Tipo de cambio', value: 'tipodecambio' },
    { label: 'Costo de envío', value: 'costoenvio' },
    { label: 'Medidas', value: 'medidas' },
    { label: 'Guía US', value: 'guiaus' },
  ];

  const columnSelectorContent = (
    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
      <Checkbox.Group
        options={columnOptions}
        value={visibleColumns}
        onChange={(checkedValues) => setVisibleColumns(checkedValues as string[])}
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

      {/* Modal Ver Todo */}
      <Modal
        title="Detalle de la Guía"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setQrError(false);
        }}
        footer={null}
        width={700}
      >
        {selectedRecord && (
          <div style={{ padding: '20px 0' }}>
            {/* Cotización y Estado */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '30px',
              paddingBottom: '20px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Cotización
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1890ff' }}>
                  {selectedRecord.idco || '-'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Estado de la cotización
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 600,
                  color: !selectedRecord.idco || selectedRecord.idco === '' ? '#8c8c8c' : '#52c41a',
                  backgroundColor: !selectedRecord.idco || selectedRecord.idco === '' ? '#f5f5f5' : '#f6ffed',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  {!selectedRecord.idco || selectedRecord.idco === '' ? 'Sin cotizar' : (selectedRecord.estadoctz || 'Nuevo')}
                </div>
              </div>
            </div>

            {/* Información en dos columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Columna izquierda */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Guía de ingreso
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.guiaingreso || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Tipo
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.tipo || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Guía única
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.guiaunica || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Fecha de entrada
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.fechaentrada || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Instrucciones
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: selectedRecord.instruccion == 1 ? '#52c41a' : '#ff4d4f' }}>
                    {selectedRecord.instruccion == 1 ? 'SI' : 'NO'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Guía de salida
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.regsa || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Costo
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5222d' }}>
                    {selectedRecord.costo ? `$${parseFloat(selectedRecord.costo).toFixed(2)}` : '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Tipo de cambio
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.tipodecambio ? `$${parseFloat(selectedRecord.tipodecambio).toFixed(2)}` : '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Medidas
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.largo || '0'} x {selectedRecord.ancho || '0'} x {selectedRecord.alto || '0'}
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Cliente
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedRecord.suite || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Estado
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.estadotxt || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    CEDIS
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.cedis || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Fecha de salida
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.fechasalida || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Paquetería
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.paqueteriasalidad || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Fecha de recepción CHINA
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.dsrecepcion || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Costo de envío
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5222d' }}>
                    {selectedRecord.costoenvio ? `$${parseFloat(selectedRecord.costoenvio).toFixed(2)}` : '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Guía USA
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedRecord.guiaalas || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección QR */}
            {(selectedRecord.tipo === 'DHL' || selectedRecord.tipo === 'TDI') && selectedRecord.guiaunica && (
              <div style={{ 
                marginTop: '30px', 
                paddingTop: '20px',
                borderTop: '1px solid #f0f0f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
                  Archivo QR
                </div>
                {!qrError ? (
                  <>
                    <img
                      src={`https://www.sistemaentregax.com/qr/guia/${selectedRecord.tipo.toLowerCase()}/${selectedRecord.guiaunica}.svg`}
                      alt="QR Code"
                      style={{ maxWidth: '250px', width: '100%', height: 'auto' }}
                      onError={() => setQrError(true)}
                    />
                    <div style={{ marginTop: '16px' }}>
                      <Button
                        type="primary"
                        onClick={() => handleDownloadQR(selectedRecord.guiaunica, selectedRecord.tipo)}
                      >
                        Descargar QR
                      </Button>
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: '40px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    color: '#8c8c8c',
                    fontSize: '14px'
                  }}>
                    QR sin crearse
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
            label="Costo (US)"
            name="costo"
            rules={[{ required: false, message: 'Ingrese el costo' }]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el costo en USD"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Tipo de cambio"
            name="tipodecambio"
            rules={[{ required: false, message: 'Ingrese el tipo de cambio' }]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el tipo de cambio"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Costo de envío (MXN)"
            name="costoenvio"
            rules={[{ required: false, message: 'Ingrese el costo de envío' }]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el costo de envío"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Peso"
            name="peso"
            rules={[{ required: false, message: 'Ingrese el peso' }]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el peso"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Largo"
            name="largo"
            rules={[{ required: false, message: 'Ingrese el largo' }]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el largo"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Ancho"
            name="ancho"
            rules={[{ required: false, message: 'Ingrese el ancho' }]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el ancho"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Alto"
            name="alto"
            rules={[{ required: false, message: 'Ingrese el alto' }]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el alto"
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

      {/* Modal Ver Instrucciones */}
      <Modal
        title={<span style={{ fontWeight: 'bold', fontSize: '18px' }}>Instrucciones de envío</span>}
        open={isInstructionsModalOpen}
        onCancel={() => {
          setIsInstructionsModalOpen(false);
          setInstructionsData(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsInstructionsModalOpen(false);
              setInstructionsData(null);
            }}
            style={{
              backgroundColor: '#dc3545',
              borderColor: '#dc3545',
              color: 'white',
              padding: '6px 24px',
              fontSize: '15px',
              borderRadius: '4px'
            }}
          >
            Cerrar
          </Button>
        ]}
        width={600}
      >
        {loadingInstructions ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spin size="large" tip="Cargando instrucciones..." />
          </div>
        ) : instructionsData ? (
          <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
            {/* Quien recibe */}
            {instructionsData.quienrecibe && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#000', fontWeight: 'normal' }}>Quien recibe: </span>
                <span style={{ color: '#000', fontWeight: 'bold' }}>
                  {instructionsData.quienrecibe}
                </span>
              </div>
            )}

            {/* Teléfono */}
            {instructionsData.telefono && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#000', fontWeight: 'normal' }}>Teléfono: </span>
                <span style={{ color: '#000', fontWeight: 'bold' }}>{instructionsData.telefono}</span>
              </div>
            )}

            {/* Teléfono móvil */}
            {instructionsData.movil && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#000', fontWeight: 'normal' }}>Teléfono movil: </span>
                <span style={{ color: '#000', fontWeight: 'bold' }}>{instructionsData.movil}</span>
              </div>
            )}

            {/* Calle con número exterior */}
            {instructionsData.calle && (
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: '#000', fontWeight: 'normal' }}>Calle: </span>
                <span style={{ color: '#000', fontWeight: 'bold' }}>
                  {instructionsData.calle}
                  {instructionsData.numeroext && ` #${instructionsData.numeroext}`}
                </span>
              </div>
            )}

            {/* Número interior */}
            {instructionsData.numeroint && (
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: '#000', fontWeight: 'normal' }}>Numero interior: </span>
                <span style={{ color: '#000', fontWeight: 'bold' }}>{instructionsData.numeroint}</span>
              </div>
            )}

            {/* Colonia y CP */}
            {(instructionsData.colonia || instructionsData.cp) && (
              <div style={{ marginBottom: '6px' }}>
                {instructionsData.colonia && (
                  <>
                    <span style={{ color: '#000', fontWeight: 'normal' }}>Colonia: </span>
                    <span style={{ color: '#000', fontWeight: 'bold' }}>{instructionsData.colonia}</span>
                  </>
                )}
                {instructionsData.cp && (
                  <>
                    <span style={{ color: '#000', fontWeight: 'normal' }}>  CP: </span>
                    <span style={{ color: '#000', fontWeight: 'bold' }}>{instructionsData.cp}</span>
                  </>
                )}
              </div>
            )}

            {/* Municipio y Estado */}
            {(instructionsData.municipio || instructionsData.estado) && (
              <div style={{ marginBottom: '6px' }}>
                {instructionsData.municipio && (
                  <>
                    <span style={{ color: '#000', fontWeight: 'normal' }}>Municipio: </span>
                    <span style={{ color: '#000', fontWeight: 'bold' }}>{instructionsData.municipio}</span>
                  </>
                )}
                {instructionsData.estado && (
                  <>
                    <span style={{ color: '#000', fontWeight: 'normal' }}>  Estado: </span>
                    <span style={{ color: '#000', fontWeight: 'bold' }}>{instructionsData.estado}</span>
                  </>
                )}
              </div>
            )}

            {/* Referencias visuales */}
            {instructionsData.ref && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#000', fontWeight: 'normal' }}>Referencias visuales: </span>
                <span style={{ color: '#000', fontWeight: 'bold' }}>{instructionsData.ref}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            color: '#8c8c8c'
          }}>
            No hay datos para mostrar
          </div>
        )}
      </Modal>

      {/* Modal Editar Guía US */}
      <Modal
        title="Editar Guía US"
        open={isGuiausModalOpen}
        onCancel={() => {
          setIsGuiausModalOpen(false);
          guiausForm.resetFields();
          setRecordToEditGuiaus(null);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={guiausForm}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="Guía US"
            name="guiaus"
            rules={[{ required: true, message: 'Ingrese la Guía US' }]}
          >
            <Input
              placeholder="Ingrese la Guía US"
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
                setIsGuiausModalOpen(false);
                guiausForm.resetFields();
                setRecordToEditGuiaus(null);
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
              onClick={handleSaveGuiaus}
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
    </div>
  );
};

export default NBox;
