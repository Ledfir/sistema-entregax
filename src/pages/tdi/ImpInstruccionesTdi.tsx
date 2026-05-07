import React, { useRef, useEffect, useState } from 'react';
import { Card, Input, Alert } from 'antd';
import type { InputRef } from 'antd';
import apiClient from '@/api/axios';

const ImpInstruccionesTdi: React.FC = () => {
  const inputRef = useRef<InputRef | null>(null);
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<Array<{ type: string; text: string }>>([]);

  useEffect(() => {
    inputRef.current?.focus();

    const handleMouseDown = () => {
      setTimeout(() => inputRef.current?.focus(), 0);
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const onEnter = () => {
    const guide = value?.trim();
    if (!guide) {
      setMessages([{ type: 'error', text: 'Ingresa una guía' }]);
      return;
    }

    setMessages([]);
    apiClient
      .get(`/cedis/imprimir-instrucciones/tdi/${encodeURIComponent(guide)}`)
      .then((res) => {
        const payload = res.data || {};
        const isSuccess = payload.success === true || payload.status === 'success' || payload.estatus === 'success' || payload.status === 'ok';

        const msgs: Array<{ type: string; text: string }> = [];
        if (payload.message) msgs.push({ type: isSuccess ? 'success' : 'error', text: String(payload.message) });
        if (payload.mensaje) msgs.push({ type: isSuccess ? 'success' : 'error', text: String(payload.mensaje) });
        if (Array.isArray(payload.messages)) payload.messages.forEach((m: any) => msgs.push({ type: isSuccess ? 'success' : 'error', text: String(m) }));

        if (!isSuccess) {
          setMessages(msgs.length ? msgs : [{ type: 'error', text: 'Error en la API' }]);
          return;
        }

        const html = String(payload.message || payload.html || payload.data || '');
        setMessages([{ type: 'success', text: 'Instrucción lista para imprimir' }]);
        setValue('');
        inputRef.current?.focus();

        try {
          const iframe = document.createElement('iframe');
          iframe.style.position = 'absolute';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.left = '-9999px';
          iframe.style.top = '0';
          iframe.setAttribute('aria-hidden', 'true');
          document.body.appendChild(iframe);

          const idoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (idoc) {
            idoc.open();
            idoc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Impresión</title></head><body>${html}</body></html>`);
            idoc.close();
          }

          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } catch (e) {
              console.error('Error al imprimir desde iframe', e);
            }
            setTimeout(() => {
              try { document.body.removeChild(iframe); } catch (e) { /* ignore */ }
            }, 500);
          }, 500);
        } catch (e) {
          console.error('No se pudo crear iframe para impresión, abriendo en nueva ventana como fallback', e);
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Impresión</title></head><body>${html}</body></html>`);
            printWindow.document.close();
            printWindow.onload = () => { printWindow.focus(); printWindow.print(); };
          }
        }
      })
      .catch((err) => {
        const text = err?.response?.data?.message || err.message || 'Error en la petición';
        setMessages([{ type: 'error', text }]);
      });
  };

  return (
    <div style={{ padding: 16 }}>
      <Card title="Impresion de instrucciones">
        <div style={{ paddingTop: 12 }}>
          <label style={{ display: 'block', textAlign: 'center', marginBottom: 8, fontWeight: 600 }}>Escanea guia de ingreso (AIR)</label>
          <Input
            placeholder="Escanea guia de ingreso (AIR)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onPressEnter={onEnter}
            ref={inputRef}
            size="large"
            style={{ width: '100%' }}
          />

          <div style={{ marginTop: 12 }}>
            {messages.map((m, idx) => (
              <Alert key={idx} style={{ marginBottom: 8 }} message={m.text} type={m.type === 'error' ? 'error' : 'success'} showIcon />
            ))}
          </div>

          {/* hidden div removed to avoid injecting API HTML into DOM */}
        </div>
      </Card>
    </div>
  );
};

export default ImpInstruccionesTdi;
export { ImpInstruccionesTdi };
