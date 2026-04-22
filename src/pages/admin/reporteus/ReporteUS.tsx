import React, { useState } from 'react';
import { Card, Row, Col, DatePicker, Button, message } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const ReporteUS: React.FC = () => {
  const [range, setRange] = useState<[any, any] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerarReporte = () => {
    if (!range || !range[0] || !range[1]) {
      message.warning('Seleccione un rango de fechas');
      return;
    }
    setLoading(true);
    const from = dayjs(range[0]).format('YYYY-MM-DD');
    const to = dayjs(range[1]).format('YYYY-MM-DD');
    // Por ahora solo mostramos un mensaje. Aquí se puede llamar al servicio correspondiente.
    console.log('Generar reporte US desde', from, 'hasta', to);
    message.success(`Generando reporte desde ${from} hasta ${to}`);
    setTimeout(() => setLoading(false), 600);
  };

  const disabledDate = (current: any) => {
    // bloquear fechas futuras (mayores al día actual)
    if (!current) return false;
    return dayjs(current).isAfter(dayjs(), 'day');
  };

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
    </Card>
  );
};

export default ReporteUS;
