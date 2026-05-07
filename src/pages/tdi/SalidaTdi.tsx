import React, { useRef, useEffect, useState } from 'react';
import { Card, Input } from 'antd';
import type { InputRef } from 'antd';

const SalidaTdi: React.FC = () => {
  const inputRef = useRef<InputRef | null>(null);
  const [guia, setGuia] = useState('');

  useEffect(() => {
    inputRef.current?.focus();

    const handleMouseDown = () => setTimeout(() => inputRef.current?.focus(), 0);
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleEnter = () => {
    const val = guia.trim();
    if (!val) return;
    // Placeholder: limpiar input y devolver foco
    setGuia('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div style={{ padding: 16 }}>
      <Card title="Salida TDI">
        <div style={{ paddingTop: 12 }}>
          <label style={{ display: 'block', textAlign: 'center', marginBottom: 8, fontWeight: 600 }}>Capturar Guia de Ingreso</label>
          <Input
            ref={inputRef}
            placeholder="Capturar Guia de Ingreso"
            value={guia}
            onChange={(e) => setGuia(e.target.value)}
            onPressEnter={handleEnter}
            size="large"
            style={{ width: '100%' }}
          />
        </div>
      </Card>
    </div>
  );
};

export default SalidaTdi;
export { SalidaTdi };
