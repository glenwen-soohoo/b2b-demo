import { useState } from 'react'
import { Layout, Menu, Typography, Tabs, Button, Tag } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getNotificationContent, EmailBody } from '../components/notificationContent'

const { Sider, Content } = Layout
const { Title, Text } = Typography

// 各通知信的目錄 + 範例資料（type = key，對應 notificationContent 的分支）
// 要新增 / 調整信件樣式：改 notificationContent.jsx；要換示範資料：改這裡的 data。
const CATALOG = [
  {
    group: '訂單流程',
    items: [
      { key: 'order_submitted', code: 'E-01', label: '新B2B訂單通知（→業務）',
        data: { channelName: '綠色小農超市', settlementMonth: '2026-06', frozenCount: 3, frozenTotal: 5400, ambientCount: 5, ambientTotal: 7200, total: 12600, vendorNote: '信義店週二下午有促銷，請上午前送達', addrCount: 2, orderCount: 2, submittedAt: '2026-06-20 14:30' } },
      { key: 'order_confirmed', code: 'E-02', label: '訂單成立通知（含異動）',
        data: { channelName: '貝比波士', channelEmail: 'order@babeboss.com.tw', orderId: 'b2b-00012', backendOrderId: '260620009001',
          diffs: [
            { productId: 'p1', productName: '常溫燉飯-蒜香甘藍豬肉', originalQty: 20, adjustedQty: 18 },
            { productId: 'p2', productName: '寶寶粥-鮭魚野菜', originalQty: 12, adjustedQty: 15 },
          ] } },
      { key: 'order_voided', code: '—', label: '訂單作廢通知',
        data: { channelName: '好自然健康館', orderId: 'b2b-00020', reason: '通路臨時取消本次採購，改下月再訂', recreatedOrderId: 'b2b-00021' } },
    ],
  },
  {
    group: '結算與收款',
    items: [
      { key: 'settlement_created', code: 'E-05', label: '結算匯款通知',
        data: { channelName: '綠色小農超市', channelEmail: 'order@greenfarm.com.tw', settlementMonth: '2026-06', totalAmount: 12600, discount: true, preOrderIds: ['b2b-00002', 'b2b-00003'] } },
      { key: 'settlement_reminder', code: 'E-07', label: '結算匯款提醒（催繳）',
        data: { channelName: '貝比波士', settlementMonth: '2026-05', totalAmount: 8800 } },
      { key: 'vendor_payment_report', code: 'E-08', label: '廠商回報匯款（→財務）',
        data: { channelName: '好自然健康館', settlementMonth: '2026-05', settlementId: 'FO-20260525-C003', totalAmount: 6750, bank_last5: '01170', reportedAt: '2026-06-02 10:15' } },
      { key: 'payment_confirmed', code: '—', label: '收款確認（廠商 / 財務）',
        data: { channelName: '綠色小農超市', channelEmail: 'order@greenfarm.com.tw', settlementMonth: '2026-05', totalAmount: 12600 } },
    ],
  },
  {
    group: '發票',
    items: [
      { key: 'invoice_issued', code: 'E-09', label: '發票開立完成（→廠商）',
        data: { channelName: '好自然健康館', channelEmail: 'purchase@haoran.com.tw', settlementMonth: '2026-06',
          invoices: [
            { storeName: '台中總倉', buyerName: '好自然有機生活股份有限公司', buyerTaxId: '87654321', invoiceNumber: 'IV-202606-0080', amount: 6750 },
            { storeName: '健新門市', buyerName: '健新生活商行', buyerTaxId: '23456789', invoiceNumber: 'IV-202606-0081', amount: 4200 },
          ] } },
      { key: 'invoice_failed', code: 'E-17', label: '發票開立失敗（→業務）',
        data: { channelName: '貝比波士', settlementId: 'FO-20260525-C001', amount: 8800, errorMessage: '買受人統一編號格式錯誤（ECPay RtnCode 2000）' } },
    ],
  },
  {
    group: '帳號',
    items: [
      { key: 'admin_password_reset', code: 'E-11', label: '後台重設密碼（→廠商）',
        data: { channelName: '綠色小農超市', contactName: '林采璇', contactEmail: 'order@greenfarm.com.tw', account: 'greenfarm', newPassword: 'Gf8x2k9q' } },
      { key: 'password_reset_email', code: 'E-12', label: '忘記密碼重設信（→廠商）',
        data: { channelName: '貝比波士', contactName: '黃宥榕', contactEmail: 'order@babeboss.com.tw', account: 'babeboss', resetToken: 'demo-token-abc123' } },
    ],
  },
]

const ALL = CATALOG.flatMap(g => g.items)

const menuItems = CATALOG.map(g => ({
  key: g.group,
  label: g.group,
  type: 'group',
  children: g.items.map(it => ({
    key: it.key,
    label: (
      <span>
        {it.code !== '—' && <Tag color="blue" style={{ marginInlineEnd: 8, fontSize: 11 }}>{it.code}</Tag>}
        {it.label}
      </span>
    ),
  })),
}))

export default function NotificationsPreviewPage() {
  const nav = useNavigate()
  const [sel, setSel] = useState(ALL[0].key)
  const item = ALL.find(i => i.key === sel) ?? ALL[0]
  const content = getNotificationContent(item.key, item.data)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 20px', background: '#fff', borderBottom: '1px solid #f0f0f0',
      }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => nav('/')}>返回首頁</Button>
        <MailOutlined style={{ color: '#1677ff' }} />
        <Title level={5} style={{ margin: 0 }}>通知信樣式預覽</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>Demo — 僅預覽樣式，不會寄送 Email</Text>
      </div>

      <Layout>
        <Sider width={260} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
          <Menu
            mode="inline"
            selectedKeys={[sel]}
            items={menuItems}
            onClick={({ key }) => setSel(key)}
            style={{ borderInlineEnd: 'none', paddingTop: 8 }}
          />
        </Sider>

        <Content style={{ padding: 24, background: '#f1f2f7' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ fontSize: 15 }}>
                {item.code !== '—' && <Tag color="blue">{item.code}</Tag>}
                {content?.title ?? item.label}
              </Text>
            </div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 20 }}>
              {content?.tabs ? (
                <Tabs
                  defaultActiveKey={content.tabs[0]?.key}
                  items={content.tabs.map(t => ({
                    key: t.key,
                    label: t.label,
                    children: <EmailBody to={t.to} subject={t.subject} body={t.body} />,
                  }))}
                />
              ) : content ? (
                <EmailBody to={content.to} subject={content.subject} body={content.body} />
              ) : (
                <Text type="secondary">此通知尚未定義內容樣式。</Text>
              )}
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
