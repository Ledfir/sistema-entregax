import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Select, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import clienteService from '../../services/clienteService';
import './Clientes.css';

const { Option } = Select;

export const ClienteEditAddress = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [addrDeliveryPlace, setAddrDeliveryPlace] = useState<string | null>(null);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [colonias, setColonias] = useState<any[]>([]);
  const [estados, setEstados] = useState<any>(null);
  const [municipios, setMunicipios] = useState<any>(null);
  const [ciudades, setCiudades] = useState<any>(null);
  const [paises, setPaises] = useState<any>(null);
  const navigate = useNavigate();
  const { id, clientId } = useParams(); // id = id de la dirección, clientId = id del cliente

  useEffect(() => {
    if (clientId) loadClient(clientId);
    if (id) loadAddress(id);
  }, [id, clientId]);

  const loadAddress = async (addressId: string | undefined) => {
    if (!addressId) return;
    try {
      setLoading(true);
      const data = await clienteService.getDeliveryAddress(addressId);
      const addr = Array.isArray(data) ? data[0] : (data ?? {});

      // poblar formulario con los campos más comunes (mapear posibles variantes)
      form.setFieldsValue({
        recipient_name: addr?.recipient_name ?? addr?.quienrecibe ?? addr?.name ?? '',
        correo: addr?.correo ?? addr?.email ?? '',
        phone: addr?.phone ?? addr?.telefono ?? '',
        mobile: addr?.mobile ?? addr?.telefono_movil ?? addr?.movil ?? '',
        street: addr?.street ?? addr?.calle ?? addr?.direccion ?? '',
        external_number: addr?.external_number ?? addr?.numeroext ?? addr?.externalNumber ?? '',
        internal_number: addr?.internal_number ?? addr?.numero_interior ?? addr?.internalNumber ?? '',
        postal_code: addr?.postal_code ?? addr?.cp ?? addr?.postalCode ?? '',
        colonia: addr?.colonia ?? addr?.colonia_id ?? addr?.settlement ?? '',
        state: addr?.state ?? addr?.state_id ?? '',
        municipality: addr?.municipality ?? addr?.municipio ?? '',
        city: addr?.city ?? addr?.ciudad ?? '',
        country: addr?.country ?? addr?.pais ?? '',
        // NO setear delivery_place aquí - se hará después con selectDeliveryPlace
        references: addr?.references ?? addr?.referencias ?? addr?.ref ?? addr?.refe ?? '',
      });

      // Guardar el valor original de delivery_place para seleccionar la opción adecuada
      const rawPlace = addr?.delivery_place ?? addr?.lugar_entrega ?? '';
      console.log('[loadAddress] Valor delivery_place de la API:', rawPlace);
      setAddrDeliveryPlace(rawPlace ? String(rawPlace) : null);

      // Si la respuesta contiene información del cliente, guardarla
      if (addr?.cliente || addr?.customer || addr?.client) setClientInfo(addr?.cliente ?? addr?.customer ?? addr?.client ?? null);

      // Si hay código postal, usar searchAddress para poblar selects y auto-seleccionar
      const postal = addr?.postal_code ?? addr?.cp ?? addr?.postalCode ?? '';
      if (postal) {
        try {
          setSearchingAddress(true);
          const addressData = await clienteService.searchAddress(String(postal));

          const coloniasList = addressData?.colonias ?? addressData?.settlements ?? [];
          const estadosObj = addressData?.estados ?? addressData?.states ?? null;
          const municipiosObj = addressData?.municipios ?? addressData?.municipalities ?? null;
          const ciudadObj = addressData?.ciudad ?? addressData?.city ?? null;
          const paisObj = addressData?.pais ?? addressData?.country ?? null;

          setColonias(Array.isArray(coloniasList) ? coloniasList : []);
          setEstados(estadosObj);
          setMunicipios(municipiosObj);
          setCiudades(ciudadObj);
          setPaises(paisObj);

          // Intentar auto-seleccionar los valores basándonos en los datos de la dirección
          // Preferir ids presentes en 'addr' (por ejemplo colonia id, state id, etc.)
          if (addr?.colonia || addr?.colonia_id) {
            const val = addr?.colonia ?? addr?.colonia_id;
            form.setFieldValue('colonia', val);
          } else if (coloniasList.length === 1) {
            form.setFieldValue('colonia', coloniasList[0]?.id ?? coloniasList[0]);
          }

          if (addr?.state || addr?.state_id) {
            form.setFieldValue('state', addr?.state ?? addr?.state_id);
          } else if (estadosObj && estadosObj.id) {
            form.setFieldValue('state', estadosObj.id);
          }

          if (addr?.municipality || addr?.municipio) {
            form.setFieldValue('municipality', addr?.municipality ?? addr?.municipio);
          } else if (municipiosObj && municipiosObj.id) {
            form.setFieldValue('municipality', municipiosObj.id);
          }

          if (addr?.city || addr?.ciudad) {
            form.setFieldValue('city', addr?.city ?? addr?.ciudad);
          } else if (ciudadObj && ciudadObj.id) {
            form.setFieldValue('city', ciudadObj.id);
          }

          // no usamos localidad en el formulario

          if (addr?.country || addr?.pais) {
            form.setFieldValue('country', addr?.country ?? addr?.pais);
          } else if (paisObj && paisObj.id) {
            form.setFieldValue('country', paisObj.id);
          }
        } catch (e: any) {
          console.error('searchAddress error', e);
        } finally {
          setSearchingAddress(false);
        }
      }
    } catch (e: any) {
      console.error(e);
      message.error('Error al cargar la dirección de entrega');
    } finally {
      setLoading(false);
    }
  };

  const selectDeliveryPlace = (place?: string | null) => {
    if (!place) return;
    console.log('[selectDeliveryPlace] Intentando seleccionar:', place);
    console.log('[selectDeliveryPlace] Opciones disponibles:', deliveryOptions);
    
    const p = String(place).toLowerCase().trim();

    // 1. Intentar coincidencia exacta con value/id
    let found = deliveryOptions.find((opt: any) => {
      const value = String(opt.id ?? opt.code ?? opt.value ?? '').toLowerCase().trim();
      return value === p;
    });

    if (found) {
      const value = found.id ?? found.code ?? found.value;
      console.log('[selectDeliveryPlace] ✓ Encontrado por value exacto:', value);
      form.setFieldValue('delivery_place', value);
      return;
    }

    // 2. Intentar coincidencia en el label
    found = deliveryOptions.find((opt: any) => {
      const label = String(opt.nombre ?? opt.name ?? opt.label ?? opt.title ?? opt.description ?? '').toLowerCase().trim();
      return label.includes(p) || p.includes(label);
    });

    if (found) {
      const value = found.id ?? found.code ?? found.value;
      console.log('[selectDeliveryPlace] ✓ Encontrado por label:', value);
      form.setFieldValue('delivery_place', value);
      return;
    }

    // 3. Manejo especial para 'domicilio' o 'ENTREGA EN DOMICILIO'
    if (p.includes('domicilio')) {
      console.log('[selectDeliveryPlace] Buscando opción con "domicilio"...');
      const opt = deliveryOptions.find((opt: any) => {
        const label = String(opt.nombre ?? opt.name ?? opt.label ?? opt.title ?? opt.description ?? '').toLowerCase();
        const value = String(opt.id ?? opt.code ?? opt.value ?? '').toLowerCase();
        return label.includes('domicilio') || value.includes('domicilio');
      });
      
      if (opt) {
        const value = opt.id ?? opt.code ?? opt.value;
        console.log('[selectDeliveryPlace] ✓ Encontrado opción domicilio:', value);
        form.setFieldValue('delivery_place', value);
        return;
      }
      
      // Si no hay opción cargada, usar el literal
      console.warn('[selectDeliveryPlace] ⚠ No se encontró opción domicilio en deliveryOptions, usando literal');
      form.setFieldValue('delivery_place', 'ENTREGA EN DOMICILIO');
      return;
    }

    // Si no se encontró nada, usar el valor original
    console.warn('[selectDeliveryPlace] ⚠ No se encontró coincidencia, usando valor original:', place);
    form.setFieldValue('delivery_place', place);
  };

  useEffect(() => {
    // cargar opciones de lugar de entrega desde la API
    const loadDeliveryOptions = async () => {
      try {
        const opts = await clienteService.getDeliveryOptions();
        const list = Array.isArray(opts) ? opts : (opts?.data ?? opts ?? []);
        console.log('[loadDeliveryOptions] Opciones cargadas:', list);
        setDeliveryOptions(list ?? []);
      } catch (e: any) {
        console.error('[loadDeliveryOptions] Error:', e);
        message.error('Error al cargar opciones de entrega');
      }
    };
    loadDeliveryOptions();
  }, []);

  const loadClient = async (clientId: string | undefined) => {
    if (!clientId) return;
    try {
      setLoading(true);
      const data = await clienteService.get(clientId);
      console.log('[loadClient] Datos del cliente:', data);
      setClientInfo(data ?? null);
      // NO setear campos en el formulario - los datos del cliente se muestran directamente desde clientInfo
    } catch (e: any) {
      console.error(e);
      message.error('Error al cargar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handlePostalCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Solo permitir números
    const numericValue = value.replace(/\D/g, '');
    
    // Actualizar el campo en el formulario
    form.setFieldValue('postal_code', numericValue);
    
    // Si tiene exactamente 5 dígitos, hacer la búsqueda
    if (numericValue.length === 5) {
      try {
        setSearchingAddress(true);
        const addressData = await clienteService.searchAddress(numericValue);
        
        // Procesar respuesta y poblar selects
        const coloniasList = addressData?.colonias ?? addressData?.settlements ?? [];
        const estadosObj = addressData?.estados ?? addressData?.states ?? null;
        const municipiosObj = addressData?.municipios ?? addressData?.municipalities ?? null;
        const ciudadObj = addressData?.ciudad ?? addressData?.city ?? null;
        const paisObj = addressData?.pais ?? addressData?.country ?? null;

        setColonias(Array.isArray(coloniasList) ? coloniasList : []);
        setEstados(estadosObj);
        setMunicipios(municipiosObj);
        setCiudades(ciudadObj);
        setPaises(paisObj);

        // Si solo hay una opción en cada campo, auto-seleccionar usando el id
        if (coloniasList.length === 1) form.setFieldValue('colonia', coloniasList[0]?.id ?? coloniasList[0]);
        if (estadosObj && estadosObj.id) form.setFieldValue('state', estadosObj.id);
        if (municipiosObj && municipiosObj.id) form.setFieldValue('municipality', municipiosObj.id);
        if (ciudadObj && ciudadObj.id) form.setFieldValue('city', ciudadObj.id);
        if (paisObj && paisObj.id) form.setFieldValue('country', paisObj.id);
        
        message.success('Dirección encontrada');
      } catch (e: any) {
        console.error(e);
        message.warning('No se encontró información para este código postal');
        // Limpiar selects
        setColonias([]);
        setEstados(null);
        setMunicipios(null);
        setCiudades(null);
        setPaises(null);
      } finally {
        setSearchingAddress(false);
      }
    }
  };

  const onFinish = async (values: any) => {
    if (!id) {
      message.error('ID de la direccion no disponible');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        address_id: id,
        customer_id: clientId,
        recipient_name: values.recipient_name,
        phone: values.phone,
        mobile: values.mobile,
        street: values.street,
        external_number: values.external_number,
        internal_number: values.internal_number,
        postal_code: values.postal_code,
        colonia: values.colonia,
        state: values.state,
        municipality: values.municipality,
        city: values.city,
        // localidad removed
        country: values.country,
        delivery_place: values.delivery_place,
        references: values.references,
      };

      const response = await clienteService.updateDeliveryAddress(payload);
      message.success(response?.message || 'Dirección actualizada correctamente');
      // Redirigir al listado de direcciones del cliente
      navigate(`/clientes/editar/${clientId}?tab=entrega`);
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.message || 'Error al actualizar la dirección');
    } finally {
      setSubmitting(false);
    }
  };

  // Cambia el valor inicial del formulario para delivery_place SOLO si no hay valor de dirección
  useEffect(() => {
    if (!addrDeliveryPlace && deliveryOptions.length === 1 && deliveryOptions[0]?.id) {
      console.log('[useEffect default] Seteando primera opción por defecto:', deliveryOptions[0].id);
      form.setFieldValue('delivery_place', deliveryOptions[0].id);
    }
  }, [deliveryOptions, addrDeliveryPlace, form]);

  // Si ya conocemos el valor original de la dirección y las opciones están cargadas,
  // intentar seleccionar la opción correspondiente cuando cualquiera cambie.
  useEffect(() => {
    console.log('[useEffect delivery_place] addrDeliveryPlace:', addrDeliveryPlace, 'deliveryOptions.length:', deliveryOptions.length);
    if (addrDeliveryPlace && deliveryOptions && deliveryOptions.length > 0) {
      // Pequeño delay para asegurar que el formulario esté listo
      const timer = setTimeout(() => {
        selectDeliveryPlace(addrDeliveryPlace);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [addrDeliveryPlace, deliveryOptions]);

  if (loading) return <div style={{ textAlign: 'center', padding: 32 }}><Spin size="large" /></div>;

  return (
    <Card title={`Editar dirección de entrega${clientInfo ? ` - Cliente ${clientInfo?.clavecliente || clientInfo?.id}` : ''}`} style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <p>Agrega la dirección del cliente para la entrega de sus paquetes.</p>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
      >
        <Card type="inner" title={`Cliente ${clientInfo?.clavecliente ?? ''}`} style={{ marginBottom: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Cliente">
                <Input disabled value={clientInfo?.nombre ?? clientInfo?.name ?? ''} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Correo electrónico">
                <Input disabled value={clientInfo?.correo ?? clientInfo?.email ?? ''} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Teléfono">
                <Input disabled value={clientInfo?.telefono ?? clientInfo?.phone ?? ''} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card type="inner" title="Agrega dirección de entrega" style={{ marginBottom: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Nombre de la persona que recibe" name="recipient_name" rules={[{ required: true, message: 'Nombre es requerido' }]}>
                <Input placeholder="¿Quién recibirá los paquetes que enviaremos?" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Teléfono de contacto" name="phone">
                <Input placeholder="Escribe un número de teléfono" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Teléfono móvil" name="mobile">
                <Input placeholder="Escribe un número móvil" />
              </Form.Item>
            </Col>

            <Col span={16}>
              <Form.Item label="Avenida o calle" name="street">
                <Input placeholder="Escribe la avenida o calle, sin número" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Número exterior" name="external_number">
                <Input placeholder="Número exterior" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Número interior" name="internal_number">
                <Input placeholder="Número interior" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Código Postal" name="postal_code">
                <Input 
                  placeholder="Escribe un código postal" 
                  onChange={handlePostalCodeChange}
                  maxLength={5}
                  suffix={searchingAddress ? <Spin size="small" /> : null}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Colonia" name="colonia">
                <Select allowClear placeholder="Selecciona colonia" loading={searchingAddress}>
                  {colonias.map((col: any, idx: number) => {
                    const val = col?.id ?? idx;
                    const label = col?.nombre ?? col?.name ?? col;
                    return <Option key={val} value={val}>{label}</Option>;
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Estado" name="state">
                <Select allowClear placeholder="Selecciona estado" loading={searchingAddress}>
                  {estados && (
                    <Option value={estados?.id ?? estados}>
                      {estados?.nombre ?? estados?.name ?? estados}
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>

            {/* Localidad removed */}

            <Col span={8}>
              <Form.Item label="Municipio" name="municipality">
                <Select allowClear placeholder="Selecciona municipio" loading={searchingAddress}>
                  {municipios && (
                    <Option value={municipios?.id ?? municipios}>
                      {municipios?.nombre ?? municipios?.name ?? municipios}
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ciudad" name="city">
                <Select allowClear placeholder="Selecciona ciudad" loading={searchingAddress}>
                  {ciudades && (
                    <Option value={ciudades?.id ?? ciudades}>
                      {ciudades?.nombre ?? ciudades?.name ?? ciudades}
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="País" name="country">
                <Select allowClear placeholder="Selecciona país" loading={searchingAddress}>
                  {paises && (
                    <Option value={paises?.id ?? paises}>
                      {paises?.nombre ?? paises?.name ?? paises}
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Lugar de entrega/Ocurre" name="delivery_place">
                <Select>
                  {deliveryOptions && deliveryOptions.length > 0 ? (
                    deliveryOptions.map((opt: any, i: number) => {
                      const value = opt.id ?? opt.code ?? opt.value ?? `opt-${i}`;
                      const label = opt.nombre ?? opt.name ?? opt.label ?? opt.title ?? opt.description ?? value;
                      return <Option key={value} value={value}>{label}</Option>;
                    })
                  ) : (
                    <>
                      <Option value="Domicilio">Domicilio</Option>
                      <Option value="Sucursal">Sucursal</Option>
                      <Option value="Otro">Otro</Option>
                    </>
                  )}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Referencias" name="references">
                <Input.TextArea rows={3} placeholder="Escribe alguna referencia asociada al domicilio del cliente..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>Guardar cambios en la dirección</Button>
        </div>
      </Form>
    </Card>
  );
};

export default ClienteEditAddress;
