import React, { useState, useEffect } from 'react';
import { Card, Table, Dropdown, Button, Input, message, Tag, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, DownOutlined, EyeOutlined, DownloadOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import { humanizarFecha } from '@/utils/dateUtils';
import { cotizacionesService } from '@/services/cotizacionesService';

interface CotizacionMaritima {
  id: string | number;
  ctz: string;
  week: string;
  suite: string;
  asesor: string;
  cbm: string | number;
  tipo_cambio: string | number;
  costo: string | number;
  costo_paqueteria: string | number;
  estado: string;
  fecha_aprobacion?: string;
  fecha_subida: string;
}

interface LogMaritimo {
  id: string | number;
  bl: string;
  week: string;
  fecha: string;
  tipo: string;
  cliente: string;
  log: string;
  estado: boolean | number | string;
  logo: boolean | number | string;
  paqueteria: string;
}

interface PagoMaritimo {
  id: string | number;
  ctz: string;
  comprobante: string;
  cantidad: string | number;
  fecha_pago: string;
}

const CotizacionesMaritimas: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CotizacionMaritima[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<CotizacionMaritima[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Estados para el modal de logs
  const [modalLogsVisible, setModalLogsVisible] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsData, setLogsData] = useState<LogMaritimo[]>([]);
  const [ctzSeleccionada, setCtzSeleccionada] = useState<string>('');

  // Estados para el modal de pagos
  const [modalPagosVisible, setModalPagosVisible] = useState(false);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [pagosData, setPagosData] = useState<PagoMaritimo[]>([]);

  // Estados para el modal de PDF
  const [modalPdfVisible, setModalPdfVisible] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
      setPagination({ ...pagination, current: 1 });
    } else {
      setFilteredData(data);
    }
  }, [searchText, data]);

  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      const response = await cotizacionesService.listMaritimas();
      
      // Mapear datos de la API al formato del componente
      const dataMapeada: CotizacionMaritima[] = response.map((item: any) => ({
        id: item.id,
        ctz: item.ctz || '-',
        week: item.week || '-',
        suite: item.suite || '-',
        asesor: item.resp || '-', // TODO: Mapear ID de asesor a nombre si es necesario
        cbm: item.cbm || 0,
        tipo_cambio: item.tc || 0,
        costo: item.costo || 0,
        costo_paqueteria: item.costopaq || 0,
        estado: mapearEstado(item.state),
        fecha_aprobacion: item.aprobed || '',
        fecha_subida: item.created || '',
      }));
      
      setData(dataMapeada);
      setPagination({ ...pagination, total: dataMapeada.length });
    } catch (error) {
      console.error('Error al cargar cotizaciones marítimas:', error);
      message.error('Error al cargar las cotizaciones');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Mapear el estado numérico a texto
  const mapearEstado = (state: string | number): string => {
    const stateNum = typeof state === 'string' ? parseInt(state) : state;
    switch (stateNum) {
      case 1:
        return 'Nuevo';
      case 2:
        return 'En validación';
      case 3:
        return 'Aprobado';
      default:
        return 'Nuevo';
    }
  };

  const handleDetalles = async (cotizacion: CotizacionMaritima) => {
    try {
      setCtzSeleccionada(cotizacion.ctz);
      setModalLogsVisible(true);
      setLoadingLogs(true);
      
      const response = await cotizacionesService.getDataQuoteMaritima(cotizacion.ctz);
      
      if (response.status === 'success') {
        const logsArray = response.data || [];
        const logsMapeados: LogMaritimo[] = logsArray.map((item: any) => ({
          id: item.id || Math.random(),
          bl: item.bl || '-',
          week: item.week || '-',
          fecha: item.dated || '-',
          tipo: item.type || '-',
          cliente: item.cliente || '-',
          log: item.log || '-',
          estado: item.estado ?? false,
          logo: item.logo ?? false,
          paqueteria: item.paqueteria || '-',
        }));
        setLogsData(logsMapeados);
      } else {
        message.error(response.message || 'Error al cargar los logs');
        setLogsData([]);
      }
    } catch (error: any) {
      console.error('Error al cargar logs:', error);
      message.error(error.response?.data?.message || 'Error al cargar los logs de la cotización');
      setLogsData([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleDescargarPDF = async (cotizacion: CotizacionMaritima) => {
    try {
      setCtzSeleccionada(cotizacion.ctz);
      setLoadingPdf(true);
      
      const response = await cotizacionesService.downloadQuoteMaritimePdf(cotizacion.ctz);
      
      if (response.status === 'success') {
        setPdfUrl(response.url);
        setModalPdfVisible(true);
        message.success(response.message || 'PDF generado correctamente');
      } else {
        message.error(response.message || 'Error al generar el PDF');
      }
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      message.error(error.response?.data?.message || 'Error al generar el PDF de la cotización');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handlePagos = async (cotizacion: CotizacionMaritima) => {
    try {
      setCtzSeleccionada(cotizacion.ctz);
      setModalPagosVisible(true);
      setLoadingPagos(true);
      
      const response = await cotizacionesService.getPaymentsQuoteMaritime(cotizacion.ctz);
      
      if (response.status === 'success') {
        const pagosArray = response.data || [];
        const pagosMapeados: PagoMaritimo[] = pagosArray.map((item: any) => ({
          id: item.id || Math.random(),
          ctz: item.ctz || cotizacion.ctz,
          comprobante: item.token && item.ext 
            ? `https://sistemaentregax.com/pagos/comprobante/${item.token}${item.ext}`
            : '-',
          cantidad: item.cantidad || 0,
          fecha_pago: item.paid || '-',
        }));
        setPagosData(pagosMapeados);
        if (pagosMapeados.length === 0) {
          message.info('No hay pagos registrados para esta cotización');
        }
      } else {
        message.error(response.message || 'Error al cargar los pagos');
        setPagosData([]);
      }
    } catch (error: any) {
      console.error('Error al cargar pagos:', error);
      message.error(error.response?.data?.message || 'Error al cargar los pagos de la cotización');
      setPagosData([]);
    } finally {
      setLoadingPagos(false);
    }
  };

  const getMenuItems = (cotizacion: CotizacionMaritima): MenuProps['items'] => [
    {
      key: 'detalles',
      label: 'Detalles',
      icon: <EyeOutlined />,
      onClick: () => handleDetalles(cotizacion),
    },
    {
      key: 'descargar-pdf',
      label: 'Descargar PDF',
      icon: <DownloadOutlined />,
      onClick: () => handleDescargarPDF(cotizacion),
    },
    {
      key: 'pagos',
      label: 'Pagos',
      icon: <DollarOutlined />,
      onClick: () => handlePagos(cotizacion),
    },
  ];

  const getEstadoColor = (estado: string): string => {
    switch (estado.toLowerCase()) {
      case 'nuevo':
        return 'blue';
      case 'en validación':
        return 'orange';
      case 'aprobado':
        return 'green';
      default:
        return 'default';
    }
  };

  const formatMoney = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const columns: ColumnsType<CotizacionMaritima> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: CotizacionMaritima) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="primary" style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}>
            Acciones <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'CTZ',
      dataIndex: 'ctz',
      key: 'ctz',
      width: 150,
    },
    {
      title: 'WEEK',
      dataIndex: 'week',
      key: 'week',
      width: 120,
      align: 'center',
    },
    {
      title: 'Suite',
      dataIndex: 'suite',
      key: 'suite',
      width: 120,
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 180,
    },
    {
      title: 'CBM',
      dataIndex: 'cbm',
      key: 'cbm',
      width: 100,
      align: 'right',
      render: (cbm: string | number) => Number(cbm).toFixed(2),
    },
    {
      title: 'Tipo de cambio',
      dataIndex: 'tipo_cambio',
      key: 'tipo_cambio',
      width: 140,
      align: 'right',
      render: (tipoCambio: string | number) => `$${Number(tipoCambio).toFixed(2)}`,
    },
    {
      title: 'Costo',
      dataIndex: 'costo',
      key: 'costo',
      width: 130,
      align: 'right',
      render: (costo: string | number) => formatMoney(costo),
    },
    {
      title: 'Costo paqueteria',
      dataIndex: 'costo_paqueteria',
      key: 'costo_paqueteria',
      width: 150,
      align: 'right',
      render: (costoPaqueteria: string | number) => formatMoney(costoPaqueteria),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 130,
      align: 'center',
      render: (estado: string) => (
        <Tag color={getEstadoColor(estado)}>{estado}</Tag>
      ),
    },
    {
      title: 'Fecha de aprobacion',
      dataIndex: 'fecha_aprobacion',
      key: 'fecha_aprobacion',
      width: 180,
      align: 'center',
      render: (fecha: string) => fecha ? humanizarFecha(fecha) : '-',
    },
    {
      title: 'Fecha de subida',
      dataIndex: 'fecha_subida',
      key: 'fecha_subida',
      width: 180,
      align: 'center',
      render: (fecha: string) => fecha ? humanizarFecha(fecha) : '-',
    },
  ];

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const handleCloseModalLogs = () => {
    setModalLogsVisible(false);
    setLogsData([]);
    setCtzSeleccionada('');
  };

  // Columnas para la tabla de logs en el modal
  const logsColumns: ColumnsType<LogMaritimo> = [
    {
      title: 'BL',
      dataIndex: 'bl',
      key: 'bl',
      width: 150,
    },
    {
      title: 'WEEK',
      dataIndex: 'week',
      key: 'week',
      width: 100,
      align: 'center',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 150,
      render: (fecha: string) => fecha && fecha !== '-' ? humanizarFecha(fecha) : '-',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 120,
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      width: 200,
    },
    {
      title: 'LOG',
      dataIndex: 'log',
      key: 'log',
      width: 250,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 100,
      align: 'center',
      render: (estado: boolean | number | string) => {
        const isActivo = estado === true || estado === 1 || estado === '1';
        return isActivo ? (
          <CheckCircleOutlined style={{ color: 'green', fontSize: 20 }} />
        ) : (
          <CloseCircleOutlined style={{ color: 'red', fontSize: 20 }} />
        );
      },
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 100,
      align: 'center',
      render: (logo: boolean | number | string) => {
        const isActivo = logo === true || logo === 1 || logo === '1';
        return isActivo ? (
          <CheckCircleOutlined style={{ color: 'green', fontSize: 20 }} />
        ) : (
          <CloseCircleOutlined style={{ color: 'red', fontSize: 20 }} />
        );
      },
    },
    {
      title: 'Paqueteria',
      dataIndex: 'paqueteria',
      key: 'paqueteria',
      width: 150,
    },
  ];

  const handleCloseModalPagos = () => {
    setModalPagosVisible(false);
    setPagosData([]);
  };

  const handleCloseModalPdf = () => {
    setModalPdfVisible(false);
    setPdfUrl('');
    setCtzSeleccionada('');
  };

  // Columnas para la tabla de pagos en el modal
  const pagosColumns: ColumnsType<PagoMaritimo> = [
    {
      title: 'CTZ',
      dataIndex: 'ctz',
      key: 'ctz',
      width: 150,
    },
    {
      title: 'Comprobante',
      dataIndex: 'comprobante',
      key: 'comprobante',
      width: 200,
      render: (comprobante: string) => {
        if (comprobante === '-') return '-';
        return (
          <a href={comprobante} target="_blank" rel="noopener noreferrer" style={{ color: '#ff6600' }}>
            <DownloadOutlined /> Ver comprobante
          </a>
        );
      },
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: 150,
      align: 'right',
      render: (cantidad: string | number) => formatMoney(cantidad),
    },
    {
      title: 'Fecha de pago',
      dataIndex: 'fecha_pago',
      key: 'fecha_pago',
      width: 180,
      align: 'center',
      render: (fecha: string) => fecha && fecha !== '-' ? humanizarFecha(fecha) : '-',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Cotizaciones Maritimas">
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar cotización..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            size="large"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Card>

      {/* Modal de LOGS */}
      <Modal
        title={`LOGS - ${ctzSeleccionada}`}
        open={modalLogsVisible}
        onCancel={handleCloseModalLogs}
        footer={null}
        width={1200}
        destroyOnClose
      >
        <Table
          columns={logsColumns}
          dataSource={logsData}
          rowKey="id"
          loading={loadingLogs}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} logs`,
          }}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Modal>

      {/* Modal de Pagos */}
      <Modal
        title={`Pagos vinculados - ${ctzSeleccionada}`}
        open={modalPagosVisible}
        onCancel={handleCloseModalPagos}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Table
          columns={pagosColumns}
          dataSource={pagosData}
          rowKey="id"
          loading={loadingPagos}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} pagos`,
          }}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Modal>

      {/* Modal de visualizador de PDF */}
      <Modal
        title={`Cotización - ${ctzSeleccionada}`}
        open={modalPdfVisible}
        onCancel={handleCloseModalPdf}
        footer={[
          <Button key="download" type="primary" style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>
              <DownloadOutlined /> Descargar PDF
            </a>
          </Button>,
          <Button key="close" onClick={handleCloseModalPdf}>
            Cerrar
          </Button>,
        ]}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
      >
        {loadingPdf ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Generando PDF...</p>
          </div>
        ) : (
          pdfUrl && (
            <iframe
              src={pdfUrl}
              style={{ width: '100%', height: '80vh', border: 'none' }}
              title={`PDF - ${ctzSeleccionada}`}
            />
          )
        )}
      </Modal>
    </div>
  );
};

export default CotizacionesMaritimas;
