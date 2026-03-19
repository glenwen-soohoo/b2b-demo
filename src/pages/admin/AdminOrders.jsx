import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import {
  Table, Button, Space, Input, Badge, Tabs,
  Statistic, Row, Col, Card, Typography, Tag, Alert,
} from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import StatusTag from '../../components/StatusTag'
import OrderDetail from '../../components/OrderDetail'
import { preOrders as initPreOrders } from '../../data/fakeData'

const { Title, Text } = Typography

// ── 業務確認 Tab ─────────────────────────────────
function SalesTab({ preOrderList, setPreOrderList }) {
  const [filterChannel, setFilterChannel] = useState('')
  const [selected, setSelected] = useState(null)

  const list = useMemo(() =>
    preOrderList.filter(o =>
      o.status === 'pending_sales' &&
      (!filterChannel || o.channelName.includes(filterChannel))
    ), [preOrderList, filterChannel])

  const handleStatusChange = (id, next, log, extra) => {
    setPreOrderList(prev => prev.map(o => {
      if (o.id !== id) return o
      const updated = {
        ...o,
        status: next,
        logs: [...o.logs, log],
        ...(extra?.salesAdjustedItems ? { salesAdjustedItems: extra.salesAdjustedItems } : {}),
        ...(extra?.salesNote !== undefined ? { salesNote: extra.salesNote } : {}),
      }
      setSelected(updated)
      return updated
    }))
  }

  const columns = [
    { title: 'B2B訂單號', dataIndex: 'id', width: 170,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '通路', dataIndex: 'channelName', width: 140 },
    { title: '品項摘要', dataIndex: 'items', ellipsis: true,
      render: items => items.map(i => i.productName).join('、') },
    { title: '金額', dataIndex: 'items', width: 100,
      render: items => {
        const t = items.reduce((s, i) => s + i.qty * i.price, 0)
        return <Text strong style={{ color: '#1677ff' }}>${t.toLocaleString()}</Text>
      }},
    { title: '下單日期', dataIndex: 'createdAt', width: 110 },
    { title: '狀態', dataIndex: 'status', width: 120,
      render: s => <StatusTag status={s} /> },
    { title: '', width: 70, align: 'center',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(r)}>查看</Button>
      )},
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="通路名稱" value={filterChannel}
          onChange={e => setFilterChannel(e.target.value)} style={{ width: 200 }} allowClear />
      </Space>
      {list.length === 0
        ? <Alert type="success" showIcon message="目前沒有待業務確認的B2B訂單" />
        : (
          <Table
            dataSource={list}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 20 }}
          />
        )
      }
      <OrderDetail
        order={selected} open={!!selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </>
  )
}

// ── 倉庫確認 Tab（唯讀）────────────────────────────
function WarehouseTab({ preOrderList }) {
  const [filterChannel, setFilterChannel] = useState('')

  const list = useMemo(() =>
    preOrderList.filter(o =>
      o.status === 'pending_warehouse' &&
      (!filterChannel || o.channelName.includes(filterChannel))
    ), [preOrderList, filterChannel])

  const columns = [
    { title: 'B2B訂單號', dataIndex: 'id', width: 170,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '通路', dataIndex: 'channelName', width: 140 },
    { title: '品項數', dataIndex: 'items', width: 70, align: 'center',
      render: items => items.length },
    { title: '金額', dataIndex: 'items', width: 100,
      render: items => {
        const t = items.reduce((s, i) => s + i.qty * i.price, 0)
        return <Text strong style={{ color: '#1677ff' }}>${t.toLocaleString()}</Text>
      }},
    { title: '業務確認日期', dataIndex: 'logs', width: 130,
      render: logs => {
        const l = [...logs].reverse().find(l => l.action.includes('業務確認完成'))
        return l ? <Text type="secondary" style={{ fontSize: 12 }}>{l.time.split(' ')[0]}</Text> : '—'
      }},
    { title: '狀態', dataIndex: 'status', width: 120,
      render: s => <StatusTag status={s} /> },
    { title: '操作說明', width: 180,
      render: () => (
        <Text type="secondary" style={{ fontSize: 12 }}>請至 /warehouse/orders 操作</Text>
      )},
  ]

  return (
    <>
      <Alert type="info" showIcon style={{ marginBottom: 16 }}
        message="此頁面為唯讀，供管理者查看進度"
        description="實際操作由倉庫人員在倉庫專屬介面（/warehouse/orders）完成。"
      />
      <Space style={{ marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="通路名稱" value={filterChannel}
          onChange={e => setFilterChannel(e.target.value)} style={{ width: 200 }} allowClear />
      </Space>
      {list.length === 0
        ? <Alert type="success" showIcon message="目前沒有待倉庫確認的B2B訂單" />
        : (
          <Table
            dataSource={list}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 20 }}
          />
        )
      }
    </>
  )
}

// ── 訂單紀錄 Tab ──────────────────────────────────
function OrderRecordsTab({ preOrderList }) {
  const [filterChannel, setFilterChannel] = useState('')

  const list = useMemo(() =>
    preOrderList.filter(o =>
      ['ordered', 'settled'].includes(o.status) &&
      (!filterChannel || o.channelName.includes(filterChannel))
    ), [preOrderList, filterChannel])

  const columns = [
    { title: 'B2B訂單號', dataIndex: 'id', width: 170,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '通路', dataIndex: 'channelName', width: 140 },
    { title: '品項摘要', dataIndex: 'items', ellipsis: true,
      render: items => items.map(i => i.productName).join('、') },
    { title: '金額', dataIndex: 'items', width: 100,
      render: items => {
        const t = items.reduce((s, i) => s + i.qty * i.price, 0)
        return <Text strong style={{ color: '#1677ff' }}>${t.toLocaleString()}</Text>
      }},
    { title: '後台訂單號', dataIndex: 'backendOrderId', width: 130,
      render: v => v ? <Tag color="cyan" style={{ fontSize: 11 }}>{v}</Tag> : <Text type="secondary">—</Text> },
    { title: '狀態', dataIndex: 'status', width: 120,
      render: s => <StatusTag status={s} /> },
    { title: '結算月', dataIndex: 'settlementMonth', width: 90 },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="通路名稱" value={filterChannel}
          onChange={e => setFilterChannel(e.target.value)} style={{ width: 200 }} allowClear />
      </Space>
      {list.length === 0
        ? <Alert type="info" showIcon message="目前沒有已成立訂單" />
        : (
          <Table
            dataSource={list}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 20 }}
            rowClassName={r => r.status === 'settled' ? 'row-settled' : ''}
          />
        )
      }
    </>
  )
}

// ── 主頁面 ────────────────────────────────────────
export default function AdminOrders() {
  const [preOrderList, setPreOrderList] = useState(initPreOrders)

  const stats = useMemo(() => ({
    pendingSales:     preOrderList.filter(o => o.status === 'pending_sales').length,
    pendingWarehouse: preOrderList.filter(o => o.status === 'pending_warehouse').length,
    ordered:          preOrderList.filter(o => o.status === 'ordered').length,
    settled:          preOrderList.filter(o => o.status === 'settled').length,
  }), [preOrderList])

  const tabItems = [
    {
      key: 'sales',
      label: (
        <Space>
          待業務確認
          {stats.pendingSales > 0 && <Badge count={stats.pendingSales} size="small" />}
        </Space>
      ),
      children: <SalesTab preOrderList={preOrderList} setPreOrderList={setPreOrderList} />,
    },
    {
      key: 'warehouse',
      label: (
        <Space>
          待倉庫確認
          {stats.pendingWarehouse > 0 && <Badge count={stats.pendingWarehouse} color="orange" size="small" />}
        </Space>
      ),
      children: <WarehouseTab preOrderList={preOrderList} />,
    },
    {
      key: 'records',
      label: '訂單紀錄',
      children: <OrderRecordsTab preOrderList={preOrderList} />,
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 20 }}>B2B訂單管理</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { label: '待業務確認', value: stats.pendingSales,     color: '#1677ff' },
          { label: '待倉庫確認', value: stats.pendingWarehouse, color: '#fa8c16' },
          { label: '本月已成立訂單', value: stats.ordered,      color: '#13c2c2' },
          { label: '已結算', value: stats.settled,             color: '#722ed1' },
        ].map(s => (
          <Col span={6} key={s.label}>
            <Card size="small" bordered style={{ textAlign: 'center' }}>
              <Statistic title={s.label} value={s.value}
                valueStyle={{ color: s.color, fontSize: 28 }} suffix="筆" />
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs items={tabItems} />

      <style>{`
        .row-settled td { background: #f9f0ff !important; color: #888; }
        .row-settled:hover td { background: #efdbff !important; }
      `}</style>
    </div>
  )
}
