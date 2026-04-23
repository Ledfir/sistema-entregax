import { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Dropdown, message, Row, Col, Select, DatePicker, Input, Form } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { MoreOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { humanizarFecha } from '@/utils';
import axios from '@/api/axios';
import dayjs from 'dayjs';
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
        </Card>
      )}
    </div>
  );
};

export default HomeOperacionMaritima;
