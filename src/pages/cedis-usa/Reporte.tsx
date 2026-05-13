import React, { useState } from 'react';
import { Card, DatePicker, Button, message, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import apiClient from '@/api/axios';

const { RangePicker } = DatePicker;

const Reporte: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('Selecciona un rango de fechas');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(
        '/cedis-usa/reporte',
        {
          fecha_inicio: dateRange[0].format('YYYY-MM-DD'),
          fecha_fin: dateRange[1].format('YYYY-MM-DD'),
        },
        { responseType: 'blob' }
      );

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `reporte_ingresos_${dateRange[0].format('YYYY-MM-DD')}_${dateRange[1].format('YYYY-MM-DD')}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Reporte generado correctamente');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Error al generar el reporte';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <Card title="Reporte de ingresos guías US" style={{ width: '100%', maxWidth: 700 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Selecciona el rango de fechas
            </label>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Fecha inicio', 'Fecha fin']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
              size="large"
            />
          </div>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={handleGenerateReport}
            loading={loading}
            size="large"
            block
          >
            Generar reporte
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Reporte;
