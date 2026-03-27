import React, { useState } from 'react';
import { Card, DatePicker, Input, Button, message, Table } from 'antd';
import type { Dayjs } from 'dayjs';
import './DHLValidar.css';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface GuiaDHL {
  guia: string;
  estado: string;
  fecha: string;
  observaciones: string;
}

const DHLValidar: React.FC = () => {
  const [fechas, setFechas] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [guias, setGuias] = useState<string>('');
  const [resultados, setResultados] = useState<GuiaDHL[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerarReporte = async () => {
    if (!fechas || !fechas[0] || !fechas[1]) {
      message.warning('Por favor selecciona el rango de fechas');
      return;
    }

    if (!guias.trim()) {
      message.warning('Por favor ingresa al menos una guía');
      return;
    }

    const guiasArray = guias
      .split('\n')
      .map(g => g.trim())
      .filter(g => g.length > 0);

    if (guiasArray.length === 0) {
      message.warning('No se encontraron guías válidas');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implementar llamada al backend
      // Simulación de datos de respuesta
      const mockResultados: GuiaDHL[] = guiasArray.map((guia, index) => ({
        guia,
        estado: index % 3 === 0 ? 'Entregado' : index % 3 === 1 ? 'En tránsito' : 'Pendiente',
        fecha: fechas[0]!.add(index, 'day').format('DD/MM/YYYY'),
        observaciones: index % 2 === 0 ? 'Sin observaciones' : 'Revisar documentación',
      }));

      setTimeout(() => {
        setResultados(mockResultados);
        setLoading(false);
        message.success(`Reporte generado con ${guiasArray.length} guías`);
      }, 1000);
    } catch (error) {
      setLoading(false);
      message.error('Error al generar el reporte');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Guía',
      dataIndex: 'guia',
      key: 'guia',
      width: 200,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 150,
      render: (estado: string) => {
        let color = 'default';
        if (estado === 'Entregado') color = 'green';
        else if (estado === 'En tránsito') color = 'blue';
        else if (estado === 'Pendiente') color = 'orange';
        
        return <span className={`estado-tag estado-${color}`}>{estado}</span>;
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 150,
    },
    {
      title: 'Observaciones',
      dataIndex: 'observaciones',
      key: 'observaciones',
    },
  ];

  return (
    <div className="dhl-validar-wrapper">
      <Card title="Validar DHL" className="dhl-validar-card">
        <div className="dhl-validar-form">
          <div className="form-item">
            <label className="form-label">Seleccione el rango de fechas</label>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Fecha inicio', 'Fecha fin']}
              value={fechas}
              onChange={(dates) => setFechas(dates)}
            />
          </div>

          <div className="form-item">
            <label className="form-label">Ingrese las guías, cada una usando un salto de línea</label>
            <TextArea
              rows={8}
              placeholder="Ingrese las guías, cada una usando un salto de línea"
              value={guias}
              onChange={(e) => setGuias(e.target.value)}
              className="guias-textarea"
            />
          </div>

          <Button
            type="primary"
            size="large"
            className="generar-reporte-btn"
            onClick={handleGenerarReporte}
            loading={loading}
          >
            Generar reporte
          </Button>
        </div>

        {resultados.length > 0 && (
          <div className="resultados-section">
            <h3>Resultados del reporte</h3>
            <Table
              columns={columns}
              dataSource={resultados.map((item, index) => ({ ...item, key: index }))}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} guías`,
              }}
              scroll={{ x: 'max-content' }}
              bordered
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default DHLValidar;
