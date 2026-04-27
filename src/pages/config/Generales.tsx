import React, { useState } from 'react';
import { Card, Row, Col, Select, Typography } from 'antd';

const { Title } = Typography;

export const Generales: React.FC = () => {
  const [categoria, setCategoria] = useState<string>('todas');

  const opciones = [
    { value: 'todas', label: 'Todas las opciones' },
    { value: 'usuarios', label: 'Usuarios' },
    { value: 'comunicados', label: 'Comunicados' },
    { value: 'paqueterias', label: 'Paqueterías' },
    { value: 'tickets', label: 'Tickets' },
    { value: 'configuracion', label: 'Configuración' },
    { value: 'envio_dolares', label: 'Envio de dolares' },
    { value: 'facturacion', label: 'Facturación' },
    { value: 'envio_renminbi', label: 'Envío de renminbi' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row>
        <Col span={24}>
          <Card title={<Title level={4} style={{ margin: 0 }}>Configuracion generales</Title>} bordered style={{ width: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Seleccione una categoria a ver</label>
              <Select
                value={categoria}
                onChange={(val) => setCategoria(val)}
                options={opciones}
                style={{ width: '100%' }}
                placeholder="Todas las opciones"
              />
            </div>

            <p>Aquí irá la configuración general del sistema.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Generales;
