import React, { useRef, useEffect, useState } from 'react';
import { Card, Input, message } from 'antd';
import { cedisMaritimoService } from '@/services/cedisMaritimoService';
import { useAuthStore } from '@/store/authStore';

const SalidaMaritimo: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const inputRef = useRef<any>(null);
  const [log, setLog] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Salida Marítimo | CEDIS';
    focusInput();
    return () => { document.title = 'Sistema Entregax'; };
  }, []);

  const focusInput = () => {
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handlePressEnter = async () => {
    const value = log.trim();
    if (!value) {
      focusInput();
      return;
    }
    if (!user?.token) {
      message.error('No se encontró la sesión del usuario');
      focusInput();
      return;
    }
    setLoading(true);
    try {
      const res = await cedisMaritimoService.salidaLog(user.token, value);
      if (res?.status === 'success') {
        message.success(res.message || 'Salida registrada exitosamente');
      } else {
        message.error(res?.message || 'Error al registrar la salida');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al conectar con el servidor';
      message.error(msg);
    } finally {
      setLog('');
      setLoading(false);
      focusInput();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="Salida de LOG Marítimo">
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', gap: 6, maxWidth: '100%' }}>
          <label style={{ fontWeight: 500, fontSize: 14 }}>Capturar LOG</label>
          <Input
            ref={inputRef}
            placeholder="Capturar LOG"
          value={log}
          onChange={(e) => setLog(e.target.value)}
          onPressEnter={handlePressEnter}
          onBlur={focusInput}
          disabled={loading}
          allowClear
          size="large"
        />
        </div>
      </Card>
    </div>
  );
};

export default SalidaMaritimo;
