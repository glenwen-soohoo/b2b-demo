import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Tag, Typography, Card, Space, Timeline, Drawer,
  Button, Descriptions, Tabs, Badge, message,
} from 'antd'
import { EyeOutlined, DollarOutlined } from '@ant-design/icons'
import { preOrders, formalOrders } from '../../data/fakeData'
import StatusTag from '../../components/StatusTag'
import { useVendor } from '../../context/VendorContext'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'

const { Title, Text } = Typography

// ── B2B訂單紀錄 Tab ───────────────────────────────
function PreOrdersPane({ channelId }) {
  const myOrders = preOrders.filter(o => o.channelId === channelId)

  const columns = [
    { title: 'B2B訂單號', dataIndex: 'id', width: 170,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '結算月', dataIndex: 'settlementMonth', width: 100 },
    { title: '品項數', dataIndex: 'items', width: 80, align: 'center',
      render: items => items.length },
    { title: '訂購金額', dataIndex: 'items', width: 110,
      render: items => {
        const t = items.reduce((s, i) => s + i.qty * i.price, 0)
        return <Text strong style={{ color: '#1677ff' }}>${t.toLocaleString()}</Text>
      }},
    { title: '建立日期', dataIndex: 'createdAt', width: 110 },
    { title: '狀態', dataIndex: 'status', width: 140,
      render: (s, r) => (
        <Space size={4}>
          <StatusTag status={s} />
          {s === 'ordered' && <Tag color="cyan" style={{ fontSize: 11 }}>已出貨</Tag>}
        </Space>
      )},
    { title: '後台訂單號', dataIndex: 'backendOrderId', width: 130,
      render: v => v
        ? <Tag color="cyan" style={{ fontSize: 11 }}>{v}</Tag>
        : <Text type="secondary">—</Text> },
  ]

  if (myOrders.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: 40 }}>
        <Text type="secondary">目前尚無B2B訂單紀錄</Text>
      </Card>
    )
  }

  return (
    <Table
      dataSource={myOrders}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 10 }}
      rowClassName={r => r.status === 'settled' ? 'row-settled-vendor' : ''}
    />
  )
}

// ── 結算紀錄 Tab ───────────────────────────────
function SettlementsPane({ channelId, channelName }) {
  const [selected, setSelected] = useState(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifData, setNotifData] = useState(null)
  const mySettlements = formalOrders.filter(o => o.channelId === channelId)

  const columns = [
    { title: '結算單號', dataIndex: 'id', width: 200,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '結算月', dataIndex: 'settlementMonth', width: 100 },
    { title: '涵蓋B2B訂單', dataIndex: 'preOrderIds', width: 100,
      render: ids => (
        <Tag color="purple">{ids?.length ?? 0} 筆B2B訂單</Tag>
      )},
    { title: '結算金額', dataIndex: 'totalAmount', width: 120,
      render: v => <Text strong style={{ color: '#1677ff' }}>${(v ?? 0).toLocaleString()}</Text> },
    { title: '建立日期', dataIndex: 'createdAt', width: 110 },
    { title: '狀態', dataIndex: 'status', width: 110, render: s => <StatusTag status={s} /> },
    { title: '', width: 70, align: 'center',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(r)}>查看</Button>
      )},
  ]

  return (
    <>
      {mySettlements.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">尚無結算紀錄</Text>
        </Card>
      ) : (
        <Table
          dataSource={mySettlements}
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
        width={640}
      >
        {selected && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="結算月份">{selected.settlementMonth}</Descriptions.Item>
              <Descriptions.Item label="建立日期">{selected.createdAt}</Descriptions.Item>
              <Descriptions.Item label="結算金額" span={2}>
                <Text strong style={{ color: '#1677ff', fontSize: 16 }}>
                  ${(selected.totalAmount ?? 0).toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="涵蓋B2B訂單" span={2}>
                <Space wrap size={4}>
                  {(selected.preOrderIds ?? []).map(id => (
                    <Tag key={id} color="purple" style={{ fontSize: 11 }}>{id}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {selected.status === 'awaiting_payment' && (
              <Card style={{ marginTop: 4, background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 20 }}>
                <Text strong>⏳ 待匯款</Text>
                <div style={{ marginTop: 8, fontSize: 13, lineHeight: 2 }}>
                  <div>戶名：舒果農企業有限公司</div>
                  <div>銀行：兆豐 0170077</div>
                  <div>帳號：00709001170</div>
                </div>
                <Button
                  type="primary" icon={<DollarOutlined />}
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setNotifData({
                      channelName,
                      settlementId: selected.id,
                      settlementMonth: selected.settlementMonth,
                      totalAmount: selected.totalAmount,
                      reportedAt: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
                    })
                    setNotifOpen(true)
                  }}
                >回報已匯款</Button>
              </Card>
            )}

            <div style={{ fontWeight: 600, marginBottom: 10, color: '#555' }}>進度紀錄</div>
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
          message.success({ content: '已回報匯款！我們將盡快確認入帳。', duration: 4 })
        }}
        type="vendor_payment_report"
        data={notifData}
      />

      <style>{`
        .row-settled-vendor td { background: #f9f0ff !important; color: #888; }
      `}</style>
    </>
  )
}

// ── 主頁面 ─────────────────────────────────────
export default function VendorHistory() {
  const { channel } = useVendor()
  const nav = useNavigate()

  if (!channel) { nav('/login'); return null }

  const activeCount     = preOrders.filter(o => o.channelId === channel.id && ['pending_sales','pending_warehouse','ordered'].includes(o.status)).length
  const settlementCount = formalOrders.filter(o => o.channelId === channel.id).length

  const tabItems = [
    {
      key: 'pre',
      label: (
        <Space>
          B2B訂單紀錄
          {activeCount > 0 && <Badge count={activeCount} size="small" />}
        </Space>
      ),
      children: <PreOrdersPane channelId={channel.id} />,
    },
    {
      key: 'settlement',
      label: (
        <Space>
          結算紀錄
          {settlementCount > 0 && <Badge count={settlementCount} color="purple" size="small" />}
        </Space>
      ),
      children: <SettlementsPane channelId={channel.id} channelName={channel.name} />,
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 20 }}>B2B訂單 &amp; 結算紀錄</Title>
      <Tabs items={tabItems} />
    </div>
  )
}
