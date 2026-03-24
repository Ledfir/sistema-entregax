import { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Spin, Form, Input, Select, InputNumber, Upload, Table, Modal } from 'antd';
import { DollarOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Swal from 'sweetalert2';
import operacionesService from '@/services/operacionesService';
import clienteService from '@/services/clienteService';

interface Proveedor {
  id: string | number;
  descri: string;
  tc: string | number;
  vence: string | number;
  [key: string]: any;
}

interface ServicioFiscal {
  key: number;
  clave: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  servicio: string;
  tipoServicio: string;
  descripcionAlternativa?: string;
}

interface Cliente {
  token: string;
  nombre: string;
  clavecliente: string;
}

interface Cuenta {
  token: string;
  id: string;
  name: string;
  rfc: string;
  banco: string;
  cuenta: string;
  clabe: string;
}

interface TipoServicio {
  id: string;
  name: string;
}

interface ServicioDisponible {
  id: string;
  ids: string;
  name: string;
}

export const EnvioConFactura = () => {
  const [loading, setLoading]         = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [servicios, setServicios] = useState<ServicioFiscal[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioDisponible[]>([]);
  const [modalDescripcionVisible, setModalDescripcionVisible] = useState(false);
  const [descripcionAlternativa, setDescripcionAlternativa] = useState('');
  const [servicioEditando, setServicioEditando] = useState<number | null>(null);
  const [form] = Form.useForm();

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const res = await operacionesService.getDollarProviders();
      const items = res?.data ?? res ?? [];
      setProveedores(Array.isArray(items) ? items : []);
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al cargar proveedores.', showConfirmButton: false, timer: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const cargarClientes = async () => {
    try {
      const data = await clienteService.getAll();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleAbrirModal = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    form.resetFields();
    form.setFieldsValue({
      tipoCambio: Number(proveedor.tc).toFixed(2),
      pct: 6,
    });
    cargarClientes();
    setCuentas([]);
    setTiposServicio([]);
    setServiciosDisponibles([]);
    setMostrarFormulario(true);
  };

  const handleCerrarModal = () => {
    setMostrarFormulario(false);
    setProveedorSeleccionado(null);
    form.resetFields();
    setServicios([]);
    setTiposServicio([]);
    setServiciosDisponibles([]);
  };

  const handleAgregarServicio = async () => {
    const clave = form.getFieldValue('clave');
    const piezas = form.getFieldValue('piezas');
    const precioUnitario = form.getFieldValue('precioUnitario');
    const servicio = form.getFieldValue('servicio');
    const tipoServicio = form.getFieldValue('tipoServicio');

    if (!clave || !piezas || !precioUnitario || !servicio || !tipoServicio) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor completa todos los campos antes de agregar', showConfirmButton: false, timer: 2500 });
      return;
    }

    const total = piezas * precioUnitario;
    const nuevoServicio: ServicioFiscal = {
      key: Date.now(),
      clave,
      cantidad: piezas,
      precioUnitario,
      total,
      servicio,
      tipoServicio,
    };

    const nuevosServicios = [...servicios, nuevoServicio];
    setServicios(nuevosServicios);
    form.setFieldsValue({ clave: '', piezas: undefined, precioUnitario: undefined, servicio: undefined, tipoServicio: undefined });
    setTiposServicio([]);
    setServiciosDisponibles([]);

    // Si es el primer servicio agregado, cargar las cuentas
    if (servicios.length === 0 && proveedorSeleccionado?.id) {
      try {
        const response = await operacionesService.listAccountsWithInvoice({
          idprov: Number(proveedorSeleccionado.id)
        });
        const cuentasData = response.data || response;
        setCuentas(Array.isArray(cuentasData) ? cuentasData : []);
      } catch (error) {
        console.error('Error al cargar cuentas:', error);
      }
    }
  };

  const handleEliminarServicio = (key: number) => {
    setServicios(servicios.filter((s) => s.key !== key));
  };

  const handleAbrirModalDescripcionTabla = (record: ServicioFiscal) => {
    setServicioEditando(record.key);
    setDescripcionAlternativa(record.descripcionAlternativa || '');
    setModalDescripcionVisible(true);
  };

  const handleCerrarModalDescripcion = () => {
    setModalDescripcionVisible(false);
    setDescripcionAlternativa('');
    setServicioEditando(null);
  };

  const handleAgregarDescripcion = () => {
    // Si estamos editando un servicio de la tabla
    if (servicioEditando !== null) {
      setServicios(servicios.map(s => 
        s.key === servicioEditando 
          ? { ...s, descripcionAlternativa: descripcionAlternativa || undefined }
          : s
      ));
      setDescripcionAlternativa('');
      setServicioEditando(null);
    }
    setModalDescripcionVisible(false);
  };

  const handleBuscarClave = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const clave = e.target.value;
    
    if (!clave) {
      setTiposServicio([]);
      setServiciosDisponibles([]);
      form.setFieldsValue({
        tipoServicio: undefined,
        servicio: undefined
      });
      return;
    }
    
    if (!proveedorSeleccionado?.id) {
      return;
    }

    try {
      const response = await operacionesService.searchClave({
        clave,
        idprov: Number(proveedorSeleccionado.id)
      });
      
      console.log('Respuesta búsqueda clave:', response);
      
      // Guardar los catálogos de servicios y tipos de servicio
      if (response.data) {
        // Manejar cuando viene "servicio" singular (tipo: "unico") o "servicios" plural (tipo: "multiple")
        let tiposServ = [];
        if (response.data.tipo === 'unico' && response.data.servicio) {
          // Si es único, convertir el objeto en un array de un elemento
          tiposServ = [response.data.servicio];
        } else if (response.data.servicios) {
          // Si es múltiple, usar el array directamente
          tiposServ = response.data.servicios;
        }
        
        // Manejar "tps" (puede ser array u objeto)
        let serviciosDisp = [];
        if (response.data.tps) {
          if (Array.isArray(response.data.tps)) {
            serviciosDisp = response.data.tps;
          } else {
            // Si tps es un objeto singular, convertirlo a array
            serviciosDisp = [response.data.tps];
          }
        }
        
        setTiposServicio(tiposServ);
        setServiciosDisponibles(serviciosDisp);
        
        // Si hay resultados, establecer el primer valor como default
        if (tiposServ.length > 0 || serviciosDisp.length > 0) {
          form.setFieldsValue({
            tipoServicio: tiposServ.length > 0 ? tiposServ[0].id : undefined,
            servicio: serviciosDisp.length > 0 ? serviciosDisp[0].id : undefined
          });
        } else {
          // Si no hay resultados, resetear los selects
          form.setFieldsValue({
            tipoServicio: undefined,
            servicio: undefined
          });
        }
      } else {
        // Si no hay data en la respuesta, limpiar todo
        setTiposServicio([]);
        setServiciosDisponibles([]);
        form.setFieldsValue({
          tipoServicio: undefined,
          servicio: undefined
        });
      }
      
    } catch (error: any) {
      console.error('Error al buscar clave:', error);
      
      // Limpiar los selects en caso de error
      setTiposServicio([]);
      setServiciosDisponibles([]);
      form.setFieldsValue({
        tipoServicio: undefined,
        servicio: undefined
      });
      
      if (error.response?.data?.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error al buscar clave',
          text: error.response.data.message,
          timer: 2500,
        });
      }
    }
  };

  const handleGuardar = async () => {
    try {
      const values = await form.validateFields();
      console.log('Datos del formulario:', values);
      console.log('Servicios:', servicios);
      
      // Aquí irá la lógica para guardar el envío
      
      Swal.fire({
        icon: 'success',
        title: 'Envío creado',
        text: 'El envío de dólares se ha creado exitosamente',
        showConfirmButton: false,
        timer: 2500,
      });
      
      handleCerrarModal();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el envío',
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  const calcularTotal = () => {
    const monto = form.getFieldValue('monto');
    const pct = form.getFieldValue('pct');
    const tipoCambio = form.getFieldValue('tipoCambio');

    // Validar que los campos no estén vacíos
    if (!monto || !pct || !tipoCambio) {
      form.setFieldsValue({ total: '' });
      Swal.fire({
        position: 'center',
        title: 'Favor de verificar que Monto a enviar, PCT y Tipo de cambio no estén vacíos',
        text: 'Favor de modificar para continuar.',
        icon: 'warning',
        timer: 5000,
      });
      return;
    }

    // Validar que el PCT sea >= 4.5%
    if (pct < 4.5) {
      form.setFieldsValue({ total: '0' });
      Swal.fire({
        position: 'center',
        title: 'El PCT debe ser igual o mayor a 4.5%',
        text: 'Favor de modificar para continuar.',
        icon: 'warning',
        timer: 5000,
      });
      return;
    }

    // Calcular el porcentaje PCT en dólares
    const pctMonto = monto * (pct / 100);
    
    // Determinar el cargo fijo según el proveedor
    const cargoFijo = proveedorSeleccionado?.id === 1 ? 30 : 40;
    
    // Calcular el total en pesos
    const total = (monto + pctMonto + cargoFijo) * tipoCambio;
    
    // Validar que el total no supere los $100,000 pesos
    if (total > 100000) {
      Swal.fire({
        position: 'center',
        title: 'El Monto a enviar supera los $100,000 pesos.',
        text: 'Favor de modificar para continuar.',
        icon: 'warning',
        timer: 5000,
      });
      form.setFieldsValue({ monto: '' });
      return;
    }

    // Establecer el total calculado
    form.setFieldsValue({ total: total.toFixed(2) });
  };

  const columnasServicios: ColumnsType<ServicioFiscal> = [
    { title: '#', dataIndex: 'key', key: 'key', align: 'center', render: (_, __, index) => index + 1 },
    { 
      title: 'Clave', 
      dataIndex: 'clave', 
      key: 'clave', 
      align: 'center',
      render: (clave, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{clave}</span>
            <Button
              size="small"
              icon={<EditOutlined />}
              style={{ background: '#F26522', color: '#fff', border: 'none' }}
              onClick={() => handleAbrirModalDescripcionTabla(record)}
            />
          </div>
          {record.descripcionAlternativa && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Alternativo: {record.descripcionAlternativa}
            </div>
          )}
        </div>
      )
    },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', align: 'center' },
    { title: 'Precio Unitario', dataIndex: 'precioUnitario', key: 'precioUnitario', align: 'center', render: (val) => `$${val.toFixed(2)}` },
    { title: 'Total', dataIndex: 'total', key: 'total', align: 'center', render: (val) => `$${val.toFixed(2)}` },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleEliminarServicio(record.key)}
        />
      ),
    },
  ];

  useEffect(() => {
    document.title = 'Sistema Entregax | Envío con factura';
    cargarProveedores();
  }, []);

  return (
    <Card title="Envío con factura">
      {!mostrarFormulario ? (
        <>
          <p style={{ marginBottom: 20, fontWeight: 500, color: '#555' }}>
            Selecciona un proveedor para el envío de dólares
          </p>

          <Spin spinning={loading}>
            <Row gutter={[16, 16]}>
              {proveedores.map((p) => (
                <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    size="small"
                    style={{ borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                    bodyStyle={{ padding: '16px 18px' }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.descri}</div>
                    <div style={{ fontSize: 13, marginBottom: 2 }}>Tipo de cambio: <strong>${Number(p.tc).toFixed(2)}</strong></div>
                    <div style={{ fontSize: 13, marginBottom: 14 }}>Hora de cierre: <strong>{String(p.vence).replace(/^(\d{2})(\d{2}).*/, '$1:$2')}</strong></div>
                    <Button
                      block
                      icon={<DollarOutlined />}
                      style={{ background: '#F26522', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}
                      onClick={() => handleAbrirModal(p)}
                    >
                      Generar envío de dólares
                    </Button>
                  </Card>
                </Col>
              ))}

              {!loading && proveedores.length === 0 && (
                <Col span={24}>
                  <p style={{ color: '#aaa', textAlign: 'center' }}>No hay proveedores disponibles.</p>
                </Col>
              )}
            </Row>
          </Spin>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              onClick={handleCerrarModal}
              style={{ background: '#6c757d', color: '#fff', border: 'none' }}
            >
              ← Volver a proveedores
            </Button>
            <h3 style={{ margin: 0, flex: 1 }}>
              Generar envío de dólares - {proveedorSeleccionado?.descri || ''}
            </h3>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{ pct: 6 }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Cliente:"
                  name="cliente"
                  rules={[{ required: true, message: 'Seleccione un cliente' }]}
                >
                  <Select
                    placeholder="Favor de seleccionar una opción"
                    showSearch
                    filterOption={(input, option: any) => {
                      const label = String(option?.label || '');
                      return label.toLowerCase().includes(input.toLowerCase());
                    }}
                    options={clientes.map((cliente) => ({
                      value: cliente.token,
                      label: `(${cliente.clavecliente}) ${cliente.nombre}`
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Monto a enviar:"
                  name="monto"
                  rules={[{ required: true, message: 'Ingrese el monto' }]}
                >
                  <InputNumber
                    prefix="$"
                    style={{ width: '100%' }}
                    min={0}
                    onChange={calcularTotal}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="% PCT (mínimo 4.5%):"
                  name="pct"
                  rules={[{ required: true, message: 'Ingrese el PCT' }]}
                >
                  <InputNumber
                    prefix="%"
                    style={{ width: '100%' }}
                    min={4.5}
                    onChange={calcularTotal}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Tipo de cambio:" name="tipoCambio">
                  <Input prefix="$" disabled style={{ background: '#f0f0f0' }} />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Total a enviar:" name="total">
                  <Input
                    prefix="$"
                    disabled
                    style={{ background: '#f0f0f0' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Cuenta en dólares del proveedor: (max 5mb)"
                  name="archivo"
                  rules={[{ required: true, message: 'Seleccione un archivo' }]}
                >
                  <Upload
                    maxCount={1}
                    beforeUpload={() => false}
                    accept=".jpg,.jpeg,.png"
                  >
                    <Button>Seleccionar archivo</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <div style={{ background: '#fff3cd', padding: '10px 16px', marginBottom: 16, borderRadius: 4, textAlign: 'center', fontWeight: 600, color: '#856404' }}>
              DATOS FISCALES
            </div>

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Clave:" name="clave">
                  <Input onChange={handleBuscarClave} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Piezas:" name="piezas">
                  <InputNumber style={{ width: '100%' }} min={1} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Precio unitario sin IVA:" name="precioUnitario">
                  <InputNumber prefix="$" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Servicio:" name="servicio">
                  <Select
                    placeholder="Seleccione un servicio"
                    showSearch
                    filterOption={(input, option: any) => {
                      const label = String(option?.label || '');
                      return label.toLowerCase().includes(input.toLowerCase());
                    }}
                    options={serviciosDisponibles.map((srv) => ({
                      value: srv.id,
                      label: srv.name
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={10}>
                <Form.Item label="Tipo de servicio:" name="tipoServicio">
                  <Select
                    placeholder="Seleccione un tipo de servicio"
                    showSearch
                    filterOption={(input, option: any) => {
                      const label = String(option?.label || '');
                      return label.toLowerCase().includes(input.toLowerCase());
                    }}
                    options={tiposServicio.map((tipo) => ({
                      value: tipo.id,
                      label: tipo.name
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={2} style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Form.Item style={{ marginBottom: 24 }}>
                  <Button
                    icon={<PlusOutlined />}
                    style={{ background: '#F26522', color: '#fff', border: 'none' }}
                    onClick={handleAgregarServicio}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Table
              columns={columnasServicios}
              dataSource={servicios}
              pagination={false}
              size="small"
              style={{ marginBottom: 16 }}
              locale={{ emptyText: 'No hay servicios agregados' }}
            />

            {servicios.length > 0 && (
              <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 20 }}>
                <div style={{ marginBottom: 8, fontSize: 15 }}>
                  <strong>Subtotal:</strong> <span style={{ marginLeft: 10 }}>${servicios.reduce((acc, item) => acc + item.total, 0).toFixed(2)}</span>
                </div>
                <div style={{ marginBottom: 8, fontSize: 15 }}>
                  <strong>IVA (16%):</strong> <span style={{ marginLeft: 10 }}>${(servicios.reduce((acc, item) => acc + item.total, 0) * 0.16).toFixed(2)}</span>
                </div>
                <div style={{ fontSize: 16, color: '#F26522' }}>
                  <strong>Total:</strong> <span style={{ marginLeft: 10 }}>${(servicios.reduce((acc, item) => acc + item.total, 0) * 1.16).toFixed(2)}</span>
                </div>
              </div>
            )}

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Cuenta:"
                  name="cuenta"
                  rules={[{ required: true, message: 'Seleccione una cuenta' }]}
                >
                  <Select
                    placeholder="Seleccione una cuenta"
                    showSearch
                    filterOption={(input, option: any) => {
                      const label = String(option?.label || '');
                      return label.toLowerCase().includes(input.toLowerCase());
                    }}
                    options={cuentas.map((cuenta) => ({
                      value: cuenta.token,
                      label: `${cuenta.name} | ${cuenta.rfc} | ${cuenta.banco} | ${cuenta.cuenta} | ${cuenta.clabe}`
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>
              *** Todos los campos son obligatorios.
            </div>

            <Row gutter={16} justify="center">
              <Col>
                <Button
                  style={{ background: '#28a745', color: '#fff', border: 'none', minWidth: 120 }}
                  onClick={handleGuardar}
                >
                  Guardar
                </Button>
              </Col>
              <Col>
                <Button
                  style={{ background: '#dc3545', color: '#fff', border: 'none', minWidth: 120 }}
                  onClick={handleCerrarModal}
                >
                  Borrar
                </Button>
              </Col>
            </Row>
          </Form>
        </>
      )}

      <Modal
        title="Descripción alternativa del servicio"
        open={modalDescripcionVisible}
        onCancel={handleCerrarModalDescripcion}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 500, marginBottom: 12 }}>
            Descripción alternativa al servicio del SAT (Opcional)
          </p>
          <Input.TextArea
            placeholder="Escribe una descripción alternativa"
            value={descripcionAlternativa}
            onChange={(e) => setDescripcionAlternativa(e.target.value)}
            rows={3}
            style={{ marginBottom: 12 }}
          />
          <p style={{ fontSize: 13, color: '#666', marginBottom: 0 }}>
            Para uso interno en EntregaX, no tiene relación con el SAT.
          </p>
          <p style={{ fontSize: 13, color: '#666' }}>
            También aparecerá en la factura del envío de dólares.
          </p>
        </div>
        
        <Button
          block
          style={{ background: '#F26522', color: '#fff', border: 'none', marginBottom: 12 }}
          onClick={handleAgregarDescripcion}
        >
          Agregar descripción
        </Button>
        
        <Button
          block
          type="link"
          onClick={handleCerrarModalDescripcion}
        >
          Cerrar modal
        </Button>
      </Modal>
    </Card>
  );
};
