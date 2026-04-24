import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import {
  Table, Button, Space, Select, Drawer, Input,
  Statistic, Row, Col, Card, Typography, Tag, Descriptions,
  Timeline, Divider, Alert, message, Popconfirm, Modal, Form,
} from 'antd'
import { EyeOutlined, PlusOutlined, CheckOutlined, SearchOutlined, FilePdfOutlined, MailOutlined } from '@ant-design/icons'
import { exportSettlementPdf } from '../../utils/exportSettlementPdf'
import StatusTag from '../../components/StatusTag'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'
import { preOrders as initPreOrders, formalOrders as initFormalOrders, channels } from '../../data/fakeData'

const { Text } = Typography

// ── 生成結算單 Modal ───────────────────────────────
function GenerateSettlementModal({ open, onClose, preOrderList, onGenerate }) {
  const [channelId,    setChannelId]    = useState(null)
  const [selectedIds,  setSelectedIds]  = useState([])

  const eligibleChannels = useMemo(() => {
    const cids = new Set(preOrderList
      .filter(o => o.status === 'arrived' && !o.settlementId)
      .map(o => o.channelId))
    return channels.filter(c => cids.has(c.id))
  }, [preOrderList])

  const eligibleOrders = useMemo(() => {
    if (!channelId) return []
    return preOrderList
      .filter(o => o.status === 'arrived' && !o.settlementId && o.channelId === channelId)
      .sort((a, b) => a.settlementMonth.localeCompare(b.settlementMonth))
  }, [preOrderList, channelId])

  const selectedOrders = useMemo(() =>
    eligibleOrders.filter(o => selectedIds.includes(o.id)),
  [eligibleOrders, selectedIds])

  const totalAmount = useMemo(() =>
    selectedOrders.reduce((s, o) => {
      const items = o.adjustedItems ?? o.items
      return s + items.reduce((ss, i) => ss + i.qty * i.price, 0)
    }, 0),
  [selectedOrders])

  const uniqueMonths = [...new Set(selectedOrders.map(o => o.settlementMonth))].sort()

  const handleChannelChange = v => { setChannelId(v); setSelectedIds([]) }

  const handleGenerate = () => {
    if (!selectedOrders.length) return
    const ch    = channels.find(c => c.id === channelId)
    const month = uniqueMonths.join('、')
    onGenerate(channelId, ch?.name ?? '', month, selectedOrders, totalAmount)
    setChannelId(null); setSelectedIds([]); onClose()
  }

  const orderCols = [
    { title: 'B2B訂單號', dataIndex: 'id',
      render: v => <Text code style={{ fontSize: 11 }}>{v}</Text> },
    { title: '門市', dataIndex: 'store_label', width: 90,
      render: v => v ? <Tag>{v}</Tag> : <Text type="secondary">—</Text> },
    { title: '結算月份', dataIndex: 'settlementMonth', width: 95 },
    { title: '金額', width: 105,
      render: (_, o) => {
        const t = (o.adjustedItems ?? o.items).reduce((s, i) => s + i.qty * i.price, 0)
        return <Text strong style={{ color: '#1677ff' }}>${t.toLocaleString()}</Text>
      }},
  ]

  return (
    <Modal
      open={open} onCancel={onClose} onOk={handleGenerate}
      okText="生成結算單"
      okButtonProps={{ disabled: selectedOrders.length === 0, type: 'primary' }}
      cancelText="取消"
      title={<Space><PlusOutlined />手動生成結算單</Space>}
      width={620}
    >
      <Form layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label="選擇通路">
          <Select
            style={{ width: '100%' }} placeholder="請選擇通路"
            value={channelId} onChange={handleChannelChange}
            options={eligibleChannels.map(c => ({ value: c.id, label: c.name }))}
          />
        </Form.Item>
      </Form>

      {channelId && (
        <>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>選擇要納入結算的訂單</div>
          {eligibleOrders.length === 0
            ? <Alert type="warning" showIcon message="此通路目前無可結算的已成立訂單" />
            : (
              <Table
                dataSource={eligibleOrders} columns={orderCols}
                rowKey="id" size="small" pagination={false}
                rowSelection={{
                  type: 'checkbox',
                  selectedRowKeys: selectedIds,
                  onChange: keys => setSelectedIds(keys),
                }}
                style={{ marginBottom: 12 }}
              />
            )
          }

          {selectedOrders.length > 0 && (
            <>
              <Divider />
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="已選訂單">
                  <Tag color="blue">{selectedOrders.length} 筆</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="結算總金額">
                  <Text strong style={{ color: '#1677ff', fontSize: 15 }}>
                    ${totalAmount.toLocaleString()}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="涵蓋月份" span={2}>
                  {uniqueMonths.map(m => <Tag key={m}>{m}</Tag>)}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </>
      )}
    </Modal>
  )
}

// ── 結算單詳情 Drawer ──────────────────────────────
function SettlementDrawer({ settlement, preOrderList, open, onClose, onStatusChange }) {
  const [financeNotifOpen,   setFinanceNotifOpen]   = useState(false)
  const [financeNotifData,   setFinanceNotifData]   = useState(null)
  const [reminderNotifOpen,  setReminderNotifOpen]  = useState(false)
  const [reminderNotifData,  setReminderNotifData]  = useState(null)

  if (!settlement) return null

  const relatedOrders = preOrderList.filter(o => settlement.preOrderIds?.includes(o.id))

  const showFinanceNotif = () => {
    setFinanceNotifData({
      channelName:     settlement.channelName,
      channelEmail:    null,
      settlementMonth: settlement.settlementMonth,
      totalAmount:     settlement.totalAmount,
      settlementId:    settlement.id,
      reportedAt:      new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
    })
    setFinanceNotifOpen(true)
  }

  const handleMarkPaid = () => {
    onStatusChange(settlement.id, 'paid', {
      time: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
      action: '[手動操作] 廠商已匯款',
    })
    showFinanceNotif()
  }

  const handleDirectFinanceConfirm = () => {
    onStatusChange(settlement.id, 'completed', {
      time: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
      action: '[手動操作] 財務確認已匯款',
    })
  }

  const handleFinanceConfirm = () => {
    onStatusChange(settlement.id, 'completed', {
      time: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
      action: '[手動操作] 財務確認已匯款',
    })
  }

  const handleSendReminder = () => {
    setReminderNotifData({
      channelName:     settlement.channelName,
      channelEmail:    null,
      settlementMonth: settlement.settlementMonth,
      totalAmount:     settlement.totalAmount,
    })
    setReminderNotifOpen(true)
    onStatusChange(settlement.id, settlement.status, {
      time: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
      action: '已補發匯款提醒通知',
    })
  }

  return (
    <>
      <Drawer
        open={open} onClose={onClose}
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
          <Descriptions.Item label="結算日期">{settlement.createdAt}</Descriptions.Item>
          <Descriptions.Item label="結算總金額">
            <Text strong style={{ color: '#1677ff', fontSize: 16 }}>
              ${(settlement.totalAmount ?? 0).toLocaleString()}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" plain>涵蓋B2B訂單</Divider>
        {relatedOrders.length > 0 ? (
          <Table
            dataSource={relatedOrders} rowKey="id" size="small"
            pagination={false} style={{ marginBottom: 20 }}
            columns={[
              { title: 'B2B訂單號', dataIndex: 'id', width: 170,
                render: v => <Tag color="purple" style={{ fontSize: 11 }}>{v}</Tag> },
              { title: '下單日期', dataIndex: 'createdAt', width: 100 },
              { title: '出貨地址', dataIndex: 'shippingAddress', ellipsis: true },
              { title: '金額小計', width: 110,
                render: (_, o) => {
                  const t = (o.adjustedItems ?? o.items).reduce((s, i) => s + i.qty * i.price, 0)
                  return <Text strong>${t.toLocaleString()}</Text>
                }},
            ]}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={3} align="right"><strong>合計</strong></Table.Summary.Cell>
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

        {/* ── 操作按鈕（操作紀錄上方：左=匯出PDF，右=狀態操作） ── */}
        {settlement.status === 'awaiting_payment' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8, textAlign: 'right' }}>
              正常流程：廠商收到匯款通知信後，請廠商自行透過通知信完成確認。後台操作僅供特殊情況使用。
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Button
                icon={<FilePdfOutlined />}
                onClick={async () => {
                  try {
                    message.loading({ content: 'PDF 產生中…', key: 'settle-pdf', duration: 0 })
                    await exportSettlementPdf({ settlement, relatedOrders })
                    message.success({ content: '結算單已下載', key: 'settle-pdf' })
                  } catch (err) {
                    console.error(err)
                    message.error({ content: err.message || '匯出失敗', key: 'settle-pdf' })
                  }
                }}
              >
                匯出 PDF
              </Button>
              <Space>
                <Button
                  icon={<MailOutlined />}
                  onClick={handleSendReminder}
                >
                  補發催款通知
                </Button>
                <Popconfirm
                  title="確認廠商已完成匯款？"
                  onConfirm={handleMarkPaid}
                  okText="確認" cancelText="取消"
                >
                  <Button icon={<CheckOutlined />}>廠商已匯款</Button>
                </Popconfirm>
                <Popconfirm
                  title="確認財務已收到款項？結算單將直接標記完成。"
                  onConfirm={handleDirectFinanceConfirm}
                  okText="確認" cancelText="取消"
                >
                  <Button type="primary" icon={<CheckOutlined />}>財務確認已匯款</Button>
                </Popconfirm>
              </Space>
            </div>
          </div>
        )}
        {settlement.status === 'paid' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Button
              icon={<FilePdfOutlined />}
              onClick={async () => {
                try {
                  message.loading({ content: 'PDF 產生中…', key: 'settle-pdf', duration: 0 })
                  await exportSettlementPdf({ settlement, relatedOrders })
                  message.success({ content: '結算單已下載', key: 'settle-pdf' })
                } catch (err) {
                  console.error(err)
                  message.error({ content: err.message || '匯出失敗', key: 'settle-pdf' })
                }
              }}
            >
              匯出 PDF
            </Button>
            <Popconfirm
              title="確認執行「財務確認已匯款」？"
              onConfirm={handleFinanceConfirm}
              okText="確認" cancelText="取消"
            >
              <Button type="primary" icon={<CheckOutlined />}>財務確認已匯款</Button>
            </Popconfirm>
          </div>
        )}
        {settlement.status === 'completed' && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
            <Button
              icon={<FilePdfOutlined />}
              onClick={async () => {
                try {
                  message.loading({ content: 'PDF 產生中…', key: 'settle-pdf', duration: 0 })
                  await exportSettlementPdf({ settlement, relatedOrders })
                  message.success({ content: '結算單已下載', key: 'settle-pdf' })
                } catch (err) {
                  console.error(err)
                  message.error({ content: err.message || '匯出失敗', key: 'settle-pdf' })
                }
              }}
            >
              匯出 PDF
            </Button>
          </div>
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
      </Drawer>

      {/* 財務通知（只顯示 business tab） */}
      <NotificationPreviewModal
        open={financeNotifOpen}
        onClose={() => setFinanceNotifOpen(false)}
        type="payment_received"
        onlyTab="business"
        data={financeNotifData}
      />
      {/* 催款提醒通知 */}
      <NotificationPreviewModal
        open={reminderNotifOpen}
        onClose={() => setReminderNotifOpen(false)}
        type="settlement_reminder"
        data={reminderNotifData}
      />
    </>
  )
}

const SETTLEMENT_STATUS_FILTERS = [
  { key: 'awaiting_payment', label: '待匯款' },
  { key: 'paid',             label: '已匯款' },
  { key: 'completed',        label: '已完成' },
]

// ── 主頁面 ────────────────────────────────────────
export default function AdminSettlements() {
  const [preOrderList,   setPreOrderList]   = useState(initPreOrders)
  const [settlementList, setSettlementList] = useState(initFormalOrders)
  const [genModalOpen,   setGenModalOpen]   = useState(false)
  const [selected,       setSelected]       = useState(null)
  const [notifOpen,      setNotifOpen]      = useState(false)
  const [notifData,      setNotifData]      = useState(null)
  const [filterText,     setFilterText]     = useState('')
  const [activeStatuses, setActiveStatuses] = useState([])   // 空 = 全部

  const filteredList = useMemo(() => {
    const q = filterText.trim()
    return settlementList.filter(o => {
      const matchText   = !q || o.id.includes(q) || o.channelName.includes(q)
      const matchStatus = activeStatuses.length === 0 || activeStatuses.includes(o.status)
      return matchText && matchStatus
    })
  }, [settlementList, filterText, activeStatuses])

  const toggleStatus = (key, checked) => {
    setActiveStatuses(prev =>
      checked ? [...prev, key] : prev.filter(s => s !== key)
    )
  }

  const stats = useMemo(() => ({
    awaitingPayment: settlementList.filter(o => o.status === 'awaiting_payment').length,
    paid:            settlementList.filter(o => o.status === 'paid').length,
    completed:       settlementList.filter(o => o.status === 'completed').length,
    arrivedCount:    preOrderList.filter(o => o.status === 'arrived' && !o.settlementId).length,
  }), [settlementList, preOrderList])

  const handleGenerate = (channelId, channelName, month, orders, totalAmount) => {
    const foId = `FO-${dayjs().format('YYYYMMDD')}-${channelId.toUpperCase()}`
    const now  = new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', '')
    const ch   = channels.find(c => c.id === channelId)

    const newSettlement = {
      id: foId, channelId, channelName,
      preOrderIds: orders.map(o => o.id),
      totalAmount, discount: false,
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

    setPreOrderList(prev => prev.map(o =>
      orders.some(ord => ord.id === o.id)
        ? { ...o, status: 'settling', settlementId: foId }
        : o
    ))
    setSettlementList(prev => [newSettlement, ...prev])
    message.success(`已生成結算單 ${foId}`)

    setNotifData({
      orderId: foId, channelName,
      channelEmail: ch?.email ?? null,
      settlementMonth: month, totalAmount,
      discount: false,
      preOrderIds: orders.map(o => o.id),
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
    { title: '結算單號', dataIndex: 'id', width: 190,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '通路', dataIndex: 'channelName', width: 130 },
    { title: '門市', dataIndex: 'store_label', width: 90,
      render: v => v ? <Tag>{v}</Tag> : <Text type="secondary">—</Text> },
    { title: '結算日期', dataIndex: 'createdAt', width: 100 },
    { title: '涵蓋B2B訂單', dataIndex: 'preOrderIds', width: 95,
      render: ids => <Tag color="purple">{ids?.length ?? 0} 筆</Tag> },
    { title: '結算金額', dataIndex: 'totalAmount', width: 110,
      render: v => <Text strong style={{ color: '#1677ff' }}>${(v ?? 0).toLocaleString()}</Text> },
    { title: '狀態', dataIndex: 'status', width: 100, render: s => <StatusTag status={s} /> },
    { title: '', width: 70, align: 'center',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(settlementList.find(s => s.id === r.id) ?? r)}>詳情</Button>
      )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setGenModalOpen(true)}>
          手動生成結算單
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { label: '尚未結算訂單',     value: stats.arrivedCount,    color: '#13c2c2' },
          { label: '待匯款訂單',       value: stats.awaitingPayment, color: '#fa8c16' },
          { label: '已匯款待確認訂單', value: stats.paid,            color: '#a0d911' },
        ].map(s => (
          <Col span={8} key={s.label}>
            <Card size="small" bordered style={{ textAlign: 'center' }}>
              <Statistic title={s.label} value={s.value}
                valueStyle={{ color: s.color, fontSize: 28 }} suffix="筆" />
            </Card>
          </Col>
        ))}
      </Row>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          prefix={<SearchOutlined />} placeholder="搜尋結算單號 / 通路名稱"
          value={filterText} onChange={e => setFilterText(e.target.value)}
          style={{ width: 220 }} allowClear
        />
        <Space size={4}>
          <Button
            size="small"
            type={activeStatuses.length === 0 ? 'primary' : 'default'}
            onClick={() => setActiveStatuses([])}
          >
            全部
          </Button>
          {SETTLEMENT_STATUS_FILTERS.map(f => (
            <Tag.CheckableTag
              key={f.key}
              checked={activeStatuses.includes(f.key)}
              onChange={checked => toggleStatus(f.key, checked)}
            >
              {f.label}
            </Tag.CheckableTag>
          ))}
        </Space>
      </Space>

      <Table
        dataSource={filteredList} columns={columns}
        rowKey="id" size="small" pagination={{ pageSize: 20 }}
      />

      <GenerateSettlementModal
        open={genModalOpen} onClose={() => setGenModalOpen(false)}
        preOrderList={preOrderList} onGenerate={handleGenerate}
      />

      <SettlementDrawer
        settlement={selected} preOrderList={preOrderList}
        open={!!selected} onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />

      {/* 生成結算單後的廠商通知 */}
      <NotificationPreviewModal
        open={notifOpen} onClose={() => setNotifOpen(false)}
        type="settlement_created" data={notifData}
      />
    </div>
  )
}
