import React, { useState, useEffect } from 'react';
import { Card, Typography, Input, TimePicker, Button, Row, Col, message, Spin, Modal } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/store/authStore';

const { Title } = Typography;

const TipoCambio: React.FC = () => {
  const [trebolId, setTrebolId] = useState<string>('');
  const [trebolCompra, setTrebolCompra] = useState<string>('');
  const [trebolVenta, setTrebolVenta] = useState<string>('');
  const [trebolHora, setTrebolHora] = useState(dayjs('01:00', 'HH:mm'));
  
  const [japcemId, setJapcemId] = useState<string>('');
  const [japcemCompra, setJapcemCompra] = useState<string>('');
  const [japcemVenta, setJapcemVenta] = useState<string>('');
  const [japcemHora, setJapcemHora] = useState(dayjs('02:00', 'HH:mm'));

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingGuardar, setLoadingGuardar] = useState<boolean>(false);
  const { user } = useAuthStore();

  useEffect(() => {
    loadTipoCambio();
  }, []);

  const loadTipoCambio = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/dolars/facturacion/get-tc', {
        headers: { token: user?.token },
      });

      if (response.data && response.data.data) {
        const data = response.data.data;
        
        // Buscar datos de TREBOL (idprov = 1)
        const trebol = data.find((item: any) => item.idprov === '1');
        if (trebol) {
          setTrebolId(trebol.id);
          setTrebolCompra(trebol.compra);
          setTrebolVenta(trebol.venta);
          // Convertir vence de formato HHMMSS a dayjs
          const trebolTime = convertirVenceAHora(trebol.vence);
          setTrebolHora(trebolTime);
        }

        // Buscar datos de JAPCEM GLOBAL (idprov = 2)
        const japcem = data.find((item: any) => item.idprov === '2');
        if (japcem) {
          setJapcemId(japcem.id);
          setJapcemCompra(japcem.compra);
          setJapcemVenta(japcem.venta);
          // Convertir vence de formato HHMMSS a dayjs
          const japcemTime = convertirVenceAHora(japcem.vence);
          setJapcemHora(japcemTime);
        }
      }
    } catch (error) {
      message.error('Error al cargar el tipo de cambio');
      console.error('Error loading tipo de cambio:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertirVenceAHora = (vence: string) => {
    // Convertir formato HHMMSS (ej: "130000") a HH:mm (ej: "13:00")
    if (vence && vence.length === 6) {
      const hh = vence.substring(0, 2);
      const mm = vence.substring(2, 4);
      return dayjs(`${hh}:${mm}`, 'HH:mm');
    }
    return dayjs('00:00', 'HH:mm');
  };

  const convertirHoraAVence = (hora: any) => {
    // Convertir formato HH:mm a HHMMSS (ej: "13:00" a "130000")
    if (hora) {
      const hh = hora.format('HH');
      const mm = hora.format('mm');
      return `${hh}${mm}00`;
    }
    return '000000';
  };

  const handleGuardar = async () => {
    try {
      setLoadingGuardar(true);
      
      const data = [
        {
          id: trebolId,
          compra: trebolCompra,
          venta: trebolVenta,
          vence: convertirHoraAVence(trebolHora),
          idprov: '1',
        },
        {
          id: japcemId,
          compra: japcemCompra,
          venta: japcemVenta,
          vence: convertirHoraAVence(japcemHora),
          idprov: '2',
        },
      ];

      const response = await apiClient.post(
        '/dolars/facturacion/update-tc',
        { data },
        {
          headers: { token: user?.token },
        }
      );

      if (response.data) {
        if (response.data.message) {
          message.success(response.data.message);
        } else {
          message.success('Tipo de cambio actualizado exitosamente');
        }
        // Recargar datos después de guardar
        loadTipoCambio();
      }
    } catch (error: any) {
      console.error('Error al guardar tipo de cambio:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Error al guardar el tipo de cambio');
      }
    } finally {
      setLoadingGuardar(false);
    }
  };

  const handleEliminar = () => {
    Modal.confirm({
      title: '¿Está seguro de eliminar el tipo de cambio?',
      content: 'Esta acción eliminará todos los tipos de cambio configurados.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const response = await apiClient.post(
            '/dolars/facturacion/delete-tc',
            { delete: true },
            {
              headers: { token: user?.token },
            }
          );

          if (response.data) {
            if (response.data.message) {
              message.success(response.data.message);
            } else {
              message.success('Tipo de cambio eliminado exitosamente');
            }
            // Recargar datos después de eliminar
            loadTipoCambio();
          }
        } catch (error: any) {
          console.error('Error al eliminar tipo de cambio:', error);
          if (error.response?.data?.message) {
            message.error(error.response.data.message);
          } else if (error.message) {
            message.error(error.message);
          } else {
            message.error('Error al eliminar el tipo de cambio');
          }
        }
      },
    });
  };

  return (
    <div style={{ padding: 24, background: 'transparent' }}>
      <Card
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
          border: '1px solid #d9d9d9',
          borderRadius: 12,
        }}
      >
        <Title level={4} style={{ marginBottom: 24, color: '#000' }}>
          Modificar tipo de cambio
        </Title>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Cargando tipo de cambio..." />
          </div>
        ) : (
          <>
            <Row gutter={24}>
          {/* TREBOL */}
          <Col xs={24} md={12}>
            <div style={{ 
              padding: 24, 
              background: '#fff', 
              borderRadius: 8,
              border: '1px solid #e0e0e0'
            }}>
              <Title level={5} style={{ marginBottom: 20, color: '#000' }}>
                TREBOL
              </Title>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#000', fontWeight: 500 }}>
                  Ingrese tipo de cambio para compra
                </label>
                <Input
                  size="large"
                  value={trebolCompra}
                  onChange={(e) => setTrebolCompra(e.target.value)}
                  type="number"
                  step="0.01"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#000', fontWeight: 500 }}>
                  Ingrese tipo de cambio para venta
                </label>
                <Input
                  size="large"
                  value={trebolVenta}
                  onChange={(e) => setTrebolVenta(e.target.value)}
                  type="number"
                  step="0.01"
                />
              </div>

              <div style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#000', fontWeight: 500 }}>
                  Hora de vencimiento
                </label>
                <TimePicker
                  size="large"
                  value={trebolHora}
                  onChange={(time) => setTrebolHora(time)}
                  format="hh:mm a"
                  use12Hours
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </Col>

          {/* JAPCEM GLOBAL */}
          <Col xs={24} md={12}>
            <div style={{ 
              padding: 24, 
              background: '#fff', 
              borderRadius: 8,
              border: '1px solid #e0e0e0'
            }}>
              <Title level={5} style={{ marginBottom: 20, color: '#000' }}>
                JAPCEM GLOBAL
              </Title>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#000', fontWeight: 500 }}>
                  Ingrese tipo de cambio para compra
                </label>
                <Input
                  size="large"
                  value={japcemCompra}
                  onChange={(e) => setJapcemCompra(e.target.value)}
                  type="number"
                  step="0.01"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#000', fontWeight: 500 }}>
                  Ingrese tipo de cambio para venta
                </label>
                <Input
                  size="large"
                  value={japcemVenta}
                  onChange={(e) => setJapcemVenta(e.target.value)}
                  type="number"
                  step="0.01"
                />
              </div>

              <div style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#000', fontWeight: 500 }}>
                  Hora de vencimiento
                </label>
                <TimePicker
                  size="large"
                  value={japcemHora}
                  onChange={(time) => setJapcemHora(time)}
                  format="hh:mm a"
                  use12Hours
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </Col>
        </Row>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 16, 
          marginTop: 32 
        }}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleGuardar}
            loading={loadingGuardar}
            disabled={loadingGuardar}
            style={{ 
              backgroundColor: '#52c41a', 
              borderColor: '#52c41a',
              minWidth: 200 
            }}
          >
            Guardar tipo de cambio
          </Button>
          <Button
            danger
            size="large"
            icon={<DeleteOutlined />}
            onClick={handleEliminar}
            disabled={loadingGuardar}
            style={{ minWidth: 200 }}
          >
            Eliminar tipo de cambio
          </Button>
        </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default TipoCambio;
