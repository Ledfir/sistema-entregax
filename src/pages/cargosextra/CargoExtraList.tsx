import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, Space, Dropdown, Menu, Modal, Form, Select, DatePicker, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import cargoExtraService from '../../services/cargoExtraService';
import { RoleGuard } from '../../components/common/RoleGuard';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import './CargoExtra.css';

const { Search } = Input;
const { Option } = Select;

interface CargoExtra {
  token: string;
  idce: string;
  cliente: string;
  SUITE: string;
  CLIENTE: string;
  created: string;
  pagado: number;
  paid: string | null;
  cta: string;
  tokenCuenta: string;
  fechap: string | null;
}

interface Cuenta {
  token: string;
  name: string;
}

export const CargoExtraList = () => {
  const [loading, setLoading] = useState(false);
  const [cargosExtras, setCargosExtras] = useState<CargoExtra[]>([]);
  const [filteredData, setFilteredData] = useState<CargoExtra[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CargoExtra | null>(null);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loadingCuentas, setLoadingCuentas] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cargoDetail, setCargoDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCargosExtras();
    fetchCuentas();
  }, [currentPage, pageSize]);

  useEffect(() => {
    filterData();
  }, [searchText, cargosExtras]);

  const fetchCargosExtras = async () => {
    try {
      setLoading(true);
      const { items, total: totalItems } = await cargoExtraService.list('', currentPage, pageSize);
      setCargosExtras(items);
      setTotal(totalItems || 0);
    } catch (error) {
      console.error('Error al cargar cargos extras:', error);
      
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.response?.data?.error || 
                           (error as any)?.message || 
                           'No se pudieron cargar los cargos extras';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCuentas = async () => {
    try {
      setLoadingCuentas(true);
      const data = await cargoExtraService.getCuentas();
      setCuentas(data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    } finally {
      setLoadingCuentas(false);
    }
  };

  const filterData = () => {
    if (!searchText.trim()) {
      setFilteredData(cargosExtras);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = cargosExtras.filter((item) => {
      const idceMatch = item.idce?.toLowerCase().includes(searchLower);
      const suiteMatch = item.SUITE?.toLowerCase().includes(searchLower);
      const clienteMatch = item.CLIENTE?.toLowerCase().includes(searchLower);
      const combinedClient = `(${item.SUITE}) ${item.CLIENTE}`.toLowerCase().includes(searchLower);
      
      return idceMatch || suiteMatch || clienteMatch || combinedClient;
    });
    
    setFilteredData(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleView = async (record: CargoExtra) => {
    try {
      setLoadingDetail(true);
      setDetailModalVisible(true);
      const data = await cargoExtraService.get(record.token);
      setCargoDetail(data);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los detalles del cargo extra',
        showConfirmButton: true,
      });
      setDetailModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleGeneratePdf = () => {
    if (!cargoDetail?.charge?.token) return;
    
    const url = `https://www.sistemaentregax.com/cargosextras/generarpdf/${cargoDetail.charge.token}`;
    window.open(url, '_blank');
  };

  const handleEdit = (record: CargoExtra) => {
    setEditingRecord(record);
    form.setFieldsValue({
      cuenta: record.tokenCuenta,
      fecha_pago: record.fechap && record.fechap !== '0000-00-00 00:00:00' ? dayjs(record.fechap) : null,
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Crear FormData para enviar como form-data
      const formData = new FormData();
      formData.append('token', editingRecord?.token || '');
      formData.append('tokenCuenta', values.cuenta);
      if (values.fecha_pago) {
        formData.append('fechap', values.fecha_pago.format('YYYY-MM-DD HH:mm:ss'));
      }

      const response = await cargoExtraService.update(formData);
      
      // Verificar respuesta exitosa
      if (response?.success || response?.status === 'success' || response) {
        // Primero cerrar el modal
        handleModalCancel();
        
        // Actualizar la tabla
        await fetchCargosExtras();
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El cargo extra ha sido actualizado correctamente',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      
      const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.message || 
                           'No se pudo actualizar el cargo extra';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        showConfirmButton: true,
      });
    }
  };

  const handleDelete = async (record: CargoExtra) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await cargoExtraService.delete(record.token);
          
          // Actualizar la tabla inmediatamente
          await fetchCargosExtras();
          
          // Mostrar mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El cargo extra ha sido eliminado',
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 
                               error?.response?.data?.error || 
                               error?.message || 
                               'No se pudo eliminar el cargo extra';
          
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            showConfirmButton: true,
          });
        }
      }
    });
  };

  const getMenu = (record: CargoExtra) => (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleView(record)}>
        Ver detalles
      </Menu.Item>
      <RoleGuard permission="extra-charges.edit">
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          Editar
        </Menu.Item>
      </RoleGuard>
      <RoleGuard permission="extra-charges.delete">
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)}>
          Eliminar
        </Menu.Item>
      </RoleGuard>
    </Menu>
  );

  const columns: ColumnsType<CargoExtra> = [
    {
      title: 'OPCIONES',
      key: 'opciones',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: CargoExtra) => (
        <Dropdown overlay={getMenu(record)} trigger={['click']}>
          <Button type="link" icon={<MoreOutlined />}>
            Opciones
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'CLAVE',
      dataIndex: 'idce',
      key: 'idce',
      width: 150,
      align: 'center' as const,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Filtrar clave"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value: unknown, record: CargoExtra) => {
        const searchValue = String(value).toLowerCase();
        return record.idce?.toLowerCase().includes(searchValue) || false;
      },
    },
    {
      title: 'CLIENTE',
      key: 'cliente',
      align: 'center' as const,
      render: (_: any, record: CargoExtra) => {
        const suite = record.SUITE || '';
        const cliente = record.CLIENTE || '';
        return `(${suite}) ${cliente}`;
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Filtrar cliente"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value: unknown, record: CargoExtra) => {
        const searchValue = String(value).toLowerCase();
        const suite = record.SUITE?.toLowerCase() || '';
        const cliente = record.CLIENTE?.toLowerCase() || '';
        const combined = `(${suite}) ${cliente}`;
        return combined.includes(searchValue) || suite.includes(searchValue) || cliente.includes(searchValue);
      },
    },
    {
      title: 'FECHA DE CREACIÓN',
      dataIndex: 'created',
      key: 'created',
      width: 180,
      align: 'center' as const,
      render: (fecha: string) => {
        if (!fecha) return '-';
        const date = new Date(fecha);
        return date.toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      title: 'PAGADO',
      dataIndex: 'pagado',
      key: 'pagado',
      width: 100,
      align: 'center' as const,
      render: (pagado: any) =>
        Number(pagado) === 1 || pagado === '1' ? (
          <Tag color="green">Sí</Tag>
        ) : (
          <Tag color="red">No</Tag>
        ),
    },
    {
      title: 'FECHA PAGADO',
      dataIndex: 'paid',
      key: 'paid',
      width: 180,
      align: 'center' as const,
      render: (fecha: string | null) => {
        if (!fecha || fecha === '0000-00-00 00:00:00') return 'Pendiente';
        const date = new Date(fecha);
        return date.toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <span>CARGOS EXTRAS</span>
          </div>
          <RoleGuard permission="extra-charges.create">
            <Button
              type="primary"
              onClick={() => navigate('/cargos-extras/crear')}
              style={{ backgroundColor: '#ff6b2c', borderColor: '#ff6b2c' }}
            >
              + Crear cargo extra
            </Button>
          </RoleGuard>
        </div>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Search
            placeholder="Buscar registro..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            enterButton={<SearchOutlined />}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="token"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: searchText ? filteredData.length : total,
            showSizeChanger: true,
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
            locale: {
              items_per_page: '/ página',
              jump_to: 'Ir a',
              page: '',
            },
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No hay cargos extras registrados',
            filterConfirm: 'Filtrar',
            filterReset: 'Limpiar',
            selectAll: 'Seleccionar todo',
            selectInvert: 'Invertir selección',
          }}
        />
      </Space>

      <Modal
        title="Editar Cargo Extra"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Guardar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            label="Cuenta:"
            name="cuenta"
            rules={[{ required: true, message: 'Favor de seleccionar una cuenta.' }]}
          >
            <Select
              placeholder="Favor de seleccionar una cuenta."
              showSearch
              loading={loadingCuentas}
              notFoundContent={loadingCuentas ? <Spin size="small" /> : 'No hay cuentas'}
              filterOption={(input, option) => {
                const name = cuentas.find(c => c.token === option?.value)?.name || '';
                return name.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {cuentas.map((cuenta) => (
                <Option key={cuenta.token} value={cuenta.token}>
                  {cuenta.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Fecha de Pago:"
            name="fecha_pago"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="Seleccionar fecha de pago"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`📋 INFORMACIÓN SOBRE EL CARGO ${cargoDetail?.charge?.idce || ''}`}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setCargoDetail(null);
        }}
        footer={null}
        width={800}
      >
        <Spin spinning={loadingDetail}>
          {cargoDetail && (
            <div style={{ padding: '20px 0' }}>
              {/* Información Principal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: 30 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 5 }}>👤 Asesor:</div>
                  <div style={{ fontWeight: 500 }}>{cargoDetail.user?.name || 'Atención a clientes'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 5 }}>👥 Cliente:</div>
                  <div style={{ fontWeight: 500 }}>
                    {cargoDetail.customer?.nombre || '-'}
                    {cargoDetail.customer?.clavecliente && ` (${cargoDetail.customer.clavecliente})`}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 5 }}>💼 Cuenta:</div>
                  <div style={{ fontWeight: 500 }}>{cargoDetail.cuenta?.name || '-'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 5 }}>📅 Fecha límite de pago:</div>
                  <div style={{ fontWeight: 500 }}>
                    {cargoDetail.charge?.fechap && cargoDetail.charge.fechap !== '0000-00-00' && cargoDetail.charge.fechap !== '0000-00-00 00:00:00'
                      ? dayjs(cargoDetail.charge.fechap).format('DD-MM-YYYY')
                      : '-'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 5 }}>📅 Fecha de creación:</div>
                  <div style={{ fontWeight: 500 }}>
                    {cargoDetail.charge?.created && cargoDetail.charge.created !== '0000-00-00 00:00:00'
                      ? dayjs(cargoDetail.charge.created).format('DD-MM-YYYY') 
                      : '-'}
                  </div>
                </div>
              </div>

              {/* Información de pago */}
              <div style={{ 
                background: '#f5f5f5', 
                padding: 15, 
                borderRadius: 8, 
                marginBottom: 20 
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: 16, textAlign: 'center' }}>Información de pago</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 5 }}>Estado:</div>
                    <div>
                      {Number(cargoDetail.charge?.pagado) === 1 ? (
                        <Tag color="green">Pagado</Tag>
                      ) : (
                        <Tag color="orange">Pendiente de pago</Tag>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 5 }}>📅 Fecha de pago:</div>
                    <div style={{ fontWeight: 500 }}>
                      {cargoDetail.charge?.paid && cargoDetail.charge.paid !== '0000-00-00' && cargoDetail.charge.paid !== '0000-00-00 00:00:00'
                        ? dayjs(cargoDetail.charge.paid).format('DD-MM-YYYY')
                        : 'Pendiente'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conceptos */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: 16, textAlign: 'center' }}>Conceptos</h3>
                <Table
                  dataSource={
                    Array.isArray(cargoDetail.detalles) && cargoDetail.detalles.length > 0
                      ? cargoDetail.detalles.map((detalle: any, idx: number) => ({
                          key: `detalle-${idx}`,
                          concepto: String(detalle.concepto || 'Cargo extra'),
                          monto: Number(detalle.monto || 0)
                        }))
                      : [{
                          key: 'detalle-0',
                          concepto: 'Cargo extra',
                          monto: 0
                        }]
                  }
                  columns={[
                    {
                      title: 'Concepto',
                      dataIndex: 'concepto',
                      key: 'concepto',
                    },
                    {
                      title: 'Monto',
                      dataIndex: 'monto',
                      key: 'monto',
                      align: 'right' as const,
                      render: (monto: any) => {
                        const amount = Number(monto) || 0;
                        return `$ ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                      },
                    },
                  ]}
                  pagination={false}
                  size="small"
                  summary={(pageData) => {
                    const total = pageData.reduce((sum, record: any) => sum + (Number(record.monto) || 0), 0);
                    return (
                      <Table.Summary.Row style={{ background: '#fafafa' }}>
                        <Table.Summary.Cell index={0}>
                          <strong>Total</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <strong>$ {total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </div>

              {/* Archivo adjunto */}
              {cargoDetail.archivo && (
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 10 }}>📎 Archivo adjunto:</div>
                  
                  {/* Previsualizador */}
                  {(() => {
                    try {
                      const fileUrl = cargoDetail.archivo;
                      const fileName = fileUrl.split('/').pop() || '';
                      const extension = fileName.split('.').pop()?.toLowerCase() || '';
                      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension);
                      const isPdf = extension === 'pdf';

                      if (isImage) {
                        return (
                          <div style={{ 
                            border: '1px solid #d9d9d9', 
                            borderRadius: 8, 
                            padding: 10,
                            marginBottom: 10,
                            textAlign: 'center',
                            background: '#fafafa'
                          }}>
                            <img 
                              src={fileUrl} 
                              alt="Archivo adjunto"
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '350px',
                                objectFit: 'contain'
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        );
                      }

                      if (isPdf) {
                        return (
                          <div style={{ 
                            border: '1px solid #d9d9d9', 
                            borderRadius: 8, 
                            overflow: 'hidden',
                            marginBottom: 10
                          }}>
                            <iframe 
                              src={fileUrl} 
                              style={{ 
                                width: '100%', 
                                height: '350px',
                                border: 'none'
                              }}
                              title="Vista previa PDF"
                            />
                          </div>
                        );
                      }

                      return null;
                    } catch (error) {
                      console.error('Error al mostrar archivo:', error);
                      return null;
                    }
                  })()}
                  
                  <div>
                    <a 
                      href={cargoDetail.archivo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#1890ff' }}
                    >
                      Descargar archivo ({cargoDetail.archivo.split('/').pop() || 'archivo'})
                    </a>
                  </div>
                </div>
              )}

              {/* Botón Generar PDF */}
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleGeneratePdf}
                >
                  📄 Generar PDF
                </Button>
              </div>
            </div>
          )}
        </Spin>
      </Modal>
    </Card>
  );
};

export default CargoExtraList;
