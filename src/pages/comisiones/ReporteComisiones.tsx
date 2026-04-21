import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Button, Row, Col, message, Alert, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { userService } from '@/services/userService';
import { comisionesService } from '@/services/comisionesService';
import { Dayjs } from 'dayjs';
import './ReporteComisiones.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Asesor {
  id: number | string;
  nombre: string;
}

interface ItemComision {
  user: string;
  service: string;
  mitad_asesor: number;
  mitad_s_asesor: number;
  total_asesor: number;
}

interface GrupoComision {
  total: number;
  data: ItemComision[];
}

interface ReporteData {
  status: string;
  data: GrupoComision[] | GrupoComision;
}

const ReporteComisiones: React.FC = () => {
  const [loadingAsesores, setLoadingAsesores] = useState(false);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [asesorSeleccionado, setAsesorSeleccionado] = useState<string>('todos');
  const [fechas, setFechas] = useState<[Dayjs, Dayjs] | null>(null);
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const [reporteData, setReporteData] = useState<GrupoComision[]>([]);
  const [mostrarReporte, setMostrarReporte] = useState(false);

  useEffect(() => {
    cargarAsesores();
  }, []);

  const cargarAsesores = async () => {
    try {
      setLoadingAsesores(true);
      const response = await userService.list('', 1, 1000);
      
      const asesoresMapeados = response.items
        .map((item: any) => ({
          id: item.token,
          nombre: item.name
        }));
      
      setAsesores(asesoresMapeados);
    } catch (error) {
      console.error('Error al cargar asesores:', error);
      message.error('Error al cargar la lista de asesores');
    } finally {
      setLoadingAsesores(false);
    }
  };

  const handleGenerarReporte = async () => {
    try {
      if (!fechas) {
        message.warning('Por favor seleccione un rango de fechas');
        return;
      }

      setGenerandoReporte(true);
      setMostrarReporte(false);
      
      const fechaInicio = fechas[0].format('YYYY-MM-DD');
      const fechaFin = fechas[1].format('YYYY-MM-DD');
      
      const response: ReporteData = await comisionesService.reporteComision(
        fechaInicio,
        fechaFin,
        asesorSeleccionado
      );
      
      if (response.status === 'success' && response.data) {
        // Normalizar la respuesta: si es un objeto, convertirlo en array
        const dataArray = Array.isArray(response.data) 
          ? response.data 
          : [response.data];
        
        setReporteData(dataArray);
        setMostrarReporte(true);
        message.success('Reporte generado correctamente');
      }
      
    } catch (error: any) {
      console.error('Error al generar reporte:', error);
      message.error(error?.response?.data?.message || 'Error al generar el reporte');
    } finally {
      setGenerandoReporte(false);
    }
  };

  const formatMoney = (amount: number): string => {
    return `$${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const calcularTotalGeneral = (): number => {
    return reporteData
      .filter(grupo => grupo.total > 0)
      .reduce((sum, grupo) => sum + grupo.total, 0);
  };

  const columns = [
    {
      title: 'Asesor',
      dataIndex: 'user',
      key: 'user',
      align: 'center' as const,
    },
    {
      title: 'Servicio',
      dataIndex: 'service',
      key: 'service',
      align: 'center' as const,
    },
    {
      title: 'Mitad a',
      dataIndex: 'mitad_asesor',
      key: 'mitad_asesor',
      render: (value: number) => formatMoney(value),
      align: 'center' as const,
    },
    {
      title: 'Mitad b',
      dataIndex: 'mitad_s_asesor',
      key: 'mitad_s_asesor',
      render: (value: number) => formatMoney(value),
      align: 'center' as const,
    },
    {
      title: 'Total',
      dataIndex: 'total_asesor',
      key: 'total_asesor',
      render: (value: number) => (
        <strong style={{ color: '#ff6600' }}>{formatMoney(value)}</strong>
      ),
      align: 'center' as const,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Reporte de comisiones">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                Rango de fechas
              </label>
              <RangePicker
                style={{ width: '100%' }}
                size="large"
                format="DD/MM/YYYY"
                placeholder={['Fecha inicio', 'Fecha fin']}
                value={fechas}
                onChange={(dates) => setFechas(dates as [Dayjs, Dayjs] | null)}
              />
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                Asesor
              </label>
              <Select
                style={{ width: '100%' }}
                size="large"
                placeholder="Seleccione un asesor"
                loading={loadingAsesores}
                value={asesorSeleccionado}
                onChange={(value) => setAsesorSeleccionado(value)}
                showSearch
                filterOption={(input, option) => {
                  const children = option?.children as unknown as string;
                  return children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
              >
                <Option value="todos">Todos</Option>
                {asesores.map((asesor) => (
                  <Option key={asesor.id} value={asesor.id}>
                    {asesor.nombre}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24}>
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              onClick={handleGenerarReporte}
              loading={generandoReporte}
              style={{
                backgroundColor: '#ff6600',
                borderColor: '#ff6600',
                width: '100%',
                maxWidth: '300px',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              Generar Reporte
            </Button>
          </Col>
        </Row>
      </Card>

      {mostrarReporte && fechas && (
        <div className="reporte-container">
          <h2 className="reporte-titulo">
            Comisiones de {fechas[0].format('DD-MM-YYYY')} al {fechas[1].format('DD-MM-YYYY')}
          </h2>

          <Alert
            message="Reajuste de comisiones en el servicio marítimo a partir del día 26 de junio a las 11:00 am"
            description="Para mayor información contactar al área de soporte(SISTEMAS)."
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          {reporteData
            .filter(grupo => grupo.total > 0)
            .map((grupo, index) => {
            // Agregar key única para cada item
            const dataSource = grupo.data.map((item, idx) => ({
              ...item,
              key: `${index}-${item.user}-${item.service}-${idx}`
            }));

            return (
              <div key={index} className="tabla-grupo">
                <Table
                  columns={columns}
                  dataSource={dataSource}
                  pagination={false}
                  size="middle"
                  bordered
                  rowClassName={(_, idx) => idx % 2 === 0 ? 'row-green' : 'row-gray'}
                  footer={() => (
                    <div style={{ textAlign: 'right', fontWeight: 600 }}>
                      Total: <span style={{ color: '#ff6600', fontSize: '16px', marginLeft: '8px' }}>
                        {formatMoney(grupo.total)}
                      </span>
                    </div>
                  )}
                />
              </div>
            );
          })}

          {reporteData.filter(grupo => grupo.total > 0).length > 0 && (
            <Card style={{ marginTop: '24px', backgroundColor: '#fff3e0' }}>
              <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 600 }}>
                Total General: <span style={{ color: '#ff6600', fontSize: '22px', marginLeft: '8px' }}>
                  {formatMoney(calcularTotalGeneral())}
                </span>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ReporteComisiones;
