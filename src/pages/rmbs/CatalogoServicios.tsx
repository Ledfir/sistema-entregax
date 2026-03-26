import { Card, Alert } from 'antd';

export const CatalogoServicios = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="Catálogo de servicios RMB" bordered={false}>
        <Alert
          message="Módulo en desarrollo"
          description="Este módulo está en proceso de desarrollo. Pronto estará disponible con el catálogo completo de servicios RMB para consulta y búsqueda."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};
