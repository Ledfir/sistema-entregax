import React from 'react';
import { Card, Space, Button } from 'antd';
import { ContainerOutlined, FlagOutlined, TruckOutlined, ApiOutlined, CloudOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const botones = [
  { key: 'maritimo', label: 'Maritimo', color: '#2f54eb', icon: <ContainerOutlined /> },
  { key: 'usa', label: 'USA', color: '#ff4d4f', icon: <FlagOutlined /> },
  { key: 'dhl', label: 'DHL', color: '#00a854', icon: <TruckOutlined /> },
  { key: 'tdi-gdl', label: 'TDI GDL', color: '#ffd666', icon: <ApiOutlined /> },
  { key: 'tdi-cdmx', label: 'TDI CDMX', color: '#262626', icon: <CloudOutlined /> },
  { key: 'tdi-mty', label: 'TDI MTY', color: '#13c2c2', icon: <CloudOutlined /> },
  { key: 'tdi-dhl', label: 'TDI - DHL', color: '#ff7a45', icon: <TruckOutlined /> },
  { key: 'historial', label: 'Historial', color: '#fa8c16', icon: <HistoryOutlined /> },
];

const Salidas: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <Card title="Salidas diarias" style={{ width: 1000 }}>
        <Space wrap size={[12, 12]} style={{ width: '100%', justifyContent: 'center' }}>
          {botones.map((b) => (
            <Button
              key={b.key}
              size="large"
              shape="round"
              icon={b.icon}
              style={{
                background: b.color,
                borderColor: b.color,
                color: '#fff',
                minWidth: 140,
                height: 44,
                fontWeight: 600,
              }}
              onClick={() => {
                // por ahora solo navegamos o registramos la acción; ajustar rutas si existen
                if (b.key === 'historial') {
                  navigate('/cedis/salidas/historial');
                } else {
                  console.log('Acción:', b.key);
                }
              }}
            >
              {b.label}
            </Button>
          ))}
        </Space>
      </Card>
    </div>
  );
};

export default Salidas;
