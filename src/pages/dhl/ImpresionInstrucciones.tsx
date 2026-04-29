import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Alert } from 'antd';
import type { InputRef } from 'antd';
import apiClient from '@/api/axios';

export const ImpresionInstrucciones: React.FC = () => {
  const [value, setValue] = useState('');
  const inputRef = useRef<InputRef | null>(null);
  const [messages, setMessages] = useState<Array<{ type: string; text: string }>>([]);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const hiddenDivRef = useRef<HTMLDivElement | null>(null);

  const onEnter = () => {
    const guide = value?.trim();
    if (!guide) {
      setMessages([{ type: 'error', text: 'Ingresa una guía' }]);
      return;
    }

    setMessages([]);
    apiClient
      .get(`/cedis/imprimir-instrucciones/dhl/${encodeURIComponent(guide)}`)
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

        // Si success, la API devuelve HTML en message
        const html = String(payload.message || payload.html || payload.data || '');
        setHtmlContent(html);
        setMessages([{ type: 'success', text: 'Instrucción lista para imprimir' }]);
        // Limpiar input y devolver foco
        setValue('');
        inputRef.current?.focus();

        // Imprimir usando un iframe oculto en la misma página (no abrir nueva pestaña)
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

          // Dar un pequeño tiempo para garantizar renderizado, luego imprimir desde el iframe
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } catch (e) {
              console.error('Error al imprimir desde iframe', e);
            }
            // Remover iframe después de un retraso
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

  useEffect(() => {
    // Enfocar al montar
    inputRef.current?.focus();

    // Re-enfocar tras cualquier click en la página (para mantener foco en esta sección)
    const handleMouseDown = () => {
      // Pequeño timeout para dejar que el click original se procese
      setTimeout(() => inputRef.current?.focus(), 0);
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Card title="DHL - Impresion de instrucciones">
        <div style={{ paddingTop: 12 }}>
          <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 8 }}>Capturar Guia Unica</div>
          <Input
            placeholder="Introduce número de guía o guía única y presiona Enter"
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

          {/* Div oculto que contiene el HTML recibido */}
          <div ref={hiddenDivRef} style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </Card>
    </div>
  );
};

export default ImpresionInstrucciones;
