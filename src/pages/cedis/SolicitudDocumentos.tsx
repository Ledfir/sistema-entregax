import React, { useEffect, useState } from 'react';
import { Card, Select, Input, Button, message, Spin } from 'antd';
import clienteService from '@/services/clienteService';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/store/authStore';

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
      const user = useAuthStore.getState().user;
      const iduser = user?.id ?? null;

      const payload = {
        cliente: selectedClient,
        solicitud: messageText.trim(),
        iduser,
      };

      const res = await apiClient.post('/cedis/enviar-solicitud-documentos', payload);
      const payloadRes = res?.data ?? {};

      const showApiMessages = (p: any) => {
        if (!p) return false;
        let shown = false;
        const push = (txt: any) => {
          if (!txt) return;
          shown = true;
          message.info(String(txt));
        };
        if (typeof p === 'string') { push(p); return shown; }
        if (p.message) push(p.message);
        if (p.messages && Array.isArray(p.messages)) p.messages.forEach((m: any) => push(m));
        if (p.error) push(p.error);
        if (p.errors) {
          if (typeof p.errors === 'string') push(p.errors);
          else if (Array.isArray(p.errors)) p.errors.forEach((e: any) => push(e));
          else if (typeof p.errors === 'object') Object.values(p.errors).forEach((v: any) => {
            if (Array.isArray(v)) v.forEach((x) => push(x)); else push(v);
          });
        }
        return shown;
      };

      const wasShown = showApiMessages(payloadRes);
      if (payloadRes?.status === 'success' || res.status === 200 || res.status === 201) {
        if (!wasShown) message.success('Solicitud enviada');
        setSelectedClient(null);
        setMessageText('');
      } else {
        if (!wasShown) message.info(payloadRes?.message || 'Respuesta inesperada del servidor');
      }
    } catch (err: any) {
      console.error('Error enviando solicitud', err);
      const resp = err?.response?.data;
      const showApiMessages = (p: any) => {
        if (!p) return false;
        let shown = false;
        const push = (txt: any) => {
          if (!txt) return;
          shown = true;
          message.error(String(txt));
        };
        if (typeof p === 'string') { push(p); return shown; }
        if (p.message) push(p.message);
        if (p.messages && Array.isArray(p.messages)) p.messages.forEach((m: any) => push(m));
        if (p.error) push(p.error);
        if (p.errors) {
          if (typeof p.errors === 'string') push(p.errors);
          else if (Array.isArray(p.errors)) p.errors.forEach((e: any) => push(e));
          else if (typeof p.errors === 'object') Object.values(p.errors).forEach((v: any) => {
            if (Array.isArray(v)) v.forEach((x) => push(x)); else push(v);
          });
        }
        return shown;
      };

      const shown = resp ? showApiMessages(resp) : false;
      if (!shown) message.error(err?.message || 'Error al enviar solicitud');
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
