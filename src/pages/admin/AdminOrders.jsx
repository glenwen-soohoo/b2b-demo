import { useState, useMemo } from 'react'
import {
  Table, Button, Space, Select, Input, Badge,
  Statistic, Row, Col, Card, Typography,
} from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import StatusTag from '../../components/StatusTag'
import OrderDetail from '../../components/OrderDetail'
import { fakeOrders, ORDER_STATUS } from '../../data/fakeData'

const { Title, Text } = Typography

const STATUS_OPTIONS = [
  { value: '', label: '全部狀態' },
  ...Object.entries(ORDER_STATUS).map(([k, v]) => ({ value: k, label: v.label })),
]

export default function AdminOrders() {
  const [orders, setOrders] = useState(fakeOrders)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterChannel, setFilterChannel] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() =>
    orders.filter(o =>
      (!filterStatus  || o.status === filterStatus) &&
      (!filterChannel || o.channelName.includes(filterChannel))
    ), [orders, filterStatus, filterChannel])

  const handleStatusChange = (id, next, log) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o
      const updated = { ...o, status: next, logs: [...o.logs, log] }
      setSelected(updated)
      return updated
    }))
  }

  const stats = useMemo(() => ({
    pending:            orders.filter(o => o.status === 'pending').length,
    insufficient_stock: orders.filter(o => o.status === 'insufficient_stock').length,
    awaiting_payment:   orders.filter(o => o.status === 'awaiting_payment').length,
    completed:          orders.filter(o => o.status === 'completed').length,
  }), [orders])

  const columns = [
    { title: '訂單編號', dataIndex: 'id', width: 170,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '通路', dataIndex: 'channelName', width: 140 },
    { title: '結算月', dataIndex: 'settlementMonth', width: 100 },
    { title: '品項', dataIndex: 'items', ellipsis: true,
      render: items => items.map(i => i.productName).join('、') },
    { title: '銷售額', dataIndex: 'items', width: 110,
      render: items => {
        const t = items.reduce((s, i) => s + i.qty * i.price, 0)
        return <Text strong style={{ color: '#1677ff' }}>${t.toLocaleString()}</Text>
      }},
    { title: '毛利', dataIndex: 'items', width: 100,
      render: items => {
        const p = items.reduce((s, i) => s + i.qty * (i.price - (i.cost ?? 0)), 0)
        return <Text style={{ color: p >= 0 ? '#52c41a' : '#ff4d4f' }}>${p.toLocaleString()}</Text>
      }},
    { title: '狀態', dataIndex: 'status', width: 110,
      render: s => <StatusTag status={s} /> },
    { title: '操作', width: 80,
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(r)}>詳情</Button>
      )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 20 }}>預訂 &amp; 結算管理</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { label: '預訂中',    value: stats.pending,            color: '#1677ff' },
          { label: '庫存不足 ⚠️', value: stats.insufficient_stock, color: '#ff4d4f' },
          { label: '待匯款',    value: stats.awaiting_payment,    color: '#fa8c16' },
          { label: '已完成',    value: stats.completed,           color: '#52c41a' },
        ].map(s => (
          <Col span={6} key={s.label}>
            <Card size="small" bordered style={{ textAlign: 'center' }}>
              <Statistic title={s.label} value={s.value}
                valueStyle={{ color: s.color, fontSize: 28 }} suffix="筆" />
            </Card>
          </Col>
        ))}
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Select options={STATUS_OPTIONS} value={filterStatus} onChange={setFilterStatus}
          style={{ width: 130 }} placeholder="篩選狀態" />
        <Input prefix={<SearchOutlined />} placeholder="通路名稱" value={filterChannel}
          onChange={e => setFilterChannel(e.target.value)} style={{ width: 180 }} allowClear />
      </Space>

      <Table dataSource={filtered} columns={columns} rowKey="id" size="small"
        pagination={{ pageSize: 10 }}
        rowClassName={r => r.status === 'insufficient_stock' ? 'row-error' : ''} />

      <OrderDetail order={selected} open={!!selected}
        onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
    </div>
  )
}
