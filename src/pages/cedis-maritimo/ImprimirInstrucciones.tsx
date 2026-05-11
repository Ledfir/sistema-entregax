import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Form, message } from 'antd';
import { ScanOutlined } from '@ant-design/icons';
import { cedisMaritimoService } from '@/services/cedisMaritimoService';

const ImprimirInstrucciones: React.FC = () => {
  const [form] = Form.useForm();
  const [scanValue, setScanValue] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);

  // Mantener el foco constante en el input
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Foco inicial
    focusInput();

    // Mantener foco cuando se hace clic fuera
    const handleClick = () => {
      setTimeout(focusInput, 0);
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleScanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanValue(e.target.value);
  };

  const imprimirHTML = (htmlContent: string) => {
    // Crear un iframe oculto para imprimir
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      // Esperar a que cargue el contenido antes de imprimir
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Remover el iframe después de imprimir
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    } else {
      message.error('No se pudo preparar la impresión');
      document.body.removeChild(iframe);
    }
  };

  const handleScanSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scanValue.trim() && !loading) {
      const guide = scanValue.trim();
      setLoading(true);

      try {
        const response = await cedisMaritimoService.getInstruccionesMaritimo(guide);
        
        if (response.status === 'success' && response.data) {
          message.success('Instrucciones cargadas, abriendo ventana de impresión...');
          imprimirHTML(response.data);
        } else {
          const errorMsg = response.message || 'No se pudo obtener las instrucciones';
          message.error(errorMsg);
        }
      } catch (error: any) {
        console.error('Error al obtener instrucciones:', error);
        const errorMessage = error?.response?.data?.message || 
                           error?.message || 
                           'Error al obtener las instrucciones';
        message.error(errorMessage);
      } finally {
        setScanValue('');
        setLoading(false);
        
        // Mantener el foco después del escaneo
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 0);
      }
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Impresión de instrucciones">
        <Form form={form} layout="vertical">
          <Form.Item label="Escanea LOGS BL">
            <Input
              ref={inputRef}
              size="large"
              prefix={<ScanOutlined />}
              placeholder="Escanea o ingresa el LOG BL"
              value={scanValue}
              onChange={handleScanChange}
              onKeyPress={handleScanSubmit}
              autoFocus
              disabled={loading}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ImprimirInstrucciones;
