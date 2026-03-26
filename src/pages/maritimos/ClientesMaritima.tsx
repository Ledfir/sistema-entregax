import { useEffect, useState } from 'react';
import { Card, Table, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import './ClientesMaritima.css';

const { Search } = Input;

interface ClienteMaritimo {
  key: string;
  suite: string;
  nombre: string;
  correo: string;
  telefono: string;
  asesor: string;
  capitan: string;
}

export const ClientesMaritima = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ClienteMaritimo[]>([]);
  const [filteredData, setFilteredData] = useState<ClienteMaritimo[]>([]);

  useEffect(() => {
    document.title = 'Sistema Entregax | Clientes Marítima';
    loadClientes();
  }, []);

  const loadClientes = () => {
    setLoading(true);
    
    // Mock data - Reemplazar con llamada real a la API
    setTimeout(() => {
      const mockData: ClienteMaritimo[] = [
        {
          key: '1',
          suite: 'STE-001',
          nombre: 'Importadora Global SA de CV',
          correo: 'contacto@importadoraglobal.com',
          telefono: '+52 55 1234 5678',
          asesor: 'Juan Pérez',
          capitan: 'Carlos Rodríguez',
        },
        {
          key: '2',
          suite: 'STE-002',
          nombre: 'Comercializadora del Norte',
          correo: 'ventas@comnorte.com',
          telefono: '+52 81 9876 5432',
          asesor: 'María González',
          capitan: 'Luis Martínez',
        },
        {
          key: '3',
          suite: 'STE-003',
          nombre: 'Distribuidora Marítima SA',
          correo: 'info@distmaritima.com',
          telefono: '+52 33 5555 1234',
          asesor: 'Ana López',
          capitan: 'Roberto Sánchez',
        },
        {
          key: '4',
          suite: 'STE-004',
          nombre: 'Logística Internacional Corp',
          correo: 'logistica@logintcorp.com',
          telefono: '+52 55 8888 9999',
          asesor: 'Pedro Ramírez',
          capitan: 'Jorge Hernández',
        },
        {
          key: '5',
          suite: 'STE-005',
          nombre: 'Exportadora del Pacífico',
          correo: 'export@pacifico.com.mx',
          telefono: '+52 66 7777 3333',
          asesor: 'Laura Torres',
          capitan: 'Miguel Castro',
        },
        {
          key: '6',
          suite: 'STE-006',
          nombre: 'Comercio Exterior Solutions',
          correo: 'info@cesolutions.mx',
          telefono: '+52 55 4444 2222',
          asesor: 'Juan Pérez',
          capitan: 'Carlos Rodríguez',
        },
      ];
      
      setData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setFilteredData(data);
      return;
    }

    const searchLower = value.toLowerCase();
    const filtered = data.filter((item) =>
      item.suite.toLowerCase().includes(searchLower) ||
      item.nombre.toLowerCase().includes(searchLower) ||
      item.correo.toLowerCase().includes(searchLower) ||
      item.telefono.toLowerCase().includes(searchLower) ||
      item.asesor.toLowerCase().includes(searchLower) ||
      item.capitan.toLowerCase().includes(searchLower)
    );

    setFilteredData(filtered);
  };

  const columns: ColumnsType<ClienteMaritimo> = [
    {
      title: 'SUITE',
      dataIndex: 'suite',
      key: 'suite',
      width: 120,
      sorter: (a, b) => a.suite.localeCompare(b.suite),
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 250,
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Correo',
      dataIndex: 'correo',
      key: 'correo',
      width: 220,
      sorter: (a, b) => a.correo.localeCompare(b.correo),
    },
    {
      title: 'Telefono',
      dataIndex: 'telefono',
      key: 'telefono',
      width: 150,
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 150,
      sorter: (a, b) => a.asesor.localeCompare(b.asesor),
    },
    {
      title: 'Capitan',
      dataIndex: 'capitan',
      key: 'capitan',
      width: 150,
      sorter: (a, b) => a.capitan.localeCompare(b.capitan),
    },
  ];

  return (
    <div className="clientes-maritima">
      <Card 
        title="Busqueda de clientes"
        className="clientes-card"
        extra={
          <Search
            placeholder="Buscar cliente..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} clientes`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default ClientesMaritima;
