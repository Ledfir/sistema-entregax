import React from 'react'
import { Card, Input, notification, Button, Space } from 'antd'
import apiClient from '@/api/axios'

const ImpInstruccionesUsa: React.FC = () => {
  const inputRef = React.useRef<any>(null)
  const [value, setValue] = React.useState('')

  React.useEffect(() => {
    const el = inputRef.current
    if (el) el.focus()
  }, [])

  const ensureFocus = () => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const sendGuide = async (guia: string) => {
    const g = guia.trim()
    if (!g) {
      notification.warning({ message: 'Aviso', description: 'Capture una guía válida' })
      return
    }

    try {
      const resp = await apiClient.get(`/cedis/imprimir-instrucciones/usa/${encodeURIComponent(g)}`)
      const payload = resp.data
      if (payload?.status === 'success') {
        // mostrar mensaje success si lo trae
        if (payload.message) notification.success({ message: 'Success', description: payload.message })
        // Si viene HTML en data, imprimir
        if (payload.data) {
          const html = payload.data
          const iframe = document.createElement('iframe')
          iframe.style.position = 'fixed'
          iframe.style.right = '0'
          iframe.style.bottom = '0'
          iframe.style.width = '0'
          iframe.style.height = '0'
          iframe.style.border = '0'
          document.body.appendChild(iframe)
          const doc = iframe.contentWindow?.document
          if (doc) {
            doc.open()
            doc.write(html)
            doc.close()
            setTimeout(() => {
              try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch (err) { console.error(err) }
              setTimeout(() => { try { document.body.removeChild(iframe) } catch(e){ } }, 1000)
            }, 300)
          } else {
            notification.error({ message: 'Error', description: 'No se pudo abrir el documento de impresión' })
            try { document.body.removeChild(iframe) } catch(e){}
          }
        }
      } else {
        notification.error({ message: 'Error', description: payload?.message || 'Respuesta inesperada del servidor' })
      }
    } catch (err: any) {
      console.error('Error al solicitar impresión', err)
      notification.error({ message: 'Error', description: err?.response?.data?.message || err.message || 'Error en la petición' })
    } finally {
      setValue('')
      ensureFocus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendGuide(value)
  }

  return (
    <div style={{ padding: 12 }}>
      <Card title="Impresion de instrucciones US" bordered>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: 8, minWidth: 160 }}>Escanea guia de ingreso</label>
          <Space>
            <Input
              ref={(el) => { inputRef.current = el as any }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => setTimeout(() => inputRef.current?.focus(), 50)}
              onKeyDown={handleKeyDown}
              placeholder="Escanea guia..."
              autoFocus
              style={{ width: 360 }}
            />
            <Button type="primary" onClick={() => sendGuide(value)}>Enviar</Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default ImpInstruccionesUsa
