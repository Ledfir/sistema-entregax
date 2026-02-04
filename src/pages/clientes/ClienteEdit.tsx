import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, message, Spin, Tabs, Modal } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import clienteService from '../../services/clienteService';
import './Clientes.css';
import { FaSave, FaEdit, FaUser, FaMapMarker, FaEyeSlash, FaFileInvoice, FaCog, FaPlus } from 'react-icons/fa';

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
      message.error('Error al cargar direcciones de entrega');
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleAddAddress = () => {
    if (id) {
      navigate(`/clientes/${id}/direcciones/nueva`);
    } else {
      navigate('/clientes/lista');
    }
  };

  const loadClient = async (clientId: string | undefined) => {
    if (!clientId) return;
    try {
      setLoading(true);
      const data = await clienteService.get(clientId);
      // normalize fields
      const model = {
        clave: data?.clave ?? data?.clavecliente ?? data?.id,
        nombre: data?.nombre ?? data?.name,
        correo: data?.correo ?? data?.email,
        telefono: data?.telefono ?? data?.phone,
        telefono_movil: data?.telefono_movil ?? data?.mobile ?? data?.celular,
        whatsapp: data?.whatsapp ?? data?.wa ?? data?.watsapp,
        wechat: data?.wechat ?? data?.we_chat,
        facebook: data?.facebook ?? data?.fb,
        alias: data?.alias ?? data?.nickname,
        tipo_cliente: data?.tipo_cliente ?? data?.type ?? data?.client_type,
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
      message.error('Error al cargar cliente');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!id) return;
    try {
      setSaving(true);
      // map form values to API payload
      // If user selected new files, send multipart/form-data
      if (fileA || fileB) {
        const form = new FormData();
        form.append('clavecliente', values.clave ?? '');
        form.append('nombre', values.nombre ?? '');
        form.append('correo', values.correo ?? '');
        form.append('telefono', values.telefono ?? '');
        form.append('telefono_movil', values.telefono_movil ?? '');
        form.append('whatsapp', values.whatsapp ?? '');
        form.append('wechat', values.wechat ?? '');
        form.append('facebook', values.facebook ?? '');
        form.append('alias', values.alias ?? '');
        form.append('tipo_cliente', values.tipo_cliente ?? '');
        form.append('state', values.state ?? '');
        if (fileA) form.append('ladoa', fileA);
        if (fileB) form.append('ladob', fileB);
        await clienteService.update(id, form);
      } else {
        const payload = {
          clavecliente: values.clave,
          nombre: values.nombre,
          correo: values.correo,
          telefono: values.telefono,
          telefono_movil: values.telefono_movil,
          whatsapp: values.whatsapp,
          wechat: values.wechat,
          facebook: values.facebook,
          alias: values.alias,
          tipo_cliente: values.tipo_cliente,
          state: values.state,
        };
        await clienteService.update(id, payload);
      }
      message.success('Cliente actualizado');
      navigate('/clientes/lista');
    } catch (e: any) {
      console.error(e);
      message.error('Error al guardar cliente');
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
                            const receiver = d?.recipient_name ?? d?.quien_recibe ?? d?.name ?? d?.contact_name ?? '';
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
                                  <button className="delivery-btn delivery-btn-delete" title="Eliminar">✖</button>
                                  <button className="delivery-btn delivery-btn-edit" title="Editar">✎</button>
                                  <button className="delivery-btn delivery-btn-hide" title="Ocultar">Ocultar</button>
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
                <Form.Item label="Dirección oculta 1" name="direccion_oculta_1">
                  <Input />
                </Form.Item>
                <Form.Item label="Dirección oculta 2" name="direccion_oculta_2">
                  <Input />
                </Form.Item>
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
                <Form.Item label="Estatus" name="state">
                  <Select style={{ width: 180 }}>
                    <Option value="1">Activo</Option>
                    <Option value="0">Inactivo</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Observaciones" name="observaciones">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Form>
    </Card>
      <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)} centered width={900}>
        {previewSrc && <img src={previewSrc} alt="Preview" style={{ width: '100%', height: 'auto' }} />}
      </Modal>
    </>
  );
};

export default ClienteEdit;
