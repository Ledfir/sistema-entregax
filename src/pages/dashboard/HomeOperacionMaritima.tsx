import { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Dropdown, message, Row, Col, Select, DatePicker, Input, Form, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { MoreOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { humanizarFecha } from '@/utils';
import axios from '@/api/axios';
import './HomeOperacionMaritima.css';

interface BLDisponible {
  key: string;
  bl: string;
  week: string;
  plsPendientes: number;
  eta: string;
  tipo: string;
  fecha: string;
  estado: string;
}

export const HomeOperacionMaritima = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BLDisponible[]>([]);
  const [estados, setEstados] = useState<Array<{id: string | number; name: string}>>([]);
  const [selectedRecord, setSelectedRecord] = useState<BLDisponible | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string | undefined>(undefined);
  const [eta, setEta] = useState<any | null>(null);
  const [comentario, setComentario] = useState<string>('');
  const [submittingEstado, setSubmittingEstado] = useState(false);
  const [submittingEta, setSubmittingEta] = useState(false);
  const [blDetails, setBlDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { confirm } = Modal;

  useEffect(() => {
    document.title = 'Sistema Entregax | Operación Marítima';
    loadBLsDisponibles();
    loadEstados();
  }, []);

  const loadEstados = () => {
    axios
      .get('/operation-maritime/list-estados')
      .then((res) => {
        const list = res?.data?.data || [];
        setEstados(list);
      })
      .catch((err) => {
        console.error('Error cargando estados:', err);
      });
  };

  const loadBLsDisponibles = () => {
    setLoading(true);

    const determineEstado = (item: any) => {
      const pendientes = Number(item.pendientes ?? 0);
      if (pendientes > 0) return 'Pendiente documentos';
      if (item.state === '1') return 'En puerto';
      return 'En tránsito';
    };

    axios
      .get('/operation-maritime/list-bls')
      .then((res) => {
        const list = res?.data?.data || [];
        const mapped: BLDisponible[] = list.map((item: any) => ({
          key: String(item.id ?? item.token ?? Math.random()),
          bl: item.name ?? item.token ?? '',
          week: item.week ?? '',
          plsPendientes: Number(item.pendientes ?? 0),
          eta: item.eta ?? '',
          tipo: item.tipo ?? '',
          fecha: item.created ?? item.eta ?? '',
          estado: determineEstado(item),
        }));

        setData(mapped);
      })
      .catch((err) => {
        console.error('Error cargando BLs:', err);
      })
      .finally(() => setLoading(false));
  };

  const getEstadoColor = (estado: string): string => {
    const estadosMap: Record<string, string> = {
      'En tránsito': 'blue',
      'En puerto': 'cyan',
      'Pendiente documentos': 'orange',
      'Listo para despacho': 'green',
      'Despachado': 'default',
    };
    return estadosMap[estado] || 'default';
  };

  const getTipoColor = (tipo: string): string => {
    return tipo === 'FCL' ? 'purple' : 'geekblue';
  };

  const getMenuItems = (record: BLDisponible): MenuProps['items'] => [
    {
      key: 'detalles',
      label: 'Detalles',
      icon: <EyeOutlined />,
      onClick: () => handleDetalles(record),
    },
    {
      key: 'ocultar',
      label: 'Ocultar',
      icon: <EyeInvisibleOutlined />,
      onClick: () => handleOcultar(record),
    },
  ];

  const columns: ColumnsType<BLDisponible> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      fixed: 'left',
      align: 'center',
      render: (_, record) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: '18px' }} />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
    {
      title: 'BL',
      dataIndex: 'bl',
      key: 'bl',
      width: 150,
      sorter: (a, b) => a.bl.localeCompare(b.bl),
    },
    {
      title: 'WEEK',
      dataIndex: 'week',
      key: 'week',
      width: 120,
      sorter: (a, b) => a.week.localeCompare(b.week),
    },
    {
      title: 'PLs Pendientes',
      dataIndex: 'plsPendientes',
      key: 'plsPendientes',
      width: 140,
      align: 'center',
      sorter: (a, b) => a.plsPendientes - b.plsPendientes,
      render: (value: number) => (
        <Tag color={value > 0 ? 'red' : 'green'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'ETA',
      dataIndex: 'eta',
      key: 'eta',
      width: 180,
      sorter: (a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime(),
      render: (value: string) => humanizarFecha(value),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 100,
      align: 'center',
      filters: [
        { text: 'FCL', value: 'FCL' },
        { text: 'LCL', value: 'LCL' },
      ],
      onFilter: (value, record) => record.tipo === value,
      render: (tipo: string) => (
        <Tag color={getTipoColor(tipo)}>{tipo}</Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 180,
      sorter: (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
      render: (value: string) => humanizarFecha(value),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 180,
      filters: [
        { text: 'En tránsito', value: 'En tránsito' },
        { text: 'En puerto', value: 'En puerto' },
        { text: 'Pendiente documentos', value: 'Pendiente documentos' },
        { text: 'Listo para despacho', value: 'Listo para despacho' },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado: string) => (
        <Tag color={getEstadoColor(estado)}>{estado}</Tag>
      ),
    },
  ];

  const handleDetalles = (record: BLDisponible) => {
    setSelectedRecord(record);
    // intentar preseleccionar el estado por nombre si existe en la lista de estados
    const match = estados.find((s) => s.name === record.estado || String(s.id) === record.estado);
    setEstadoSeleccionado(match ? String(match.id) : undefined);
    setEta(null);
    setComentario('');
    loadBlDetails(record.key);
  };

  const loadBlDetails = (id: string) => {
    setDetailsLoading(true);
    setBlDetails(null);
    axios
      .get(`/operation-maritime/details-bl/${id}`)
      .then((res) => {
        const data = res?.data?.data ?? {};
        const bl = data.bl ?? null;
        const logs = data.logs || [];
        // calcular totales
        const totalCbm = logs.reduce((acc: number, l: any) => acc + (parseFloat(l.cbm ?? 0) || 0), 0);
        const totalBultos = logs.reduce((acc: number, l: any) => acc + (parseInt(l.bultos ?? 0) || 0), 0);
        setBlDetails({ bl, logs, totalCbm, totalBultos });
      })
      .catch((err) => {
        console.error('Error cargando detalles BL:', err);
      })
      .finally(() => setDetailsLoading(false));
  };

  const handleEditDeliveryAddress = (log: any) => {
    message.info('Editar Dir. Entrega - implementar UI');
    console.log('Editar dir entrega', log);
  };

  const handleChangePlToS = (log: any) => {
    confirm({
      title: 'Cambiar PL a S',
      content: `¿Deseas cambiar PL a S para ${log.name || log.id}?`,
      onOk() {
        return axios.post('/operation-maritime/change-pl-to-s', { id: log.id })
          .then((res) => {
            const data = res?.data ?? {};
            const msg = data.message || 'Operacion exitosa';
            message.success(msg);
            if (selectedRecord) loadBlDetails(selectedRecord.key);
          })
          .catch((err) => {
            console.error(err);
            message.error('Error cambiando PL');
          });
      }
    });
  };

  const handleRejectPl = (log: any) => {
    confirm({
      title: 'Rechazar PL',
      content: `¿Deseas rechazar el PL ${log.name || log.id}?`,
      onOk() {
        return axios.post('/operation-maritime/reject-pl', { id: log.id })
          .then((res) => {
            const data = res?.data ?? {};
            const msg = data.message || 'PL rechazado';
            message.success(msg);
            if (selectedRecord) loadBlDetails(selectedRecord.key);
          })
          .catch((err) => {
            console.error(err);
            message.error('Error rechazando PL');
          });
      }
    });
  };

  const handleOcultar = (record: BLDisponible) => {
    const id = record.key;
    const key = `hide-${id}`;
    message.loading({ content: 'Ocultando...', key, duration: 0 });
    setLoading(true);

    axios
      .post('/operation-maritime/hide-bl', { id })
      .then((res) => {
        const data = res?.data ?? {};
        const msg = data.message || data.msg || (typeof data === 'string' ? data : 'Operación completada');
        const success = data.status === 'success' || data.success === true;

        if (success) {
          message.success({ content: msg, key, duration: 2 });
          loadBLsDisponibles();
        } else {
          message.error({ content: msg, key, duration: 3 });
        }
      })
      .catch((err) => {
        console.error('Error ocultando BL:', err);
        message.error({ content: 'Error al ocultar BL', key, duration: 3 });
      })
      .finally(() => setLoading(false));
  };

  const handleChangeEstado = () => {
    if (!selectedRecord || !estadoSeleccionado) return;
    const id = selectedRecord.key;
    const key = `change-state-${id}`;
    message.loading({ content: 'Cambiando estado...', key, duration: 0 });
    setSubmittingEstado(true);

    axios
      .post('/operation-maritime/change-state', { id, state: estadoSeleccionado })
      .then((res) => {
        const data = res?.data ?? {};
        const msg = data.message || data.msg || 'Estado cambiado';
        const success = data.status === 'success' || data.success === true;

        if (success) {
          message.success({ content: msg, key, duration: 2 });
          loadBLsDisponibles();
        } else {
          message.error({ content: msg, key, duration: 3 });
        }
      })
      .catch((err) => {
        console.error('Error cambiando estado:', err);
        message.error({ content: 'Error cambiando estado', key, duration: 3 });
      })
      .finally(() => setSubmittingEstado(false));
  };

  const handleChangeEta = () => {
    if (!selectedRecord || !eta) return;
    const id = selectedRecord.key;
    const key = `change-eta-${id}`;
    message.loading({ content: 'Cambiando ETA...', key, duration: 0 });
    setSubmittingEta(true);

    const etaFormatted = typeof eta?.format === 'function' ? eta.format('YYYY-MM-DD') : eta;

    axios
      .post('/operation-maritime/change-eta', { id, eta: etaFormatted, comentario })
      .then((res) => {
        const data = res?.data ?? {};
        const msg = data.message || data.msg || 'ETA actualizada';
        const success = data.status === 'success' || data.success === true;

        if (success) {
          message.success({ content: msg, key, duration: 2 });
          loadBLsDisponibles();
        } else {
          message.error({ content: msg, key, duration: 3 });
        }
      })
      .catch((err) => {
        console.error('Error cambiando ETA:', err);
        message.error({ content: 'Error cambiando ETA', key, duration: 3 });
      })
      .finally(() => setSubmittingEta(false));
  };

  return (
    <div className="home-operacion-maritima">
      {!selectedRecord ? (
        <Card 
          title="BL's disponibles"
          className="bls-card"
        >
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} BLs`,
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Card>
      ) : (
        <Card
          title={`Detalles BL ${selectedRecord.bl}`}
          extra={<Button onClick={() => { setSelectedRecord(null); setEstadoSeleccionado(undefined); setEta(null); setComentario(''); }}>Volver</Button>}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div style={{ border: '1px solid #f0f0f0', padding: 16, borderRadius: 4 }}>
                <h3>Estado BL</h3>
                <Form layout="vertical">
                  <Form.Item label="Estado a cambiar en BL">
                    <Select
                      placeholder="Selecciona un estado"
                      value={estadoSeleccionado}
                      onChange={(val) => setEstadoSeleccionado(val)}
                      loading={estados.length === 0}
                    >
                      {estados.map((s) => (
                        <Select.Option key={s.id} value={String(s.id)}>
                          {s.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" onClick={handleChangeEstado} loading={submittingEstado}>
                      Cambiar estado
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ border: '1px solid #f0f0f0', padding: 16, borderRadius: 4 }}>
                <h3>Cambio de ETA</h3>
                <Form layout="vertical">
                  <Form.Item label="Selecciona la nueva ETA">
                    <DatePicker style={{ width: '100%' }} value={eta} onChange={(d) => setEta(d)} />
                  </Form.Item>
                  <Form.Item label="Comentario">
                    <Input.TextArea rows={4} placeholder="Por favor indícanos cuál es el motivo del cambio" value={comentario} onChange={(e) => setComentario(e.target.value)} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" onClick={handleChangeEta} loading={submittingEta}>
                      Cambiar ETA
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Col>
          </Row>
          {blDetails && (
            <>
              <div style={{ marginTop: 20, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                <h2 style={{ margin: 0 }}>Estado Actual: {blDetails.bl?.estado || '—'}</h2>
                <p style={{ marginTop: 8 }}>
                  <strong>BL:</strong> {blDetails.bl?.name || selectedRecord?.bl} - 
                  <strong>WEEK:</strong> {blDetails.bl?.week || selectedRecord?.week || '—'} - 
                  <strong>Fecha:</strong> {blDetails.bl?.created ? humanizarFecha(blDetails.bl.created) : (selectedRecord?.fecha ? humanizarFecha(selectedRecord.fecha) : '—')} - 
                  <strong>CBMS:</strong> {Number(blDetails.totalCbm).toFixed(2)} - 
                  <strong>Bultos:</strong> {blDetails.totalBultos}
                </p>
              </div>

              <div style={{ marginTop: 16 }}>
                <Table
                  columns={[
                    {
                      title: 'Acciones',
                      key: 'acciones',
                      width: 120,
                      fixed: 'left',
                      align: 'center',
                      render: (_: any, record: any) => {
                        const items: any[] = [
                          { key: 'editar', label: 'Editar Dir. Entrega', onClick: () => handleEditDeliveryAddress(record) },
                          { key: 'cambiar', label: 'Cambiar PL a S', onClick: () => handleChangePlToS(record) },
                          { key: 'rechazar', label: 'Rechazar PL', onClick: () => handleRejectPl(record) },
                        ];
                        return (
                          <Dropdown menu={{ items }} trigger={[ 'click' ]}>
                            <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} onClick={(e) => e.stopPropagation()} />
                          </Dropdown>
                        );
                      }
                    },
                    { title: 'LOG', dataIndex: 'name', key: 'name' },
                    { title: 'Cliente', dataIndex: 'cliente', key: 'cliente' },
                    { title: 'CBMs', dataIndex: 'cbm', key: 'cbm', render: (v: any) => Number(v || 0).toFixed(2) },
                    { title: 'Bultos', dataIndex: 'bultos', key: 'bultos' },
                    { title: 'Asesor', dataIndex: 'asesor', key: 'asesor' },
                    { title: 'Fecha de creacion', dataIndex: 'created', key: 'created', render: (v: any) => v ? humanizarFecha(v) : '-' },
                    { title: 'Dias de PL', dataIndex: 'dias_pl', key: 'dias_pl' },
                    { title: 'PL', dataIndex: 'pl', key: 'pl', render: (v: any) => (
                        v === 1 || v === true || String(v) === '1' ? <Tag color="green">Sí</Tag> : <Tag>No</Tag>
                      ) },
                    { title: 'Tipo', dataIndex: 'pl_tipo', key: 'pl_tipo', render: (v: any) => (
                        Number(v) === 1 ? <Tag>LOGO</Tag> : <Tag>GENERICO</Tag>
                      ) },
                    { title: 'Sensible', dataIndex: 'sensible', key: 'sensible', render: (v: any) => (
                        v === 1 || v === true || String(v) === '1' ? <Tag color="red">Sí</Tag> : <Tag>No</Tag>
                      ) },
                    { title: 'Descargar PL', key: 'descargar', render: (_: any, record: any) => {
                        const file = record.file_pl || record.pl_file || null;
                        if (file && file.success && file.value) {
                          return <a href={file.value} target="_blank" rel="noreferrer">Descargar</a>;
                        }
                        return '-';
                      }
                    },
                    { title: 'Dias en aceptar PL', dataIndex: 'dias_pl_acept', key: 'dias_pl_acept' },
                  ] as any}
                  dataSource={blDetails.logs}
                  rowKey={(r: any) => r.id}
                  loading={detailsLoading}
                  pagination={{
                    defaultPageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showTotal: (total) => `Total: ${total}`,
                  }}
                />
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default HomeOperacionMaritima;
