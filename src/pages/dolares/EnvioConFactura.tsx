import { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Spin } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import operacionesService from '@/services/operacionesService';

interface Proveedor {
  id: string | number;
  descri: string;
  tc: string | number;
  vence: string | number;
  [key: string]: any;
}

export const EnvioConFactura = () => {
  const [loading, setLoading]         = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const res = await operacionesService.getDollarProviders();
      const items = res?.data ?? res ?? [];
      setProveedores(Array.isArray(items) ? items : []);
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: '', text: e?.response?.data?.message ?? 'Error al cargar proveedores.', showConfirmButton: false, timer: 4000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Sistema Entregax | Envío con factura';
    cargarProveedores();
  }, []);

  return (
    <Card title="Envío con factura">
      <p style={{ marginBottom: 20, fontWeight: 500, color: '#555' }}>
        Selecciona un proveedor para el envío de dólares
      </p>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {proveedores.map((p) => (
            <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                size="small"
                style={{ borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                bodyStyle={{ padding: '16px 18px' }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.descri}</div>
                <div style={{ fontSize: 13, marginBottom: 2 }}>Tipo de cambio: <strong>${Number(p.tc).toFixed(2)}</strong></div>
                <div style={{ fontSize: 13, marginBottom: 14 }}>Hora de cierre: <strong>{String(p.vence).replace(/^(\d{2})(\d{2}).*/, '$1:$2')}</strong></div>
                <Button
                  block
                  icon={<DollarOutlined />}
                  style={{ background: '#F26522', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}
                  onClick={() => console.log('Generar envío de dólares', p.id)}
                >
                  Generar envío de dólares
                </Button>
              </Card>
            </Col>
          ))}

          {!loading && proveedores.length === 0 && (
            <Col span={24}>
              <p style={{ color: '#aaa', textAlign: 'center' }}>No hay proveedores disponibles.</p>
            </Col>
          )}
        </Row>
      </Spin>
    </Card>
  );
};
