import React, { useState } from 'react';
import { Card, DatePicker, Button, Space, Alert, Table, Divider, Spin, Modal } from 'antd';
import { FiTruck } from 'react-icons/fi';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');
import apiClient from '@/api/axios';

export const CedisIngresosDiarios: React.FC = () => {
  const [fecha, setFecha] = useState<Dayjs | null>(dayjs());
  const [messages, setMessages] = useState<Array<{ type: string; text: string }>>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDireccion, setSelectedDireccion] = useState<any | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);

  const onChange = (value: Dayjs | null) => {
    setFecha(value);
  };

  const onBuscar = () => {
    const dateStr = fecha ? fecha.format('YYYY-MM-DD') : null;
    if (!dateStr) {
      setMessages([{ type: 'error', text: 'Selecciona una fecha' }]);
      return;
    }

    setLoading(true);
    setMessages([]);

    apiClient.get(`/cedis/ingresos-diarios/dhl/${dateStr}`)
      .then((res) => {
        const payload = res.data || {};

        // Determinar éxito según diferentes posibles claves
        const isSuccess = payload.success === true || payload.status === 'success' || payload.estatus === 'success' || payload.status === 'ok';

        const msgs: Array<{ type: string; text: string }> = [];
        if (payload.message) msgs.push({ type: isSuccess ? 'success' : 'error', text: String(payload.message) });
        if (payload.mensaje) msgs.push({ type: isSuccess ? 'success' : 'error', text: String(payload.mensaje) });
        if (Array.isArray(payload.messages)) {
          payload.messages.forEach((m: any) => msgs.push({ type: isSuccess ? 'success' : 'error', text: String(m) }));
        }

        setMessages(msgs.length ? msgs : [{ type: isSuccess ? 'success' : 'info', text: 'Respuesta recibida' }]);

        if (isSuccess && Array.isArray(payload.data)) {
          const mapped = payload.data.map((it: any) => {
            const dir = it.direccion || it.direcciones || null;
            const formatDireccion = (d: any) => {
              if (!d) return '-';
              const parts = [];
              if (d.quienrecibe) parts.push(d.quienrecibe);
              const calle = d.calle ? d.calle : '';
              const num = d.numeroext || d.numeroint || d.numero || '';
              const colonia = d.colonia ? d.colonia : '';
              const ciudad = d.ciudad || d.municipio || '';
              if (calle) parts.push(`${calle}${num ? ' ' + num : ''}`);
              if (colonia) parts.push(colonia);
              if (ciudad) parts.push(ciudad);
              return parts.join(', ') || '-';
            };

            return {
              id: it.id || `${it.guiaunica || it.guia_ingreso || Math.random()}`,
              dirEntrega: formatDireccion(dir),
              rawDireccion: dir,
              guiaIngreso: it.guiaingreso || it.guia_ingreso || it.guia || '-',
              guiaUnica: it.guiaunica || it.guia_unica || '-',
              suite: it.suite || '-',
              impuestoMN: it.impuesto || it.impuesto_mn || '-',
              impuestoAsignadoPor: it.resp_impuesto || it.resp_impuesto || it.resp_imp || '-',
              cajas: it.cantidad_cajas ?? it.cajas ?? '-',
              estado: it.estado || it.status || '-',
              medidas: `${it.largo ?? '-'} x ${it.alto ?? '-'} x ${it.ancho ?? '-'}`,
              fechaEntrada: it.fechaentrada || it.fecha_entrada || '-',
              fechaSalida: it.fechasalida || it.fecha_salida || '-',
              guiaSalida: it.guiasalida || it.guia_salida || '-',
            };
          });

          setTableData(mapped);
        } else {
          setTableData([]);
        }
      })
      .catch((err) => {
        const text = err?.response?.data?.message || err.message || 'Error en la petición';
        setMessages([{ type: 'error', text }]);
        setTableData([]);
      })
      .finally(() => setLoading(false));
  };

  // Column helpers with fallbacks
  const getField = (record: any, ...keys: string[]) => {
    for (const k of keys) {
      if (record[k] !== undefined && record[k] !== null) return record[k];
    }
    return '-';
  };

  const formatDate = (value: any) => {
    if (!value) return '-';
    const d = dayjs(String(value));
    if (!d.isValid()) return String(value);
    return d.format('DD MMM YYYY HH:mm');
  };

  const columns = [
    {
      title: 'Dir. Entrega',
      dataIndex: 'dirEntrega',
      key: 'dirEntrega',
      render: (_: any, r: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            onClick={() => { setSelectedDireccion(r.rawDireccion || null); setModalVisible(true); }}
            style={{
              backgroundColor: '#0b8457',
              color: '#fff',
              border: 'none',
              width: 40,
              height: 40,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              boxShadow: 'none',
            }}
          >
            <FiTruck size={18} />
          </Button>
        </div>
      )
    },
    { title: 'Guia de ingreso', dataIndex: 'guiaIngreso', key: 'guiaIngreso', nowrap: true, render: (_: any, r: any) => getField(r, 'guiaIngreso', 'guia_ingreso', 'guia') },
    { title: 'Guia unica', dataIndex: 'guiaUnica', key: 'guiaUnica', nowrap: true, render: (_: any, r: any) => getField(r, 'guiaUnica', 'guia_unica') },
    { title: 'SUITE', dataIndex: 'suite', key: 'suite', render: (_: any, r: any) => getField(r, 'suite') },
    { title: 'Impuesto (M.N)', dataIndex: 'impuestoMN', key: 'impuestoMN', render: (_: any, r: any) => getField(r, 'impuestoMN', 'impuesto_mn', 'impuesto') },
    { title: 'Impuesto asignado por', dataIndex: 'impuestoAsignadoPor', key: 'impuestoAsignadoPor', render: (_: any, r: any) => getField(r, 'impuestoAsignadoPor', 'impuesto_asignado_por') },
    { title: 'Cajas', dataIndex: 'cajas', key: 'cajas', render: (_: any, r: any) => getField(r, 'cajas', 'boxes') },
    { title: 'Estado', dataIndex: 'estado', key: 'estado', render: (_: any, r: any) => getField(r, 'estado', 'status') },
    { title: 'Medidas', dataIndex: 'medidas', key: 'medidas', render: (_: any, r: any) => getField(r, 'medidas', 'measurements') },
    {
      title: 'Fecha de entrada',
      dataIndex: 'fechaEntrada',
      key: 'fechaEntrada',
      render: (_: any, r: any) => formatDate(getField(r, 'fechaEntrada', 'fecha_entrada'))
    },
    {
      title: 'Fecha de salida',
      dataIndex: 'fechaSalida',
      key: 'fechaSalida',
      render: (_: any, r: any) => formatDate(getField(r, 'fechaSalida', 'fecha_salida'))
    },
    { title: 'Guia de salida', dataIndex: 'guiaSalida', key: 'guiaSalida', render: (_: any, r: any) => getField(r, 'guiaSalida', 'guia_salida') },
  ];

  // Asegurar que las celdas permiten mostrar texto completo (wrap)
  const displayColumns = columns.map((c) => ({
    ...c,
    ellipsis: false,
    onCell: () => ({ style: { whiteSpace: 'normal', wordBreak: 'break-word', paddingRight: 12 } }),
  }));

  return (
    <div style={{ padding: 16 }}>
      <Card title="Guias Ingresadas Diariamente">
        <Space align="center" style={{ marginBottom: 16 }}>
          <DatePicker value={fecha} onChange={onChange} size="large" style={{ width: 220 }} />
          <Button type="primary" onClick={onBuscar} size="large">Buscar</Button>
        </Space>

        <div style={{ marginTop: 16 }}>
          {messages.map((m, idx) => (
            <Alert key={idx} style={{ marginBottom: 8 }} message={m.text} type={m.type === 'error' ? 'error' : m.type === 'success' ? 'success' : 'info'} showIcon />
          ))}
        </div>

        <Divider />

        <Modal
          open={modalVisible}
          title="Dirección de entrega"
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Cerrar
            </Button>,
          ]}
        >
            {selectedDireccion ? (
              <div>
                <p><b>Quien recibe:</b> {selectedDireccion.quienrecibe || selectedDireccion.quien_recibe || '-'}</p>
                <p><b>Calle:</b> {selectedDireccion.calle || '-'}</p>
                <p><b>Número ext/int:</b> {(selectedDireccion.numeroext || selectedDireccion.numeroint || selectedDireccion.numero) || '-'}</p>
                <p><b>Colonia:</b> {selectedDireccion.colonia || '-'}</p>
                <p><b>Ciudad / Municipio:</b> {(selectedDireccion.ciudad || selectedDireccion.municipio) || '-'}</p>
                <p><b>Estado:</b> {selectedDireccion.estado || '-'}</p>
                <p><b>CP:</b> {selectedDireccion.cp || '-'}</p>
                <p><b>Teléfono:</b> {selectedDireccion.telefono || selectedDireccion.movil || '-'}</p>
                <p><b>Referencia:</b> {selectedDireccion.refe || selectedDireccion.referencia || '-'}</p>
                <p><b>Tipo entrega:</b> {selectedDireccion.lugarentrega || '-'}</p>

                {/* Google Maps iframe */}
                {(() => {
                  const parts = [];
                  const calle = selectedDireccion.calle || '';
                  const num = selectedDireccion.numeroext || selectedDireccion.numeroint || selectedDireccion.numero || '';
                  if (calle) parts.push(`${calle}${num ? ' ' + num : ''}`);
                  if (selectedDireccion.colonia) parts.push(selectedDireccion.colonia);
                  if (selectedDireccion.ciudad) parts.push(selectedDireccion.ciudad);
                  if (selectedDireccion.municipio) parts.push(selectedDireccion.municipio);
                  if (selectedDireccion.estado) parts.push(selectedDireccion.estado);
                  if (selectedDireccion.cp) parts.push(selectedDireccion.cp);
                  if (selectedDireccion.pais) parts.push(selectedDireccion.pais);
                  const query = parts.filter(Boolean).join(', ');

                  if (query) {
                    const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
                    return (
                      <div style={{ marginTop: 12 }}>
                        <iframe
                          title="Mapa dirección"
                          src={src}
                          style={{ width: '100%', height: 300, border: 0, borderRadius: 6 }}
                          loading="lazy"
                        />
                        <div style={{ marginTop: 8 }}>
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer">Abrir en Google Maps</a>
                        </div>
                      </div>
                    );
                  }

                  return <div style={{ marginTop: 12 }}>No hay datos suficientes para mostrar el mapa.</div>;
                })()}
              </div>
            ) : (
              <div>No hay dirección</div>
            )}
        </Modal>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table
              rowKey={(r) => r.id || r.guia_unica || JSON.stringify(r)}
              dataSource={tableData}
              columns={displayColumns as any}
              pagination={{
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total: number, range?: [number, number]) => {
                  if (range) return `Mostrando ${range[0]}-${range[1]} de ${total}`;
                  return `Total: ${total}`;
                }
              }}
              onChange={(pagination: any) => {
                if (pagination?.pageSize) setPageSize(Number(pagination.pageSize));
              }}
              scroll={{ x: 1300 }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default CedisIngresosDiarios;
