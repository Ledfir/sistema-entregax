import { Card, Alert } from 'antd';

export const CatalogoServicios = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="Catálogo de servicios USDT" bordered={false}>
        <Alert
          message="Módulo en desarrollo"
          description="Este módulo permitirá consultar el catálogo de servicios disponibles para envíos USDT. Próximamente estará disponible."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};
