import { useState, useEffect } from 'react';
import { Button, Card, Col, Input, Row, Select, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import operacionesService from '@/services/operacionesService';
import Swal from 'sweetalert2';

interface TipoServicio {
  id: string | number;
  name: string;
}

interface Servicio {
  id: number;
  clave: string;
  tipo: string;
  nombre: string;
  proveedor?: string;
  [key: string]: any;
}

const columns: ColumnsType<Servicio> = [
  { title: 'Clave', dataIndex: 'clave', key: 'clave', align: 'center' },
  { title: 'Tipo de servicio', dataIndex: 'tipo', key: 'tipo', align: 'center' },
  { title: 'Nombre', dataIndex: 'nombre', key: 'nombre', align: 'center' },
  { title: 'Proveedor', dataIndex: 'proveedor', key: 'proveedor', align: 'center' }
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
    try {
      const payload: { clave?: string; ids?: string; servicio?: string } = {};
      
      if (clave) payload.clave = clave;
      if (tipo) payload.ids = tipo;
      if (nombre) payload.servicio = nombre;
      
      const response = await operacionesService.searchDollarServices(payload);
      
      console.log('Respuesta completa:', response);
      
      // Verificar si la respuesta tiene un status de error en el JSON
      if (response?.status && (response.status === 404 || response.status >= 400)) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin resultados',
          text: response?.message || 'No se encontraron datos',
          showConfirmButton: false,
          timer: 2500,
        });
        setData([]);
        return;
      }
      
      const items = response?.data ?? response ?? [];
      
      if (Array.isArray(items) && items.length > 0) {
        setData(items);
        message.success(`Se encontraron ${items.length} servicio(s)`);
      } else {
        setData([]);
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: response?.message || 'No se encontraron servicios',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);
      
      // Priorizar el mensaje del response.data si existe
      const errorData = error?.response?.data;
      let errorMsg = 'Error al buscar servicios';
      
      if (errorData) {
        // Si el servidor devuelve un objeto con message
        if (errorData.message) {
          errorMsg = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      // Determinar el tipo de notificación según el status
      if (error?.response?.status === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'No encontrado',
          text: errorMsg,
          showConfirmButton: false,
          timer: 2500,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
          showConfirmButton: false,
          timer: 2500,
        });
      }
      
      setData([]);
    } finally {
      setLoading(false);
    }
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
            onPressEnter={handleBuscar}
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
            onPressEnter={handleBuscar}
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
