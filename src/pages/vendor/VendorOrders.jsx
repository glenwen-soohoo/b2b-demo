import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Tag, Typography, Card, Space, Drawer,
  Button, Descriptions, Divider, InputNumber, message,
} from 'antd'
import { EyeOutlined, RedoOutlined, EditOutlined, SaveOutlined, CloseOutlined, FilePdfOutlined } from '@ant-design/icons'
import { preOrders as initialOrders, productMap, systemSettings } from '../../data/fakeData'
import { useVendor } from '../../context/VendorContext'
import { exportOrderPdf } from '../../utils/exportOrderPdf'

const { Title, Text } = Typography

function temperatureZoneTag(items) {
  const zones = new Set(items.map(i => productMap[i.productId]?.category).filter(Boolean))
  return (
    <Space size={4}>
      {zones.has('frozen')  && <Tag color="blue"  style={{ margin: 0 }}>❄️ 冷凍</Tag>}
      {zones.has('ambient') && <Tag color="green" style={{ margin: 0 }}>🌿 常溫</Tag>}
    </Space>
  )
}

function vendorStatusTag(status) {
  if (status === 'pending_sales') return <Tag color="blue">待確認</Tag>
  if (status === 'ordered')       return <Tag color="cyan">出貨中</Tag>
  if (status === 'arrived')       return <Tag color="orange">已送達，待結算</Tag>
  if (status === 'settling')      return <Tag color="gold">結算中</Tag>
  if (status === 'settled_done')  return <Tag color="purple">已結算</Tag>
  return <Tag>{status}</Tag>
}

function OrderDetailDrawer({ order, open, onClose, onReorder, onSaveItems, channel }) {
  const [editing, setEditing] = useState(false)
  const [editQtys, setEditQtys] = useState({})

  if (!order) return null

  const displayItems = order.adjustedItems ?? order.items
  const editedItems  = editing
    ? displayItems.map(i => ({ ...i, qty: editQtys[i.productId] ?? i.qty }))
    : displayItems
  const total = editedItems.reduce((s, i) => s + i.qty * i.price, 0)

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

  const startEdit = () => {
    const init = {}
    displayItems.forEach(i => { init[i.productId] = i.qty })
    setEditQtys(init)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditQtys({})
  }

  const saveEdit = () => {
    const newItems = displayItems.map(i => ({ ...i, qty: editQtys[i.productId] ?? i.qty }))
    onSaveItems(order.id, newItems)
    setEditing(false)
    setEditQtys({})
    message.success('數量已儲存')
  }

  const canEdit = order.status === 'pending_sales'

  return (
    <Drawer
      open={open}
      onClose={() => { cancelEdit(); onClose() }}
      title={
        <Space>
          <Text strong style={{ fontSize: 14 }}>{order.id}</Text>
          {vendorStatusTag(order.status)}
          {temperatureZoneTag(order.items)}
        </Space>
      }
      width={620}
      extra={
        <Space>
          <Button
            icon={<FilePdfOutlined />}
            onClick={async () => {
              try {
                message.loading({ content: 'PDF 產生中…', key: 'pdf', duration: 0 })
                await exportOrderPdf({ order, channel, systemSettings })
                message.success({ content: '採購確認單已下載', key: 'pdf' })
              } catch (err) {
                console.error(err)
                message.error({ content: err.message || '匯出失敗', key: 'pdf' })
              }
            }}
          >
            匯出 PDF
          </Button>
          <Button icon={<RedoOutlined />} onClick={() => { cancelEdit(); onClose(); onReorder(order) }}>
            重複下單
          </Button>
        </Space>
      }
    >
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
        <Descriptions.Item label="結算月份">{order.settlementMonth}</Descriptions.Item>
        <Descriptions.Item label="下單日期">{order.createdAt}</Descriptions.Item>
        <Descriptions.Item label="收貨地址" span={2}>{order.shippingAddress}</Descriptions.Item>
        <Descriptions.Item label="正式訂單編號" span={2}>
          {order.fruitOrderNumber
            ? <><Text code style={{ fontSize: 13 }}>{order.fruitOrderNumber}</Text><Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>（無毒農）</Text></>
            : order.backendOrderId
              ? <Text code style={{ fontSize: 13, color: '#8c8c8c' }}>{order.backendOrderId}</Text>
              : <Text type="secondary">尚未建立正式訂單</Text>
          }
        </Descriptions.Item>
        <Descriptions.Item label="我的備註" span={2}>
          {order.vendorNote
            ? <Text style={{ whiteSpace: 'pre-line' }}>{order.vendorNote}</Text>
            : <Text type="secondary">—</Text>
          }
        </Descriptions.Item>
      </Descriptions>

      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>訂購品項</Text>

      <Table
        dataSource={displayItems}
        rowKey="productId"
        size="small"
        pagination={false}
        style={{ marginBottom: 8 }}
        columns={[
          { title: '品項名稱', dataIndex: 'productName' },
          { title: '單位', dataIndex: 'unit', width: 55, align: 'center' },
          { title: '數量', dataIndex: 'qty', width: 90, align: 'center',
            render: (v, r) => editing
              ? <InputNumber
                  size="small"
                  min={1}
                  value={editQtys[r.productId] ?? v}
                  onChange={val => setEditQtys(prev => ({ ...prev, [r.productId]: val }))}
                  style={{ width: 70 }}
                />
              : v
          },
          { title: '採購價', dataIndex: 'price', width: 80, align: 'right',
            render: v => `$${v}` },
          { title: '小計', width: 95, align: 'right',
            render: (_, r) => {
              const qty = editing ? (editQtys[r.productId] ?? r.qty) : r.qty
              return <Text strong>${(qty * r.price).toLocaleString()}</Text>
            }},
        ]}
        summary={() => {
          const discount = order.discount_amount ?? 0
          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={4} align="right">
                  <strong>訂購總金額</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell align="right">
                  <strong style={{ color: '#1677ff' }}>${total.toLocaleString()}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              {discount > 0 && (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={4}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>折扣備註</div>
                          <div style={{ fontSize: 13, color: '#595959', whiteSpace: 'pre-line' }}>
                            {order.discount_note || <Text type="secondary">—</Text>}
                          </div>
                        </div>
                        <span style={{ color: '#fa8c16', whiteSpace: 'nowrap' }}>折扣</span>
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right" style={{ color: '#fa8c16' }}>
                      -${discount.toLocaleString()}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={4} align="right">
                      <strong style={{ color: '#13c2c2' }}>實收金額</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <strong style={{ color: '#13c2c2' }}>${(total - discount).toLocaleString()}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )}
            </>
          )
        }}
      />

      {/* 修改數量按鈕（pending_sales，放在總金額下方） */}
      {canEdit && !editing && (
        <div style={{ textAlign: 'right', marginBottom: 4 }}>
          <Button size="small" icon={<EditOutlined />} onClick={startEdit}>
            修改數量
          </Button>
        </div>
      )}
      {editing && (
        <div style={{ textAlign: 'right', marginBottom: 4 }}>
          <Space size={4}>
            <Button size="small" icon={<CloseOutlined />} onClick={cancelEdit}>取消</Button>
            <Button size="small" type="primary" icon={<SaveOutlined />} onClick={saveEdit}>儲存</Button>
          </Space>
        </div>
      )}

      {/* B2B備註（廠商可見） */}
      <div style={{ marginBottom: 16, fontSize: 13 }}>
        <Text type="secondary">B2B備註：</Text>
        <Text style={{ marginLeft: 4 }}>
          {order.b2b_note || '—'}
        </Text>
      </div>

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
  const [orders, setOrders] = useState(initialOrders)
  const [selected, setSelected] = useState(null)

  if (!channel) { nav('/login'); return null }

  const myOrders = orders
    .filter(o => o.channelId === channel.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))

  const handleReorder = (order) => {
    nav('/order', { state: { prefill: order.items } })
  }

  const handleSaveItems = (orderId, newItems) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, items: newItems, adjustedItems: o.adjustedItems ? newItems : null }
        : o
    ))
    // 同步更新 selected
    setSelected(prev => prev && prev.id === orderId
      ? { ...prev, items: newItems, adjustedItems: prev.adjustedItems ? newItems : null }
      : prev
    )
  }

  const columns = [
    { title: 'B2B訂單號', dataIndex: 'id', width: 130,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '下單日期', dataIndex: 'createdAt', width: 110 },
    { title: '溫層', dataIndex: 'items', width: 120,
      render: items => temperatureZoneTag(items) },
    { title: '金額', dataIndex: 'items', width: 110,
      render: items => {
        const t = items.reduce((s, i) => s + i.qty * i.price, 0)
        return <Text strong style={{ color: '#1677ff' }}>${t.toLocaleString()}</Text>
      }},
    { title: '品項摘要', dataIndex: 'items', ellipsis: true,
      render: items => items.map(i => i.productName).join('、') },
    { title: '狀態', dataIndex: 'status', width: 130,
      render: s => vendorStatusTag(s) },
    { title: '', width: 170, align: 'center',
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
          rowClassName={r => (r.status === 'settling' || r.status === 'settled_done') ? 'row-settled-vendor' : ''}
        />
      )}

      <OrderDetailDrawer
        channel={channel}
        order={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onReorder={handleReorder}
        onSaveItems={handleSaveItems}
      />

      <style>{`
        .row-settled-vendor td { background: #f9f0ff !important; color: #888; }
        .row-settled-vendor:hover td { background: #efdbff !important; }
      `}</style>
    </div>
  )
}
