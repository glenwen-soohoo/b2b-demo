import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import {
  Table, Button, Space, Select, Badge, Tabs, Drawer,
  Statistic, Row, Col, Card, Typography, Tag, Descriptions,
  Timeline, Divider, Alert, message, Popconfirm, Modal, Form,
} from 'antd'
import { EyeOutlined, PlusOutlined, CheckOutlined, BankOutlined } from '@ant-design/icons'
import StatusTag from '../../components/StatusTag'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'
import { preOrders as initPreOrders, formalOrders as initFormalOrders, channels } from '../../data/fakeData'

const { Title, Text } = Typography

// 生成結算單 Modal
function GenerateSettlementModal({ open, onClose, preOrderList, onGenerate }) {
  const [channelId, setChannelId] = useState(null)
  const [month, setMonth]         = useState(null)

  // 可選通路（有 ordered + settlementId=null 的B2B訂單）
  const eligibleChannels = useMemo(() => {
    const cids = new Set(preOrderList
      .filter(o => o.status === 'ordered' && !o.settlementId)
      .map(o => o.channelId))
    return channels.filter(c => cids.has(c.id))
  }, [preOrderList])

  // 可選月份（該通路下有 ordered 的月份）
  const eligibleMonths = useMemo(() => {
    if (!channelId) return []
    const months = new Set(
      preOrderList
        .filter(o => o.status === 'ordered' && !o.settlementId && o.channelId === channelId)
        .map(o => o.settlementMonth)
    )
    return [...months].sort()
  }, [preOrderList, channelId])

  // 預覽
  const preview = useMemo(() => {
    if (!channelId || !month) return null
    const orders = preOrderList.filter(o =>
      o.status === 'ordered' && !o.settlementId &&
      o.channelId === channelId && o.settlementMonth === month
    )
    if (!orders.length) return null
    const totalAmount = orders.reduce((s, o) => {
      const items = o.adjustedItems ?? o.items
      return s + items.reduce((ss, i) => ss + i.qty * i.price, 0)
    }, 0)
    return { orders, totalAmount }
  }, [preOrderList, channelId, month])

  const handleGenerate = () => {
    if (!preview) return
    const ch = channels.find(c => c.id === channelId)
    onGenerate(channelId, ch?.name ?? '', month, preview.orders, preview.totalAmount)
    setChannelId(null)
    setMonth(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleGenerate}
      okText="生成結算單"
      okButtonProps={{ disabled: !preview, type: 'primary' }}
      cancelText="取消"
      title={<Space><PlusOutlined />手動生成結算單</Space>}
      width={560}
    >
      <Form layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label="選擇通路">
          <Select
            style={{ width: '100%' }}
            placeholder="請選擇通路"
            value={channelId}
            onChange={v => { setChannelId(v); setMonth(null) }}
            options={eligibleChannels.map(c => ({ value: c.id, label: c.name }))}
          />
        </Form.Item>
        <Form.Item label="選擇結算月份">
          <Select
            style={{ width: '100%' }}
            placeholder={channelId ? '請選擇月份' : '請先選通路'}
            disabled={!channelId}
            value={month}
            onChange={setMonth}
            options={eligibleMonths.map(m => ({ value: m, label: m }))}
          />
        </Form.Item>
      </Form>

      {preview && (
        <>
          <Divider />
          <div style={{ fontWeight: 600, marginBottom: 8 }}>預覽</div>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="涵蓋B2B訂單筆數">
              <Tag color="blue">{preview.orders.length} 筆</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="結算總金額">
              <Text strong style={{ color: '#1677ff', fontSize: 16 }}>
                ${preview.totalAmount.toLocaleString()}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="B2B訂單號" span={2}>
              <Space wrap size={4}>
                {preview.orders.map(o => (
                  <Tag key={o.id} color="purple" style={{ fontSize: 11 }}>{o.id}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </>
      )}

      {channelId && !preview && (
        <Alert type="warning" showIcon message="所選通路當月無可結算的已成立訂單" />
      )}
    </Modal>
  )
}

// 結算單詳情 Drawer
function SettlementDrawer({ settlement, preOrderList, open, onClose, onStatusChange }) {
  const [notifOpen,     setNotifOpen]     = useState(false)
  const [notifData,     setNotifData]     = useState(null)
  const [pendingAction, setPendingAction] = useState(null)

  if (!settlement) return null

  const relatedOrders = preOrderList.filter(o => settlement.preOrderIds?.includes(o.id))

  const getActions = (status) => {
    if (status === 'awaiting_payment') return [{ key: 'mark_paid', label: '廠商已匯款', icon: <CheckOutlined />, next: 'paid' }]
    if (status === 'paid')            return [{ key: 'finance_ok', label: '財務確認完成', icon: <CheckOutlined />, next: 'completed' }]
    return []
  }

  const actions = getActions(settlement.status)

  const handleAction = (a) => {
    const log = {
      time: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
      action: `[手動操作] ${a.label}`,
    }
    onStatusChange(settlement.id, a.next, log)
  }

  const handleMarkPaid = (a) => {
    setNotifData({
      channelName:     settlement.channelName,
      channelEmail:    null,
      settlementMonth: settlement.settlementMonth,
      totalAmount:     settlement.totalAmount,
    })
    setPendingAction(a)
    setNotifOpen(true)
  }

  const handleNotifConfirm = () => {
    if (pendingAction) handleAction(pendingAction)
    setNotifOpen(false)
    setPendingAction(null)
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={
          <Space>
            <Text strong>{settlement.id}</Text>
            <StatusTag status={settlement.status} />
          </Space>
        }
        width={720}
      >
        <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
          <Descriptions.Item label="通路名稱">{settlement.channelName}</Descriptions.Item>
          <Descriptions.Item label="結算月份">{settlement.settlementMonth}</Descriptions.Item>
          <Descriptions.Item label="建立日期">{settlement.createdAt}</Descriptions.Item>
          <Descriptions.Item label="結算總金額">
            <Text strong style={{ color: '#1677ff', fontSize: 16 }}>
              ${(settlement.totalAmount ?? 0).toLocaleString()}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" plain>涵蓋B2B訂單</Divider>
        {relatedOrders.length > 0 ? (
          <Table
            dataSource={relatedOrders}
            rowKey="id"
            size="small"
            pagination={false}
            style={{ marginBottom: 20 }}
            columns={[
              { title: 'B2B訂單號', dataIndex: 'id', width: 170,
                render: v => <Tag color="purple" style={{ fontSize: 11 }}>{v}</Tag> },
              { title: '出貨地址', dataIndex: 'shippingAddress', ellipsis: true },
              { title: '金額小計', width: 110,
                render: (_, o) => {
                  const items = o.adjustedItems ?? o.items
                  const t = items.reduce((s, i) => s + i.qty * i.price, 0)
                  return <Text strong>${t.toLocaleString()}</Text>
                }},
            ]}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2} align="right"><strong>合計</strong></Table.Summary.Cell>
                <Table.Summary.Cell>
                  <strong style={{ color: '#1677ff' }}>
                    ${(settlement.totalAmount ?? 0).toLocaleString()}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        ) : (
          <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
            B2B訂單資料不在本 Demo 範圍內（歷史資料）
          </Text>
        )}

        {settlement.status === 'awaiting_payment' && (
          <Card style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 20 }}>
            <Text strong>⏳ 待廠商匯款</Text>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 2 }}>
              <div>戶名：舒果農企業有限公司</div>
              <div>銀行：兆豐 0170077</div>
              <div>帳號：00709001170</div>
            </div>
          </Card>
        )}

        <Divider orientation="left" plain>操作紀錄</Divider>
        <Timeline
          style={{ marginBottom: 24 }}
          items={settlement.logs.map(l => ({
            children: (
              <div>
                <Tag color="default" style={{ fontSize: 11 }}>{l.time}</Tag>
                <span style={{ marginLeft: 8 }}>{l.action}</span>
              </div>
            ),
          }))}
        />

        {actions.length > 0 && (
          <>
            <Divider orientation="left" plain>可執行操作</Divider>
            <Space wrap>
              {actions.map(a => (
                a.key === 'mark_paid' ? (
                  <Button key={a.key} type="primary" icon={a.icon}
                    onClick={() => handleMarkPaid(a)}>
                    {a.label}
                  </Button>
                ) : (
                  <Popconfirm key={a.key} title={`確認執行「${a.label}」？`}
                    onConfirm={() => handleAction(a)} okText="確認" cancelText="取消">
                    <Button type="primary" icon={a.icon}>{a.label}</Button>
                  </Popconfirm>
                )
              ))}
            </Space>
          </>
        )}
      </Drawer>

      <NotificationPreviewModal
        open={notifOpen}
        onClose={() => { setNotifOpen(false); setPendingAction(null) }}
        onConfirm={handleNotifConfirm}
        type="payment_received"
        data={notifData}
      />
    </>
  )
}

// ── 主頁面 ────────────────────────────────────────
export default function AdminSettlements() {
  const [preOrderList,    setPreOrderList]    = useState(initPreOrders)
  const [settlementList,  setSettlementList]  = useState(initFormalOrders)
  const [genModalOpen,    setGenModalOpen]    = useState(false)
  const [selected,        setSelected]        = useState(null)
  const [notifOpen,       setNotifOpen]       = useState(false)
  const [notifData,       setNotifData]       = useState(null)

  const stats = useMemo(() => ({
    awaitingPayment: settlementList.filter(o => o.status === 'awaiting_payment').length,
    paid:            settlementList.filter(o => o.status === 'paid').length,
    completed:       settlementList.filter(o => o.status === 'completed').length,
    orderedCount:    preOrderList.filter(o => o.status === 'ordered' && !o.settlementId).length,
  }), [settlementList, preOrderList])

  const handleGenerate = (channelId, channelName, month, orders, totalAmount) => {
    const foId = `FO-${dayjs().format('YYYYMMDD')}-${channelId.toUpperCase()}`
    const now  = new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', '')
    const ch   = channels.find(c => c.id === channelId)

    const newSettlement = {
      id: foId,
      channelId,
      channelName,
      preOrderIds: orders.map(o => o.id),
      totalAmount,
      discount: false,
      status: 'awaiting_payment',
      settlementMonth: month,
      createdAt: dayjs().format('YYYY-MM-DD'),
      shippingAddress: orders[0]?.shippingAddress ?? '',
      logs: [{
        time: now,
        action: `手動生成結算單，涵蓋 ${orders.length} 筆B2B訂單（${orders.map(o => o.id).join('、')}）`,
      }, {
        time: now,
        action: '發結算匯款通知給廠商',
      }],
    }

    // 將涵蓋的B2B訂單狀態改為 settled，填入 settlementId
    setPreOrderList(prev => prev.map(o =>
      orders.some(ord => ord.id === o.id)
        ? { ...o, status: 'settled', settlementId: foId }
        : o
    ))
    setSettlementList(prev => [newSettlement, ...prev])
    message.success(`已生成結算單 ${foId}`)

    // 觸發通知彈窗
    setNotifData({
      orderId: foId,
      channelName,
      channelEmail: ch?.email ?? null,
      settlementMonth: month,
      totalAmount,
      discount: false,
    })
    setNotifOpen(true)
  }

  const handleStatusChange = (id, next, log) => {
    setSettlementList(prev => prev.map(o => {
      if (o.id !== id) return o
      const updated = { ...o, status: next, logs: [...o.logs, log] }
      setSelected(updated)
      return updated
    }))
  }

  const columns = [
    { title: '結算單號', dataIndex: 'id', width: 200,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '通路', dataIndex: 'channelName', width: 140 },
    { title: '結算月', dataIndex: 'settlementMonth', width: 90 },
    { title: '涵蓋B2B訂單', dataIndex: 'preOrderIds', width: 100,
      render: ids => <Tag color="purple">{ids?.length ?? 0} 筆</Tag> },
    { title: '結算金額', dataIndex: 'totalAmount', width: 110,
      render: v => <Text strong style={{ color: '#1677ff' }}>${(v ?? 0).toLocaleString()}</Text> },
    { title: '狀態', dataIndex: 'status', width: 100, render: s => <StatusTag status={s} /> },
    { title: '', width: 70, align: 'center',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(r)}>詳情</Button>
      )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>結算管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setGenModalOpen(true)}>
          手動生成結算單
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { label: '可結算訂單', value: stats.orderedCount,     color: '#13c2c2' },
          { label: '待匯款',     value: stats.awaitingPayment,  color: '#fa8c16' },
          { label: '已匯款',     value: stats.paid,             color: '#a0d911' },
          { label: '已完成',     value: stats.completed,        color: '#52c41a' },
        ].map(s => (
          <Col span={6} key={s.label}>
            <Card size="small" bordered style={{ textAlign: 'center' }}>
              <Statistic title={s.label} value={s.value}
                valueStyle={{ color: s.color, fontSize: 28 }} suffix="筆" />
            </Card>
          </Col>
        ))}
      </Row>

      <Table
        dataSource={settlementList}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 20 }}
      />

      <GenerateSettlementModal
        open={genModalOpen}
        onClose={() => setGenModalOpen(false)}
        preOrderList={preOrderList}
        onGenerate={handleGenerate}
      />

      <SettlementDrawer
        settlement={selected}
        preOrderList={preOrderList}
        open={!!selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />

      <NotificationPreviewModal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        type="settlement_created"
        data={notifData}
      />
    </div>
  )
}
