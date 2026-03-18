import { useState, useEffect } from 'react';
import { Button, Card, Col, Input, Row, Select, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import operacionesService from '@/services/operacionesService';

interface TipoServicio {
  id: string | number;
  name: string;
}

interface Servicio {
  id: number;
  clave: string;
  tipo: string;
  nombre: string;
  [key: string]: any;
}

const columns = [
  { title: 'Clave', dataIndex: 'clave', key: 'clave' },
  { title: 'Tipo de servicio', dataIndex: 'tipo', key: 'tipo' },
  { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
];

export const CatalogoServicios = () => {
  const [clave, setClave]               = useState('');
  const [tipo, setTipo]                 = useState<string | undefined>(undefined);
  const [nombre, setNombre]             = useState('');
  const [data, setData]                 = useState<Servicio[]>([]);
  const [loading, setLoading]           = useState(false);
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([]);

  useEffect(() => {
    document.title = 'Sistema Entregax | Catálogo de servicios';
    operacionesService.getDollarServiceTypes()
      .then((items) => setTiposServicio(items))
      .catch(() => setTiposServicio([]));
  }, []);

  const handleBuscar = async () => {
    setLoading(true);
    // TODO: conectar con servicio real
    setData([]);
    setLoading(false);
  };

  const handleLimpiar = () => {
    setClave('');
    setTipo(undefined);
    setNombre('');
    setData([]);
  };

  return (
    <Card title="Catálogo de servicios">
      <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>Ingrese la CLAVE de servicio</span>
          <Input
            placeholder="CLAVE"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            style={{ minWidth: 100 }}
          />
        </Col>

        <Col xs={24} sm={12} md={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>Tipo de servicio</span>
          <Select
            value={tipo}
            onChange={(val) => setTipo(val)}
            placeholder=""
            style={{ width: '100%' }}
            allowClear
            options={tiposServicio.map((t) => ({ value: String(t.id), label: t.name }))}
          />
        </Col>

        <Col xs={24} sm={12} md={6} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>Busqueda por nombre</span>
          <Input
            placeholder="Servicio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ minWidth: 100 }}
          />
        </Col>

        <Col xs={24} sm="auto" style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<SearchOutlined />}
            style={{ background: '#28a745', color: '#fff', border: 'none', fontWeight: 600 }}
            onClick={handleBuscar}
            loading={loading}
          >
            Buscar
          </Button>
          <Button
            style={{ background: '#dc3545', color: '#fff', border: 'none', fontWeight: 600 }}
            onClick={handleLimpiar}
          >
            Limpiar
          </Button>
        </Col>
      </Row>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 20 }}
        size="small"
      />
    </Card>
  );
};
