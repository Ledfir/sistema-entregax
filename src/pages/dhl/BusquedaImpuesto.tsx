import React, { useState } from 'react';
import { Card, Form, Input, Button, Table, message, Tag, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import apiClient from '@/api/axios';
import { humanizarFecha } from '@/utils/dateUtils';

const BusquedaImpuesto: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    const guia = (query || '').trim();
    if (!guia) {
      message.warning('Ingresa una guía (waybill) para buscar');
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      const resp = await apiClient.get(`cedis/busqueda-impuesto/${encodeURIComponent(guia)}`);
      // API example: { status: 'success', data: [ { id, guiaingreso, impuesto, pagado, fecha_pago, asociadas } ] }
      if (resp.data?.status && resp.data.status !== 'success') {
        const err = resp.data?.message || resp.data?.mensaje || 'Error en la búsqueda';
        message.error(err);
        setLoading(false);
        return;
      }

      const data = Array.isArray(resp.data?.data) ? resp.data.data : [];
      if (data.length === 0) {
        message.info('No se encontraron registros para la guía indicada');
      }
      setResults(data);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.response?.data?.mensaje || err.message || 'Error al consultar el servidor';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificarPago = async (record: any) => {
    try {
      setLoading(true);
      const resp = await apiClient.post('cedis/notificar-pago', { id: record.id });
      const msg = resp.data?.message || resp.data?.mensaje || 'Notificación enviada';
      message.success(msg);

      // Si la API devuelve datos actualizados, usarlos; si no, marcar como pagado localmente
      let updated: any = null;
      if (resp.data?.data) {
        // puede ser un objeto o un array
        if (Array.isArray(resp.data.data)) {
          updated = resp.data.data[0] || null;
        } else if (typeof resp.data.data === 'object') {
          updated = resp.data.data;
        }
      }

      setResults((prev) =>
        prev.map((r) => {
          if (r.id == record.id) {
            if (updated) {
              return { ...r, ...updated };
            }
            return { ...r, pagado: '1', fecha_pago: new Date().toISOString() };
          }
          return r;
        })
      );
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.mensaje || err.message || 'Error al notificar pago';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Waybill',
      dataIndex: 'guiaingreso',
      key: 'guiaingreso',
      align: 'center',
    },
    {
      title: 'Guia unica',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
    },
    {
      title: 'Impuesto',
      dataIndex: 'impuesto',
      key: 'impuesto',
      align: 'center',
      render: (v: any) => (v == null ? '-' : '$' + v),
    },
    {
      title: 'Guias asociadas',
      dataIndex: 'asociadas',
      key: 'asociadas',
      align: 'center',
      render: (v: any) => (v == null || v < 2 ? 'Sin guias asociadas' : (v - 1) + ' guia(s) asociada(s)'),
    },
    {
      title: 'Pagado',
      dataIndex: 'pagado',
      key: 'pagado',
      align: 'center',
      render: (_: any, record: any) => (
        (record.pagado === '1' || record.pagado === 1 || record.pagado === true) ? (
          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" align="center">
              <Tag color="green">Sí</Tag>
              <div style={{ fontWeight: 600 }}>Pagado el: {record.fecha_pago ? humanizarFecha(record.fecha_pago) : '-'}</div>
            </Space>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" align="center">
              <Tag color="red">NO</Tag>
              <Popconfirm
                title="Confirmar notificación"
                description="Al confirmar, esta guía será marcada como pagada. ¿Deseas continuar?"
                okText="Sí, marcar como pagada"
                cancelText="Cancelar"
                onConfirm={() => handleNotificarPago(record)}
              >
                <Button type="primary" style={{ background: '#ff6b00', borderColor: '#ff6b00' }} disabled={loading}>
                  Notificar pago
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )
      ),
    },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <Card title="Buscador de guias para impuestos" style={{ width: 1200 }}>
        <Form layout="vertical">
          <Form.Item label="Guia a buscar (Waybill)" style={{ textAlign: 'center' }}>
            <Input
              placeholder="Ingresa la guia (waybill)"
              style={{ textAlign: 'center' }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Button type="primary" onClick={handleSearch} loading={loading}>
              Buscar guia
            </Button>
          </div>

          {results.length > 0 && (
            <Table
              dataSource={results.map((r: any, idx: number) => ({ key: idx, ...r }))}
              columns={columns}
              pagination={false}
            />
          )}
        </Form>
      </Card>
    </div>
  );
};

export default BusquedaImpuesto;
