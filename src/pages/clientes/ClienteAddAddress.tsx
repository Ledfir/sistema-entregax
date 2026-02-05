import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Select, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import clienteService from '../../services/clienteService';
import './Clientes.css';

const { Option } = Select;

export const ClienteAddAddress = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [colonias, setColonias] = useState<any[]>([]);
  const [estados, setEstados] = useState<any>(null);
  const [municipios, setMunicipios] = useState<any>(null);
  const [ciudades, setCiudades] = useState<any>(null);
  const [localidades, setLocalidades] = useState<any[]>([]);
  const [paises, setPaises] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) loadClient(id);
  }, [id]);

  useEffect(() => {
    // cargar opciones de lugar de entrega desde la API
    const loadDeliveryOptions = async () => {
      try {
        const opts = await clienteService.getDeliveryOptions();
        const list = Array.isArray(opts) ? opts : (opts?.data ?? opts ?? []);
        setDeliveryOptions(list ?? []);
      } catch (e: any) {
        console.error(e);
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
      setClientInfo(data ?? null);
      form.setFieldsValue({
        recipient_name: data?.recipient_name ?? data?.nombre ?? data?.name ?? data?.cliente ?? '',
        correo: data?.correo ?? data?.email ?? '',
        telefono: data?.telefono ?? data?.phone ?? '',
      });
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
        // Asumiendo que la API devuelve arrays para cada campo
        const coloniasList = addressData?.colonias ?? addressData?.settlements ?? [];
        const estadosObj = addressData?.estados ?? addressData?.states ?? null;
        const municipiosObj = addressData?.municipios ?? addressData?.municipalities ?? null;
        const ciudadObj = addressData?.ciudad ?? addressData?.city ?? null;
        const localidadesList = addressData?.localidades ?? addressData?.localities ?? [];
        const paisObj = addressData?.pais ?? addressData?.country ?? null;
        
        setColonias(Array.isArray(coloniasList) ? coloniasList : []);
        setEstados(estadosObj);
        setMunicipios(municipiosObj);
        setCiudades(ciudadObj);
        setLocalidades(Array.isArray(localidadesList) ? localidadesList : []);
        setPaises(paisObj);
        
        // Si solo hay una opción en cada campo, auto-seleccionar
        if (coloniasList.length === 1) form.setFieldValue('colonia', coloniasList[0]?.nombre ?? coloniasList[0]);
        if (estadosObj) form.setFieldValue('state', estadosObj?.nombre ?? estadosObj?.name ?? estadosObj);
        if (municipiosObj) form.setFieldValue('municipality', municipiosObj?.nombre ?? municipiosObj?.name ?? municipiosObj);
        if (ciudadObj) form.setFieldValue('city', ciudadObj?.nombre ?? ciudadObj?.name ?? ciudadObj);
        if (localidadesList.length === 1) form.setFieldValue('localidad', localidadesList[0]?.nombre ?? localidadesList[0]);
        if (paisObj) form.setFieldValue('country', paisObj?.nombre ?? paisObj?.name ?? paisObj);
        
        message.success('Dirección encontrada');
      } catch (e: any) {
        console.error(e);
        message.warning('No se encontró información para este código postal');
        // Limpiar selects
        setColonias([]);
        setEstados(null);
        setMunicipios(null);
        setCiudades(null);
        setLocalidades([]);
        setPaises(null);
      } finally {
        setSearchingAddress(false);
      }
    }
  };

  const onFinish = async (values: any) => {
    if (!id) return;
    try {
      setSubmitting(true);
      const payload = {
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
        localidad: values.localidad,
        country: values.country,
        delivery_place: values.delivery_place,
        references: values.references,
      };

      await clienteService.addDeliveryAddress(id, payload);
      message.success('Dirección agregada');
      // regresar al editor del cliente y abrir la pestaña de entrega
      navigate(`/clientes/editar/${id}?tab=entrega`);
    } catch (e: any) {
      console.error(e);
      message.error('Error al agregar la dirección');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title={`Agregar dirección de entrega${clientInfo ? ` - Cliente ${clientInfo?.clave || clientInfo?.id}` : ''}`} style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <p>Agrega la dirección del cliente para la entrega de sus paquetes.</p>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ delivery_place: 'Domicilio' }}>
        <Card type="inner" title={`Cliente ${clientInfo?.clave ?? ''}`} style={{ marginBottom: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Cliente" name="recipient_name">
                <Input disabled value={clientInfo?.nombre ?? clientInfo?.name} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Correo electrónico" name="correo">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Teléfono" name="telefono">
                <Input disabled />
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
                    const val = col?.nombre ?? col?.name ?? col;
                    return <Option key={idx} value={val}>{val}</Option>;
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Estado" name="state">
                <Select allowClear placeholder="Selecciona estado" loading={searchingAddress}>
                  {estados && (
                    <Option value={estados?.nombre ?? estados?.name ?? estados}>
                      {estados?.nombre ?? estados?.name ?? estados}
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Localidad" name="localidad">
                <Select allowClear placeholder="Selecciona localidad" loading={searchingAddress}>
                  {localidades.map((loc: any, idx: number) => {
                    const val = loc?.nombre ?? loc?.name ?? loc;
                    return <Option key={idx} value={val}>{val}</Option>;
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Municipio" name="municipality">
                <Select allowClear placeholder="Selecciona municipio" loading={searchingAddress}>
                  {municipios && (
                    <Option value={municipios?.nombre ?? municipios?.name ?? municipios}>
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
                    <Option value={ciudades?.nombre ?? ciudades?.name ?? ciudades}>
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
                    <Option value={paises?.nombre ?? paises?.name ?? paises}>
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
                      const value = opt.value ?? opt.code ?? opt.id ?? opt.name ?? `opt-${i}`;
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
          <Button type="primary" htmlType="submit" loading={submitting}>Agregar dirección ahora</Button>
        </div>
      </Form>
    </Card>
  );
};

export default ClienteAddAddress;
