import React, { useEffect, useState } from 'react';
import { Card, Select, Input, Button, message, Spin } from 'antd';
import clienteService from '@/services/clienteService';
import apiClient from '@/api/axios';

const { TextArea } = Input;

const SolicitudDocumentos: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | number | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const items = await clienteService.getAll();
        setClients(items);
      } catch (err: any) {
        console.error('Error cargando clientes', err);
        message.error(err?.message || 'Error al cargar clientes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSend = async () => {
    if (!selectedClient) {
      message.warning('Selecciona un cliente');
      return;
    }
    if (!messageText.trim()) {
      message.warning('Describe la información o documentos solicitados');
      return;
    }

    setSending(true);
    try {
      const payload = {
        customer_id: selectedClient,
        message: messageText.trim(),
      };

      // Endpoint: /cedis/solicitud-documentos (puede ajustarse según API)
      const res = await apiClient.post('/cedis/solicitud-documentos', payload);
      const payloadRes = res?.data ?? {};
      if (payloadRes?.status === 'success' || res.status === 200 || res.status === 201) {
        message.success('Solicitud enviada');
        setSelectedClient(null);
        setMessageText('');
      } else {
        message.info(payloadRes?.message || 'Solicitud enviada (respuesta inesperada)');
      }
    } catch (err: any) {
      console.error('Error enviando solicitud', err);
      const resp = err?.response?.data;
      if (resp?.message) message.error(resp.message);
      else if (err?.message) message.error(err.message);
      else message.error('Error al enviar solicitud');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <Card title="Solicitud de Documentos" style={{ width: 700 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Select
              showSearch
              placeholder="Selecciona un cliente"
              optionFilterProp="label"
              value={selectedClient ?? undefined}
              onChange={(val) => setSelectedClient(val)}
              filterOption={(input, option) => String(option?.label).toLowerCase().includes(input.toLowerCase())}
            >
              {clients.map((c) => {
                const token = c.token ?? c.token_id ?? c.id ?? c.suite;
                const nombre = c.name ?? c.nombre ?? c.business_name ?? '';
                const clave = c.suite ?? c.clavecliente ?? c.client_key ?? '';
                const label = `${nombre}${clave ? ` (${clave})` : ''}`;
                return (
                  <Select.Option key={String(token)} value={token} label={label}>
                    {label}
                  </Select.Option>
                );
              })}
            </Select>

            <TextArea rows={6} placeholder="Describe qué información o documentos requieres" value={messageText} onChange={(e) => setMessageText(e.target.value)} />

            <div style={{ textAlign: 'center' }}>
              <Button style={{ background: '#ff7a45', borderColor: '#ff7a45', color: '#fff' }} type="primary" onClick={handleSend} loading={sending}>
                Enviar solicitud
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SolicitudDocumentos;
