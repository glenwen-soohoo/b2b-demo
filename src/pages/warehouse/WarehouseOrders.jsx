import { useState } from 'react'
import {
  Table, Button, Space, Tag, Typography, Drawer, Descriptions,
  InputNumber, Alert, Divider, Timeline, Empty, Card,
} from 'antd'
import { CheckOutlined, InboxOutlined } from '@ant-design/icons'
import { preOrders as initPreOrders } from '../../data/fakeData'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'

const { Text, Title } = Typography

export default function WarehouseOrders() {
  const [orderList,     setOrderList]     = useState(initPreOrders)
  const [selected,      setSelected]      = useState(null)
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [adjQtyMap,     setAdjQtyMap]     = useState({})
  const [warehouseNote, setWarehouseNote] = useState('')
  const [notifOpen,     setNotifOpen]     = useState(false)
  const [notifData,     setNotifData]     = useState(null)
  const [pendingConfirm, setPendingConfirm] = useState(null)

  const pendingList = orderList.filter(o => o.status === 'arrived')

  const openDrawer = (order) => {
    setSelected(order)
    const source = order.salesAdjustedItems ?? order.items
    setAdjQtyMap(Object.fromEntries(source.map(i => [i.productId, i.qty])))
    setWarehouseNote('')
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelected(null)
  }

  const handleConfirm = () => {
    if (!selected) return

    const adjustedItems = selected.items.map(i => ({
      ...i, qty: adjQtyMap[i.productId] ?? i.qty,
    }))

    // 比對廠商原始下訂 vs 倉庫最終確認數量
    const diffs = selected.items
      .filter(i => (adjQtyMap[i.productId] ?? i.qty) !== i.qty)
      .map(i => ({
        productId:   i.productId,
        productName: i.productName,
        originalQty: i.qty,
        adjustedQty: adjQtyMap[i.productId] ?? i.qty,
      }))

    const backendOrderId = `EZPOS-${Math.floor(8000 + Math.random() * 2000)}`
    const now = new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', '')

    const logMsg = diffs.length > 0
      ? `[倉庫操作] 確認並轉入後台（${diffs.map(d => `${d.productName}: ${d.originalQty}→${d.adjustedQty}`).join('、')}），後台建單 ${backendOrderId}`
      : `[倉庫操作] 確認並轉入後台（數量無變動），後台建單 ${backendOrderId}`

    setPendingConfirm({
      id:            selected.id,
      adjustedItems,
      backendOrderId,
      warehouse_note: warehouseNote || null,
      log: { time: now, action: logMsg },
      diffs,
    })

    setNotifData({
      orderId:       selected.id,
      channelName:   selected.channelName,
      channelEmail:  null,
      backendOrderId,
      diffs,
    })
    setNotifOpen(true)
  }

  const handleNotifConfirm = () => {
    if (!pendingConfirm) return
    const { id, adjustedItems, backendOrderId, warehouse_note, log } = pendingConfirm

    setOrderList(prev => prev.map(o => {
      if (o.id !== id) return o
      return {
        ...o,
        status: 'ordered',
        adjustedItems,
        backendOrderId,
        warehouse_note,
        logs: [...o.logs, log],
      }
    }))

    setNotifOpen(false)
    setPendingConfirm(null)
    closeDrawer()
  }

  const sourceItems = selected
    ? (selected.salesAdjustedItems ?? selected.items)
    : []

  const listColumns = [
    { title: 'B2B訂單號', dataIndex: 'id', width: 170,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '通路名稱', dataIndex: 'channelName', width: 140 },
    { title: '出貨地址', dataIndex: 'shippingAddress', ellipsis: true },
    { title: '品項數', dataIndex: 'items', width: 70, align: 'center',
      render: items => items.length },
    { title: '業務確認日期', dataIndex: 'logs', width: 130,
      render: logs => {
        const l = [...logs].reverse().find(l => l.action.includes('業務確認完成'))
        return l
          ? <Text style={{ fontSize: 12 }}>{l.time.split(' ')[0]}</Text>
          : <Text type="secondary">—</Text>
      }},
    { title: '', width: 110, align: 'center',
      render: (_, r) => (
        <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => openDrawer(r)}>
          確認出貨
        </Button>
      )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 20 }}>
        <Space><InboxOutlined />待倉庫確認出貨訂單</Space>
      </Title>

      {pendingList.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Empty description="目前沒有待確認的出貨訂單" />
        </Card>
      ) : (
        <Table
          dataSource={pendingList}
          columns={listColumns}
          rowKey="id"
          size="small"
          pagination={false}
        />
      )}

      {/* 確認出貨 Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={
          <Space>
            <InboxOutlined />
            <span>確認出貨 — {selected?.id}</span>
          </Space>
        }
        width={700}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={closeDrawer}>取消</Button>
              <Button type="primary" icon={<CheckOutlined />} onClick={handleConfirm}>
                確認並轉入後台
              </Button>
            </Space>
          </div>
        }
      >
        {selected && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="通路名稱">{selected.channelName}</Descriptions.Item>
              <Descriptions.Item label="結算月份">{selected.settlementMonth}</Descriptions.Item>
              <Descriptions.Item label="出貨地址" span={2}>{selected.shippingAddress}</Descriptions.Item>
            </Descriptions>

            {selected.shipping_note && (
              <Alert type="info" showIcon style={{ marginBottom: 12 }}
                message={`出貨備註：${selected.shipping_note}`}
              />
            )}

            <Alert type="warning" showIcon style={{ marginBottom: 16 }}
              message="請核對品項數量後點擊「確認並轉入後台」"
              description="「預計出貨」為業務確認後的數量。倉庫可在「出貨數量」欄微調，差異欄顯示與業務確認數量的差異。"
            />

            <Table
              dataSource={sourceItems}
              rowKey="productId"
              size="small"
              pagination={false}
              style={{ marginBottom: 12 }}
              columns={[
                { title: '品項', dataIndex: 'productName' },
                { title: '預計出貨', dataIndex: 'qty', width: 90, align: 'center' },
                { title: '出貨數量', width: 150, align: 'center',
                  render: (_, r) => (
                    <InputNumber
                      min={0} size="small"
                      value={adjQtyMap[r.productId] ?? r.qty}
                      onChange={v => setAdjQtyMap(prev => ({ ...prev, [r.productId]: v ?? 0 }))}
                      style={{ width: 90 }}
                    />
                  )},
                { title: '差異', width: 90, align: 'center',
                  render: (_, r) => {
                    const diff = (adjQtyMap[r.productId] ?? r.qty) - r.qty
                    if (diff === 0) return <Tag color="default">無變動</Tag>
                    return <Tag color="red">{diff > 0 ? '+' : ''}{diff}</Tag>
                  }},
              ]}
            />

            <Divider orientation="left" plain>操作紀錄</Divider>
            <Timeline
              items={selected.logs.map(l => ({
                children: (
                  <div>
                    <Tag color="default" style={{ fontSize: 11 }}>{l.time}</Tag>
                    <span style={{ marginLeft: 8 }}>{l.action}</span>
                  </div>
                ),
              }))}
            />
          </>
        )}
      </Drawer>

      <NotificationPreviewModal
        open={notifOpen}
        onClose={() => { setNotifOpen(false); setPendingConfirm(null) }}
        onConfirm={handleNotifConfirm}
        type="warehouse_confirmed"
        data={notifData}
      />
    </div>
  )
}
