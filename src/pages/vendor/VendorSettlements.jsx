import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Tag, Typography, Card, Space, Timeline, Drawer,
  Button, Descriptions, Divider, message,
} from 'antd'
import { EyeOutlined, DollarOutlined } from '@ant-design/icons'
import { formalOrders } from '../../data/fakeData'
import StatusTag from '../../components/StatusTag'
import { useVendor } from '../../context/VendorContext'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'

const { Title, Text } = Typography

export default function VendorSettlements() {
  const { channel } = useVendor()
  const nav = useNavigate()
  const [selected, setSelected] = useState(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifData, setNotifData] = useState(null)

  if (!channel) { nav('/login'); return null }

  const mySettlements = formalOrders.filter(o => o.channelId === channel.id)

  const openNotif = (r) => {
    setNotifData({
      channelName: channel.name,
      settlementId: r.id,
      settlementMonth: r.settlementMonth,
      totalAmount: r.totalAmount,
      reportedAt: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
    })
    setNotifOpen(true)
  }

  const columns = [
    { title: '結算單號', dataIndex: 'id', width: 200,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '結算月', dataIndex: 'settlementMonth', width: 90 },
    { title: '涵蓋B2B訂單', dataIndex: 'preOrderIds', width: 100,
      render: ids => <Tag color="purple">{ids?.length ?? 0} 筆</Tag> },
    { title: '結算金額', dataIndex: 'totalAmount', width: 120,
      render: v => <Text strong style={{ color: '#1677ff' }}>${(v ?? 0).toLocaleString()}</Text> },
    { title: '建立日期', dataIndex: 'createdAt', width: 110 },
    { title: '狀態', dataIndex: 'status', width: 100, render: s => <StatusTag status={s} /> },
    { title: '', width: 70, align: 'center',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(r)}>查看</Button>
      )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 20 }}>結算紀錄</Title>

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
        width={560}
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
              <Card style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 20 }}>
                <Text strong>⏳ 待匯款</Text>
                <div style={{ marginTop: 8, fontSize: 13, lineHeight: 2 }}>
                  <div>戶名：舒果農企業有限公司</div>
                  <div>銀行：兆豐 0170077</div>
                  <div>帳號：00709001170</div>
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
          message.success({ content: '已回報匯款！我們將盡快確認入帳。', duration: 4 })
        }}
        type="vendor_payment_report"
        data={notifData}
      />
    </div>
  )
}
