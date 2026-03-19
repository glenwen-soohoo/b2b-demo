import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Tag, Typography, Card, Space, Drawer,
  Button, Descriptions, Divider,
} from 'antd'
import { EyeOutlined, RedoOutlined } from '@ant-design/icons'
import { preOrders } from '../../data/fakeData'
import { useVendor } from '../../context/VendorContext'

const { Title, Text } = Typography

function vendorStatusTag(status) {
  if (status === 'pending_sales' || status === 'pending_warehouse') {
    return <Tag color="blue">待確認</Tag>
  }
  if (status === 'ordered') {
    return <Tag color="cyan">確認完出貨中</Tag>
  }
  if (status === 'settled') {
    return <Tag color="purple">已結算</Tag>
  }
  return <Tag>{status}</Tag>
}

function OrderDetailDrawer({ order, open, onClose, onReorder }) {
  if (!order) return null

  const displayItems = order.adjustedItems ?? order.items
  const total = displayItems.reduce((s, i) => s + i.qty * i.price, 0)

  // 計算最終出貨 vs 原始下訂的差異
  const qtyDiffs = (() => {
    if (!order.adjustedItems) return []
    return order.items
      .map(orig => {
        const adj = order.adjustedItems.find(a => a.productId === orig.productId)
        if (!adj || adj.qty === orig.qty) return null
        return { name: orig.productName, original: orig.qty, final: adj.qty }
      })
      .filter(Boolean)
  })()

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <Space>
          <Text strong style={{ fontSize: 14 }}>{order.id}</Text>
          {vendorStatusTag(order.status)}
        </Space>
      }
      width={620}
      extra={
        <Button icon={<RedoOutlined />} onClick={() => { onClose(); onReorder(order) }}>
          重複下單
        </Button>
      }
    >
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
        <Descriptions.Item label="結算月份">{order.settlementMonth}</Descriptions.Item>
        <Descriptions.Item label="下單日期">{order.createdAt}</Descriptions.Item>
        <Descriptions.Item label="收貨地址" span={2}>{order.shippingAddress}</Descriptions.Item>
        <Descriptions.Item label="正式訂單編號" span={2}>
          {order.backendOrderId
            ? <Text code style={{ fontSize: 13 }}>{order.backendOrderId}</Text>
            : <Text type="secondary">尚未建立正式訂單</Text>
          }
        </Descriptions.Item>
        <Descriptions.Item label="備註" span={2}>
          {order.vendorNote
            ? <Text style={{ whiteSpace: 'pre-line' }}>{order.vendorNote}</Text>
            : <Text type="secondary">—</Text>
          }
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" plain>訂購品項</Divider>
      <Table
        dataSource={displayItems}
        rowKey="productId"
        size="small"
        pagination={false}
        style={{ marginBottom: 20 }}
        columns={[
          { title: '品項名稱', dataIndex: 'productName' },
          { title: '單位', dataIndex: 'unit', width: 55, align: 'center' },
          { title: '數量', dataIndex: 'qty', width: 65, align: 'center' },
          { title: '採購價', dataIndex: 'price', width: 80, align: 'right',
            render: v => `$${v}` },
          { title: '小計', width: 95, align: 'right',
            render: (_, r) => <Text strong>${(r.qty * r.price).toLocaleString()}</Text> },
        ]}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={4} align="right">
              <strong>訂購總金額</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell align="right">
              <strong style={{ color: '#1677ff' }}>${total.toLocaleString()}</strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />

      {/* 數量差異（最終出貨 vs 原始下訂） */}
      {qtyDiffs.length > 0 && (
        <>
          <Divider orientation="left" plain>出貨數量差異</Divider>
          <ul style={{ paddingLeft: 20, margin: '0 0 16px' }}>
            {qtyDiffs.map((d, i) => (
              <li key={i} style={{ marginBottom: 6, fontSize: 13 }}>
                <Text strong>{d.name}</Text>
                <Text type="secondary">：原始下訂 </Text>
                <Text strong>{d.original}</Text>
                <Text type="secondary"> → 最終出貨 </Text>
                <Text strong style={{ color: d.final < d.original ? '#ff4d4f' : '#52c41a' }}>
                  {d.final}
                </Text>
              </li>
            ))}
          </ul>
        </>
      )}
    </Drawer>
  )
}

export default function VendorOrders() {
  const { channel } = useVendor()
  const nav = useNavigate()
  const [selected, setSelected] = useState(null)

  if (!channel) { nav('/login'); return null }

  const myOrders = preOrders
    .filter(o => o.channelId === channel.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))

  const handleReorder = (order) => {
    nav('/order', { state: { prefill: order.items } })
  }

  const columns = [
    { title: 'B2B訂單號', dataIndex: 'id', width: 130,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '結算月', dataIndex: 'settlementMonth', width: 90 },
    { title: '品項數', dataIndex: 'items', width: 70, align: 'center',
      render: items => items.length },
    { title: '訂購金額', dataIndex: 'items', width: 110,
      render: items => {
        const t = items.reduce((s, i) => s + i.qty * i.price, 0)
        return <Text strong style={{ color: '#1677ff' }}>${t.toLocaleString()}</Text>
      }},
    { title: '下單日期', dataIndex: 'createdAt', width: 110 },
    { title: '狀態', dataIndex: 'status', width: 130,
      render: s => vendorStatusTag(s) },
    { title: '', width: 140, align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(r)}>
            查看
          </Button>
          <Button size="small" icon={<RedoOutlined />} onClick={() => handleReorder(r)}>
            重複下單
          </Button>
        </Space>
      )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 20 }}>B2B訂單紀錄</Title>

      {myOrders.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">目前尚無B2B訂單紀錄</Text>
        </Card>
      ) : (
        <Table
          dataSource={myOrders}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
          rowClassName={r => r.status === 'settled' ? 'row-settled-vendor' : ''}
        />
      )}

      <OrderDetailDrawer
        order={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onReorder={handleReorder}
      />

      <style>{`
        .row-settled-vendor td { background: #f9f0ff !important; color: #888; }
        .row-settled-vendor:hover td { background: #efdbff !important; }
      `}</style>
    </div>
  )
}
