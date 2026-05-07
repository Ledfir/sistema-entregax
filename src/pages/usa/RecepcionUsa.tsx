import React, { useRef, useEffect, useState } from 'react';
import { Card, Input, message } from 'antd';
import type { InputRef } from 'antd';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/store/authStore';

const RecepcionUsa: React.FC = () => {
  const inputRef = useRef<InputRef | null>(null);
  const [guia, setGuia] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

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
      const payload = {
        tipo: 'usa',
        guiaingreso: guide,
        token: user?.token,
      };

      const res = await apiClient.post('cedis/recepcion', payload);
      const data = res.data || {};
      const msgs: string[] = [];
      if (data.message) msgs.push(String(data.message));
      if (data.mensaje) msgs.push(String(data.mensaje));
      if (Array.isArray(data.messages)) data.messages.forEach((m: any) => msgs.push(String(m)));

      const success = data.status === 'success' || data.success === true || data.estatus === 'success';
      if (msgs.length) {
        msgs.forEach((m) => (success ? message.success(m) : message.error(m)));
      } else {
        success ? message.success('Operación exitosa') : message.error('Error en la petición');
      }

      if (success) setGuia('');
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (err: any) {
      const text = err.response?.data?.message || err.response?.data?.mensaje || err.message || 'Error en la petición';
      message.error(text);
      setTimeout(() => inputRef.current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Card title="US - Recepcion de cartones en Monterrey">
        <div style={{ paddingTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Capture guia local</label>
          <Input
            ref={inputRef}
            placeholder="Capture guia local"
            value={guia}
            onChange={(e) => setGuia(e.target.value)}
            onPressEnter={handleEnter}
            disabled={loading}
            size="large"
            style={{ maxWidth: 400 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default RecepcionUsa;
