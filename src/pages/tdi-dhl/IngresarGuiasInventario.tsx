import React, { useRef, useEffect, useState } from 'react';
import { Card, Input, message } from 'antd';
import type { InputRef } from 'antd';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/store/authStore';

const STEPS = [
  { key: 'guiaDhl', label: 'Ingresa guia DHL (10 digitos)', placeholder: 'Ingresa guia DHL (10 digitos)' },
  { key: 'guiaUnica', label: 'Ingresa guia unica (21 digitos)', placeholder: 'Ingresa guia unica (21 digitos)' },
  { key: 'suite', label: 'Capturar SUITE Cliente', placeholder: 'Capturar SUITE Cliente' },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

const IngresarGuiasInventario: React.FC = () => {
  const refs = {
    guiaDhl: useRef<InputRef | null>(null),
    guiaUnica: useRef<InputRef | null>(null),
    suite: useRef<InputRef | null>(null),
  };

  const [values, setValues] = useState<Record<StepKey, string>>({
    guiaDhl: '',
    guiaUnica: '',
    suite: '',
  });
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  const activeKey = STEPS[step].key;

  useEffect(() => {
    refs[activeKey].current?.focus();

    const handleMouseDown = () => {
      setTimeout(() => refs[activeKey].current?.focus(), 0);
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [step]);

  const handleChange = (key: StepKey, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleEnter = async (currentStep: number) => {
    const key = STEPS[currentStep].key;
    if (!values[key].trim()) {
      message.warning(`Ingresa el campo: ${STEPS[currentStep].label}`);
      return;
    }

    // Si no es el último paso, avanza al siguiente
    if (currentStep < STEPS.length - 1) {
      setStep(currentStep + 1);
      return;
    }

    // Último paso: enviar al backend
    setLoading(true);
    try {
      const payload = {
        guiaingreso: values.guiaDhl.trim(),
        guiaunica: values.guiaUnica.trim(),
        suite: values.suite.trim(),
        token: user?.token,
        tipo: 'tdi-express',
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

      if (success) {
        setValues({ guiaDhl: '', guiaUnica: '', suite: '' });
        setStep(0);
      } else {
        setTimeout(() => refs[activeKey].current?.focus(), 0);
      }
    } catch (err: any) {
      const text =
        err.response?.data?.message || err.response?.data?.mensaje || err.message || 'Error en la petición';
      message.error(text);
      setTimeout(() => refs[activeKey].current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Card title="TDI - DHL - Ingreso a inventario">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: '100%', paddingTop: 12 }}>
          {STEPS.map((s, i) => (
            <div key={s.key} style={{ display: step === i ? 'block' : 'none' }}>
              <label style={{ display: 'block', textAlign: 'center', marginBottom: 8, fontWeight: 600 }}>{s.label}</label>
              <Input
                ref={refs[s.key]}
                placeholder={s.placeholder}
                value={values[s.key]}
                onChange={(e) => handleChange(s.key, e.target.value)}
                onPressEnter={() => handleEnter(i)}
                disabled={loading}
                size="large"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default IngresarGuiasInventario;
