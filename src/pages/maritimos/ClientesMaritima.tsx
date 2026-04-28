import { useEffect, useState } from 'react';
import { Card, Table, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import axios from '@/api/axios';
import './ClientesMaritima.css';

const { Search } = Input;

interface ClienteMaritimo {
  key: string;
  suite: string;
  nombre: string;
  correo: string;
  telefono: string;
  asesor: string;
}

export const ClientesMaritima = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ClienteMaritimo[]>([]);
  const [filteredData, setFilteredData] = useState<ClienteMaritimo[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    document.title = 'Sistema Entregax | Clientes Marítima';
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/customers/list-customers-maritimo');
      if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        const mapped: ClienteMaritimo[] = res.data.data.map((it: any) => ({
          key: it.token || it.id || String(Math.random()),
          suite: it.suite || it.suite_number || '',
          nombre: (it.nombre || it.name || '').trim(),
          correo: it.correo || it.email || '',
          telefono: it.telefono || it.phone || '',
          asesor: it.asesor || it.advisor || '',
        }));
        setData(mapped);
        setFilteredData(mapped);
      } else {
        setData([]);
        setFilteredData([]);
        message.error('No se recibieron clientes desde el servidor');
      }
    } catch (err) {
      console.error('Error cargando clientes maritimos', err);
      message.error('Error al cargar clientes');
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setFilteredData(data);
      return;
    }

    const searchLower = value.toLowerCase();
    const filtered = data.filter((item) => {
      return (
        (item.suite || '').toLowerCase().includes(searchLower) ||
        (item.nombre || '').toLowerCase().includes(searchLower) ||
        (item.correo || '').toLowerCase().includes(searchLower) ||
        (item.telefono || '').toLowerCase().includes(searchLower) ||
        (item.asesor || '').toLowerCase().includes(searchLower)
      );
    });

    setFilteredData(filtered);
  };

  const columns: ColumnsType<ClienteMaritimo> = [
    {
      title: 'SUITE',
      dataIndex: 'suite',
      key: 'suite',
      align: 'center',
      width: 120,
      sorter: (a, b) => a.suite.localeCompare(b.suite),
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      align: 'center',
      width: 250,
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Correo',
      dataIndex: 'correo',
      key: 'correo',
      width: 220,
      align: 'center',
      sorter: (a, b) => a.correo.localeCompare(b.correo),
    },
    {
      title: 'Telefono',
      dataIndex: 'telefono',
      key: 'telefono',
      width: 150,
      align: 'center',
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 150,
      align: 'center',
      sorter: (a, b) => a.asesor.localeCompare(b.asesor),
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
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total: ${total} clientes`,
          }}
          onChange={(pag) => {
            setPagination({ current: pag.current || 1, pageSize: pag.pageSize || 10 });
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default ClientesMaritima;
