import React, { useState } from 'react';
import { Card, Row, Col, DatePicker, Button, message, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');
import operacionesService from '@/services/operacionesService';

const { RangePicker } = DatePicker;

const ReporteUS: React.FC = () => {
  const [range, setRange] = useState<[any, any] | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [total, setTotal] = useState<number | null>(null);

  const handleGenerarReporte = async () => {
    if (!range || !range[0] || !range[1]) {
      message.warning('Seleccione un rango de fechas');
      return;
    }
    setLoading(true);
    const from = dayjs(range[0]).format('YYYY-MM-DD');
    const to = dayjs(range[1]).format('YYYY-MM-DD');
    try {
      const payload = { fecha_inicio: from, fecha_fin: to };
      const resp = await operacionesService.getReportUS(payload);
      console.log('Reporte US response:', resp);
      // Normalizar respuesta: soporta { status, data, total } o array directo
      const finalRows = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
      const finalTotal = resp?.total ?? null;
      setReportData(finalRows);
      setTotal(finalTotal);
      message.success('Reporte generado correctamente');
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current: any) => {
    // bloquear fechas futuras (mayores al día actual)
    if (!current) return false;
    return dayjs(current).isAfter(dayjs(), 'day');
  };

  const fmtCurrencyUSD = (v: any) => {
    const n = Number(v) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  };

  const fmtCurrencyMX = (v: any) => {
    const n = Number(v) || 0;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
  };

  const columns = [
    { title: 'SUITE', dataIndex: 'cliente', key: 'cliente', width: 200 },
    { title: 'GUIA US', dataIndex: 'guiaus', key: 'guiaus', width: 250 },
    { title: 'GUIA', dataIndex: 'guiaingreso', key: 'guiaingreso', width: 300 },
    { title: 'RUTA', dataIndex: 'ruta', key: 'ruta', width: 80 },
    { title: 'ESTADO', dataIndex: 'estado', key: 'estado', width: 500 },
    { title: 'COSTO CLIENTE', dataIndex: 'costo', key: 'costo', width: 200, render: (v: any) => fmtCurrencyMX(v) },
    { title: 'FECHA DE INGRESO US', dataIndex: 'created', key: 'created', width: 300, render: (v: any) => (v ? dayjs(v).format('DD MMM YYYY HH:mm') : '') },
    { title: 'FECHA LLEGADA MTY', dataIndex: 'fechaentrada', key: 'fechaentrada', width: 300, render: (v: any) => (v ? dayjs(v).format('DD MMM YYYY HH:mm') : '') },
    { title: 'MEDIDAS EN PULGADAS', key: 'medidas', width: 200, render: (_: any, record: any) => `${record.largo ?? ''} x ${record.alto ?? ''} x ${record.ancho ?? ''}` },
    { title: 'TOTAL USD', dataIndex: 'totalUsd', key: 'totalUsd', width: 200, render: (v: any) => fmtCurrencyUSD(v) },
    { title: 'T.C.', dataIndex: 'tipodecambio', key: 'tipodecambio', width: 200 },
    { title: 'TOTAL MX', dataIndex: 'totalMx', key: 'totalMx', width: 200, render: (v: any) => fmtCurrencyMX(v) },
  ];

  return (
    <Card title="Reporte US" style={{ width: 'min(1200px, 90%)', margin: '24px auto', padding: 24 }}>
      <Row gutter={24} align="middle" justify="center">
        <Col>
          <div style={{ marginBottom: 8, textAlign: 'center' }}>Seleccione rango de fechas</div>
          <RangePicker
            value={range as any}
            onChange={(vals) => setRange(vals as any)}
            allowClear
            size="large"
            disabledDate={disabledDate}
          />
        </Col>
        <Col>
          <div style={{ height: 40 }} />
          <Button
            type="primary"
            size="large"
            onClick={handleGenerarReporte}
            loading={loading}
            style={{ background: '#ff6600', borderColor: '#ff6600', color: '#fff', minWidth: 180, fontSize: 16 }}
          >
            Generar reporte
          </Button>
        </Col>
      </Row>
      {total !== null && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Typography.Text strong style={{ fontSize: 18 }}>TOTAL A PAGAR: {fmtCurrencyMX(total)}</Typography.Text>
        </div>
      )}

      {reportData && reportData.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Table
            dataSource={reportData}
            columns={columns}
            rowKey={(record: any) => record.guias ?? record.guiaingreso ?? Math.random().toString(36).slice(2)}
            pagination={{ pageSize: 25 }}
            scroll={{ x: 1400 }}
          />
        </div>
      )}
    </Card>
  );
};

export default ReporteUS;
