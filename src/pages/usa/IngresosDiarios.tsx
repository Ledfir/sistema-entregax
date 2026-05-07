import React from 'react'
import { Card, DatePicker, Button, Space, Table, Input, Row, Col, notification, Spin } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import apiClient from '@/api/axios'

const { Search } = Input

const IngresosDiarios: React.FC = () => {
  const [fecha, setFecha] = React.useState(dayjs())
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<any[]>([])
  const [search, setSearch] = React.useState('')

  const fetchData = async () => {
    const fechaStr = fecha.format('YYYY-MM-DD')
    setLoading(true)
    try {
      const resp = await apiClient.get(`/cedis/ingresos-diarios/usa/${fechaStr}`)
      const payload = resp.data
      if (payload?.status === 'success') {
        setData(payload.data || [])
      } else {
        notification.error({ message: 'Error', description: payload?.message || 'Respuesta inesperada' })
      }
    } catch (err: any) {
      console.error('Error fetching ingresos diarios', err)
      notification.error({ message: 'Error', description: err?.response?.data?.message || err.message || 'Error al consultar API' })
    } finally {
      setLoading(false)
    }
  }

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((r) =>
      (r.guiaingreso || '').toLowerCase().includes(q) ||
      (r.suite || '').toLowerCase().includes(q) ||
      ('' + (r.ruta || '')).toLowerCase().includes(q)
    )
  }, [data, search])

  const columns: ColumnsType<any> = [
    { title: 'Guia de ingreso', dataIndex: 'guiaingreso', key: 'guiaingreso', align: 'center' },
    { title: 'Suite', dataIndex: 'suite', key: 'suite', align: 'center' },
    { title: 'Ruta', dataIndex: 'ruta', key: 'ruta', align: 'center' },
    { title: 'Hora de entrada', dataIndex: 'created', key: 'created', render: (v: string) => dayjs(v).format('HH:mm'), align: 'center' },
  ]

  const handlePrint = () => {
    const title = `LISTADO DE GUIAS INGRESADAS EL ${fecha.format('DD-MM-YYYY')}`
    const rows = filtered.map(r => `
      <tr>
        <td style="padding:8px">${r.guiaingreso || ''}</td>
        <td style="padding:8px">${r.suite || ''}</td>
        <td style="padding:8px">${r.ruta || ''}</td>
        <td style="padding:8px">${dayjs(r.created).format('HH:mm:ss')}</td>
      </tr>
    `).join('')

    const html = `
      <html>
      <head>
        <title>${title}</title>
        <style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd}</style>
      </head>
      <body>
        <h2 style="text-align:center">${title}</h2>
        <p style="text-align:center">GUIAS TOTALES: ${filtered.length}</p>
        <table>
          <thead>
            <tr><th>Guia de ingreso</th><th>Suite</th><th>Ruta</th><th>Hora de entrada</th></tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `

    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      w.print()
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <Card title="Guias ingresadas diariamente" bordered>
        <Row gutter={12} align="middle">
          <Col>
            <DatePicker value={fecha} onChange={(d) => setFecha(d || dayjs())} />
          </Col>
          <Col>
            <Button type="primary" onClick={fetchData} loading={loading}>Generar reporte</Button>
          </Col>
          <Col flex="auto">
            <Space style={{ float: 'right' }}>
              <Button onClick={handlePrint} type="default">Imprimir</Button>
            </Space>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h3>LISTADO DE GUIAS INGRESADAS EL {fecha.format('DD-MM-YYYY')}</h3>
              <div>GUIAS TOTALES: {data.length}</div>
            </Col>
            <Col>
              <Search placeholder="Buscar" onSearch={(v) => setSearch(v)} onChange={(e) => setSearch(e.target.value)} style={{ width: 240 }} allowClear />
            </Col>
          </Row>

          <div style={{ marginTop: 12 }}>
            {loading ? (
              <Spin />
            ) : (
              <Table
                dataSource={filtered.map((r: any, i: number) => ({ ...r, key: i }))}
                columns={columns}
                pagination={{ pageSize: 25 }}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default IngresosDiarios
