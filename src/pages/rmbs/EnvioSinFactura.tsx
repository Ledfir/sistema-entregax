import { Card, Alert } from 'antd';

export const EnvioSinFactura = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="Solicitud de envío RMB sin factura" bordered={false}>
        <Alert
          message="Módulo en desarrollo"
          description="Este módulo está en proceso de desarrollo. Pronto estará disponible con todas las funcionalidades para solicitudes de envío RMB sin factura."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};
