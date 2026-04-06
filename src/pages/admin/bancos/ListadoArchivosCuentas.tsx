import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Tag, Button, message, Input } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { humanizarFecha } from '@/utils/dateUtils';
import { cuentasService } from '@/services/cuentasService';
import './ListadoArchivosCuentas.css';

// Interfaz para los datos que vienen del API
interface EstadoCuentaAPI {
  token: string;
  name: string;
  ext: string;
  url: string;
  cuenta: string;
  registros: string;
  subidos: string;
  duplicados: string;
  errores: string;
  state: string;
  resp: string;
  created: string;
}

// Interfaz para el manejo interno de datos
interface EstadoCuenta {
  id: string;
  archivo: string;
  cuenta: string;
  registros: number;
  subidos: number;
  duplicados: number;
  errores: number;
  subidoPor: string;
  fechaCreacion: string;
  archivoUrl: string;
}

const ListadoArchivosCuentas: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [estadosCuenta, setEstadosCuenta] = useState<EstadoCuenta[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  // Cargar datos del API al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data: EstadoCuentaAPI[] = await cuentasService.listFilesAccounts();
      
      // Mapear datos del API a formato UI
      const estadosMapeados: EstadoCuenta[] = data.map((item) => ({
        id: item.token,
        archivo: item.name,
        cuenta: item.cuenta,
        registros: parseInt(item.registros) || 0,
        subidos: parseInt(item.subidos) || 0,
        duplicados: parseInt(item.duplicados) || 0,
        errores: parseInt(item.errores) || 0,
        subidoPor: item.resp,
        fechaCreacion: item.created,
        archivoUrl: `https://sistemaentregax.com/${item.url}${item.token}.${item.ext}`,
      }));
      
      setEstadosCuenta(estadosMapeados);
    } catch (error) {
      console.error('Error al cargar estados de cuenta:', error);
      message.error('Error al cargar los estados de cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = (record: EstadoCuenta) => {
    // Crear un enlace temporal para descargar el archivo
    const link = document.createElement('a');
    link.href = record.archivoUrl;
    link.download = record.archivo;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar datos según el texto de búsqueda
  const datosFiltrados = useMemo(() => {
    if (!searchText) return estadosCuenta;
    
    const textoBusqueda = searchText.toLowerCase();
    return estadosCuenta.filter((item) => {
      return (
        item.archivo.toLowerCase().includes(textoBusqueda) ||
        item.cuenta.toLowerCase().includes(textoBusqueda) ||
        item.subidoPor.toLowerCase().includes(textoBusqueda) ||
        item.registros.toString().includes(textoBusqueda) ||
        item.subidos.toString().includes(textoBusqueda) ||
        item.duplicados.toString().includes(textoBusqueda) ||
        item.errores.toString().includes(textoBusqueda)
      );
    });
  }, [estadosCuenta, searchText]);

  const columns = [
    {
      title: 'Archivo',
      dataIndex: 'archivo',
      key: 'archivo',
      width: 250,
      ellipsis: true,
      sorter: (a: EstadoCuenta, b: EstadoCuenta) => a.archivo.localeCompare(b.archivo),
    },
    {
      title: 'Cuenta',
      dataIndex: 'cuenta',
      key: 'cuenta',
      width: 200,
      ellipsis: true,
      sorter: (a: EstadoCuenta, b: EstadoCuenta) => a.cuenta.localeCompare(b.cuenta),
      render: (cuenta: string) => (
        <Tag color="blue" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cuenta}
        </Tag>
      ),
    },
    {
      title: 'Registros',
      dataIndex: 'registros',
      key: 'registros',
      width: 100,
      align: 'center' as const,
      sorter: (a: EstadoCuenta, b: EstadoCuenta) => a.registros - b.registros,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Subidos',
      dataIndex: 'subidos',
      key: 'subidos',
      width: 100,
      align: 'center' as const,
      sorter: (a: EstadoCuenta, b: EstadoCuenta) => a.subidos - b.subidos,
      render: (value: number) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>
          {value.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Duplicados',
      dataIndex: 'duplicados',
      key: 'duplicados',
      width: 110,
      align: 'center' as const,
      sorter: (a: EstadoCuenta, b: EstadoCuenta) => a.duplicados - b.duplicados,
      render: (value: number) => (
        <span style={{ color: '#faad14', fontWeight: 500 }}>
          {value.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Errores',
      dataIndex: 'errores',
      key: 'errores',
      width: 100,
      align: 'center' as const,
      sorter: (a: EstadoCuenta, b: EstadoCuenta) => a.errores - b.errores,
      render: (value: number) => (
        <span style={{ color: '#ff4d4f', fontWeight: 500 }}>
          {value.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Subido por',
      dataIndex: 'subidoPor',
      key: 'subidoPor',
      width: 150,
      sorter: (a: EstadoCuenta, b: EstadoCuenta) => a.subidoPor.localeCompare(b.subidoPor),
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'fechaCreacion',
      key: 'fechaCreacion',
      width: 180,
      sorter: (a: EstadoCuenta, b: EstadoCuenta) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime(),
      render: (fecha: string) => humanizarFecha(fecha, true),
    },
    {
      title: 'Archivo',
      key: 'accion',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: EstadoCuenta) => (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="small"
          onClick={() => handleDescargar(record)}
        >
          Descargar
        </Button>
      ),
    },
  ];

  return (
    <div className="listado-archivos-cuentas-wrapper">
      <Card title="Estados de cuenta cargados" className="listado-archivos-cuentas-card">
        <Input
          placeholder="Buscar por archivo, cuenta, usuario..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
          allowClear
        />
        <Table
          columns={columns}
          dataSource={datosFiltrados}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} archivos`,
          }}
          scroll={{ x: 1400 }}
          bordered
        />
      </Card>
    </div>
  );
};

export default ListadoArchivosCuentas;
