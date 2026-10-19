import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Input, Button, Typography, Divider, Result, Space, Segmented } from 'antd'
import { CreditCardOutlined, SafetyCertificateOutlined, LockOutlined } from '@ant-design/icons'
import { preOrders } from '../data/fakeData'

const { Title, Text } = Typography

// 團媽逐筆信用卡付款頁（免登入連結開啟；手機／桌機同一響應式頁）。
// 付款走 TapPay（比照無毒農網頁刷卡）；此為 demo，不實際扣款。
export default function PaymentPage() {
  const [sp] = useSearchParams()
  const orderId = sp.get('order') || 'b2b-gm001'   // demo 預設團媽待付款單
  const order = useMemo(() => preOrders.find(o => o.id === orderId), [orderId])

  // 情境：form（待付款表單）/ success（付款成功）/ fail（付款失敗）
  const [phase, setPhase] = useState('form')
  const [submitting, setSubmitting] = useState(false)

  const amount = useMemo(() => {
    if (!order) return 0
    const sum = order.items.reduce((s, i) => s + i.qty * i.price, 0)
    return sum - (order.discount_amount ?? 0)
  }, [order])

  const pay = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      // 方案A：主站收款成功後訂單成立（demo 直接把這筆待付款單轉為已成立）
      if (order && order.status === 'pending_payment') order.status = 'ordered'
      setPhase('success')
    }, 900)
  }

  const Shell = ({ children }) => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6ffed 0%, #e8f5e9 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 16px',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <img src="https://greenboxcdn.azureedge.net/images/greenbox-logo-mark.png" alt="無毒農" style={{ height: 44 }} />
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 6 }}>無毒農 B2B 訂單付款</div>
      </div>
      <div style={{ width: '100%', maxWidth: 420 }}>{children}</div>
      <DevPanel />
    </div>
  )

  // 情境切換面板（demo 用，讓人快速看三種狀態）
  const DevPanel = () => (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 50,
      background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8,
      padding: '8px 10px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>情境切換</div>
      <Segmented
        size="small"
        value={phase}
        onChange={setPhase}
        options={[
          { label: '待付款', value: 'form' },
          { label: '成功', value: 'success' },
          { label: '失敗', value: 'fail' },
        ]}
      />
    </div>
  )

  if (!order) {
    return (
      <Shell>
        <Card><Result status="warning" title="找不到訂單" subTitle="此付款連結無效或已過期。" /></Card>
      </Shell>
    )
  }

  if (phase === 'success') {
    return (
      <Shell>
        <Card>
          <Result
            status="success"
            title="付款成功"
            subTitle={`訂單 ${order.b2b_order_no}　金額 $${amount.toLocaleString()}`}
            extra={<Text type="secondary" style={{ fontSize: 13 }}>我們已收到您的款項，將盡快為您安排出貨。</Text>}
          />
        </Card>
      </Shell>
    )
  }

  if (phase === 'fail') {
    return (
      <Shell>
        <Card>
          <Result
            status="error"
            title="付款失敗"
            subTitle="卡片授權未通過，請確認卡片資訊或換一張卡再試。"
            extra={<Button type="primary" onClick={() => setPhase('form')}>重新付款</Button>}
          />
        </Card>
      </Shell>
    )
  }

  // ── 待付款表單 ──
  return (
    <Shell>
      {/* 訂單摘要 */}
      <Card size="small" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <Text strong>訂單摘要</Text>
          <Text code style={{ fontSize: 12 }}>{order.b2b_order_no}</Text>
        </div>
        <div style={{ fontSize: 13, color: '#595959', marginBottom: 8 }}>{order.channelName}</div>
        {order.items.map(i => (
          <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: '#595959' }}>{i.productName} × {i.qty}</span>
            <span>${(i.qty * i.price).toLocaleString()}</span>
          </div>
        ))}
        <Divider style={{ margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text strong>應付金額</Text>
          <Title level={3} style={{ margin: 0, color: '#389e0d' }}>${amount.toLocaleString()}</Title>
        </div>
      </Card>

      {/* 信用卡表單 */}
      <Card size="small">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <CreditCardOutlined style={{ color: '#389e0d' }} />
          <Text strong>信用卡付款</Text>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>卡號</div>
          <Input size="large" placeholder="0000 0000 0000 0000" maxLength={19} inputMode="numeric" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>有效期限</div>
            <Input size="large" placeholder="MM / YY" maxLength={7} inputMode="numeric" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>安全碼</div>
            <Input size="large" placeholder="CVC" maxLength={4} inputMode="numeric" suffix={<LockOutlined style={{ color: '#bbb' }} />} />
          </div>
        </div>
        <Button
          type="primary" block size="large"
          loading={submitting}
          onClick={pay}
          style={{ background: '#389e0d', borderColor: '#389e0d', height: 46 }}
        >
          確認付款 ${amount.toLocaleString()}
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, color: '#999', fontSize: 12 }}>
          <SafetyCertificateOutlined />
          由 TapPay 安全加密處理
        </div>
      </Card>
    </Shell>
  )
}
