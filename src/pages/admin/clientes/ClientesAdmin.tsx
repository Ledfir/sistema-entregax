import React, { useState, useEffect } from 'react';
import { Card, Table, Dropdown, Button, Input, message, Modal, Row, Col } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, DownOutlined, InfoCircleOutlined, EnvironmentOutlined, FileTextOutlined, HistoryOutlined, GiftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import { clienteService } from '@/services/clienteService';

interface Cliente {
  id: string | number;
  token: string;
  suite: string;
  nombre: string;
  correo: string;
  tel: string;
  asesor: string;
}

const ClientesAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Cliente[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<Cliente[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalBeneficiosVisible, setModalBeneficiosVisible] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [beneficioCredito, setBeneficioCredito] = useState<number | null>(null);
  const [beneficioPrecioUSA, setBeneficioPrecioUSA] = useState<number | null>(null);
  const [beneficioPrecioMaritimo, setBeneficioPrecioMaritimo] = useState<number | null>(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
      // Resetear a la primera página cuando se filtra
      setPagination({ ...pagination, current: 1 });
    } else {
      setFilteredData(data);
    }
  }, [searchText, data]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      
      // Llamar al endpoint
      const response = await clienteService.listCustomersAdmin();
      
      if (response.status === 'success' && response.data) {
        // Mapear los datos de la API a la estructura de la tabla
        const mappedData = response.data.map((item: any, index: number) => ({
          id: index + 1,
          token: item.token,
          suite: item.suite,
          nombre: item.nombre,
          correo: item.correo,
          tel: item.telefono,
          asesor: item.asesor,
        }));
        setData(mappedData);
        setPagination({ ...pagination, total: mappedData.length });
      } else {
        setData([]);
        message.info('No se encontraron clientes');
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.message || 
                           'Error al cargar los clientes';
      message.error(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (cliente: Cliente, key: string) => {
    switch (key) {
      case 'informacion':
        message.info(`Ver información de: ${cliente.nombre}`);
        // TODO: Navegar a información del cliente
        break;
      case 'direcciones':
        message.info(`Ver direcciones de: ${cliente.nombre}`);
        // TODO: Navegar a direcciones del cliente
        break;
      case 'fiscales':
        message.info(`Ver datos fiscales de: ${cliente.nombre}`);
        // TODO: Navegar a datos fiscales del cliente
        break;
      case 'historial':
        message.info(`Ver historial de: ${cliente.nombre}`);
        // TODO: Navegar a historial del cliente
        break;
      case 'beneficios':
        setClienteSeleccionado(cliente);
        setModalBeneficiosVisible(true);
        break;
      default:
        break;
    }
  };

  const getMenuItems = (cliente: Cliente): MenuProps['items'] => [
    {
      key: 'informacion',
      label: 'Información',
      icon: <InfoCircleOutlined />,
      onClick: () => handleMenuClick(cliente, 'informacion'),
    },
    {
      key: 'direcciones',
      label: 'Direcciones',
      icon: <EnvironmentOutlined />,
      onClick: () => handleMenuClick(cliente, 'direcciones'),
    },
    {
      key: 'fiscales',
      label: 'Fiscales',
      icon: <FileTextOutlined />,
      onClick: () => handleMenuClick(cliente, 'fiscales'),
    },
    {
      key: 'historial',
      label: 'Historial',
      icon: <HistoryOutlined />,
      onClick: () => handleMenuClick(cliente, 'historial'),
    },
    {
      key: 'beneficios',
      label: 'Beneficios',
      icon: <GiftOutlined />,
      onClick: () => handleMenuClick(cliente, 'beneficios'),
    },
  ];

  const columns: ColumnsType<Cliente> = [
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: Cliente) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="primary" style={{ backgroundColor: '#ff6600', borderColor: '#ff6600' }}>
            Acciones <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'SUITE',
      dataIndex: 'suite',
      key: 'suite',
      width: 100,
      align: 'center',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 250,
    },
    {
      title: 'Correo',
      dataIndex: 'correo',
      key: 'correo',
      width: 250,
    },
    {
      title: 'Tel',
      dataIndex: 'tel',
      key: 'tel',
      width: 130,
      align: 'center',
    },
    {
      title: 'Asesor',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 200,
    },
  ];

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Listado de clientes">
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar cliente..."
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
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Card>

      {/* Modal de Beneficios */}
      <Modal
        title={`Beneficios - ${clienteSeleccionado?.nombre || ''}`}
        open={modalBeneficiosVisible}
        onCancel={() => setModalBeneficiosVisible(false)}
        footer={null}
        width={1000}
      >
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {/* Tarjeta Crédito */}
          <Col xs={24} md={8} style={{ display: 'flex' }}>
            <Card 
              style={{ textAlign: 'center', width: '100%', border: '2px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer' }}
              bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 350 }}
              onClick={() => {
                setBeneficioCredito(1);
                console.log('Crédito seleccionado: 1');
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="https://img.icons8.com/color/48/bank-card-back-side.png" 
                  alt="Credit Card" 
                  style={{ width: 80, height: 80, marginBottom: 16 }} 
                />
                <h3 style={{ fontSize: 20, marginBottom: 16 }}>Crédito</h3>
                <p style={{ color: '#666', marginBottom: 24 }}>
                  Al habilitar esta opción se otorgará crédito al cliente, solo en estrategas y usa
                </p>
              </div>
              <Button 
                danger 
                size="large" 
                style={{ backgroundColor: '#dc0000', borderColor: '#dc0000', color: '#ffffff' }}
              >
                Crédito : No
              </Button>
            </Card>
          </Col>

          {/* Tarjeta Precio USA */}
          <Col xs={24} md={8} style={{ display: 'flex' }}>
            <Card 
              style={{ textAlign: 'center', width: '100%', border: '2px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer' }}
              bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 350 }}
              onClick={() => {
                setBeneficioPrecioUSA(2);
                console.log('Precio USA seleccionado: 2');
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="https://img.icons8.com/color/48/usa.png" 
                  alt="USA Flag" 
                  style={{ width: 80, height: 80, marginBottom: 16 }} 
                />
                <h3 style={{ fontSize: 20, marginBottom: 16 }}>Precio USA</h3>
                <p style={{ color: '#666', marginBottom: 24 }}>
                  Esta opción habilita precio mayoreo en USA solo aplica en bodegas USA
                </p>
              </div>
              <Button 
                danger 
                size="large" 
                style={{ backgroundColor: '#dc0000', borderColor: '#dc0000', color: '#ffffff' }}
              >
                USA : No
              </Button>
            </Card>
          </Col>

          {/* Tarjeta Precio Marítimo */}
          <Col xs={24} md={8} style={{ display: 'flex' }}>
            <Card 
              style={{ textAlign: 'center', width: '100%', border: '2px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer' }}
              bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 350 }}
              onClick={() => {
                setBeneficioPrecioMaritimo(3);
                console.log('Precio Marítimo seleccionado: 3');
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 80, marginBottom: 16 }}>🚢</div>
                <h3 style={{ fontSize: 20, marginBottom: 16 }}>Precio Marítimo</h3>
                <p style={{ color: '#666', marginBottom: 24 }}>
                  Esta opción habilita precio mayoreo en marítimo a precio de 15 cbm
                </p>
              </div>
              <Button 
                danger 
                size="large" 
                style={{ backgroundColor: '#dc0000', borderColor: '#dc0000', color: '#ffffff' }}
              >
                Marítimo : No
              </Button>
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default ClientesAdmin;
