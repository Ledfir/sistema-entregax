import { useEffect, useState } from 'react';
import { Card, Table, Button, Input, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { SearchOutlined, UserAddOutlined, MoreOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import axios from '@/api/axios';
import './Clientes.css';

interface ClienteItem {
  id?: string | number;
  token: string;
  clavecliente?: string;
  nombre?: string;
  asesor?: string;
  [key: string]: unknown;
}

export const MisClientes = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ClienteItem[]>([]);
  const [filtered, setFiltered] = useState<ClienteItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = 'Sistema Entregax | Mis Clientes';
    if (user?.id) fetchClientes();
  }, [user?.id]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const token = user?.token || localStorage.getItem('token') || '';
      const res = await axios.get(`/customers/my-customers/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data;
      let list: ClienteItem[] = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (payload?.status === 'success' && Array.isArray(payload.data)) {
        list = payload.data;
      } else if (payload?.data && Array.isArray(payload.data)) {
        list = payload.data;
      }
      setData(list);
      setFiltered(list);
    } catch {
      setData([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const q = value.toLowerCase();
    setFiltered(
      data.filter(
        (r) =>
          String(r.clavecliente ?? '').toLowerCase().includes(q) ||
          String(r.nombre ?? '').toLowerCase().includes(q) ||
          String(r.asesor ?? '').toLowerCase().includes(q)
      )
    );
  };

  const getSuite = (r: ClienteItem) => r.clavecliente ?? '—';
  const getNombre = (r: ClienteItem) => r.nombre ?? '—';

  const columns: ColumnsType<ClienteItem> = [
    {
      title: 'Opciones',
      key: 'opciones',
      align: 'center',
      width: 90,
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'ver',
            icon: <EditOutlined />,
            label: 'Editar',
            onClick: () => navigate(`/clientes/editar/${record.token}`),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomLeft">
            <Button
              size="small"
              icon={<MoreOutlined />}
              style={{ borderColor: '#d9d9d9' }}
            />
          </Dropdown>
        );
      },
    },
    {
      title: 'Suite',
      key: 'suite',
      align: 'center',
      render: (_, record) => <strong>{getSuite(record)}</strong>,
      sorter: (a, b) => String(getSuite(a)).localeCompare(String(getSuite(b))),
    },
    {
      title: 'Nombre',
      key: 'nombre',
      render: (_, record) => getNombre(record),
      sorter: (a, b) => String(getNombre(a)).localeCompare(String(getNombre(b))),
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      render: (v) => v || '—',
      sorter: (a, b) => String(a.asesor ?? '').localeCompare(String(b.asesor ?? '')),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.4 }}>
            Mis clientes
          </span>
        }
        extra={
          <Input
            placeholder="Buscar..."
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            style={{ background: '#2da58e', borderColor: '#2da58e' }}
            onClick={() => navigate('/clientes/nuevo')}
          >
            Agregar cliente
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey={(r) => r.token}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '25', '50'],
            showTotal: (total) => `Total: ${total} clientes`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
          locale={{ emptyText: 'Sin clientes asignados' }}
        />
      </Card>
    </div>
  );
};
