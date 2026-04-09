import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, message } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '@/services/userService';

interface BlRecord {
  id: string | number;
  name: string;
  bl: string;
  name_bl: string;
  pl: string;
  name_pl: string;
  resp: string;
  created: string;
}

const BlsCargados: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<BlRecord[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchText, data]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Llamar al endpoint
      const response = await userService.listFilesBls();
      
      if (response.status === 'success' && response.data) {
        // Mapear los datos de la API a la estructura de la tabla
        const mappedData = response.data.map((item: any, index: number) => ({
          id: index + 1,
          name: item.name,
          bl: item.bl,
          name_bl: item.name_bl,
          pl: item.pl,
          name_pl: item.name_pl,
          resp: item.resp,
          created: item.created,
        }));
        setData(mappedData);
      } else {
        setData([]);
        message.info('No se encontraron archivos BLs');
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.message || 
                           'Error al cargar los datos';
      message.error(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = (url: string) => {
    window.open(url, '_blank');
  };

  const formatearFecha = (fecha: string) => {
    // Humanizar fecha: "2024-04-08 14:38:04" a formato legible
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: ColumnsType<BlRecord> = [
    {
      title: 'BL',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      align: 'center',
    },
    {
      title: 'ARCHIVO BL',
      key: 'bl',
      width: 250,
      align: 'center',
      render: (_: any, record: BlRecord) => (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => handleDescargar(record.bl)}
          style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}
        >
          {record.name_bl}
        </Button>
      ),
    },
    {
      title: 'ARCHIVO PL',
      key: 'pl',
      width: 300,
      align: 'center',
      render: (_: any, record: BlRecord) => (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => handleDescargar(record.pl)}
          style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}
        >
          {record.name_pl}
        </Button>
      ),
    },
    {
      title: 'RESPONSABLE',
      dataIndex: 'resp',
      key: 'resp',
      width: 250,
      align: 'center',
    },
    {
      title: 'FECHA',
      dataIndex: 'created',
      key: 'created',
      width: 180,
      align: 'center',
      render: (fecha: string) => formatearFecha(fecha),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Archivos de usuarios maritimos"
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar:"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            size="large"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} Entradas`,
          }}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Card>
    </div>
  );
};

export default BlsCargados;
