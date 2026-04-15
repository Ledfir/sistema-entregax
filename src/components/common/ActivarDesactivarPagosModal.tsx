import React, { useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { pagosService } from '@/services/pagosService';

interface ActivarDesactivarPagosModalProps {
  open: boolean;
  onCancel: () => void;
  estadoInicial: boolean; // 0 = inactivo (activar), 1 = activo (desactivar)
  userId: string | number; // Token del usuario para enviar al endpoint
}

export const ActivarDesactivarPagosModal: React.FC<ActivarDesactivarPagosModalProps> = ({
  open,
  onCancel,
  estadoInicial,
  userId,
}) => {
  const [loading, setLoading] = useState(false);
  const [estadoActual, setEstadoActual] = useState<'activo' | 'inactivo' | null>(null);

  useEffect(() => {
    if (open) {
      // Convertir booleano a string: 0 = inactivo, 1 = activo
      setEstadoActual(estadoInicial ? 'activo' : 'inactivo');
    }
  }, [open, estadoInicial]);

  const handleToggleEstado = async () => {
    try {
      setLoading(true);
      const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
      
      const response = await pagosService.toggleEstadoPagos(userId);
      
      if (response.status === 'success') {
        message.success(response.message || `Botón de pagos ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
        setEstadoActual(nuevoEstado);
      } else {
        message.error(response.message || 'Error al cambiar el estado');
      }
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      const errorMessage = error?.response?.data?.message || 'Error al cambiar el estado de los pagos';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Desactivar / Activar boton de pago de CTZ´s"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            El boton de pago de cotizaciones y subir pagos a monedero actualmente se encuentra{' '}
            <strong style={{ color: estadoActual === 'activo' ? '#52c41a' : '#ff4d4f' }}>
              {estadoActual?.toUpperCase()}
            </strong>
            .
          </p>

          <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '30px' }}>
            ¿{estadoActual === 'activo' ? 'DESACTIVAR' : 'ACTIVAR'} boton de pago de CTZs?
          </p>

          <Button
            type="primary"
            danger={estadoActual === 'activo'}
            size="large"
            onClick={handleToggleEstado}
            loading={loading}
            style={{
              minWidth: '200px',
              backgroundColor: estadoActual === 'activo' ? '#ff4d4f' : '#52c41a',
              borderColor: estadoActual === 'activo' ? '#ff4d4f' : '#52c41a',
            }}
          >
            {estadoActual === 'activo' ? 'DESACTIVAR' : 'ACTIVAR'}
          </Button>
        </div>
    </Modal>
  );
};
