import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Spin, Tabs, Modal } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import clienteService from '../../services/clienteService';
import Swal from 'sweetalert2';
import './Clientes.css';
import { FaSave, FaUser, FaMapMarker, FaEyeSlash, FaFileInvoice, FaCog, FaPlus, FaLock, FaUnlock } from 'react-icons/fa';

const { Option } = Select;

export const ClienteEdit = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientClave, setClientClave] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryAddresses, setDeliveryAddresses] = useState<any[]>([]);
  const [hiddenLoading, setHiddenLoading] = useState(false);
  const [hiddenAddresses, setHiddenAddresses] = useState<any[]>([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('datos');

  useEffect(() => {
    if (id) loadClient(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const loadDeliveryAddresses = async (clientId: string | undefined) => {
    if (!clientId) return;
    try {
      setDeliveryLoading(true);
      const data = await clienteService.getDeliveryAddresses(clientId);
      // guardar lista de direcciones en estado
      const items = Array.isArray(data) ? data : (data?.addresses ?? data?.data ?? []);
      setDeliveryAddresses(items ?? []);
      // si hay al menos una dirección, la lista queda disponible en estado
      // (no poblamos inputs específicos aquí porque fueron removidos)
    } catch (e: any) {
      console.error(e);
      Swal.fire({
        position: 'center',
        title: '',
        text: 'Error al cargar direcciones de entrega',
        icon: 'error',
        showConfirmButton: false,
        timer: 4500,
      });
    } finally {
      setDeliveryLoading(false);
    }
  };

  const loadHiddenAddresses = async (clientId: string | undefined) => {
    if (!clientId) return;
    try {
      setHiddenLoading(true);
      const data = await clienteService.getHiddenAddresses(clientId);
      // guardar lista de direcciones ocultas en estado
      const items = Array.isArray(data) ? data : (data?.addresses ?? data?.data ?? []);
      setHiddenAddresses(items ?? []);
    } catch (e: any) {
      console.error(e);
      Swal.fire({
        position: 'center',
        title: '',
        text: 'Error al cargar direcciones ocultas',
        icon: 'error',
        showConfirmButton: false,
        timer: 4500,
      });
    } finally {
      setHiddenLoading(false);
    }
  };

  const handleAddAddress = () => {
    if (id) {
      navigate(`/clientes/${id}/direcciones/nueva`);
    } else {
      navigate('/clientes/lista');
    }
  };

  const handleHideAddress = async (addressId: string | number) => {
    try {
      const res = await clienteService.hideDeliveryAddress(addressId);
      const ok = Boolean(
        res && (
          res.success === true ||
          String(res.status).toLowerCase() === 'success' ||
          res.ok === true
        )
      );
      
      if (ok) {
        Swal.fire({
          position: 'center',
          title: '',
          text: res?.message ?? 'Dirección ocultada correctamente',
          icon: 'success',
          showConfirmButton: false,
          timer: 4500,
        });
        // Recargar direcciones de entrega
        setTimeout(() => {
          loadDeliveryAddresses(id);
        }, 1500);
      } else {
        const serverMsg = res?.message ?? res?.error ?? 'Error al ocultar la dirección';
        Swal.fire({
          position: 'center',
          title: '',
          text: serverMsg,
          icon: 'error',
          showConfirmButton: false,
          timer: 4500,
        });
      }
    } catch (e: any) {
      console.error(e);
      Swal.fire({
        position: 'center',
        title: '',
        text: 'Error al ocultar la dirección',
        icon: 'error',
        showConfirmButton: false,
        timer: 4500,
      });
    }
  };

  const handleDeleteAddress = async (addressId: string | number) => {
    try {
      const result = await Swal.fire({
        title: 'Confirmar eliminación',
        text: '¿Seguro que deseas eliminar esta dirección? Esta acción puede ser irreversible.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        // Intentar llamar al endpoint de eliminación en el servicio
        try {
          const res = await clienteService.deleteDeliveryAddress(addressId);
          const ok = Boolean(
            res && (
              res.success === true ||
              String(res.status).toLowerCase() === 'success' ||
              res.ok === true
            )
          );

          if (ok) {
            Swal.fire({
              position: 'center',
              title: '',
              text: res?.message ?? 'Dirección eliminada',
              icon: 'success',
              showConfirmButton: false,
              timer: 2000,
            });
            setTimeout(() => loadDeliveryAddresses(id), 800);
          } else {
            const serverMsg = res?.message ?? res?.error ?? 'Error al eliminar la dirección';
            Swal.fire({ position: 'center', title: '', text: serverMsg, icon: 'error', showConfirmButton: false, timer: 4500 });
          }
        } catch (e: any) {
          console.error(e);
          Swal.fire({ position: 'center', title: '', text: 'Error al eliminar la dirección', icon: 'error', showConfirmButton: false, timer: 4500 });
        }
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleShowAddress = async (addressId: string | number) => {
    try {
      const res = await clienteService.showDeliveryAddress(addressId);
      const ok = Boolean(
        res && (
          res.success === true ||
          String(res.status).toLowerCase() === 'success' ||
          res.ok === true
        )
      );
      
      if (ok) {
        Swal.fire({
          position: 'center',
          title: '',
          text: res?.message ?? 'Dirección reactivada correctamente',
          icon: 'success',
          showConfirmButton: false,
          timer: 4500,
        });
        // Recargar direcciones ocultas
        setTimeout(() => {
          loadHiddenAddresses(id);
        }, 1500);
      } else {
        const serverMsg = res?.message ?? res?.error ?? 'Error al reactivar la dirección';
        Swal.fire({
          position: 'center',
          title: '',
          text: serverMsg,
          icon: 'error',
          showConfirmButton: false,
          timer: 4500,
        });
      }
    } catch (e: any) {
      console.error(e);
      Swal.fire({
        position: 'center',
        title: '',
        text: 'Error al reactivar la dirección',
        icon: 'error',
        showConfirmButton: false,
        timer: 4500,
      });
    }
  };

  const loadClient = async (clientId: string | undefined) => {
    if (!clientId) return;
    try {
      setLoading(true);
      const data = await clienteService.get(clientId);
      // normalize fields
      // Map numeric tipo (1,2,3) to human labels expected by the form
      const rawTipo = data?.tipo_cliente ?? data?.type ?? data?.client_type ?? data?.idtp;
      let tipoClienteMapped: any = rawTipo;
      if (typeof rawTipo === 'number' || (typeof rawTipo === 'string' && /^\d+$/.test(String(rawTipo)))) {
        const n = Number(rawTipo);
        tipoClienteMapped = n === 1 ? 'Final' : (n === 2 ? 'Broker' : 'Desconocido');
      }

      const model = {
        clave: data?.clave ?? data?.clavecliente ?? data?.id,
        nombre: data?.nombre ?? data?.name,
        correo: data?.correo ?? data?.email,
        telefono: data?.telefono ?? data?.phone,
        telefono_movil: data?.telefono_movil ?? data?.mobile ?? data?.celular ?? data?.movil,
        whatsapp: data?.whatsapp ?? data?.wa ?? data?.watsapp,
        wechat: data?.wechat ?? data?.we_chat,
        facebook: data?.facebook ?? data?.fb,
        alias: data?.alias ?? data?.nickname,
        tipo_cliente: tipoClienteMapped,
        asesor: data?.asesor ?? data?.advisor ?? data?.resp,
        ladoa: data?.ladoa ?? data?.lado_a ?? data?.fileA ?? null,
        ladob: data?.ladob ?? data?.lado_b ?? data?.fileB ?? null,
        state: data?.state ?? data?.status ?? data?.estado,
      };
      form.setFieldsValue(model);
      // guardar clave y nombre en estado para mostrar en el título
      setClientClave(model.clave ? String(model.clave) : String(clientId));
      setClientName(model.nombre ? String(model.nombre) : null);
      // guardar imágenes recibidas
      setImageA(model.ladoa ? String(model.ladoa) : null);
      setImageB(model.ladob ? String(model.ladob) : null);
      // reset any selected files
      setFileA(null);
      setFileB(null);
    } catch (e: any) {
      console.error(e);
      Swal.fire({
        position: 'center',
        title: '',
        text: 'Error al cargar cliente',
        icon: 'error',
        showConfirmButton: false,
        timer: 4500,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockClient = async () => {
    // Abrir modal para capturar motivo de bloqueo
    if (!id) return;
    setBlockModalOpen(true);
  };

  // Estado y función para modal de bloqueo
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockingSubmitting, setBlockingSubmitting] = useState(false);

  const submitBlockClient = async () => {
    if (!id) return;
    if (!blockReason || String(blockReason).trim().length === 0) {
      Swal.fire({ icon: 'warning', title: '', text: 'Por favor escribe el motivo del bloqueo', showConfirmButton: false, timer: 2500 });
      return;
    }
    try {
      setBlockingSubmitting(true);
      const payload: any = { id: String(id), motivo_bloqueo: blockReason };
      const res = await clienteService.banCustomer(payload);
      const ok = Boolean(res && (res.success === true || String(res.status).toLowerCase() === 'success' || res.ok === true));
      if (ok) {
        Swal.fire({ icon: 'success', title: '', text: res?.message ?? 'Cliente bloqueado', showConfirmButton: false, timer: 2500 });
        // actualizar campo state en el formulario si existe
        try { form.setFieldValue && form.setFieldValue('state', '0'); } catch(e) {}
        setBlockReason('');
        setBlockModalOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: '', text: res?.message ?? 'No se pudo bloquear al cliente', showConfirmButton: false, timer: 3500 });
      }
    } catch (e: any) {
      console.error(e);
      Swal.fire({ icon: 'error', title: '', text: 'Error al bloquear cliente', showConfirmButton: false, timer: 3500 });
    } finally {
      setBlockingSubmitting(false);
    }
  };

  const handleUnblockClient = async () => {
    if (!id) return;
    const result = await Swal.fire({
      title: '¿Confirmas desbloquear al cliente?',
      text: 'Esto marcará al cliente como activo en el sistema.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, desbloquear',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      try {
        const payload = { id: String(id) };
        const res = await clienteService.desbanCustomer(payload);
        const ok = Boolean(res && (res.success === true || String(res.status).toLowerCase() === 'success' || res.ok === true));
        if (ok) {
          Swal.fire({ icon: 'success', title: '', text: res?.message ?? 'Cliente desbloqueado', showConfirmButton: false, timer: 2500 });
        } else {
          Swal.fire({ icon: 'error', title: '', text: res?.message ?? 'No se pudo desbloquear al cliente', showConfirmButton: false, timer: 3500 });
        }
      } catch (e: any) {
        console.error(e);
        Swal.fire({ icon: 'error', title: '', text: 'Error al desbloquear cliente', showConfirmButton: false, timer: 3500 });
      }
    }
  };

  const onFinish = async (values: any) => {
    if (!id) return;
    try {
      setSaving(true);
      // Enviar por POST a '/customers/update-customer' los campos solicitados
      // Campos: nombre, correo, telefono, telefono_movil, whatsapp, wechat, facebook, alias, tipo_cliente
      // Archivos: el primero con name 'archivo' y el segundo con name 'ladob'
      const hasFiles = !!(fileA || fileB);
      let res: any = null;
      if (hasFiles) {
        const formData = new FormData();
        formData.append('id', String(id));
        formData.append('nombre', values.nombre ?? '');
        formData.append('correo', values.correo ?? '');
        formData.append('telefono', values.telefono ?? '');
        formData.append('telefono_movil', values.telefono_movil ?? '');
        formData.append('whatsapp', values.whatsapp ?? '');
        formData.append('wechat', values.wechat ?? '');
        formData.append('facebook', values.facebook ?? '');
        formData.append('alias', values.alias ?? '');
        formData.append('tipo_cliente', values.tipo_cliente ?? '');
        if (fileA) formData.append('archivo', fileA);
        if (fileB) formData.append('ladob', fileB);
        res = await clienteService.updateCustomerPost(formData);
      } else {
        const payload = {
          id: String(id),
          nombre: values.nombre ?? '',
          correo: values.correo ?? '',
          telefono: values.telefono ?? '',
          telefono_movil: values.telefono_movil ?? '',
          whatsapp: values.whatsapp ?? '',
          wechat: values.wechat ?? '',
          facebook: values.facebook ?? '',
          alias: values.alias ?? '',
          tipo_cliente: values.tipo_cliente ?? '',
        };
        res = await clienteService.updateCustomerPost(payload);
      }

      // Verificar que la respuesta indique éxito antes de navegar
      const ok = Boolean(
        res && (
          res.success === true ||
          String(res.status).toLowerCase() === 'success' ||
          res.ok === true ||
          Number(res.code) === 200 ||
          (res.data && res.data.success === true)
        )
      );

      if (ok) {
        Swal.fire({
          position: 'center',
          title: '',
          text: res?.message ?? 'Cliente actualizado',
          icon: 'success',
          showConfirmButton: false,
          timer: 4500,
        });
        setTimeout(() => {
          navigate('/clientes/lista');
        }, 1500);
      } else {
        const serverMsg = res?.message ?? res?.error ?? 'No se recibió confirmación de éxito del servidor';
        Swal.fire({
          position: 'center',
          title: '',
          text: serverMsg,
          icon: 'error',
          showConfirmButton: false,
          timer: 4500,
        });
      }
    } catch (e: any) {
      console.error(e);
      Swal.fire({
        position: 'center',
        title: '',
        text: 'Error al guardar cliente',
        icon: 'error',
        showConfirmButton: false,
        timer: 4500,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 32 }}><Spin size="large"/></div>;

  return (
    <>
    <Card
      title={
        clientName
          ? `Editando información de ${clientName} (${clientClave ?? ''})`
          : clientClave
          ? `Editando información de (${clientClave})`
          : 'Editando información'
      }
      style={{ maxWidth: 1000, margin: '0 auto' }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ state: '1' }}>
        <div className="cliente-edit-tabs">
          <Tabs tabPosition="left" activeKey={activeTab} onChange={(key) => {
            setActiveTab(key);
            if (key === 'entrega') loadDeliveryAddresses(id);
            if (key === 'ocultas') loadHiddenAddresses(id);
          }}>
            <Tabs.TabPane tab={<><FaUser /> Datos personales</>} key="datos">
              <div className="tab-panel-grid">
                <Form.Item label="Clave" name="clave">
                  <Input disabled />
                </Form.Item>

                <Form.Item label="Nombre del cliente" name="nombre" rules={[{ required: true, message: 'Nombre es requerido' }]}>
                  <Input />
                </Form.Item>

                <Form.Item label="Correo" name="correo" rules={[{ type: 'email', message: 'Correo inválido' }]}>
                  <Input />
                </Form.Item>

                <Form.Item label="Teléfono" name="telefono">
                  <Input />
                </Form.Item>

                <Form.Item label="Teléfono móvil" name="telefono_movil">
                  <Input />
                </Form.Item>

                <Form.Item label="WhatsApp" name="whatsapp">
                  <Input />
                </Form.Item>

                <Form.Item label="WeChat" name="wechat">
                  <Input />
                </Form.Item>

                <Form.Item label="Facebook" name="facebook">
                  <Input />
                </Form.Item>

                <Form.Item label="Alias para el cliente" name="alias">
                  <Input />
                </Form.Item>

                <Form.Item label="Tipo de cliente" name="tipo_cliente">
                  <Select style={{ width: 220 }}>
                    <Option value="Final">Final</Option>
                    <Option value="Broker">Broker</Option>
                    <Option value="Desconocido">Desconocido</Option>
                  </Select>
                </Form.Item>

                
              </div>

              {/* Mostrar imágenes (ladoa / ladob) en dos columnas antes de los botones */}
              <h4 className="tab-images-title">Archivos de registro</h4>
              <div className="tab-images">
                <div className="tab-image-col">
                  {imageA ? (
                      // eslint-disable-next-line jsx-a11y/alt-text
                      <>
                        <img src={imageA} alt="Registro A" onClick={() => { setPreviewSrc(imageA); setPreviewOpen(true); }} />
                        <input type="file" accept="image/*" className="file-input" onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          if (f) {
                            setFileA(f);
                            const url = URL.createObjectURL(f);
                            setImageA(url);
                          }
                        }} />
                      </>
                  ) : (
                      <>
                        <div className="img-placeholder">Sin imagen A</div>
                        <input type="file" accept="image/*" className="file-input" onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          if (f) {
                            setFileA(f);
                            const url = URL.createObjectURL(f);
                            setImageA(url);
                          }
                        }} />
                      </>
                  )}
                </div>
                <div className="tab-image-col">
                  {imageB ? (
                      // eslint-disable-next-line jsx-a11y/alt-text
                      <>
                        <img src={imageB} alt="Registro B" onClick={() => { setPreviewSrc(imageB); setPreviewOpen(true); }} />
                        <input type="file" accept="image/*" className="file-input" onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          if (f) {
                            setFileB(f);
                            const url = URL.createObjectURL(f);
                            setImageB(url);
                          }
                        }} />
                      </>
                  ) : (
                      <>
                        <div className="img-placeholder">Sin imagen B</div>
                        <input type="file" accept="image/*" className="file-input" onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          if (f) {
                            setFileB(f);
                            const url = URL.createObjectURL(f);
                            setImageB(url);
                          }
                        }} />
                      </>
                  )}
                </div>
              </div>

              {/* Botones específicos del tab "Datos personales" */}
              <div className="tab-actions">
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={saving}><FaSave /> Guardar</Button>
                  <Button onClick={() => navigate('/clientes/lista')}>Cancelar</Button>
                </Form.Item>
              </div>

            </Tabs.TabPane>

            <Tabs.TabPane tab={<><FaMapMarker /> Direcciones de entrega</>} key="entrega">
              <div className="tab-panel-grid">
                {deliveryLoading ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 24 }}><Spin /></div>
                ) : (
                  <>
                    {/* Los inputs de Dirección 1/2 y Ciudad se han eliminado; se muestran las direcciones obtenidas abajo. */}
                    {/* opcional: mostrar lista completa de direcciones obtenidas */}
                    {deliveryAddresses && deliveryAddresses.length > 0 && (
                      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                        <div style={{ gridColumn: '1 / -1', marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button type="primary" onClick={handleAddAddress}><FaPlus style={{ marginRight: 8 }} /> Agregar nueva dirección</Button>
                        </div>
                        <div className="delivery-list">
                          {deliveryAddresses.map((d: any, idx: number) => {
                            const addressId = d?.id ?? d?.token ?? idx;
                            const receiver = d?.recipient_name ?? d?.quienrecibe ?? d?.name ?? d?.contact_name ?? '';
                            const street = d?.street ?? d?.address_line_1 ?? d?.calle ?? d?.direccion ?? '';
                            const numeroExtRaw = d?.external_number ?? d?.numeroext ?? d?.numero_ext ?? d?.no_exterior ?? d?.numeroExterior ?? d?.numero ?? '';
                            const numeroIntRaw = d?.interior_number ?? d?.numero_interior ?? d?.no_interior ?? d?.numeroint ?? d?.numero_interior_text ?? '';
                            const numberInt = numeroIntRaw ?? '';
                            // concatenar numeroint a numeroext si existe
                            const numeroExt = numeroExtRaw ? (numberInt ? `${numeroExtRaw} ${numberInt}` : numeroExtRaw) : (numberInt || '');
                            const colonia = d?.colonia ?? d?.neighbourhood ?? '';
                            const refe = d?.refe ?? d?.referencia ?? d?.reference ?? d?.ref ?? d?.referencia1 ?? '';
                            const cp = d?.postal_code ?? d?.cp ?? '';
                            const municipio = d?.city ?? d?.municipio ?? '';
                            const estado = d?.state ?? d?.estado ?? '';
                            const lugarRaw = d?.delivery_place ?? d?.lugar_entrega ?? d?.lugarentrega ?? d?.lugarEntrega ?? d?.lugar_entrega_text ?? d?.place ?? d?.lugar ?? null;
                            const lugar = lugarRaw ?? 'Domicilio';
                            return (
                              <div className="delivery-card" key={idx}>
                                <div className="delivery-card-left">
                                  <div><strong>¿Quien recibe?:</strong> <strong>{receiver}</strong></div>
                                  <div style={{ marginTop: 6 }}>
                                    <strong>Calle:</strong> <span>{street}</span>
                                    {numeroExt ? (<span>  <strong>Numero:</strong> <span>{numeroExt}</span></span>) : null}
                                    {colonia ? (<span>  <strong>Colonia:</strong> <span>{colonia}</span></span>) : null}
                                    {refe ? (<span>  <strong>Ref:</strong> <span>{refe}</span></span>) : null}
                                    {cp ? (<span>  <strong>CP:</strong> <span>{cp}</span></span>) : null}
                                  </div>
                                  <div style={{ marginTop: 6 }}>
                                    <strong>Municipio:</strong> <span>{municipio}</span>
                                    {'  '}
                                    <strong>Estado:</strong> <span>{estado}</span>
                                  </div>
                                  <div style={{ marginTop: 6 }}>
                                    <strong>Lugar de entrega:</strong> <span>{lugar}</span>
                                  </div>
                                </div>
                                <div className="delivery-card-actions">
                                  <button type="button" className="delivery-btn delivery-btn-delete" title="Eliminar" onClick={() => handleDeleteAddress(addressId)}>✖</button>
                                  <button type="button" className="delivery-btn delivery-btn-edit" title="Editar" onClick={() => navigate(`/clientes/${id}/direccion/editar/${addressId}`)}>✎</button>
                                  <button type="button" className="delivery-btn delivery-btn-hide" title="Ocultar" onClick={() => handleHideAddress(addressId)}>Ocultar</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab={<><FaEyeSlash /> Direcciones ocultas</>} key="ocultas">
              <div className="tab-panel-grid">
                {hiddenLoading ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 24 }}><Spin /></div>
                ) : (
                  <>
                    {hiddenAddresses && hiddenAddresses.length > 0 ? (
                      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                        <div className="delivery-list">
                          {hiddenAddresses.map((d: any, idx: number) => {
                            const addressId = d?.id ?? d?.token ?? idx;
                            const receiver = d?.recipient_name ?? d?.quienrecibe ?? d?.name ?? d?.contact_name ?? '';
                            const street = d?.street ?? d?.address_line_1 ?? d?.calle ?? d?.direccion ?? '';
                            const numeroExtRaw = d?.external_number ?? d?.numeroext ?? d?.numero_ext ?? d?.no_exterior ?? d?.numeroExterior ?? d?.numero ?? '';
                            const numeroIntRaw = d?.interior_number ?? d?.numero_interior ?? d?.no_interior ?? d?.numeroint ?? d?.numero_interior_text ?? '';
                            const numberInt = numeroIntRaw ?? '';
                            const numeroExt = numeroExtRaw ? (numberInt ? `${numeroExtRaw} ${numberInt}` : numeroExtRaw) : (numberInt || '');
                            const colonia = d?.colonia ?? d?.neighbourhood ?? '';
                            const refe = d?.refe ?? d?.referencia ?? d?.reference ?? d?.ref ?? d?.referencia1 ?? '';
                            const cp = d?.postal_code ?? d?.cp ?? '';
                            const municipio = d?.city ?? d?.municipio ?? '';
                            const estado = d?.state ?? d?.estado ?? '';
                            const lugarRaw = d?.delivery_place ?? d?.lugar_entrega ?? d?.lugarentrega ?? d?.lugarEntrega ?? d?.lugar_entrega_text ?? d?.place ?? d?.lugar ?? null;
                            const lugar = lugarRaw ?? 'Domicilio';
                            return (
                              <div className="delivery-card" key={idx}>
                                <div className="delivery-card-left">
                                  <div><strong>¿Quien recibe?:</strong> <strong>{receiver}</strong></div>
                                  <div style={{ marginTop: 6 }}>
                                    <strong>Calle:</strong> <span>{street}</span>
                                    {numeroExt ? (<span>  <strong>Numero:</strong> <span>{numeroExt}</span></span>) : null}
                                    {colonia ? (<span>  <strong>Colonia:</strong> <span>{colonia}</span></span>) : null}
                                    {refe ? (<span>  <strong>Ref:</strong> <span>{refe}</span></span>) : null}
                                    {cp ? (<span>  <strong>CP:</strong> <span>{cp}</span></span>) : null}
                                  </div>
                                  <div style={{ marginTop: 6 }}>
                                    <strong>Municipio:</strong> <span>{municipio}</span>
                                    {'  '}
                                    <strong>Estado:</strong> <span>{estado}</span>
                                  </div>
                                  <div style={{ marginTop: 6 }}>
                                    <strong>Lugar de entrega:</strong> <span>{lugar}</span>
                                  </div>
                                </div>
                                <div className="delivery-card-actions">
                                  <button type="button" className="delivery-btn delivery-btn-hide" title="Reactivar" onClick={() => handleShowAddress(addressId)}>Reactivar/mostrar</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 24, color: '#999' }}>
                        No hay direcciones ocultas
                      </div>
                    )}
                  </>
                )}
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab={<><FaFileInvoice /> Direcciones de facturacion</>} key="facturacion">
              <div className="tab-panel-grid">
                <Form.Item label="Dirección de facturación 1" name="direccion_fact_1">
                  <Input />
                </Form.Item>
                <Form.Item label="RFC / ID fiscal" name="rfc">
                  <Input />
                </Form.Item>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab={<><FaCog /> Opciones</>} key="opciones">
              <div className="tab-panel-grid">
                <div style={{ padding: 12, borderRadius: 6, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220, boxSizing: 'border-box', width: '100%' }}>
                  <div>
                    <h4 style={{ marginTop: 0, textAlign: 'center' }}>Bloquear a cliente dentro del sistema.</h4>
                    <p style={{ color: '#666', textAlign: 'center' }}>Marca al cliente como inactivo para evitar que pueda realizar operaciones.</p>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                    <Button type="primary" danger onClick={handleBlockClient}><FaLock style={{ marginRight: 8 }} />Bloquear</Button>
                  </div>
                </div>

                <div style={{ padding: 12, borderRadius: 6, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220, boxSizing: 'border-box', width: '100%' }}>
                  <div>
                    <h4 style={{ marginTop: 0, textAlign: 'center' }}>Desbloquear a cliente dentro del sistema.</h4>
                    <p style={{ color: '#666', textAlign: 'center' }}>Restablece el estatus del cliente a activo para permitir operaciones nuevamente.</p>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                    <Button style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50', color: '#fff' }} onClick={handleUnblockClient}><FaUnlock style={{ marginRight: 8 }} />Desbloquear</Button>
                  </div>
                </div>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Form>
    </Card>
      <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)} centered width={900}>
        {previewSrc && <img src={previewSrc} alt="Preview" style={{ width: '100%', height: 'auto' }} />}
      </Modal>

      <Modal title="Motivo de bloqueo" open={blockModalOpen} onCancel={() => setBlockModalOpen(false)} okText="Bloquear" onOk={submitBlockClient} confirmLoading={blockingSubmitting} centered>
        <p>Escribe el motivo por el cual se bloqueará este cliente:</p>
        <Input.TextArea rows={4} value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Motivo del bloqueo" />
      </Modal>
    </>
  );
};

export default ClienteEdit;
