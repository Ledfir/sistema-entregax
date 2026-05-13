import React, { useRef, useEffect, useState } from 'react';
import { Card, Input, message } from 'antd';
import type { InputRef } from 'antd';
import apiClient from '@/api/axios';

const Salida: React.FC = () => {
  const inputRef = useRef<InputRef | null>(null);
  const [guia, setGuia] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();

    const handleMouseDown = () => {
      setTimeout(() => inputRef.current?.focus(), 0);
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleEnter = async () => {
    const guide = guia.trim();
    if (!guide) {
      message.warning('Ingresa una guía');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/cedis-usa/salida', { guia: guide });
      const data = res.data ?? {};
      const msgs: string[] = [];
      if (data.message) msgs.push(String(data.message));
      if (data.mensaje) msgs.push(String(data.mensaje));
      if (Array.isArray(data.messages)) data.messages.forEach((m: any) => msgs.push(String(m)));

      const success = data.status === 'success' || data.success === true || data.estatus === 'success';
      if (msgs.length) {
        msgs.forEach((m) => (success ? message.success(m) : message.error(m)));
      } else {
        success ? message.success('Salida registrada correctamente') : message.error('Error en la petición');
      }

      if (success) setGuia('');
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (err: any) {
      const text =
        err.response?.data?.message ||
        err.response?.data?.mensaje ||
        err.message ||
        'Error en la petición';
      message.error(text);
      setTimeout(() => inputRef.current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <Card title="Salida" style={{ width: '100%', maxWidth: 700 }}>
        <div style={{ paddingTop: 12 }}>
          <label style={{ display: 'block', textAlign: 'center', marginBottom: 8, fontWeight: 600 }}>
            Escanea guia a dar salida
          </label>
          <Input
            ref={inputRef}
            placeholder="Escanea guia a dar salida"
            value={guia}
            onChange={(e) => setGuia(e.target.value)}
            onPressEnter={handleEnter}
            disabled={loading}
            size="large"
          />
        </div>
      </Card>
    </div>
  );
};

export default Salida;
