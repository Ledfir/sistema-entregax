import { Card, Alert } from 'antd';

export const EnvioConFactura = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="Solicitud de envío USDT con factura" bordered={false}>
        <Alert
          message="Módulo en desarrollo"
          description="Este módulo permitirá realizar solicitudes de envío USDT con factura. Próximamente estará disponible."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};
