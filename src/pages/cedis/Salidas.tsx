import React, { useState } from 'react';
import { Card, Space, Button, Table, message, Modal, Row, Col, Divider, Typography } from 'antd';
import { ContainerOutlined, FlagOutlined, TruckOutlined, ApiOutlined, CloudOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import { humanizarFecha } from '../../utils/dateUtils';

const botones = [
  { key: 'maritimo', label: 'Maritimo', color: '#2f54eb', icon: <ContainerOutlined /> },
  { key: 'usa', label: 'USA', color: '#ff4d4f', icon: <FlagOutlined /> },
  { key: 'dhl', label: 'DHL', color: '#00a854', icon: <TruckOutlined /> },
  { key: 'tdi-gdl', label: 'TDI GDL', color: '#ffd666', icon: <ApiOutlined /> },
  { key: 'tdi-cdmx', label: 'TDI CDMX', color: '#262626', icon: <CloudOutlined /> },
  { key: 'tdi-mty', label: 'TDI MTY', color: '#13c2c2', icon: <CloudOutlined /> },
  { key: 'tdi-dhl', label: 'TDI - DHL', color: '#ff7a45', icon: <TruckOutlined /> },
];

const Salidas: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedDetails, setSelectedDetails] = useState<any[] | null>(null);

  const showApiMessages = (payload: any, kind: 'info' | 'error' = 'info'): boolean => {
    if (!payload) return false;
    let shown = false;
    const push = (text: any) => {
      if (!text) return;
      shown = true;
      if (kind === 'error') message.error(String(text));
      else message.info(String(text));
    };

    if (typeof payload === 'string') { push(payload); return shown; }

    if (payload.message) push(payload.message);
    if (payload.messages && Array.isArray(payload.messages)) payload.messages.forEach((m: any) => push(m));
    if (payload.error) push(payload.error);
    if (payload.errors) {
      if (typeof payload.errors === 'string') push(payload.errors);
      else if (Array.isArray(payload.errors)) payload.errors.forEach((e: any) => push(e));
      else if (typeof payload.errors === 'object') {
        Object.values(payload.errors).forEach((v: any) => {
          if (Array.isArray(v)) v.forEach((x) => push(x));
          else push(v);
        });
      }
    }
    return shown;
  };
  const [detailLoading, setDetailLoading] = useState(false);

  const handleDarSalida = async (record: any) => {
    const id = record?.id || record?.suite;
    if (!id) {
      message.error('Registro inválido');
      return;
    }
    try {
      setLoading(true);
      // Intentar llamar endpoint para marcar salida; si no existe, se mostrará el error
      await apiClient.post(`/cedis/salidas-diarias/${id}/dar-salida`);
      setRows((prev) => prev.filter((r) => r.id !== record.id));
      message.success('Salida registrada');
    } catch (err: any) {
        console.error(err);
      const resp = err?.response?.data;
      const shown = resp ? showApiMessages(resp, 'error') : false;
      if (!shown) message.error(err?.message || 'No fue posible registrar la salida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <Card title="Salidas diarias" style={{ width: 1200, textAlign: 'center' }}>
        <Space wrap size={[12, 12]} style={{ width: '100%', justifyContent: 'center' }}>
          {botones.map((b) => (
            <Button
              key={b.key}
              size="large"
              shape="round"
              icon={b.icon}
              style={{
                background: b.color,
                borderColor: b.color,
                color: '#fff',
                minWidth: 140,
                height: 44,
                fontWeight: 600,
              }}
              onClick={async () => {
                if (b.key === 'historial') {
                  navigate('/cedis/salidas/historial');
                  return;
                }

                setLoading(true);
                try {
                  const res = await apiClient.get(`/cedis/salidas-diarias/${b.key}`);
                  const payload = res?.data ?? {};
                  // Si la API regresa mensajes o status
                  if (payload.status && payload.status !== 'success') {
                    showApiMessages(payload, 'info');
                  }
                  const data = payload.data ?? [];
                  setRows(data);
                  if (!data.length) {
                    message.info('No se encontraron salidas para esta clave.');
                  }
                } catch (err: any) {
                  console.error(err);
                  setRows([]);
                  const resp = err?.response?.data;
                  const shown = resp ? showApiMessages(resp, 'error') : false;
                  if (!shown) message.error(err?.message || 'Error al consultar salidas');
                } finally {
                  setLoading(false);
                }
              }}
            >
              {b.label}
            </Button>
          ))}
        </Space>
        <div style={{ marginTop: 20 }}>
          <Table
            dataSource={rows}
            loading={loading}
            rowKey={(record) => record.id || record.suite || Math.random()}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Acciones',
                key: 'acciones',
                align: 'center',
                render: (_: any, record: any) => (
                  <Space>
                    <Button
                      size="small"
                      style={{ background: '#ff7a45', borderColor: '#ff7a45', color: '#fff' }}
                      onClick={() => {
                        Modal.confirm({
                          title: '¿Confirmas dar salida a este registro?',
                          okText: 'Sí',
                          cancelText: 'No',
                          onOk: () => handleDarSalida(record),
                        });
                      }}
                    >
                      Dar Salida
                    </Button>

                    <Button
                      size="small"
                      loading={detailLoading}
                      onClick={async () => {
                        const id = record?.id || record?.suite;
                        if (!id) {
                          message.error('Registro inválido');
                          return;
                        }
                        try {
                          setDetailLoading(true);
                          const res = await apiClient.get(`/cedis/detalles-salida/${id}`);
                          // Mostrar mensajes que retorne la API
                          const apiPayload = res?.data ?? {};
                          showApiMessages(apiPayload, apiPayload.status === 'success' ? 'info' : 'error');

                          if (apiPayload.status === 'success') {
                            const data = apiPayload.data ?? apiPayload;
                            if (Array.isArray(data) && data.length > 1) {
                              setSelectedDetails(data);
                              setSelectedRecord(data[0]);
                              setDetailsVisible(true);
                            } else {
                              const detalle = Array.isArray(data) ? data[0] : data;
                              setSelectedDetails(null);
                              setSelectedRecord(detalle || {});
                              setDetailsVisible(true);
                            }
                          }
                        } catch (err: any) {
                          console.error(err);
                          const resp = err?.response?.data;
                          const shown = resp ? showApiMessages(resp, 'error') : false;
                          if (!shown) message.error(err?.message || 'Error al obtener detalles');
                        } finally {
                          setDetailLoading(false);
                        }
                      }}
                    >Detalles</Button>
                  </Space>
                ),
              },
              {
                title: 'Clave cliente',
                dataIndex: 'suite',
                key: 'suite',
                align: 'center',
              },
              {
                title: 'Cajas',
                dataIndex: 'cajas',
                key: 'cajas',
                align: 'center',
              },
              {
                title: 'Fecha de subida',
                dataIndex: 'created',
                key: 'created',
                align: 'center',
                render: (text: string) => (text ? humanizarFecha(text, true) : ''),
              },
              {
                title: 'Autoriza',
                dataIndex: 'responsable',
                key: 'responsable',
                align: 'center',
              },
            ]}
          />
        </div>
        <Modal
          visible={detailsVisible}
          title={'Detalles'}
          onCancel={() => { setDetailsVisible(false); setSelectedDetails(null); setSelectedRecord(null); }}
          footer={null}
          width={1000}
        >
          {selectedDetails && selectedDetails.length > 1 ? (
            <Row gutter={16}>
              <Col span={10} style={{ maxHeight: 500, overflowY: 'auto' }}>
                <Table
                  dataSource={selectedDetails}
                  pagination={false}
                  rowKey={(r: any) => r.id || r.guiaunica || Math.random()}
                  size="small"
                  columns={[
                    { title: 'Guía ingreso', dataIndex: 'guiaingreso', key: 'guiaingreso' },
                    { title: 'Guía única', dataIndex: 'guiaunica', key: 'guiaunica' },
                    { title: 'Estado', dataIndex: 'estado', key: 'estado' },
                    { title: 'Fecha', dataIndex: 'fechaentrada', key: 'fechaentrada', render: (t: any) => t ? new Date(t).toLocaleString() : '-' },
                    { title: 'Cedis', dataIndex: 'ubicacion', key: 'ubicacion' },
                    { title: 'Acciones', key: 'acciones', render: (_: any, rec: any) => (<Button size="small" onClick={() => setSelectedRecord(rec)}>Ver</Button>) },
                  ]}
                />
              </Col>

              <Col span={14}>
                {selectedRecord ? (
                  (() => {
                    const formatShort = (s: any) => {
                      if (!s) return '-';
                      const d = new Date(s);
                      if (isNaN(d.getTime())) return String(s);
                      return `${d.toLocaleDateString('es-ES')} ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
                    };

                    const address = selectedRecord.direccion || {};
                    const addressLines: string[] = [];
                    if (address.calle) {
                      let line = address.calle;
                      if (address.numeroext) line += ` # ${address.numeroext}`;
                      if (address.numeroint) line += `, Int. ${address.numeroint}`;
                      addressLines.push(line);
                    }
                    if (address.colonia) addressLines.push(`Col. ${address.colonia}`);
                    const cpMunicipio = [address.cp, address.municipio].filter(Boolean).join(', ');
                    if (cpMunicipio) addressLines.push(cpMunicipio);
                    if (address.estado) addressLines.push(address.estado);

                    return (
                      <div>
                        <Row gutter={16} style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: 12 }}>
                          <Col span={6}>GUIA INGRESO</Col>
                          <Col span={6}>GUIA UNICA</Col>
                          <Col span={12}>ESTADO</Col>
                        </Row>

                        <div style={{ background: '#f2f2f2', padding: 20, marginTop: 8 }}>
                          <Row gutter={16} align="middle">
                            <Col span={6}><Typography.Text>{selectedRecord.guiaingreso || '-'}</Typography.Text></Col>
                            <Col span={6}><Typography.Text>{selectedRecord.guiaunica || '-'}</Typography.Text></Col>
                            <Col span={12}>
                              <div style={{ whiteSpace: 'pre-line' }}>
                                <Typography.Text>{selectedRecord.estado || '-'}</Typography.Text>
                                {selectedRecord.guiasalida ? (<div><Typography.Text>Guía de salida: {selectedRecord.guiasalida}</Typography.Text></div>) : null}
                                {selectedRecord.fechasalida ? (<div style={{ marginTop: 8 }}><Typography.Text>Fecha de salida: {formatShort(selectedRecord.fechasalida)}</Typography.Text></div>) : null}
                              </div>
                            </Col>
                          </Row>

                          <Divider />

                          <div style={{ paddingTop: 8 }}>
                            <Typography.Text strong>Dirección de entrega</Typography.Text>
                            <div style={{ marginTop: 12 }}>
                              {addressLines.length ? (
                                (() => {
                                  const mapQuery = addressLines.join(', ');
                                  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
                                  return (
                                    <Row gutter={16} align="top">
                                      <Col xs={24} md={12} style={{ paddingRight: 12 }}>
                                        {addressLines.map((l, i) => (
                                          <div key={i}><Typography.Text>{l}</Typography.Text></div>
                                        ))}
                                      </Col>

                                      <Col xs={24} md={12}>
                                        <div style={{ width: '100%', height: 220, borderRadius: 4, overflow: 'hidden' }}>
                                          <iframe
                                            title="mapa-direccion"
                                            src={mapSrc}
                                            width="100%"
                                            height={220}
                                            style={{ border: 0 }}
                                            loading="lazy"
                                          />
                                        </div>
                                      </Col>
                                    </Row>
                                  );
                                })()
                              ) : (
                                <div><Typography.Text>-</Typography.Text></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : null}
              </Col>
            </Row>
          ) : (
            selectedRecord ? (
              (() => {
                const formatShort = (s: any) => {
                  if (!s) return '-';
                  const d = new Date(s);
                  if (isNaN(d.getTime())) return String(s);
                  return `${d.toLocaleDateString('es-ES')} ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
                };

                const address = selectedRecord.direccion || {};
                const addressLines: string[] = [];
                if (address.calle) {
                  let line = address.calle;
                  if (address.numeroext) line += ` # ${address.numeroext}`;
                  if (address.numeroint) line += `, Int. ${address.numeroint}`;
                  addressLines.push(line);
                }
                if (address.colonia) addressLines.push(`Col. ${address.colonia}`);
                const cpMunicipio = [address.cp, address.municipio].filter(Boolean).join(', ');
                if (cpMunicipio) addressLines.push(cpMunicipio);
                if (address.estado) addressLines.push(address.estado);

                return (
                  <div>
                    <Row gutter={16} style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: 12 }}>
                      <Col span={4}>GUIA INGRESO</Col>
                      <Col span={4}>GUIA UNICA</Col>
                      <Col span={6}>ESTADO</Col>
                      <Col span={4}>FECHA DE INGRESO CEDIS</Col>
                      <Col span={6}>CEDIS</Col>
                    </Row>

                    <div style={{ background: '#f2f2f2', padding: 20, marginTop: 8 }}>
                      <Row gutter={16} align="middle">
                        <Col span={4}><Typography.Text>{selectedRecord.guiaingreso || '-'}</Typography.Text></Col>
                        <Col span={4}><Typography.Text>{selectedRecord.guiaunica || '-'}</Typography.Text></Col>
                        <Col span={6}>
                          <div style={{ whiteSpace: 'pre-line' }}>
                            <Typography.Text>{selectedRecord.estado || '-'}</Typography.Text>
                            {selectedRecord.guiapagada ? (<div><Typography.Text>Guía Pagada</Typography.Text></div>) : null}
                            {selectedRecord.guiasalida ? (<div><Typography.Text>Guía de salida: {selectedRecord.guiasalida}</Typography.Text></div>) : null}
                            {selectedRecord.fechasalida ? (<div style={{ marginTop: 8 }}><Typography.Text>Fecha de salida: {formatShort(selectedRecord.fechasalida)}</Typography.Text></div>) : null}
                          </div>
                        </Col>
                        <Col span={4}><Typography.Text>{selectedRecord.fechaentrada ? formatShort(selectedRecord.fechaentrada) : '-'}</Typography.Text></Col>
                        <Col span={6}><Typography.Text>{selectedRecord.ubicacion || '-'}</Typography.Text></Col>
                      </Row>

                      <Divider />

                      <div style={{ paddingTop: 8 }}>
                        <Typography.Text strong>Dirección de entrega</Typography.Text>
                        <div style={{ marginTop: 12 }}>
                          {addressLines.length ? (
                            (() => {
                              const mapQuery = addressLines.join(', ');
                              const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
                              return (
                                <Row gutter={16} align="top">
                                  <Col xs={24} md={12} style={{ paddingRight: 12 }}>
                                    {addressLines.map((l, i) => (
                                      <div key={i}><Typography.Text>{l}</Typography.Text></div>
                                    ))}
                                  </Col>

                                  <Col xs={24} md={12}>
                                    <div style={{ width: '100%', height: 220, borderRadius: 4, overflow: 'hidden' }}>
                                      <iframe
                                        title="mapa-direccion"
                                        src={mapSrc}
                                        width="100%"
                                        height={220}
                                        style={{ border: 0 }}
                                        loading="lazy"
                                      />
                                    </div>
                                  </Col>
                                </Row>
                              );
                            })()
                          ) : (
                            <div><Typography.Text>-</Typography.Text></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : null
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Salidas;
