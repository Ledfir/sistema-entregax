import { useEffect, useState } from 'react';
import { Table, Button, Card, Input, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { operacionesService } from '@/services/operacionesService';
import Swal from 'sweetalert2';
import './HomeServicioCliente.css';

interface CotizacionPendiente {
  id: string;
  Suite: string;
  ctz: string;
  cedis: string;
  tipo: string;
  paq: string;
  cajas: string;
  fecha: string;
  de?: string;
  aa?: string;
  estado?: string;
  cliente?: string;
  idu?: string;
}

interface CajaValidada {
  id: string;
  idap: string;
  guia: string;
  guiaunica: string;
  fecha: string;
  largo: string;
  alto: string;
  ancho: string;
  peso: string;
  cajas: string;
  idco: string;
  costo: string;
  volumen: string;
}

interface Destino {
  calle: string;
  numeroext: string;
  numeroint: string;
  colonia: string;
  cp: string;
  municipio: string;
  estado: string;
}

interface CajaConCosto {
  id: string;
  idap?: string;
  guia?: string;
  guiaunica?: string;
  fecha?: string;
  largo?: string;
  alto?: string;
  ancho?: string;
  peso?: string;
  cajas?: string;
  idco?: string;
  costo?: string;
  volumen?: string;
  destino: Destino;
  // Campos para tipo MARITIMO
  name?: string;      // LOG
  cbm?: string;       // Metros cúbicos
  bultos?: string;    // Bultos
  token?: string;
  idbl?: string;
  idu?: string;
  idc?: string;
  dated?: string;
  arrived?: string;
  type?: string;
  estado?: string;
  cedis?: string;
  week?: string;
  logo?: string;
  sensible?: string;
  pl?: string;
  pl_tipo?: string;
  pl_file?: string;
  pl_date?: string;
  ingreso_resp?: string;
  ingreso_date?: string;
  instrucciones?: string;
  ide?: string;
  factura?: string;
  paqueteria?: string;
  cotizado?: string;
  pagado?: string;
  pagado_fecha?: string;
  cedis_fecha?: string | null;
  ingresada?: string;
  guiasalida?: string;
  salida_resp?: string;
  salida_fecha?: string | null;
  ctz?: string;
  boton?: string;
  listpl?: string;
  notif?: string;
  oculto?: string;
  desc?: string | null;
  resp?: string;
  state?: string;
  created?: string;
}

interface DetalleCotizacion {
  register: {
    id: string;
    ctz: string;
    de: string;
    aa: string;
    fecha: string;
    cajas: string;
    estado: string;
    cliente: string;
    tipo: string;
    cedis: string;
    Suite: string;
    paqueteria: string;
  };
  paq: {
    name: string;
  };
  data: {
    boxes: CajaConCosto[];
  };
}


export const HomeServicioCliente = () => {
  const [vistaActual, setVistaActual] = useState<'home' | 'cajas-validadas' | 'asignar-costo'>('home');
  const [loadingAsignar, setLoadingAsignar] = useState(false);
  const [loadingMedidas, setLoadingMedidas] = useState(false);
  const [loadingCajas, setLoadingCajas] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [dataAsignar, setDataAsignar] = useState<CotizacionPendiente[]>([]);
  const [dataMedidas, setDataMedidas] = useState<CotizacionPendiente[]>([]);
  const [dataCajasValidadas, setDataCajasValidadas] = useState<CajaValidada[]>([]);
  const [detalleCotizacion, setDetalleCotizacion] = useState<DetalleCotizacion | null>(null);
  const [costosEditados, setCostosEditados] = useState<{ [key: string]: string }>({});
  const [pageSizeAsignar, setPageSizeAsignar] = useState(10);
  const [pageSizeMedidas, setPageSizeMedidas] = useState(10);
  const [pageSizeCajas, setPageSizeCajas] = useState(10);

  useEffect(() => {
    document.title = 'Home - Servicio al Cliente';
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingAsignar(true);
      setLoadingMedidas(true);
      
      const response = await operacionesService.getCotizacionesPendientes();
      
      if (response.status === 'success' && response.data) {
        // Cargar registers en la primera tabla
        if (Array.isArray(response.data.registers)) {
          setDataAsignar(response.data.registers);
        } else {
          setDataAsignar([]);
        }
        
        // Cargar pending en la segunda tabla
        if (Array.isArray(response.data.pending)) {
          setDataMedidas(response.data.pending);
        } else {
          setDataMedidas([]);
        }
      } else {
        setDataAsignar([]);
        setDataMedidas([]);
      }
    } catch (error: any) {
      console.error('Error al cargar cotizaciones pendientes:', error);
      setDataAsignar([]);
      setDataMedidas([]);
    } finally {
      setLoadingAsignar(false);
      setLoadingMedidas(false);
    }
  };

  const humanizarFecha = (fechaStr: string): string => {
    if (!fechaStr) return '-';
    
    try {
      // Formato esperado: "24-02-2026 20:19:01"
      const [fecha, hora] = fechaStr.split(' ');
      const [dia, mes, anio] = fecha.split('-');
      const [horas, minutos] = hora.split(':');
      
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

  const handleVerDetalles = async (record: CotizacionPendiente) => {
    try {
      setLoadingDetalle(true);
      setVistaActual('asignar-costo');
      
      const response = await operacionesService.getDetalleCotizacionPendiente(record.id);
      
      if (response.status === 'success' && response.data) {
        // Validar que la estructura de datos sea correcta
        if (!response.data.register || !response.data.paq || !response.data.data || !response.data.data.boxes) {
          console.error('Estructura de datos inválida:', response.data);
          throw new Error('La estructura de datos recibida no es válida');
        }
        
        // Inicializar costos editados con los valores actuales
        const costosIniciales: { [key: string]: string } = {};
        response.data.data.boxes.forEach((caja: CajaConCosto) => {
          costosIniciales[caja.id] = caja.costo || '';
        });
        setCostosEditados(costosIniciales);
        
        // Actualizar el detalle al final
        setDetalleCotizacion(response.data);
      } else {
        setVistaActual('home');
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar el detalle de la cotización',
          icon: 'error',
          confirmButtonColor: '#ff6600'
        });
      }
    } catch (error: any) {
      console.error('Error al cargar detalle:', error);
      setVistaActual('home');
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al cargar el detalle',
        icon: 'error',
        confirmButtonColor: '#ff6600'
      });
    } finally {
      setLoadingDetalle(false);
    }
  };

  const loadCajasValidadas = async () => {
    try {
      setLoadingCajas(true);
      const response = await operacionesService.getCajasValidadasPaquete();
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        setDataCajasValidadas(response.data);
      } else {
        setDataCajasValidadas([]);
      }
    } catch (error: any) {
      console.error('Error al cargar cajas validadas:', error);
      setDataCajasValidadas([]);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las cajas validadas',
        icon: 'error',
        confirmButtonColor: '#ff6600'
      });
    } finally {
      setLoadingCajas(false);
    }
  };

  const handleCajasCTZ = async () => {
    setVistaActual('cajas-validadas');
    await loadCajasValidadas();
  };

  const handleVolverHome = () => {
    setVistaActual('home');
    setDetalleCotizacion(null);
    setCostosEditados({});
  };

  const columnasAsignar: ColumnsType<CotizacionPendiente> = [
    {
      title: 'Suite',
      dataIndex: 'Suite',
      key: 'Suite',
      width: 100,
      align: 'center',
    },
    {
      title: 'CTZ',
      dataIndex: 'ctz',
      key: 'ctz',
      width: 150,
      align: 'center',
    },
    {
      title: 'CEDIS',
      dataIndex: 'cedis',
      key: 'cedis',
      width: 150,
      align: 'center',
    },
    {
      title: 'TIPO',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 100,
      align: 'center',
    },
    {
      title: 'PAQUETERIA',
      dataIndex: 'paq',
      key: 'paq',
      width: 150,
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
      title: 'FECHA',
      key: 'fecha',
      width: 250,
      render: (_, record) => humanizarFecha(record.fecha),
      align: 'center',
    },
    {
      title: 'VER',
      key: 'ver',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleVerDetalles(record)}
          style={{ background: '#ff6600', borderColor: '#ff6600' }}
        >
          Ver detalles
        </Button>
      ),
    },
  ];

  const columnasMedidas: ColumnsType<CotizacionPendiente> = [
    {
      title: 'Suite',
      dataIndex: 'Suite',
      key: 'Suite',
      width: 100,
      align: 'center',
    },
    {
      title: 'CTZ',
      dataIndex: 'ctz',
      key: 'ctz',
      width: 150,
      align: 'center',
    },
    {
      title: 'CEDIS',
      dataIndex: 'cedis',
      key: 'cedis',
      width: 150,
      align: 'center',
    },
    {
      title: 'TIPO',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 120,
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
      title: 'FECHA',
      key: 'fecha',
      width: 250,
      render: (_, record) => humanizarFecha(record.fecha),
      align: 'center',
    },
  ];

  const columnasCajasValidadas: ColumnsType<CajaValidada> = [
    {
      title: 'CTZ',
      dataIndex: 'idco',
      key: 'idco',
      width: 150,
      align: 'center',
    },
    {
      title: 'GUIA',
      dataIndex: 'guia',
      key: 'guia',
      width: 180,
      align: 'center',
    },
    {
      title: 'GUIA UNICA',
      dataIndex: 'guiaunica',
      key: 'guiaunica',
      width: 180,
      align: 'center',
    },
    {
      title: 'LARGO',
      dataIndex: 'largo',
      key: 'largo',
      width: 100,
      align: 'center',
    },
    {
      title: 'ALTO',
      dataIndex: 'alto',
      key: 'alto',
      width: 100,
      align: 'center',
    },
    {
      title: 'ANCHO',
      dataIndex: 'ancho',
      key: 'ancho',
      width: 100,
      align: 'center',
    },
    {
      title: 'PESO',
      dataIndex: 'peso',
      key: 'peso',
      width: 100,
      align: 'center',
    },
    {
      title: 'CAJAS',
      dataIndex: 'cajas',
      key: 'cajas',
      width: 100,
      align: 'center',
    },
    {
      title: 'COSTO',
      dataIndex: 'costo',
      key: 'costo',
      width: 120,
      align: 'center',
      render: (value) => value ? `$${value}` : '-',
    },
  ];

  const handleCostoChange = (id: string, value: string) => {
    setCostosEditados(prev => ({ ...prev, [id]: value }));
  };

  const handleAsignarCostos = async () => {
    if (!detalleCotizacion) return;

    const cajas = detalleCotizacion.data.boxes;
    const todasTienenCosto = cajas.every(caja => 
      costosEditados[caja.id] && costosEditados[caja.id].trim() !== ''
    );

    if (!todasTienenCosto) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Debe asignar costo a todas las cajas antes de continuar',
        icon: 'warning',
        confirmButtonColor: '#ff6600'
      });
      return;
    }

    try {
      const data = {
        ctzId: detalleCotizacion.register.id,
        costs: cajas.map(caja => ({
          boxId: caja.id,
          cost: parseFloat(costosEditados[caja.id])
        }))
      };

      const response = await operacionesService.asignarCostosCotizacion(data);

      if (response.status === 'success') {
        Swal.fire({
          title: 'Éxito',
          text: response.message || 'Costos asignados correctamente',
          icon: 'success',
          confirmButtonColor: '#ff6600'
        });
        setVistaActual('home');
        loadData();
      } else {
        Swal.fire({
          title: 'Error',
          text: response.message || 'No se pudieron asignar los costos',
          icon: 'error',
          confirmButtonColor: '#ff6600'
        });
      }
    } catch (error: any) {
      console.error('Error al asignar costos:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al asignar los costos',
        icon: 'error',
        confirmButtonColor: '#ff6600'
      });
    }
  };

  // Columnas para envíos MARITIMOS
  const columnasCostosMaritimo: ColumnsType<CajaConCosto> = [
    {
      title: 'CTZ',
      dataIndex: 'ctz',
      key: 'ctz',
      align: 'center',
    },
    {
      title: 'LOG',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: 'CBM',
      dataIndex: 'cbm',
      key: 'cbm',
      align: 'center',
    },
    {
      title: 'BULTOS',
      dataIndex: 'bultos',
      key: 'bultos',
      align: 'center',
    },
    {
      title: 'DESTINO',
      key: 'destino',
      width: 300,
      render: (_, record) => (
        <div style={{ textAlign: 'left', fontSize: '12px' }}>
          <div><strong>Calle:</strong> {record.destino.calle} #{record.destino.numeroext}</div>
          {record.destino.numeroint && <div><strong>Numero interior:</strong> {record.destino.numeroint}</div>}
          <div><strong>Colonia:</strong> {record.destino.colonia} <strong>CP:</strong> {record.destino.cp}</div>
          <div><strong>Municipio:</strong> {record.destino.municipio} <strong>Estado:</strong> {record.destino.estado}</div>
        </div>
      ),
    },
    {
      title: 'COSTO',
      key: 'costo',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Input
          type="number"
          value={costosEditados[record.id] || ''}
          onChange={(e) => handleCostoChange(record.id, e.target.value)}
          placeholder="Ingrese costo"
          style={{ width: '100%' }}
        />
      ),
    },
  ];

  // Columnas para envíos normales (Paquete Express, etc.)
  const columnasCostos: ColumnsType<CajaConCosto> = [
    {
      title: 'CTZ',
      dataIndex: 'idco',
      key: 'idco',
      align: 'center',
    },
    {
      title: 'GUIA',
      dataIndex: 'guia',
      key: 'guia',
      align: 'center',
    },
    {
      title: 'GUIA UNICA',
      dataIndex: 'guiaunica',
      key: 'guiaunica',
      align: 'center',
    },
    {
      title: 'MEDIDAS (L x A x An)',
      key: 'medidas',
      align: 'center',
      render: (_, record) => `${record.largo} x ${record.alto} x ${record.ancho}`,
    },
    {
      title: 'PESO',
      dataIndex: 'peso',
      key: 'peso',
      align: 'center',
      render: (value) => value ? `${value} kg` : '-',
    },
    {
      title: 'CAJAS',
      dataIndex: 'cajas',
      key: 'cajas',
      align: 'center',
    },
    {
      title: 'DESTINO',
      key: 'destino',
      width: 300,
      render: (_, record) => (
        <div style={{ textAlign: 'left', fontSize: '12px' }}>
          <div><strong>Calle:</strong> {record.destino.calle} {record.destino.numeroext}</div>
          <div><strong>Colonia:</strong> {record.destino.colonia}, <strong>CP:</strong> {record.destino.cp}</div>
          <div><strong>Municipio:</strong> {record.destino.municipio}, <strong>Estado:</strong> {record.destino.estado}</div>
        </div>
      ),
    },
    {
      title: 'COSTO',
      key: 'costo',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Input
          type="number"
          value={costosEditados[record.id] || ''}
          onChange={(e) => handleCostoChange(record.id, e.target.value)}
          placeholder="400"
          style={{ width: '100%' }}
        />
      ),
    },
  ];

  // Renderizado condicional según la vista actual
  if (vistaActual === 'asignar-costo') {
    if (!detalleCotizacion || loadingDetalle) {
      return (
        <div className="home-servicio-container">
          <div className="home-header">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleVolverHome}
              style={{ 
                color: 'white', 
                marginBottom: '16px',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Volver
            </Button>
            <h1>Cargando detalle...</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Spin size="large" />
          </div>
        </div>
      );
    }

    return (
      <div className="home-servicio-container">
        <div className="home-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleVolverHome}
            style={{ 
              color: 'white', 
              marginBottom: '16px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Volver
          </Button>
          <h1>Cajas en CTZ "{detalleCotizacion?.paq?.name || 'Sin nombre'}"</h1>
        </div>

        <div className="seccion-cotizaciones">
          <div className="quote-info">
            <h2>
              CTZ: {detalleCotizacion?.register?.ctz || 'N/A'} | Suite: {detalleCotizacion?.register?.Suite || 'N/A'} | Tipo: {detalleCotizacion?.register?.tipo || 'N/A'}
            </h2>
            <p><strong>CEDIS:</strong> {detalleCotizacion?.register?.cedis || 'N/A'}</p>
            <p><strong>Código postal de origen: {detalleCotizacion?.register?.de || 'N/A'}</strong></p>
            <p><strong>Fecha:</strong> {detalleCotizacion?.register?.fecha ? humanizarFecha(detalleCotizacion.register.fecha) : 'N/A'}</p>
          </div>

          <h3 style={{ marginTop: '24px', marginBottom: '8px', textAlign: 'center' }}>
            Cotizaciones pendientes de asignar costo para {detalleCotizacion?.paq?.name || 'paquetería'} {detalleCotizacion?.register?.tipo === 'MARITIMO' ? 'PREPAGADO' : ''}
          </h3>
          <p style={{ marginBottom: '24px', color: '#666', textAlign: 'center' }}>
            {detalleCotizacion?.register?.tipo === 'MARITIMO' 
              ? 'Ingrese el costo para cada registro marítimo.'
              : 'Recuerde ingresar el costo UNITARIO de una sola caja. El sistema calcula el costo TOTAL dependiendo de la cantidad de cajas.'}
          </p>

          <Table
            columns={detalleCotizacion?.register?.tipo === 'MARITIMO' ? columnasCostosMaritimo : columnasCostos}
            dataSource={detalleCotizacion?.data?.boxes || []}
            loading={loadingDetalle}
            rowKey={(record) => record.id}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              showTotal: (total) => `Total: ${total} ${detalleCotizacion?.register?.tipo === 'MARITIMO' ? 'registros' : 'cajas'}`,
            }}
            scroll={{ x: 1400 }}
            className="tabla-cotizaciones"
          />

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleAsignarCostos}
              style={{ 
                background: '#ff6600', 
                borderColor: '#ff6600',
                fontWeight: 'bold',
                height: '48px',
                padding: '0 32px'
              }}
            >
              Asignar Costo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (vistaActual === 'cajas-validadas') {
    return (
      <div className="home-servicio-container">
        <div className="home-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleVolverHome}
            style={{ 
              color: 'white', 
              marginBottom: '16px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Volver
          </Button>
          <h1>Cajas en CTZ Paquete Express, EVISA y 24 HORAS</h1>
        </div>

        <Card 
          title="Cajas en CTZ Paquete Express, EVISA y 24 HORAS"
          className="card-cajas-validadas"
        >
          <Table
            columns={columnasCajasValidadas}
            dataSource={dataCajasValidadas}
            loading={loadingCajas}
            rowKey={(record) => record.id}
            pagination={{
              pageSize: pageSizeCajas,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              showTotal: (total) => `Total: ${total} registros`,
              onShowSizeChange: (_, size) => setPageSizeCajas(size),
            }}
            scroll={{ x: 1200 }}
            className="tabla-cotizaciones"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="home-servicio-container">
      <div className="home-header">
        <h1>Cotizaciones Pendientes de validar Paquete Express, EVISA y 24 HORAS</h1>
      </div>

      <div className="seccion-cotizaciones">
        <div className="seccion-titulo">
          <h2>Cotizaciones pendientes de validar para asignar</h2>
          <Button 
            type="primary" 
            onClick={handleCajasCTZ}
            className="btn-cajas-ctz"
          >
            Cajas en CTZ's validadas
          </Button>
        </div>
        
        <Table
          columns={columnasAsignar}
          dataSource={dataAsignar}
          loading={loadingAsignar}
          rowKey={(record) => record.id}
          pagination={{
            pageSize: pageSizeAsignar,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total) => `Total: ${total} registros`,
            onShowSizeChange: (_, size) => setPageSizeAsignar(size),
          }}
          scroll={{ x: 1000 }}
          className="tabla-cotizaciones"
        />
      </div>

      <div className="seccion-cotizaciones">
        <div className="seccion-titulo">
          <h2>Cotizaciones pendientes de asignar medidas y peso para paquete express</h2>
        </div>
        
        <Table
          columns={columnasMedidas}
          dataSource={dataMedidas}
          loading={loadingMedidas}
          rowKey={(record) => record.id}
          pagination={{
            pageSize: pageSizeMedidas,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total) => `Total: ${total} registros`,
            onShowSizeChange: (_, size) => setPageSizeMedidas(size),
          }}
          scroll={{ x: 1000 }}
          className="tabla-cotizaciones"
        />
      </div>
    </div>
  );
};

export default HomeServicioCliente;
