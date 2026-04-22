import React, { useState } from 'react';
import { Card, Row, Col, Input, Button, Table, message, Spin } from 'antd';
import operacionesService from '@/services/operacionesService';

const ReporteGastosWeek: React.FC = () => {
  const [week, setWeek] = useState('');
  const [year, setYear] = useState('');

  const handleGenerarReporte = () => {
    // Aquí irá la lógica para generar el reporte
    // Por ahora solo mostramos los valores
    if (!week || !year) {
      message.warning('Ingrese WEEK y año');
      return;
    }
    setLoading(true);
    operacionesService.getReportWeek({ week, year })
      .then((res) => {
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setTableData(res.data);
          message.success('Reporte cargado');
        } else {
          message.error(res?.message || 'No se encontraron datos');
          setTableData([]);
        }
      })
      .catch((err) => {
        console.error(err);
        message.error(err?.response?.data?.message || 'Error al obtener reporte');
      })
      .finally(() => setLoading(false));
  };

  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const numberFormatter = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtNumber = (val: any) => {
    const n = Number(val);
    if (Number.isNaN(n)) return '-';
    return numberFormatter.format(n);
  };

  const fmtCurrency = (val: any) => {
    const n = Number(val);
    if (Number.isNaN(n)) return '-';
    return '$ ' + numberFormatter.format(n);
  };

  const columns = [
    { title: 'COLABORADOR', dataIndex: 'asesor', key: 'asesor' },
    { title: 'SUITE', dataIndex: 'suite', key: 'suite' },
    { title: 'CBM', dataIndex: 'cbm', key: 'cbm', render: (v: any) => fmtNumber(v), align: 'right' as const },
    { title: 'PRECIO CBM', dataIndex: 'precioCbm', key: 'precioCbm', render: (v: any, r: any) => fmtCurrency(v ?? r.precioCbm ?? r.precioCbm), align: 'right' as const },
    { title: 'T.C.', dataIndex: 'tc', key: 'tc', render: (v: any) => fmtNumber(v), align: 'right' as const },
    { title: 'PAGO', dataIndex: 'costo', key: 'costo', render: (v: any) => fmtCurrency(v), align: 'right' as const },
    { title: 'ENVIO NACIONAL', dataIndex: 'costopaq', key: 'costopaq', render: (v: any) => fmtCurrency(v), align: 'right' as const },
    { title: 'COMISIONES', dataIndex: 'comision', key: 'comision', render: (v: any) => v === null || v === undefined ? '-' : fmtCurrency(v), align: 'right' as const },
    { title: 'COTIZACION', dataIndex: 'ctz', key: 'ctz' },
    { title: 'PAGADA', dataIndex: 'pagado_fecha', key: 'pagado_fecha' },
  ];

  const handleDownload = () => {
    if (!week || !year) {
      message.warning('Ingrese WEEK y año para descargar');
      return;
    }
    setLoading(true);
    operacionesService.downloadReportWeek({ week, year })
      .then((res) => {
        const blob = res.data;
        // intentar obtener filename desde headers
        let filename = `reporte_week_${week}_${year}.xlsx`;
        const cd = res.headers?.['content-disposition'] || res.headers?.['Content-Disposition'];
        if (cd) {
          const m = cd.match(/filename\*?=(?:UTF-8''?)?"?([^;\n\r"]+)"?/i);
          if (m && m[1]) {
            try {
              filename = decodeURIComponent(m[1]);
            } catch (e) {
              filename = m[1];
            }
          }
        }
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        message.success('Descarga iniciada');
      })
      .catch((err) => {
        console.error(err);
        message.error('Error al descargar el archivo');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Card title="Reporte de gastos WEEK" style={{ maxWidth: 1200, margin: '0 auto', marginTop: 32 }}>
      <Row gutter={24} justify="center" align="middle">
        <Col span={10}>
          <div style={{ marginBottom: 8, textAlign: 'center' }}>Ingrese el WEEK a buscar</div>
          <Input
            value={week}
            onChange={e => setWeek(e.target.value)}
            placeholder="Ejemplo: 15"
            size="large"
          />
        </Col>
        <Col span={10}>
          <div style={{ marginBottom: 8, textAlign: 'center' }}>Ingrese el año del WEEK (2024, 2025, etc)</div>
          <Input
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="Ejemplo: 2026"
            size="large"
          />
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: 32 }}>
        <Button
          type="primary"
          style={{ background: '#ff6600', borderColor: '#ff6600', minWidth: 200, fontSize: 18 }}
          size="large"
          onClick={handleGenerarReporte}
        >
          Generar reporte
        </Button>
      </Row>

      <div style={{ maxWidth: 1200, margin: '16px auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
        ) : tableData && tableData.length > 0 ? (
          <div>
            <Row justify="end" style={{ marginBottom: 12 }}>
              <Button onClick={handleDownload}>Descargar reporte</Button>
            </Row>
            <Table
              dataSource={tableData}
              columns={columns}
              rowKey={(r) => r.idc || r.ctz || Math.random()}
              pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10','20','50'] }}
              bordered
              size="middle"
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default ReporteGastosWeek;
