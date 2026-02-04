import { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Tag, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import clienteService from '../../services/clienteService';
import dayjs from 'dayjs';
import './Clientes.css';

export const ClientesLista = () => {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [allClientes, setAllClientes] = useState<any[] | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sistema Entregax | Clientes';
    // Intentar cargar todos los clientes para filtrado en frontend
    loadAllClientes().then(() => {
      fetchClientes('', page, pageSize);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClientes = async (q = '', p = 1, per = 10) => {
    try {
      setLoading(true);
      // Si ya cargamos todos los clientes, filtrar en frontend
      if (Array.isArray(allClientes) && allClientes.length > 0) {
        const filtered = allClientes.filter((c) => {
          if (!q) return true;
          const needle = q.toString().toLowerCase();
          return (
            String(c.clave ?? c.id ?? '').toLowerCase().includes(needle) ||
            String(c.nombre ?? c.name ?? '').toLowerCase().includes(needle) ||
            String(c.telefono ?? c.phone ?? '').toLowerCase().includes(needle) ||
            String(c.asesor ?? '').toLowerCase().includes(needle) ||
            String(c.correo ?? c.email ?? '').toLowerCase().includes(needle)
          );
        });
        const tot = filtered.length;
        const start = (p - 1) * per;
        const pageItems = filtered.slice(start, start + per);
        setClientes(pageItems);
        setTotal(tot);
      } else {
        const res = await clienteService.list(q, p, per);
        setClientes(res.items ?? []);
        setTotal(res.total);
      }
    } catch (error: any) {
      console.error(error);
      message.error('Error al obtener clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadAllClientes = async () => {
    try {
      // intentar solicitar un gran per_page para obtener todos los registros
      const res = await clienteService.list('', 1, 10000);
      if (Array.isArray(res.items) && res.items.length > 0) {
        setAllClientes(res.items);
      }
    } catch (e) {
      // ignore, fallback a paginación por servidor
      console.warn('No fue posible cargar todos los clientes en frontend, se usará paginado servidor', e);
    }
  };

  const onSearch = (value?: string) => {
    const q = typeof value === 'string' ? value : query;
    setQuery(q);
    setPage(1);
    fetchClientes(q, 1, pageSize);
  };

  // Debounce search while typing: dispara búsqueda 400ms después del último cambio
  useEffect(() => {
    const t = setTimeout(() => {
      // si el query cambió, solicitar la página 1
      setPage(1);
      fetchClientes(query, 1, pageSize);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleTableChange = (newPage: number, newPageSize?: number) => {
    const ps = newPageSize ?? pageSize;
    setPage(newPage);
    setPageSize(ps);
    fetchClientes(query, newPage, ps);
  };

  const columns = [
    {
      title: 'OPCIONES',
      key: 'actions',
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button className="btn-edit" size="small" onClick={() => navigate(`/clientes/editar/${record.id ?? record.clave}`)}>Editar</Button>
        </Space>
      ),
    },
    { title: 'CLAVE', dataIndex: 'clave', key: 'clave', width: 120, render: (_: any, r: any) => r.clave ?? r.id },
    { title: 'NOMBRE', dataIndex: 'nombre', key: 'nombre' },
    { title: 'TELEFONO', dataIndex: 'telefono', key: 'telefono' },
    { title: 'ASESOR', dataIndex: 'asesor', key: 'asesor', render: (_: any, r: any) => r.asesor ?? r.advisor ?? r.assigned_to ?? '—' },
    {
      title: 'FECHA DE CREACION',
      dataIndex: 'fecha_creacion',
      key: 'fecha_creacion',
      width: 180,
      render: (_: any, r: any) => {
        const d = r.fecha_creacion ?? r.created_at ?? r.createdAt;
        return d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—';
      },
    },
    {
      title: 'ESTATUS',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      render: (s: any) => {
        const active = s === '1' || s === 1 || String(s).toLowerCase() === 'activo' || String(s).toLowerCase() === 'true';
        return <Tag color={active ? 'green' : 'default'}>{active ? 'Activo' : (s ?? '—')}</Tag>;
      },
    },
  ];

  return (
    <div className="clientes-container">
      <div className="clientes-header">
        <h1>Clientes</h1>
        <Space>
          <Input.Search
            placeholder="Buscar clientes"
            allowClear
            onSearch={onSearch}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 280 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/clientes/nuevo')}>Nuevo Cliente</Button>
        </Space>
      </div>

      <div className="clientes-table">
        {loading ? (
          <div className="clientes-spinner"><Spin size="large" /></div>
        ) : (
          <Table
            rowKey={(r) => r.id ?? r.clave}
            dataSource={clientes}
            columns={columns}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100'],
              onChange: handleTableChange,
              showTotal: (t: number) => `${t} registros`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ClientesLista;
