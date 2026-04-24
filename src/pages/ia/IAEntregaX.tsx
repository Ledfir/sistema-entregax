import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, Avatar, notification } from 'antd';
import { UserOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';
import apiClient from '@/api/axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './IAEntregaX.css';

// Renderizado normal (sin efecto de tipeo)

export const IAEntregaX = () => {
  const [messages, setMessages] = useState<Array<{ id: number; sender: 'user' | 'bot'; text: string }>>([
    { id: 1, sender: 'bot', text: 'Hola, soy IA EntregaX. ¿En qué puedo ayudarte?' },
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll al final cuando cambian los mensajes
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), sender: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      setLoading(true);
      const resp = await apiClient.post('/chatbot/get-response', { message: text });
      // Intentar obtener la respuesta en varios campos posibles
      const reply = resp?.data?.reply || resp?.data?.message || resp?.data?.data || (typeof resp?.data === 'string' ? resp.data : null) || 'No se recibió respuesta';
      const botMsg = { id: Date.now() + 1, sender: 'bot' as const, text: String(reply) };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error('Error al obtener respuesta del chatbot:', error);
      notification.error({ message: 'Error', description: error?.response?.data?.message || 'No se pudo obtener respuesta del chatbot' });
      const botMsg = { id: Date.now() + 1, sender: 'bot' as const, text: 'Error al obtener respuesta del servidor.' };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onPressEnter = () => sendMessage();

  return (
    <div style={{ padding: 24 }}>
      <Card title="ChatBot" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="ia-chat-container">
          <div className="ia-chat-messages" ref={listRef}>
            <List
              dataSource={messages}
              renderItem={item => (
                <List.Item className={`ia-message ia-message-${item.sender}`}>
                  <div className="ia-message-avatar">
                    <Avatar icon={item.sender === 'user' ? <UserOutlined /> : <RobotOutlined />} />
                  </div>
                  <div className="ia-message-body">
                    <div className="ia-message-title">{item.sender === 'user' ? 'Tú' : 'IA EntregaX'}</div>
                    <div className="ia-message-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.text}</ReactMarkdown>
                      </div>
                  </div>
                </List.Item>
              )}
            />
          </div>

          <div className="ia-chat-input">
            <Input.TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              onPressEnter={(e: any) => { e.preventDefault(); onPressEnter(); }}
              rows={2}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} style={{ marginTop: 8 }} loading={loading}>
              Enviar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IAEntregaX;
