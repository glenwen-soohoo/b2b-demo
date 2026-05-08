import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Tag, Typography, Card, Space, Timeline, Drawer,
  Button, Descriptions, Divider, message, Input,
} from 'antd'
import { EyeOutlined, DollarOutlined, FilePdfOutlined } from '@ant-design/icons'
import { formalOrders, preOrders as allPreOrders } from '../../data/fakeData'
import StatusTag from '../../components/StatusTag'
import { useVendor } from '../../context/VendorContext'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'
import { exportSettlementPdf } from '../../utils/exportSettlementPdf'

const { Title, Text } = Typography

// 結算單顯示的「電子發票號碼」文字
//  - 單筆開票（period='per_order'）：固定「依訂單開票」
//  - 月結（period='monthly'）：顯示業務手填的 invoiceNote，否則「尚未開發票」
function renderInvoiceNoteRO(settlement, period) {
  if (period === 'per_order') {
    return <Text type="secondary">依訂單開票（請看下方各訂單發票號碼）</Text>
  }
  return settlement.invoiceNote
    ? <span style={{ whiteSpace: 'pre-wrap' }}>{settlement.invoiceNote}</span>
    : <Text type="secondary">尚未開發票</Text>
}

export default function VendorSettlements() {
  const { channel } = useVendor()
  const nav = useNavigate()
  const [settlements, setSettlements] = useState(
    formalOrders.filter(o => o.channelId === (channel?.id ?? ''))
  )
  const [selected, setSelected]   = useState(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifData, setNotifData] = useState(null)
  const [bankLast5, setBankLast5] = useState(channel?.default_bank_last5 ?? '')

  if (!channel) { nav('/login'); return null }

  const openNotif = (r) => {
    setNotifData({
      channelName:     channel.name,
      settlementId:    r.id,
      settlementMonth: r.settlementMonth,
      totalAmount:     r.totalAmount,
      bank_last5:      bankLast5 || null,
      reportedAt:      new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
    })
    setNotifOpen(true)
  }

  const columns = [
    { title: '結算單號', dataIndex: 'id', width: 180,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '結算日期', dataIndex: 'createdAt', width: 100 },
    { title: 'B2B訂單', dataIndex: 'preOrderIds', width: 90,
      render: ids => <Tag color="purple">{ids?.length ?? 0} 筆</Tag> },
    { title: '結算金額', dataIndex: 'totalAmount', width: 110,
      render: v => <Text strong style={{ color: '#1677ff' }}>${(v ?? 0).toLocaleString()}</Text> },
    { title: '狀態', dataIndex: 'status', width: 100, render: s => <StatusTag status={s} /> },
    { title: '', width: 70, align: 'center',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(settlements.find(s => s.id === r.id) ?? r)}>查看</Button>
      )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 20 }}>結算紀錄</Title>

      {settlements.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">尚無結算紀錄</Text>
        </Card>
      ) : (
        <Table
          dataSource={settlements}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      )}

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected
          ? <Space><Text strong>{selected.id}</Text><StatusTag status={selected.status} /></Space>
          : ''}
        width={680}
      >
        {selected && (() => {
          const period   = channel?.invoicePeriod
          const taxScope = channel?.invoiceTaxScope
          const relatedOrders = (() => {
            const ids = selected.preOrderIds ?? []
            return allPreOrders.filter(o => ids.includes(o.id))
          })()
          return (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="結算日期">{selected.createdAt}</Descriptions.Item>
              <Descriptions.Item label="結算金額">
                <Text strong style={{ color: '#1677ff', fontSize: 16 }}>
                  ${(selected.totalAmount ?? 0).toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="電子發票號碼" span={2}>
                {renderInvoiceNoteRO(selected, period)}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>涵蓋B2B訂單</div>
            <Table
              size="small"
              pagination={false}
              style={{ marginBottom: 20 }}
              rowKey="id"
              dataSource={relatedOrders}
              columns={[
                { title: 'B2B訂單號', dataIndex: 'b2b_order_no', width: 130,
                  render: v => v
                    ? <Tag color="purple" style={{ fontSize: 11, margin: 0 }}>{v}</Tag>
                    : <Text type="secondary">—</Text> },
                { title: '下單日期', dataIndex: 'createdAt', width: 95 },
                ...(taxScope === 'per_store' ? [
                  { title: '門市', dataIndex: 'store_label', ellipsis: true,
                    render: v => v
                      ? <Tag color="cyan" style={{ margin: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{v}</Tag>
                      : <Text type="secondary">—</Text> },
                ] : []),
                { title: '正式編號', dataIndex: 'backendOrderId', width: 105,
                  render: v => v ? <Text code style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{v}</Text> : <Text type="secondary">—</Text> },
                ...(period === 'per_order' ? [
                  { title: '發票號碼', dataIndex: 'invoiceNumber', width: 120,
                    render: v => v
                      ? <Text code style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{v}</Text>
                      : <Text type="secondary">未開立</Text> },
                ] : []),
                { title: '金額', align: 'right', width: 80,
                  render: (_, o) => {
                    const items = o.adjustedItems ?? o.salesAdjustedItems ?? o.items
                    const t = items.reduce((s, i) => s + i.qty * i.price, 0)
                    return <Text strong style={{ whiteSpace: 'nowrap' }}>${t.toLocaleString()}</Text>
                  }},
              ]}
            />

            {/* per_store：各門市結算金額彙整（廠商也能對帳） */}
            {period === 'monthly' && taxScope === 'per_store' && relatedOrders.length > 0 && (() => {
              const groups = new Map()
              relatedOrders.forEach(o => {
                const key = o.storeId ?? o.store_label ?? '未知門市'
                const items = o.adjustedItems ?? o.items
                const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
                if (!groups.has(key)) {
                  const addr = channel?.addresses?.find(a => a.storeId === o.storeId)
                  groups.set(key, {
                    storeId: o.storeId,
                    label: addr?.label ?? o.store_label ?? '—',
                    buyerName:  addr?.buyerName  ?? channel?.title ?? '—',
                    buyerTaxId: addr?.buyerTaxId ?? channel?.taxId ?? '—',
                    amount: 0,
                    orderCount: 0,
                  })
                }
                const g = groups.get(key)
                g.amount += subtotal
                g.orderCount += 1
              })
              const groupList = Array.from(groups.values())
              return (
                <Card
                  size="small"
                  style={{ marginBottom: 20, background: '#fafafa', border: '1px solid #e5e5e5' }}
                >
                  <div style={{ fontSize: 13, color: '#262626', marginBottom: 12, fontWeight: 600 }}>
                    各門市結算金額彙整
                    <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400, marginLeft: 8 }}>
                      共 {groupList.length} 張發票
                    </span>
                  </div>
                  <Table
                    dataSource={groupList} rowKey="storeId" size="small" pagination={false}
                    columns={[
                      { title: '門市', dataIndex: 'label', width: 110, ellipsis: true,
                        render: v => <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span> },
                      { title: '抬頭', dataIndex: 'buyerName', ellipsis: true,
                        render: v => <span style={{ fontSize: 13 }}>{v}</span> },
                      { title: '統編', dataIndex: 'buyerTaxId', width: 95,
                        render: v => <Text code style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{v}</Text> },
                      { title: '訂單數', dataIndex: 'orderCount', width: 70, align: 'center',
                        render: v => <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{v} 筆</span> },
                      { title: '小計', dataIndex: 'amount', align: 'right', width: 90,
                        render: v => <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>${v.toLocaleString()}</span> },
                    ]}
                  />
                </Card>
              )
            })()}

            {selected.status === 'awaiting_payment' && (
              <Card style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 20 }}>
                <Text strong>⏳ 待匯款</Text>
                <div style={{ marginTop: 8, fontSize: 13, lineHeight: 2 }}>
                  <div>戶名：舒果農企業有限公司</div>
                  <div>銀行：兆豐 0170077</div>
                  <div>帳號：00709001170</div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>匯款帳號末五碼：</span>
                  <Input
                    value={bankLast5}
                    onChange={e => setBankLast5(e.target.value)}
                    placeholder="選填，5碼"
                    maxLength={5}
                    style={{ width: 100 }}
                    size="small"
                  />
                </div>
                <Button
                  type="primary" icon={<DollarOutlined />}
                  style={{ marginTop: 12 }}
                  onClick={() => openNotif(selected)}
                >回報已匯款</Button>
              </Card>
            )}

            <div style={{ marginBottom: 16 }}>
              <Button
                icon={<FilePdfOutlined />}
                onClick={async () => {
                  try {
                    message.loading({ content: 'PDF 產生中…', key: 'settle-pdf', duration: 0 })
                    await exportSettlementPdf({ settlement: selected, relatedOrders })
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

            <Divider orientation="left" plain>進度紀錄</Divider>
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
          )
        })()}
      </Drawer>

      <NotificationPreviewModal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onConfirm={() => {
          setNotifOpen(false)
          if (notifData?.settlementId) {
            const now = new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', '')
            setSettlements(prev => prev.map(s =>
              s.id === notifData.settlementId
                ? { ...s, status: 'paid', logs: [...(s.logs ?? []), { time: now, action: '廠商回報已匯款' }] }
                : s
            ))
            setSelected(prev => prev && prev.id === notifData.settlementId
              ? { ...prev, status: 'paid' }
              : prev
            )
          }
          message.success({ content: '已回報匯款！我們將盡快確認入帳。', duration: 4 })
        }}
        type="vendor_payment_report"
        data={notifData}
      />
    </div>
  )
}
