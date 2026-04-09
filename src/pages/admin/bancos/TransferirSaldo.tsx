import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, message, Table, Tag, Modal } from 'antd';
import { SearchOutlined, SwapOutlined } from '@ant-design/icons';
import { userService } from '@/services/userService';
import { clienteService } from '@/services/clienteService';
import { cuentasService } from '@/services/cuentasService';
import './TransferirSaldo.css';

const { Option } = Select;

interface Usuario {
  id: number | string;
  token: string;
  name: string;
  username?: string;
}

interface Cliente {
  id?: number | string;
  token: string;
  clavecliente: string;
  nombre: string;
  asesor?: string;
}

interface Pago {
  id: string | number;
  cliente: string;
  cantidad: string | number;
  fecha: string;
  cuenta: string;
  estado: string;
}

interface Cuenta {
  id: number | string;
  name: string;
}

const TransferirSaldo: React.FC = () => {
  const [form] = Form.useForm();
  const [loadingAsesores, setLoadingAsesores] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [asesores, setAsesores] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<string | number | undefined>(undefined);
  const [loadingCuentas, setLoadingCuentas] = useState(false);
  const [loadingTransferir, setLoadingTransferir] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarAsesores();
    cargarCuentas();
  }, []);

  const cargarAsesores = async () => {
    try {
      setLoadingAsesores(true);
      const response = await userService.list('', 1, 1000);
      setAsesores(response.items || []);
    } catch (error) {
      console.error('Error al cargar asesores:', error);
      message.error('Error al cargar asesores');
    } finally {
      setLoadingAsesores(false);
    }
  };

  const cargarCuentas = async () => {
    try {
      setLoadingCuentas(true);
      const data = await cuentasService.list();
      setCuentas(data || []);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      message.error('Error al cargar cuentas');
    } finally {
      setLoadingCuentas(false);
    }
  };

  const cargarClientesPorAsesor = async (asesorToken: string | number) => {
    try {
      setLoadingClientes(true);
      setClientes([]); // Limpiar clientes antes de cargar
      form.setFieldValue('cliente', undefined); // Limpiar selección de cliente
      
      const data = await clienteService.getMyCustomers(asesorToken);
      setClientes(data || []);
      
      if (!data || data.length === 0) {
        message.info('Este asesor no tiene clientes asignados');
      }
    } catch (error) {
      console.error('Error al cargar clientes del asesor:', error);
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.message || 
                           'Error al cargar los clientes del asesor';
      message.error(errorMessage);
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleAsesorChange = (asesorId: string | number) => {
    if (asesorId) {
      cargarClientesPorAsesor(asesorId);
    } else {
      setClientes([]);
      form.setFieldValue('cliente', undefined);
    }
  };

  const handleBuscar = async (values: any) => {
    try {
      if (!values.cliente) {
        message.warning('Por favor seleccione un cliente');
        return;
      }

      setLoadingBuscar(true);
      setPagos([]); // Limpiar resultados anteriores
      
      const response = await cuentasService.searchPaymentsCustomer(values.cliente);
      
      if (response?.data && Array.isArray(response.data)) {
        setPagos(response.data);
        
        if (response.data.length === 0) {
          message.info('No se encontraron pagos para este cliente');
        } else {
          message.success(`Se encontraron ${response.data.length} pago(s)`);
        }
      } else {
        setPagos([]);
        message.info('No se encontraron pagos para este cliente');
      }
    } catch (error) {
      console.error('Error al buscar:', error);
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.message || 
                           'Error al buscar pagos del cliente';
      message.error(errorMessage);
      setPagos([]);
    } finally {
      setLoadingBuscar(false);
    }
  };

  const handleTransferirSaldo = (pago: Pago) => {
    setPagoSeleccionado(pago);
    setCuentaSeleccionada(undefined);
    setModalVisible(true);
  };

  const handleCancelarModal = () => {
    setModalVisible(false);
    setPagoSeleccionado(null);
    setCuentaSeleccionada(undefined);
  };

  const handleRealizarTransferencia = async () => {
    if (!cuentaSeleccionada) {
      message.warning('Por favor seleccione una cuenta');
      return;
    }

    if (!pagoSeleccionado) {
      message.error('No hay pago seleccionado');
      return;
    }

    // Obtener el nombre de la cuenta seleccionada
    const cuentaDestino = cuentas.find((c) => c.id === cuentaSeleccionada);

    Modal.confirm({
      title: '¿Confirmar transferencia?',
      content: (
        <div>
          <p>Está a punto de transferir el siguiente pago:</p>
          <p><strong>Cantidad:</strong> ${Number(pagoSeleccionado.cantidad).toFixed(2)}</p>
          <p><strong>Cuenta origen:</strong> {pagoSeleccionado.cuenta}</p>
          <p><strong>Cuenta destino:</strong> {cuentaDestino?.name}</p>
        </div>
      ),
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          setLoadingTransferir(true);
          
          // Llamar al endpoint de transferencia
          const response = await cuentasService.transferPayment(
            pagoSeleccionado.id,
            cuentaSeleccionada
          );
          
          // Mostrar mensaje de la API
          if (response.status === 'success') {
            message.success(response.message || 'Transferencia realizada exitosamente');
            handleCancelarModal();
            
            // Recargar los pagos
            const values = form.getFieldsValue();
            if (values.cliente) {
              handleBuscar(values);
            }
          } else {
            message.error(response.message || 'Error al realizar la transferencia');
          }
        } catch (error) {
          console.error('Error al realizar la transferencia:', error);
          const errorMessage = (error as any)?.response?.data?.message || 
                               (error as any)?.message || 
                               'Error al realizar la transferencia';
          message.error(errorMessage);
        } finally {
          setLoadingTransferir(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Opciones',
      key: 'opciones',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: Pago) => (
        <Button
          type="primary"
          icon={<SwapOutlined />}
          size="small"
          onClick={() => handleTransferirSaldo(record)}
        >
          Transferir saldo
        </Button>
      ),
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: 120,
      align: 'center' as const,
      render: (cantidad: number | string) => {
        const num = Number(cantidad);
        return isNaN(num) ? cantidad : `$${num.toFixed(2)}`;
      },
    },
    {
      title: 'Fecha de pago',
      dataIndex: 'paid',
      key: 'paid',
      width: 150,
      align: 'center' as const,
      render: (fecha: string) => {
        if (!fecha) return '-';
        try {
          const date = new Date(fecha);
          if (isNaN(date.getTime())) return fecha;
          
          return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
        } catch {
          return fecha;
        }
      },
    },
    {
      title: 'Cuenta',
      dataIndex: 'cuenta',
      key: 'cuenta',
      width: 200,
      align: 'center' as const,
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      align: 'center' as const,
      render: (state: number | string) => {
        const stateNum = Number(state);
        let texto = '';
        let color = 'default';
        
        if (stateNum === 1) {
          texto = 'Nuevo';
          color = 'blue';
        } else if (stateNum === 2) {
          texto = 'Aprobado';
          color = 'green';
        } else {
          texto = String(state);
          color = 'default';
        }
        
        return <Tag color={color}>{texto}</Tag>;
      },
    },
  ];

  return (
    <div className="transferir-saldo-wrapper">
      <Card 
        title="Transferir saldos" 
        className="transferir-saldo-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBuscar}
          className="transferir-saldo-form"
        >
          <div className="form-row-two-columns">
            <Form.Item
              label="Seleccionar al asesor"
              name="asesor"
              rules={[{ required: true, message: 'Por favor seleccione un asesor' }]}
            >
              <Select
                placeholder="Seleccione un asesor"
                showSearch
                loading={loadingAsesores}
                optionFilterProp="children"
                onChange={handleAsesorChange}
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {asesores.map((asesor) => (
                  <Option key={asesor.token} value={asesor.token}>
                    {asesor.name || asesor.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Seleccionar cliente"
              name="cliente"
              rules={[{ required: true, message: 'Por favor seleccione un cliente' }]}
            >
              <Select
                placeholder="Seleccione un cliente"
                showSearch
                loading={loadingClientes}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {clientes.map((cliente, index) => (
                  <Option key={cliente.token || `cliente-${index}`} value={cliente.token}>
                    ({cliente.clavecliente}) {cliente.nombre}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item className="button-section">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loadingBuscar}
              size="large"
            >
              Buscar
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Tabla de resultados */}
      {pagos.length > 0 && (
        <Card 
          title="Resultados de pagos" 
          className="resultados-card"
          style={{ marginTop: 24 }}
        >
          <Table
            columns={columns}
            dataSource={pagos}
            rowKey={(record) => record.id}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total) => `Total ${total} registros`,
            }}
            scroll={{ x: 'max-content' }}
            bordered
          />
        </Card>
      )}

      {/* Modal de transferencia de saldo */}
      <Modal
        title="Transferir saldo"
        open={modalVisible}
        onCancel={handleCancelarModal}
        footer={null}
        width={500}
      >
        {pagoSeleccionado && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>Pago seleccionado:</strong></p>
            <p>Cantidad: ${Number(pagoSeleccionado.cantidad).toFixed(2)}</p>
            <p>Cuenta actual: {pagoSeleccionado.cuenta}</p>
          </div>
        )}

        <Form layout="vertical">
          <Form.Item
            label="Seleccionar cuenta destino"
            required
          >
            <Select
              placeholder="Seleccione una cuenta"
              value={cuentaSeleccionada}
              onChange={setCuentaSeleccionada}
              showSearch
              loading={loadingCuentas}
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {cuentas
                .filter((cuenta) => cuenta.name !== pagoSeleccionado?.cuenta)
                .map((cuenta) => (
                  <Option key={cuenta.id} value={cuenta.id}>
                    {cuenta.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Button
              type="primary"
              onClick={handleRealizarTransferencia}
              loading={loadingTransferir}
              size="large"
              style={{ minWidth: 200 }}
            >
              Realizar transferencia
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TransferirSaldo;
