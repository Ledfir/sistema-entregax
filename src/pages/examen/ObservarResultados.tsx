import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Tag, Dropdown, Modal, Form, Input, Spin, Row, Col, Radio } from 'antd';
import { EyeOutlined, FileTextOutlined, MoreOutlined } from '@ant-design/icons';
import { examService } from '@/services/examService';
import { formatearFechaCorta } from '@/utils/dateUtils';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

interface ResultadoExamen {
  key: string;
  fecha: string;
  nombre: string;
  lider: string;
  calificacion: number;
  detalles: string;
  resultados: string;
}

const ObservarResultados: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ResultadoExamen[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [examenDetalle, setExamenDetalle] = useState<any>(null);
  const [calificaciones, setCalificaciones] = useState<any>({});
  const [modalResultadosVisible, setModalResultadosVisible] = useState(false);
  const [modalResultadosLoading, setModalResultadosLoading] = useState(false);
  const [resultadosDetalle, setResultadosDetalle] = useState<any>(null);

  useEffect(() => {
    cargarResultados();
  }, []);

  const cargarResultados = async () => {
    try {
      setLoading(true);
      const response = await examService.getResultados();
      
      if (response.status === 'success' && response.data) {
        const resultadosMapeados = response.data.map((item: any) => ({
          key: item.id,
          fecha: formatearFechaCorta(item.fecha),
          nombre: item.nombre || 'Sin nombre',
          lider: item.lider || 'Sin lider',
          calificacion: parseInt(item.calificado) || 0,
          detalles: '',
          resultados: '',
        }));
        
        setResultados(resultadosMapeados);
      }
    } catch (error: any) {
      console.error('Error al cargar resultados:', error);
      message.error(error?.response?.data?.message || 'Error al cargar los resultados');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalles = async (record: ResultadoExamen) => {
    try {
      setModalVisible(true);
      setModalLoading(true);
      setExamenDetalle(null);
      
      const response = await examService.getExamenDetalle(record.key);
      
      if (response.status === 'success' && response.data) {
        setExamenDetalle(response.data);
      }
    } catch (error: any) {
      console.error('Error al cargar detalles del examen:', error);
      message.error(error?.response?.data?.message || 'Error al cargar los detalles del examen');
      setModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setExamenDetalle(null);
    setCalificaciones({});
  };

  const handleCalificacionChange = (campo: string, valor: string) => {
    setCalificaciones((prev: any) => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleGuardarCalificacion = async () => {
    try {
      if (!examenDetalle?.id) {
        message.error('No se encontró el ID del examen');
        return;
      }

      // Validar que todas las preguntas tengan respuesta
      const camposRequeridos = [
        'lsd', 'pedimento', 'logistica', 'volumen', 'tdia', 'pbox', 
        'tdimari', 'cbm40', 'polcom', 'enviodinex', 'nomped', 'factmer',
        'nombrea', 'nombreb', 'nombrec', 'nombred',
        'datox', 'noimpomer', 'tdiactu', 'pto220', 'plmarc',
        'ej1', 'ej2', 'ej3', 'ej4'
      ];

      const camposFaltantes = camposRequeridos.filter(campo => !calificaciones[campo]);
      
      if (camposFaltantes.length > 0) {
        message.warning('Por favor, selecciona una opción (Si/No) en todas las preguntas antes de guardar');
        return;
      }

      const response = await examService.saveCalification(examenDetalle.id, calificaciones);
      
      if (response.status === 'success') {
        // Mostrar el mensaje que devuelve la API
        message.success(response.message || 'Calificación guardada exitosamente');
        handleCloseModal();
        cargarResultados(); // Recargar la tabla
      } else {
        // Mostrar mensaje de error si el status no es success
        message.error(response.message || 'Error al guardar la calificación');
      }
    } catch (error: any) {
      console.error('Error al guardar calificación:', error);
      // Mostrar el mensaje de error de la API
      message.error(error?.response?.data?.message || 'Error al guardar la calificación');
    }
  };

  const handleVerResultados = async (record: ResultadoExamen) => {
    try {
      setModalResultadosLoading(true);
      setModalResultadosVisible(true);
      setResultadosDetalle(null);
      
      const response = await examService.getExamenResultados(record.key);
      
      if (response.status === 'success' && response.data) {
        setResultadosDetalle(response.data);
      }
    } catch (error: any) {
      console.error('Error al cargar resultados:', error);
      message.error(error?.response?.data?.message || 'Error al cargar los resultados');
      setModalResultadosVisible(false);
    } finally {
      setModalResultadosLoading(false);
    }
  };

  const handleCloseModalResultados = () => {
    setModalResultadosVisible(false);
    setResultadosDetalle(null);
  };

  const getInputStyle = (isCorrect: boolean) => {
    return {
      backgroundColor: isCorrect ? '#f6ffed' : '#fff2f0',
      borderColor: isCorrect ? '#52c41a' : '#ff4d4f',
      color: isCorrect ? '#389e0d' : '#cf1322',
      fontWeight: 500,
    };
  };

  const getCalificacionTag = (calificacion: number) => {
    if (calificacion >= 80) {
      return <Tag color="success">{calificacion}</Tag>;
    } else if (calificacion >= 60) {
      return <Tag color="warning">{calificacion}</Tag>;
    } else {
      return <Tag color="error">{calificacion}</Tag>;
    }
  };

  const columns: ColumnsType<ResultadoExamen> = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 120,
      sorter: (a, b) => a.fecha.localeCompare(b.fecha),
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Lider',
      dataIndex: 'lider',
      key: 'lider',
      sorter: (a, b) => a.lider.localeCompare(b.lider),
    },
    {
      title: 'Calificación',
      dataIndex: 'calificacion',
      key: 'calificacion',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.calificacion - b.calificacion,
      render: (calificacion: number) => getCalificacionTag(calificacion),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'detalles',
            label: 'Ver Detalles',
            icon: <EyeOutlined />,
            onClick: () => handleVerDetalles(record),
          },
          {
            key: 'resultados',
            label: 'Ver Resultados',
            icon: <FileTextOutlined />,
            onClick: () => handleVerResultados(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Resultados de examen">
        <Table
          columns={columns}
          dataSource={resultados}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: resultados.length,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} resultados`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          bordered
          size="middle"
        />
      </Card>

      <Modal
        title="Resultados de examen"
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Cerrar
          </Button>,
          <Button key="save" type="primary" onClick={handleGuardarCalificacion} style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}>
            Guardar calificación
          </Button>,
        ]}
        width={900}
      >
        {modalLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : examenDetalle ? (
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Nombre">
                  <Input value={examenDetalle.nombre || 'Sin nombre'} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Líder">
                  <Input value={examenDetalle.lider || 'Sin líder'} disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Fecha">
                  <Input value={formatearFechaCorta(examenDetalle.fecha)} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Teléfono">
                  <Input value={examenDetalle.telefono || 'Sin teléfono'} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Calificación">
                  <div>
                    {examenDetalle.calificado ? getCalificacionTag(parseInt(examenDetalle.calificado)) : <Tag color="default">Sin calificar</Tag>}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <h3 style={{ marginTop: '20px', marginBottom: '16px', fontWeight: 600 }}>Respuestas del examen</h3>

            <Form.Item label="¿Con tus palabras describe a que se dedica nuestra empresa ENTREGAX?">
              <Input value={examenDetalle['lsd'] || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones['lsd']} onChange={(e) => handleCalificacionChange('lsd', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Que es un pedimento?">
              <Input value={examenDetalle.pedimento || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.pedimento} onChange={(e) => handleCalificacionChange('pedimento', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Cual es el significado de logística?">
              <Input value={examenDetalle.logistica || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.logistica} onChange={(e) => handleCalificacionChange('logistica', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Como se calcula el peso volumétrico?">
              <Input value={examenDetalle.volumen || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.volumen} onChange={(e) => handleCalificacionChange('volumen', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿En que consiste el servicio TDI Aéreo?">
              <Input value={examenDetalle.tdia || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.tdia} onChange={(e) => handleCalificacionChange('tdia', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Como funciona el servicio PO Box USA?">
              <Input value={examenDetalle.pbox || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.pbox} onChange={(e) => handleCalificacionChange('pbox', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Cuanto tiempo tarda en llegar la carga TDI marítima?">
              <Input value={examenDetalle.tdimari || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.tdimari} onChange={(e) => handleCalificacionChange('tdimari', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Cuantos CBM puedes transportar en una contenedor de 40 pies HC?">
              <Input value={examenDetalle.cbm40 || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.cbm40} onChange={(e) => handleCalificacionChange('cbm40', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Que es y como funciona la política de compensación?">
              <Input.TextArea value={examenDetalle.polcom || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} />              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.polcom} onChange={(e) => handleCalificacionChange('polcom', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>            </Form.Item>

            <Form.Item label="Explica el procedimiento de envió de dinero al extranjero">
              <Input.TextArea value={examenDetalle.enviodinex || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.enviodinex} onChange={(e) => handleCalificacionChange('enviodinex', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Que tramite tiene que hacer un cliente para que el pedimento se encuentre a su nombre?">
              <Input value={examenDetalle.nomped || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.nomped} onChange={(e) => handleCalificacionChange('nomped', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Es posible facturar exactamente la mercancía que un cliente importa? Si, No y Porque?">
              <Input value={examenDetalle.factmer || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.factmer} onChange={(e) => handleCalificacionChange('factmer', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <h4 style={{ marginTop: '20px', marginBottom: '16px', fontWeight: 600, textAlign: 'center' }}>Cuales son los tiempos de transito de la mercancía en las siguientes modalidades</h4>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="TDI Aéreo">
                  <Input value={examenDetalle.nombrea || 'Sin respuesta'} disabled />
                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <span style={{ marginRight: '8px' }}>Es correcto</span>
                    <Radio.Group value={calificaciones.nombrea} onChange={(e) => handleCalificacionChange('nombrea', e.target.value)}>
                      <Radio value="si">Si</Radio>
                      <Radio value="no">No</Radio>
                    </Radio.Group>
                  </div>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="TDI Marítimo">
                  <Input value={examenDetalle.nombreb || 'Sin respuesta'} disabled />
                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <span style={{ marginRight: '8px' }}>Es correcto</span>
                    <Radio.Group value={calificaciones.nombreb} onChange={(e) => handleCalificacionChange('nombreb', e.target.value)}>
                      <Radio value="si">Si</Radio>
                      <Radio value="no">No</Radio>
                    </Radio.Group>
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Envió Directo DHL">
                  <Input value={examenDetalle.nombrec || 'Sin respuesta'} disabled />
                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <span style={{ marginRight: '8px' }}>Es correcto</span>
                    <Radio.Group value={calificaciones.nombrec} onChange={(e) => handleCalificacionChange('nombrec', e.target.value)}>
                      <Radio value="si">Si</Radio>
                      <Radio value="no">No</Radio>
                    </Radio.Group>
                  </div>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Po Box EU">
                  <Input value={examenDetalle.nombred || 'Sin respuesta'} disabled />
                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <span style={{ marginRight: '8px' }}>Es correcto</span>
                    <Radio.Group value={calificaciones.nombred} onChange={(e) => handleCalificacionChange('nombred', e.target.value)}>
                      <Radio value="si">Si</Radio>
                      <Radio value="no">No</Radio>
                    </Radio.Group>
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="¿Que datos son los que se necesitan para dar de alta un pago de proveedor?">
              <Input value={examenDetalle.datox || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.datox} onChange={(e) => handleCalificacionChange('datox', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Cuales son las mercancías que no se pueden importar?">
              <Input value={examenDetalle.noimpomer || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.noimpomer} onChange={(e) => handleCalificacionChange('noimpomer', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Cada cuando se actualiza el costo del servicio TDI?">
              <Input value={examenDetalle.tdiactu || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.tdiactu} onChange={(e) => handleCalificacionChange('tdiactu', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Cuales son los 3 productos que cuestan 220usd en el servicio Envio Directo DHL?">
              <Input value={examenDetalle.pto220 || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.pto220} onChange={(e) => handleCalificacionChange('pto220', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label="¿Qué debe de contener el Packing list de mi cliente, en servicio marítimo?">
              <Input value={examenDetalle.plmarc || 'Sin respuesta'} disabled />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.plmarc} onChange={(e) => handleCalificacionChange('plmarc', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <h4 style={{ marginTop: '20px', marginBottom: '16px', fontWeight: 600, textAlign: 'center' }}>Ejercicios</h4>

            <Form.Item label="Ejercicio 1 - Si un cliente, me deposita 10,000 pesos, por concepto de pago de una caja de 10 Kilos, de cuanto será su reembolso en caso de que su caja se extraviara? Política de compensación + devolución">
              <Input.TextArea value={examenDetalle.ej1 || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.ej1} onChange={(e) => handleCalificacionChange('ej1', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label={
              <span>
                Ejercicio 2 - Determina el costo en pesos que pagaría el cliente por el siguiente servicio:<br />
                - Servicio: TDI aéreo<br />
                - Medidas de la caja 60 cm x 45 cm x 78 cm<br />
                - Peso: 52 kg<br />
                - Tipo de Cambio: $20.50<br />
                - Domicilio de entrega: Código postal 01000 Ciudad de México<br />
                - Costo por kg: $15.8 usd
              </span>
            }>
              <Input.TextArea value={examenDetalle.ej2 || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.ej2} onChange={(e) => handleCalificacionChange('ej2', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>
            
            <Form.Item label={
                <span>
                    Ejercicio 3 - Calcula el costo en pesos que pagaría el cliente por el siguiente servicio: <br />
                    - Servicio: PO Box USA<br />
                    - Medidas de la caja 45 cm x 28 cm x 32 cm<br />
                    - Peso: 28 kg<br />
                    - Tipo de Cambio: $20.50<br />
                    - Domicilio de entrega: Código postal 64000 Monterrey<br />
                    - Costo por cbm: 700 usd
                </span>
            }>
              <Input.TextArea value={examenDetalle.ej3 || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.ej3} onChange={(e) => handleCalificacionChange('ej3', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

            <Form.Item label={
                <span>
                    Ejercicio 4 - Calcula el costo en pesos que pagaría el cliente por el siguiente servicio: <br />
                    - Servicio: TDI Marítimo<br />
                    - Cantidad de bultos: 20 cajas<br />
                    - Medidas de la caja 48cm X 56 x 87<br />
                    - Peso: 50 kg<br />
                    - Tipo de Cambio: $20.50<br />
                    - Domicilio de entrega: Código postal 44000 Guadalajara<br />
                    - Costo por CBM: $600 usd
                </span>
            }>
              <Input.TextArea value={examenDetalle.ej4 || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} />
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>Es correcto</span>
                <Radio.Group value={calificaciones.ej4} onChange={(e) => handleCalificacionChange('ej4', e.target.value)}>
                  <Radio value="si">Si</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </Form.Item>

          </Form>
        ) : null}
      </Modal>

      <Modal
        title="Calificación"
        open={modalResultadosVisible}
        onCancel={handleCloseModalResultados}
        footer={[
          <Button key="close" onClick={handleCloseModalResultados}>
            Cerrar
          </Button>,
        ]}
        width={900}
      >
        {modalResultadosLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : resultadosDetalle?.examen && resultadosDetalle?.resultados ? (
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Nombre">
                  <Input value={resultadosDetalle.examen.nombre || 'Sin nombre'} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Líder">
                  <Input value={resultadosDetalle.examen.lider || 'Sin líder'} disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Fecha">
                  <Input value={formatearFechaCorta(resultadosDetalle.examen.fecha)} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Teléfono">
                  <Input value={resultadosDetalle.examen.telefono || 'Sin teléfono'} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Calificación">
                  <div>
                    {resultadosDetalle.examen.calificado ? getCalificacionTag(parseInt(resultadosDetalle.examen.calificado)) : <Tag color="default">Sin calificar</Tag>}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <h3 style={{ marginTop: '20px', marginBottom: '16px', fontWeight: 600 }}>Respuestas del examen</h3>

            <Form.Item label="¿Con tus palabras describe a que se dedica nuestra empresa ENTREGAX?">
              <Input value={resultadosDetalle.examen.lsd || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.lsd === 'si')} />
            </Form.Item>

            <Form.Item label="¿Que es un pedimento?">
              <Input value={resultadosDetalle.examen.pedimento || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.pedimento === 'si')} />
            </Form.Item>

            <Form.Item label="¿Cual es el significado de logística?">
              <Input value={resultadosDetalle.examen.logistica || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.logistica === 'si')} />
            </Form.Item>

            <Form.Item label="¿Como se calcula el peso volumétrico?">
              <Input value={resultadosDetalle.examen.volumen || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.volumen === 'si')} />
            </Form.Item>

            <Form.Item label="¿En que consiste el servicio TDI Aéreo?">
              <Input value={resultadosDetalle.examen.tdia || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.tdia === 'si')} />
            </Form.Item>

            <Form.Item label="¿Como funciona el servicio PO Box USA?">
              <Input value={resultadosDetalle.examen.pbox || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.pbox === 'si')} />
            </Form.Item>

            <Form.Item label="¿Cuanto tiempo tarda en llegar la carga TDI marítima?">
              <Input value={resultadosDetalle.examen.tdimari || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.tdimari === 'si')} />
            </Form.Item>

            <Form.Item label="¿Cuantos CBM puedes transportar en una contenedor de 40 pies HC?">
              <Input value={resultadosDetalle.examen.cbm40 || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.cbm40 === 'si')} />
            </Form.Item>

            <Form.Item label="¿Que es y como funciona la política de compensación?">
              <Input.TextArea value={resultadosDetalle.examen.polcom || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} style={getInputStyle(resultadosDetalle.resultados.polcom === 'si')} />
            </Form.Item>

            <Form.Item label="Explica el procedimiento de envió de dinero al extranjero">
              <Input.TextArea value={resultadosDetalle.examen.enviodinex || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} style={getInputStyle(resultadosDetalle.resultados.enviodinex === 'si')} />
            </Form.Item>

            <Form.Item label="¿Que tramite tiene que hacer un cliente para que el pedimento se encuentre a su nombre?">
              <Input value={resultadosDetalle.examen.nomped || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.nomped === 'si')} />
            </Form.Item>

            <Form.Item label="¿Es posible facturar exactamente la mercancía que un cliente importa? Si, No y Porque?">
              <Input value={resultadosDetalle.examen.factmer || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.factmer === 'si')} />
            </Form.Item>

            <h4 style={{ marginTop: '20px', marginBottom: '16px', fontWeight: 600, textAlign: 'center' }}>Cuales son los tiempos de transito de la mercancía en las siguientes modalidades</h4>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="TDI Aéreo">
                  <Input value={resultadosDetalle.examen.nombrea || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.nombrea === 'si')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="TDI Marítimo">
                  <Input value={resultadosDetalle.examen.nombreb || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.nombreb === 'si')} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Envió Directo DHL">
                  <Input value={resultadosDetalle.examen.nombrec || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.nombrec === 'si')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Po Box EU">
                  <Input value={resultadosDetalle.examen.nombred || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.nombred === 'si')} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="¿Que datos son los que se necesitan para dar de alta un pago de proveedor?">
              <Input value={resultadosDetalle.examen.datox || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.datox === 'si')} />
            </Form.Item>

            <Form.Item label="¿Cuales son las mercancías que no se pueden importar?">
              <Input value={resultadosDetalle.examen.noimpomer || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.noimpomer === 'si')} />
            </Form.Item>

            <Form.Item label="¿Cada cuando se actualiza el costo del servicio TDI?">
              <Input value={resultadosDetalle.examen.tdiactu || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.tdiactu === 'si')} />
            </Form.Item>

            <Form.Item label="¿Cuales son los 3 productos que cuestan 220usd en el servicio Envio Directo DHL?">
              <Input value={resultadosDetalle.examen.pto220 || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.pto220 === 'si')} />
            </Form.Item>

            <Form.Item label="¿Qué debe de contener el Packing list de mi cliente, en servicio marítimo?">
              <Input value={resultadosDetalle.examen.plmarc || 'Sin respuesta'} disabled style={getInputStyle(resultadosDetalle.resultados.plmarc === 'si')} />
            </Form.Item>

            <h4 style={{ marginTop: '20px', marginBottom: '16px', fontWeight: 600, textAlign: 'center' }}>Ejercicios</h4>

            <Form.Item label="Ejercicio 1 - Si un cliente, me deposita 10,000 pesos, por concepto de pago de una caja de 10 Kilos, de cuanto será su reembolso en caso de que su caja se extraviara? Política de compensación + devolución">
              <Input.TextArea value={resultadosDetalle.examen.ej1 || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} style={getInputStyle(resultadosDetalle.resultados.ej1 === 'si')} />
            </Form.Item>

            <Form.Item label={
              <span>
                Ejercicio 2 - Determina el costo en pesos que pagaría el cliente por el siguiente servicio:<br />
                - Servicio: TDI aéreo<br />
                - Medidas de la caja 60 cm x 45 cm x 78 cm<br />
                - Peso: 52 kg<br />
                - Tipo de Cambio: $20.50<br />
                - Domicilio de entrega: Código postal 01000 Ciudad de México<br />
                - Costo por kg: $15.8 usd
              </span>
            }>
              <Input.TextArea value={resultadosDetalle.examen.ej2 || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} style={getInputStyle(resultadosDetalle.resultados.ej2 === 'si')} />
            </Form.Item>
            
            <Form.Item label={
                <span>
                    Ejercicio 3 - Calcula el costo en pesos que pagaría el cliente por el siguiente servicio: <br />
                    - Servicio: PO Box USA<br />
                    - Medidas de la caja 45 cm x 28 cm x 32 cm<br />
                    - Peso: 28 kg<br />
                    - Tipo de Cambio: $20.50<br />
                    - Domicilio de entrega: Código postal 64000 Monterrey<br />
                    - Costo por cbm: 700 usd
                </span>
            }>
              <Input.TextArea value={resultadosDetalle.examen.ej3 || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} style={getInputStyle(resultadosDetalle.resultados.ej3 === 'si')} />
            </Form.Item>

            <Form.Item label={
                <span>
                    Ejercicio 4 - Calcula el costo en pesos que pagaría el cliente por el siguiente servicio: <br />
                    - Servicio: TDI Marítimo<br />
                    - Cantidad de bultos: 20 cajas<br />
                    - Medidas de la caja 48cm X 56 x 87<br />
                    - Peso: 50 kg<br />
                    - Tipo de Cambio: $20.50<br />
                    - Domicilio de entrega: Código postal 44000 Guadalajara<br />
                    - Costo por CBM: $600 usd
                </span>
            }>
              <Input.TextArea value={resultadosDetalle.examen.ej4 || 'Sin respuesta'} disabled autoSize={{ minRows: 4 }} style={getInputStyle(resultadosDetalle.resultados.ej4 === 'si')} />
            </Form.Item>

          </Form>
        ) : null}
      </Modal>
    </div>
  );
};

export default ObservarResultados;
