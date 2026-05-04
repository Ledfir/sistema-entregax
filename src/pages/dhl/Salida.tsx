import React, { useRef, useEffect, useState } from 'react';
import { Card, Form, Input, message } from 'antd';
import type { InputRef } from 'antd';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/store/authStore';

const Salida: React.FC = () => {
  const [stage, setStage] = useState<'capture' | 'salida'>('capture');
  const [guiaUnica, setGuiaUnica] = useState('');
  const [guiaSalida, setGuiaSalida] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef1 = useRef<InputRef>(null);
  const inputRef2 = useRef<InputRef>(null);
  const stageRef = useRef(stage);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    stageRef.current = stage;
    if (stage === 'capture') {
      inputRef1.current?.focus();
    } else {
      inputRef2.current?.focus();
    }
  }, [stage]);

  const handleBlur = () => {
    setTimeout(() => {
      if (stageRef.current === 'capture') {
        inputRef1.current?.focus();
      } else {
        inputRef2.current?.focus();
      }
    }, 0);
  };

  const handleGuiaUnicaEnter = () => {
    const val = guiaUnica.trim();
    if (!val) {
      message.warning('Ingresa la guía única');
      return;
    }
    setStage('salida');
  };

  const handleSubmit = async () => {
    const val = guiaSalida.trim();
    if (!val) {
      message.warning('Ingresa la guía de salida');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('cedis/salida', {
        token: user?.id,
        guiasalida: guiaUnica.trim(),
        tipo: 'dhl',
      });

      const msg = response.data?.message || response.data?.mensaje || 'Operación exitosa';
      message.success(msg);

      // Reiniciar flujo
      setGuiaUnica('');
      setGuiaSalida('');
      setStage('capture');
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        'Error al procesar la solicitud';
      message.error(msg);

      // Regresar al segundo input para reintentar
      setTimeout(() => inputRef2.current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="DHL - Salida a destino">
        <Form layout="vertical">
          {stage === 'capture' && (
            <Form.Item label="Capturar Guia Unica" name="guiaUnica">
              <Input
                ref={inputRef1}
                placeholder="Ingresa la guía única"
                value={guiaUnica}
                onChange={(e) => setGuiaUnica(e.target.value)}
                onPressEnter={handleGuiaUnicaEnter}
                onBlur={handleBlur}
                disabled={loading}
              />
            </Form.Item>
          )}

          {stage === 'salida' && (
            <Form.Item label="Ingresar guia de salida" name="guiaSalida">
              <Input
                ref={inputRef2}
                placeholder="Ingresa la guía de salida"
                value={guiaSalida}
                onChange={(e) => setGuiaSalida(e.target.value)}
                onPressEnter={handleSubmit}
                onBlur={handleBlur}
                disabled={loading}
              />
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default Salida;
