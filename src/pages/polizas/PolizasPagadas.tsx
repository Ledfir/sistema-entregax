import { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckOutlined, CloseOutlined, FilePdfOutlined, FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { polizasService } from '@/services/polizasService';
import Swal from 'sweetalert2';
import './Polizas.css';

interface Poliza {
  token: string;
  gex: string;
  suite: string;
  asesor: string;
  cajas: string;
  volumen: string;
  costo_usd: string;
  created: string;
  total_factura: string;
  file_pl: string;
  file_factura: string;
}

export const PolizasPagadas = () => {
  const [loading, setLoading] = useState(false);
  const [dataPolizas, setDataPolizas] = useState<Poliza[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'Pólizas Pagadas Pendientes de Aprobación';
    loadPolizas();
  }, []);

  const loadPolizas = async () => {
    try {
      setLoading(true);
      const response = await polizasService.getPolizasPagadasPendientes();
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        setDataPolizas(response.data);
      } else {
        setDataPolizas([]);
      }
    } catch (error) {
      console.error('Error al cargar pólizas pagadas:', error);
      setDataPolizas([]);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las pólizas',
        icon: 'error',
        confirmButtonColor: '#ff6600'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (record: Poliza) => {
    const result = await Swal.fire({
      title: '¿Aprobar póliza?',
      text: `¿Está seguro de aprobar la póliza ${record.gex}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#52c41a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await polizasService.aprobarPoliza(record.token);
        
        if (response.status === 'success') {
          Swal.fire({
            title: 'Aprobada',
            text: 'La póliza ha sido aprobada correctamente',
            icon: 'success',
            confirmButtonColor: '#ff6600'
          });
          loadPolizas();
        } else {
          Swal.fire({
            title: 'Error',
            text: response.message || 'No se pudo aprobar la póliza',
            icon: 'error',
            confirmButtonColor: '#ff6600'
          });
        }
      } catch (error) {
        console.error('Error al aprobar póliza:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al aprobar la póliza',
          icon: 'error',
          confirmButtonColor: '#ff6600'
        });
      }
    }
  };

  const handleRechazar = async (record: Poliza) => {
    const result = await Swal.fire({
      title: '¿Rechazar póliza?',
      text: `¿Está seguro de rechazar la póliza ${record.gex}?`,
      icon: 'warning',
      input: 'textarea',
      inputPlaceholder: 'Motivo del rechazo (opcional)',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#999',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await polizasService.rechazarPoliza(record.token, result.value);
        
        if (response.status === 'success') {
          Swal.fire({
            title: 'Rechazada',
            text: 'La póliza ha sido rechazada',
            icon: 'success',
            confirmButtonColor: '#ff6600'
          });
          loadPolizas();
        } else {
          Swal.fire({
            title: 'Error',
            text: response.message || 'No se pudo rechazar la póliza',
            icon: 'error',
            confirmButtonColor: '#ff6600'
          });
        }
      } catch (error) {
        console.error('Error al rechazar póliza:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al rechazar la póliza',
          icon: 'error',
          confirmButtonColor: '#ff6600'
        });
      }
    }
  };

  // Función para humanizar fechas
  const humanizarFecha = (fechaStr: string): string => {
    if (!fechaStr) return '-';
    
    try {
      // Formato esperado: "2025-02-25 13:40:49"
      const [fecha, hora] = fechaStr.split(' ');
      const [anio, mes, dia] = fecha.split('-');
      const [horas, minutos] = hora ? hora.split(':') : ['00', '00'];
      
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      
      const mesNombre = meses[parseInt(mes) - 1];
      
      // Convertir a formato 12 horas
      let horaNum = parseInt(horas);
      const ampm = horaNum >= 12 ? 'PM' : 'AM';
      horaNum = horaNum % 12 || 12;
      
      return `${dia} de ${mesNombre} de ${anio}, ${horaNum}:${minutos} ${ampm}`;
    } catch (error) {
      return fechaStr;
    }
  };

  // Función para formatear números con separación de miles
  const formatearMoneda = (valor: string | number): string => {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numero)) return '-';
    
    const formatoNumero = new Intl.NumberFormat('es-MX', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numero);
    
    return `$${formatoNumero}`;
  };

  // Función para detectar el tipo de archivo y renderizar el tag correspondiente
  const renderFileTag = (url: string) => {
    if (!url) return <Tag>N/A</Tag>;

    const isExcel = url.toLowerCase().includes('.xlsx') || url.toLowerCase().includes('.xls');
    const isPdf = url.toLowerCase().includes('.pdf');

    if (isExcel) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Tag color="success" icon={<FileExcelOutlined />} style={{ cursor: 'pointer' }}>
            Ver Excel
          </Tag>
        </a>
      );
    } else if (isPdf) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Tag color="green" icon={<FilePdfOutlined />} style={{ cursor: 'pointer' }}>
            Ver PDF
          </Tag>
        </a>
      );
    } else {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Tag color="default" style={{ cursor: 'pointer' }}>
            Ver archivo
          </Tag>
        </a>
      );
    }
  };

  // Filtrar datos según el término de búsqueda
  const datosFiltrados = dataPolizas.filter((poliza) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      poliza.gex?.toLowerCase().includes(searchLower) ||
      poliza.suite?.toLowerCase().includes(searchLower) ||
      poliza.asesor?.toLowerCase().includes(searchLower) ||
      poliza.cajas?.toString().includes(searchLower) ||
      poliza.volumen?.toLowerCase().includes(searchLower) ||
      poliza.costo_usd?.toString().includes(searchLower) ||
      poliza.total_factura?.toString().includes(searchLower) ||
      humanizarFecha(poliza.created).toLowerCase().includes(searchLower)
    );
  });

  const columnas: ColumnsType<Poliza> = [
    {
      title: 'GEX',
      dataIndex: 'gex',
      key: 'gex',
      width: 140,
      align: 'center',
    },
    {
      title: 'SUITE',
      dataIndex: 'suite',
      key: 'suite',
      width: 100,
      align: 'center',
    },
    {
      title: 'ASESOR',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 180,
      align: 'center',
    },
    {
      title: 'CARTONES',
      dataIndex: 'cajas',
      key: 'cajas',
      width: 100,
      align: 'center',
    },
    {
      title: 'CBM',
      dataIndex: 'volumen',
      key: 'volumen',
      width: 100,
      align: 'center',
      render: (value) => value ? `${value} m³` : '-',
    },
    {
      title: 'COSTO USD',
      dataIndex: 'costo_usd',
      key: 'costo_usd',
      width: 130,
      align: 'center',
      render: (value) => value ? `$${value}` : '-',
    },
    {
      title: 'FACTURA',
      dataIndex: 'file_factura',
      key: 'file_factura',
      width: 120,
      align: 'center',
      render: (value) => renderFileTag(value),
    },
    {
      title: 'PL',
      dataIndex: 'file_pl',
      key: 'file_pl',
      width: 100,
      align: 'center',
      render: (value) => renderFileTag(value),
    },
    {
      title: 'FECHA',
      dataIndex: 'created',
      key: 'created',
      width: 250,
      align: 'center',
      render: (value) => humanizarFecha(value),
    },
    {
      title: 'TOTAL POLIZA',
      dataIndex: 'total_factura',
      key: 'total_factura',
      width: 150,
      align: 'center',
      render: (value) => (
        <span style={{ fontWeight: 'bold', color: '#ff6600' }}>
          {formatearMoneda(value)}
        </span>
      ),
    },
    {
      title: 'ACCIONES',
      key: 'acciones',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleAprobar(record)}
            size="small"
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            title="Aprobar"
          />
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleRechazar(record)}
            size="small"
            title="Rechazar"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="polizas-container">
      <Card 
        title={<h2 style={{ margin: 0 }}>Pólizas pagadas pendientes de aprobación</h2>}
        className="polizas-card"
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar por GEX, Suite, Asesor, Cajas, Volumen, Costo, Fecha o Total"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
            style={{ width: '100%' }}
          />
        </div>
        <Table
          columns={columnas}
          dataSource={datosFiltrados}
          loading={loading}
          rowKey={(record) => record.token}
          pagination={{
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total) => `Total: ${total} pólizas${searchTerm ? ' (filtradas)' : ''}`,
            onShowSizeChange: (_, size) => setPageSize(size),
          }}
          scroll={{ x: 1700 }}
          className="tabla-polizas"
        />
      </Card>
    </div>
  );
};

export default PolizasPagadas;
