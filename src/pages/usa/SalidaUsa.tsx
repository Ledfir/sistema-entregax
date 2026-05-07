import React, { useRef, useEffect, useState } from 'react';
import { Card, Input, message } from 'antd';
import type { InputRef } from 'antd';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/store/authStore';

const SalidaUsa: React.FC = () => {
  const input1Ref = useRef<InputRef | null>(null);
  const input2Ref = useRef<InputRef | null>(null);
  const [guiaIngreso, setGuiaIngreso] = useState('');
  const [guiaSalida, setGuiaSalida] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  // Mantener foco constante en el input activo
  useEffect(() => {
    const activeRef = step === 1 ? input1Ref : input2Ref;
    activeRef.current?.focus();

    const handleMouseDown = () => {
      setTimeout(() => activeRef.current?.focus(), 0);
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [step]);

  const handleEnterStep1 = () => {
    if (!guiaIngreso.trim()) {
      message.warning('Ingresa una guía');
      return;
    }
    setStep(2);
  };

  const handleEnterStep2 = async () => {
    const guide = guiaSalida.trim();
    if (!guide) {
      message.warning('Ingresa una guía de salida');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tipo: 'usa',
        guiaingreso: guiaIngreso.trim(),
        guiasalida: guide,
        token: user?.token,
      };

      const res = await apiClient.post('cedis/salida', payload);
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

      if (success) {
        setGuiaIngreso('');
        setGuiaSalida('');
        setStep(1);
      } else {
        setTimeout(() => input2Ref.current?.focus(), 0);
      }
    } catch (err: any) {
      const text =
        err.response?.data?.message || err.response?.data?.mensaje || err.message || 'Error en la petición';
      message.error(text);
      setTimeout(() => input2Ref.current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Card title="Salida US">
        <div style={{ paddingTop: 12 }}>
          {step === 1 && (
            <>
              <label style={{ display: 'block', textAlign: 'center', marginBottom: 8, fontWeight: 600 }}>
                Capturar guia de ingreso (QR Inst)
              </label>
              <Input
                ref={input1Ref}
                placeholder="Capturar guia de ingreso (QR Inst)"
                value={guiaIngreso}
                onChange={(e) => setGuiaIngreso(e.target.value)}
                onPressEnter={handleEnterStep1}
                disabled={loading}
                size="large"
                style={{ maxWidth: '100%' }}
              />
            </>
          )}
          {step === 2 && (
            <>
              <label style={{ display: 'block', textAlign: 'center', marginBottom: 8, fontWeight: 600 }}>
                Ingrese guia de salida
              </label>
              <Input
                ref={input2Ref}
                placeholder="Ingrese guia de salida"
                value={guiaSalida}
                onChange={(e) => setGuiaSalida(e.target.value)}
                onPressEnter={handleEnterStep2}
                disabled={loading}
                size="large"
                style={{ maxWidth: '100%' }}
              />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SalidaUsa;
