import { useNavigate } from 'react-router-dom'
import { Table, Tag, Typography, Card, Space, Timeline, Drawer, Button, Descriptions } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { fakeOrders, ORDER_STATUS } from '../../data/fakeData'
import StatusTag from '../../components/StatusTag'
import { useVendor } from '../../context/VendorContext'

const { Title, Text } = Typography

export default function VendorHistory() {
  const { channel } = useVendor()
  const nav = useNavigate()
  const [selected, setSelected] = useState(null)

  if (!channel) { nav('/vendor'); return null }

  // 只顯示該通路自己的訂單
  const myOrders = fakeOrders.filter(o => o.channelId === channel.id)

  const columns = [
    { title: '訂單編號', dataIndex: 'id', width: 170,
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '結算月', dataIndex: 'settlementMonth', width: 100 },
    { title: '品項數', dataIndex: 'items', width: 80, align: 'center',
      render: items => items.length },
    { title: '訂購金額', dataIndex: 'items', width: 110,
      render: items => {
        const total = items.reduce((s, i) => s + i.qty * i.price, 0)
        return <Text strong style={{ color: '#1677ff' }}>${total.toLocaleString()}</Text>
      }},
    { title: '建立日期', dataIndex: 'createdAt', width: 110 },
    { title: '狀態', dataIndex: 'status', width: 110, render: s => <StatusTag status={s} /> },
    { title: '詳情', width: 80,
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(r)}>查看</Button>
      )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 20 }}>我的預訂紀錄</Title>

      {myOrders.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">目前尚無預訂紀錄</Text>
        </Card>
      ) : (
        <Table
          dataSource={myOrders}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      )}

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? <Space>{selected.id}<StatusTag status={selected.status} /></Space> : ''}
        width={620}
      >
        {selected && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="結算月份">{selected.settlementMonth}</Descriptions.Item>
              <Descriptions.Item label="建立日期">{selected.createdAt}</Descriptions.Item>
              <Descriptions.Item label="出貨地址" span={2}>{selected.shippingAddress}</Descriptions.Item>
            </Descriptions>

            <Table
              dataSource={selected.items}
              rowKey="productId"
              size="small"
              pagination={false}
              columns={[
                { title: '品項', dataIndex: 'productName' },
                { title: '單位', dataIndex: 'unit', width: 60 },
                { title: '數量', dataIndex: 'qty', width: 70 },
                { title: '採購價', dataIndex: 'price', width: 80, render: v => `$${v}` },
                { title: '小計', width: 90, render: (_, r) => `$${(r.qty * r.price).toLocaleString()}` },
              ]}
              summary={() => {
                const total = selected.items.reduce((s, i) => s + i.qty * i.price, 0)
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={4} align="right"><strong>合計</strong></Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <strong style={{ color: '#1677ff' }}>${total.toLocaleString()}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )
              }}
              style={{ marginBottom: 20 }}
            />

            <div style={{ fontWeight: 600, marginBottom: 10, color: '#555' }}>訂單進度</div>
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

            {selected.status === 'awaiting_payment' && (
              <Card style={{ marginTop: 16, background: '#fffbe6', border: '1px solid #ffe58f' }}>
                <Text strong>⏳ 待匯款</Text>
                <div style={{ marginTop: 8, fontSize: 13, lineHeight: 2 }}>
                  <div>戶名：舒果農企業有限公司</div>
                  <div>銀行：兆豐 0170077</div>
                  <div>帳號：00709001170</div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">完成匯款後，請點擊通知信中的回報按鈕，或聯繫業務窗口。</Text>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
