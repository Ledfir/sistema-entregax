import React, { useEffect, useState, useMemo } from 'react';
import { Card, Spin, message, Row, Col, Tag, Typography, Pagination, Badge, Input, Select, Dropdown, Button, Modal, Descriptions, Form } from 'antd';
import { SearchOutlined, MoreOutlined, EditOutlined, EyeOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/store/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

const { Title, Text } = Typography;

// Colores por banco con mejor contraste
const getBankColor = (banco: string): string => {
  const bankColors: Record<string, string> = {
    SCOTIABANK: 'red',
    AFIRME: 'blue',
    BBVA: 'cyan',
    SANTANDER: 'red',
    BANAMEX: 'blue',
    BANORTE: 'orange',
    HSBC: 'default',
  };
  return bankColors[banco?.toUpperCase()] || 'default';
};

const CuentasProveedores: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string | undefined>(undefined);
  const [selectedProv, setSelectedProv] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [addModalLoading, setAddModalLoading] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editModalLoading, setEditModalLoading] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [servicios, setServicios] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const pageSize = 12;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/dolars/facturacion/accounts');
        const accounts = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setData(accounts);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Error al cargar cuentas';
        message.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Obtener lista única de bancos
  const bancos = useMemo(() => {
    const uniqueBanks = new Set<string>();
    data.forEach((account) => {
      const banco = account.banco || account.bank;
      if (banco) uniqueBanks.add(banco.toUpperCase());
    });
    return Array.from(uniqueBanks).sort();
  }, [data]);

  // Obtener lista única de proveedores (prov)
  const proveedores = useMemo(() => {
    const uniqueProvs = new Set<string>();
    data.forEach((account) => {
      if (account.prov) uniqueProvs.add(account.prov.toString());
    });
    return Array.from(uniqueProvs).sort();
  }, [data]);

  // Filtrar datos según búsqueda y banco seleccionado
  const filteredData = data.filter((account) => {
    // Filtro de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchSearch = (
        (account.nombre || account.name || account.proveedor || '').toLowerCase().includes(search) ||
        (account.banco || account.bank || '').toLowerCase().includes(search) ||
        (account.id || account.account_id || account.numero || '').toString().toLowerCase().includes(search) ||
        (account.prov || '').toString().toLowerCase().includes(search)
      );
      if (!matchSearch) return false;
    }
    
    // Filtro de banco
    if (selectedBank) {
      const accountBank = (account.banco || account.bank || '').toUpperCase();
      if (accountBank !== selectedBank) return false;
    }
    
    // Filtro de proveedor
    if (selectedProv) {
      const accountProv = (account.prov || '').toString();
      if (accountProv !== selectedProv) return false;
    }
    
    return true;
  });

  // Calcular datos de la página actual
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const handleBankChange = (value: string | undefined) => {
    setSelectedBank(value);
    setCurrentPage(1); // Resetear a la primera página al cambiar banco
  };

  const handleProvChange = (value: string | undefined) => {
    setSelectedProv(value);
    setCurrentPage(1); // Resetear a la primera página al cambiar proveedor
  };

  const handleViewDetails = async (account: any) => {
    setModalVisible(true);
    setModalLoading(true);
    setSelectedAccount(null);
    
    try {
      const accountId = account.id || account.account_id;
      const res = await apiClient.get(`/dolars/facturacion/account/${accountId}`);
      setSelectedAccount(res.data.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al cargar detalles de la cuenta';
      message.error(msg);
      setModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAccount(null);
  };

  const handleOpenAddModal = async () => {
    setAddModalVisible(true);
    setAddModalLoading(true);
    
    try {
      const res = await apiClient.get('/dolars/list-services');
      const services = res.data?.data || [];
      setServicios(services);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al cargar servicios';
      message.error(msg);
    } finally {
      setAddModalLoading(false);
    }
  };

  const handleCloseAddModal = () => {
    setAddModalVisible(false);
    form.resetFields();
  };

  const handleAddAccount = async (values: any) => {
    setAddModalLoading(true);
    
    try {
      const payload = {
        token: user?.token,
        servicio: values.servicio,
        nombre: values.nombre,
        proveedor: values.proveedor,
        rfc: values.rfc,
        banco: values.banco,
        cuenta: values.cuenta,
        clabe: values.clabe,
      };

      const res = await apiClient.post('/dolars/facturacion/create-account', payload);
      
      // Mostrar mensaje de éxito de la API
      const successMsg = res.data?.message || 'Cuenta creada exitosamente';
      message.success(successMsg);
      
      handleCloseAddModal();
      
      // Recargar la lista de cuentas
      const accountsRes = await apiClient.get('/dolars/facturacion/accounts');
      const accounts = Array.isArray(accountsRes.data) ? accountsRes.data : accountsRes.data?.data || [];
      setData(accounts);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al crear la cuenta';
      message.error(msg);
    } finally {
      setAddModalLoading(false);
    }
  };

  const handleOpenEditModal = async (account: any) => {
    setEditModalVisible(true);
    setEditModalLoading(true);
    
    try {
      // Cargar servicios si no están cargados
      if (servicios.length === 0) {
        const servicesRes = await apiClient.get('/dolars/list-services');
        const services = servicesRes.data?.data || [];
        setServicios(services);
      }
      
      // Obtener datos completos de la cuenta desde la API
      const accountId = account.id || account.account_id;
      const res = await apiClient.get(`/dolars/facturacion/account/${accountId}`);
      const accountData = res.data.data;
      
      setEditingAccount(accountData);
      
      // Precargar datos del formulario con la información de la API
      editForm.setFieldsValue({
        servicio: accountData.ids,
        nombre: accountData.name,
        proveedor: accountData.prov,
        rfc: accountData.rfc,
        banco: accountData.banco,
        cuenta: accountData.cuenta,
        clabe: accountData.clabe,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al cargar datos de la cuenta';
      message.error(msg);
      setEditModalVisible(false);
    } finally {
      setEditModalLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditingAccount(null);
    editForm.resetFields();
  };

  const handleEditAccount = async (values: any) => {
    setEditModalLoading(true);
    
    try {
      const payload = {
        token: user?.token,
        id: editingAccount.id,
        servicio: values.servicio,
        nombre: values.nombre,
        proveedor: values.proveedor,
        rfc: values.rfc,
        banco: values.banco,
        cuenta: values.cuenta,
        clabe: values.clabe,
      };

      const res = await apiClient.post('/dolars/facturacion/update-account', payload);
      const successMsg = res.data?.message || 'Cuenta actualizada exitosamente';
      
      message.success(successMsg);
      
      handleCloseEditModal();
      
      // Recargar la lista de cuentas
      const accountsRes = await apiClient.get('/dolars/facturacion/accounts');
      const accounts = Array.isArray(accountsRes.data) ? accountsRes.data : accountsRes.data?.data || [];
      setData(accounts);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al actualizar la cuenta';
      message.error(msg);
    } finally {
      setEditModalLoading(false);
    }
  };

  const handleDeleteAccount = (account: any) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta cuenta?',
      content: `Se eliminará la cuenta: ${account.name || account.nombre || 'Sin nombre'}`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const accountId = account.id || account.account_id;
          const payload = {
            token: user?.token,
            id: accountId,
          };

          const res = await apiClient.post('/dolars/facturacion/delete-account', payload);
          const successMsg = res.data?.message || 'Cuenta eliminada exitosamente';
          message.success(successMsg);

          // Recargar la lista de cuentas
          const accountsRes = await apiClient.get('/dolars/facturacion/accounts');
          const accounts = Array.isArray(accountsRes.data) ? accountsRes.data : accountsRes.data?.data || [];
          setData(accounts);
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || 'Error al eliminar la cuenta';
          message.error(msg);
        }
      },
    });
  };

  const handleMenuClick = (key: string, account: any) => {
    switch (key) {
      case 'edit':
        handleOpenEditModal(account);
        break;
      case 'deactivate':
        message.warning(`Desactivar cuenta: ${account.nombre || account.name || account.proveedor}`);
        // TODO: Implementar lógica de desactivación
        break;
      case 'delete':
        handleDeleteAccount(account);
        break;
    }
  };

  const getMenuItems = (account: any): MenuProps['items'] => [
    {
        key: 'view',
        label: 'Ver detalles',
        icon: <EyeOutlined />,
        onClick: () => handleViewDetails(account),
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => handleMenuClick('edit', account),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleMenuClick('delete', account),
    },
  ];

  return (
    <div style={{ padding: 24, background: 'transparent' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Title level={2} style={{ margin: 0, color: '#000' }}>Listado de cuentas</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleOpenAddModal}
            size="large"
          >
            Agregar nueva cuenta
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select
            placeholder="Filtrar por banco"
            allowClear
            style={{ minWidth: 200 }}
            value={selectedBank}
            onChange={handleBankChange}
            options={[
              { label: 'Todos los bancos', value: undefined },
              ...bancos.map((banco) => ({
                label: banco,
                value: banco,
              })),
            ]}
          />
          <Select
            placeholder="Filtrar por proveedor"
            allowClear
            style={{ minWidth: 200 }}
            value={selectedProv}
            onChange={handleProvChange}
            options={[
              { label: 'Todos los proveedores', value: undefined },
              ...proveedores.map((prov) => ({
                label: `Proveedor ${prov}`,
                value: prov,
              })),
            ]}
          />
          <Input.Search
            placeholder="Buscar por nombre, banco, ID o prov..."
            allowClear
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
            style={{ flex: 1, maxWidth: 400 }}
          />
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {currentData.map((account: any) => (
            <Col xs={24} sm={12} lg={8} key={account.id || account.account_id}>
              <Card
                hoverable
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #bdbdbd 100%)',
                  border: '1px solid #ffffff',
                  borderRadius: 12,
                  height: '100%',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <Title 
                    level={5} 
                    style={{ 
                      margin: 0, 
                      color: '#020202', 
                      fontSize: 16, 
                      fontWeight: 600,
                      lineHeight: '1.4',
                      maxWidth: '60%'
                    }}
                  >
                    {account.nombre || account.name || account.proveedor || 'Sin nombre'}
                  </Title>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Dropdown menu={{ items: getMenuItems(account) }} trigger={['click']} placement="bottomRight">
                      <Button 
                        type="text" 
                        icon={<MoreOutlined />} 
                        size="small"
                        style={{ color: '#020202' }}
                      />
                    </Dropdown>
                    <Tag 
                      color={getBankColor(account.banco || account.bank)}
                      style={{ 
                        fontWeight: 500,
                        fontSize: 12,
                        borderRadius: 6,
                        padding: '2px 10px',
                        margin: 0
                      }}
                    >
                      {(account.banco || account.bank || 'N/A').toUpperCase()}
                    </Tag>
                  </div>
                </div>
                
                {account.prov && (
                  <div style={{ marginBottom: 12 }}>
                    <Badge 
                      count={account.prov} 
                      style={{ 
                        backgroundColor: '#52c41a',
                        fontWeight: 500,
                        fontSize: 12
                      }} 
                    />
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  {/* <Text style={{ color: '#111111', fontSize: 14, fontWeight: 500 }}>
                    #{account.id || account.account_id || account.numero || '---'}
                  </Text> */}
                  <Text style={{ color: '#111111', fontSize: 13 }}>
                    {account.fecha ? dayjs(account.fecha).fromNow() : 
                     account.created ? dayjs(account.created).fromNow() : 
                     'Fecha desconocida'}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
          </Row>
          
          {filteredData.length > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
              <Pagination
                current={currentPage}
                total={filteredData.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} cuentas`}
              />
            </div>
          )}
        </>
      )}
      
      {!loading && filteredData.length === 0 && searchTerm && (
        <Card style={{ textAlign: 'center', padding: 48, background: '#ffffff', border: '1px solid #bdbdbd' }}>
          <Text type="secondary" style={{ color: '#111111' }}>No se encontraron resultados para "{searchTerm}"</Text>
        </Card>
      )}
      
      {!loading && data.length === 0 && !searchTerm && (
        <Card style={{ textAlign: 'center', padding: 48, background: '#ffffff', border: '1px solid #bdbdbd' }}>
          <Text type="secondary" style={{ color: '#111111' }}>No hay cuentas disponibles</Text>
        </Card>
      )}

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Detalles de la cuenta</span>
            {selectedAccount?.banco && (
              <Tag color={getBankColor(selectedAccount.banco)}>
                {selectedAccount.banco.toUpperCase()}
              </Tag>
            )}
          </div>
        }
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        {modalLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : selectedAccount ? (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              {/* <Descriptions.Item label="ID" span={1}>
                {selectedAccount.id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Token" span={1}>
                {selectedAccount.token || 'N/A'}
              </Descriptions.Item> */}
              <Descriptions.Item label="Nombre/Razón Social" span={2}>
                <strong>{selectedAccount.name || 'N/A'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="RFC" span={1}>
                {selectedAccount.rfc || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Sin Factura" span={1}>
                {selectedAccount.sinfactura || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Banco" span={1}>
                <Tag color={getBankColor(selectedAccount.banco)}>
                  {selectedAccount.banco?.toUpperCase() || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Proveedor" span={1}>
                {selectedAccount.prov ? (
                  <Badge 
                    count={selectedAccount.prov} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                ) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Número de Cuenta" span={1}>
                {selectedAccount.cuenta || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="CLABE" span={1}>
                {selectedAccount.clabe || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="IDS" span={1}>
                {selectedAccount.ids || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Estado" span={1}>
                <Tag color={selectedAccount.state === '1' ? 'green' : 'red'}>
                  {selectedAccount.state === '1' ? 'Activo' : 'Inactivo'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Fecha de Creación" span={1}>
                {selectedAccount.created 
                  ? dayjs(selectedAccount.created).fromNow()
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Última Actualización" span={1}>
                {selectedAccount.updated 
                  ? dayjs(selectedAccount.updated).fromNow()
                  : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : null}
      </Modal>

      <Modal
        title="Agregar nueva cuenta"
        open={addModalVisible}
        onCancel={handleCloseAddModal}
        footer={null}
        width={900}
      >
        {addModalLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddAccount}
          >
            <Form.Item
              label="Seleccione el tipo de servicio de la cuenta"
              name="servicio"
              rules={[{ required: true, message: 'Por favor seleccione un servicio' }]}
            >
              <Select
                placeholder="Seleccione un servicio"
                size="large"
                options={servicios.map((servicio) => ({
                  label: servicio.name,
                  value: servicio.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Nombre de la cuenta o beneficiario"
              name="nombre"
              rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
            >
              <Input size="large" placeholder="Nombre completo o razón social" />
            </Form.Item>

            <Form.Item
              label="Proveedor."
              name="proveedor"
              rules={[{ required: true, message: 'Por favor seleccione un proveedor' }]}
            >
              <Select
                placeholder="-- Selecciona --"
                size="large"
                options={proveedores.map((prov) => ({
                  label: `Proveedor ${prov}`,
                  value: prov,
                }))}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="RFC de la cuenta."
                  name="rfc"
                  rules={[{ required: false, message: 'Por favor ingrese el RFC' }]}
                >
                  <Input size="large" placeholder="RFC" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Banco de la cuenta."
                  name="banco"
                  rules={[{ required: true, message: 'Por favor ingrese el banco' }]}
                >
                  <Input size="large" placeholder="Nombre del banco" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Numero de cuenta."
                  name="cuenta"
                  rules={[{ required: false, message: 'Por favor ingrese el número de cuenta' }]}
                >
                  <Input size="large" placeholder="Número de cuenta" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="CLABE interbancario de la cuenta."
                  name="clabe"
                  rules={[{ required: true, message: 'Por favor ingrese la CLABE' }]}
                >
                  <Input size="large" placeholder="CLABE interbancaria" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 24, textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                loading={addModalLoading}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', minWidth: 200 }}
              >
                Guardar cuenta
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="Editar cuenta"
        open={editModalVisible}
        onCancel={handleCloseEditModal}
        footer={null}
        width={900}
      >
        {editModalLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditAccount}
          >
            <Form.Item
              label="Seleccione el tipo de servicio de la cuenta"
              name="servicio"
              rules={[{ required: true, message: 'Por favor seleccione un servicio' }]}
            >
              <Select
                placeholder="Seleccione un servicio"
                size="large"
                options={servicios.map((servicio) => ({
                  label: servicio.name,
                  value: servicio.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Nombre de la cuenta o beneficiario"
              name="nombre"
              rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
            >
              <Input size="large" placeholder="Nombre completo o razón social" />
            </Form.Item>

            <Form.Item
              label="Proveedor."
              name="proveedor"
              rules={[{ required: true, message: 'Por favor seleccione un proveedor' }]}
            >
              <Select
                placeholder="-- Selecciona --"
                size="large"
                options={proveedores.map((prov) => ({
                  label: `Proveedor ${prov}`,
                  value: prov,
                }))}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="RFC de la cuenta."
                  name="rfc"
                  rules={[{ required: true, message: 'Por favor ingrese el RFC' }]}
                >
                  <Input size="large" placeholder="RFC" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Banco de la cuenta."
                  name="banco"
                  rules={[{ required: true, message: 'Por favor ingrese el banco' }]}
                >
                  <Input size="large" placeholder="Nombre del banco" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Numero de cuenta."
                  name="cuenta"
                  rules={[{ required: true, message: 'Por favor ingrese el número de cuenta' }]}
                >
                  <Input size="large" placeholder="Número de cuenta" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="CLABE interbancario de la cuenta."
                  name="clabe"
                  rules={[{ required: true, message: 'Por favor ingrese la CLABE' }]}
                >
                  <Input size="large" placeholder="CLABE interbancaria" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 24, textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                loading={editModalLoading}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', minWidth: 200 }}
              >
                Actualizar cuenta
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default CuentasProveedores;
