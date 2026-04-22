import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Tag, Typography, Card, Space, Timeline, Drawer,
  Button, Descriptions, Divider, message, Input,
} from 'antd'
import { EyeOutlined, DollarOutlined } from '@ant-design/icons'
import { formalOrders, preOrders as allPreOrders } from '../../data/fakeData'
import StatusTag from '../../components/StatusTag'
import { useVendor } from '../../context/VendorContext'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'

const { Title, Text } = Typography

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
        width={560}
      >
        {selected && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="結算日期">{selected.createdAt}</Descriptions.Item>
              <Descriptions.Item label="結算金額">
                <Text strong style={{ color: '#1677ff', fontSize: 16 }}>
                  ${(selected.totalAmount ?? 0).toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>涵蓋B2B訂單</div>
            <Table
              size="small"
              pagination={false}
              style={{ marginBottom: 20 }}
              rowKey="id"
              dataSource={(() => {
                const ids = selected.preOrderIds ?? []
                return allPreOrders.filter(o => ids.includes(o.id))
              })()}
              columns={[
                { title: 'B2B訂單號', dataIndex: 'id', width: 140,
                  render: v => <Tag color="purple" style={{ fontSize: 11 }}>{v}</Tag> },
                { title: '下單日期', dataIndex: 'createdAt', width: 100 },
                { title: '正式編號', dataIndex: 'backendOrderId', width: 130,
                  render: v => v ? <Text code style={{ fontSize: 11 }}>{v}</Text> : <Text type="secondary">—</Text> },
                { title: '金額', align: 'right',
                  render: (_, o) => {
                    const items = o.adjustedItems ?? o.salesAdjustedItems ?? o.items
                    const t = items.reduce((s, i) => s + i.qty * i.price, 0)
                    return <Text strong>${t.toLocaleString()}</Text>
                  }},
              ]}
            />

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
        )}
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
