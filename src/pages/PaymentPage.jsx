import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { preOrders, productMap } from '../data/fakeData'

// ─────────────────────────────────────────────
// 團媽付款頁（demo）= 複用無毒農主站既有信用卡付款頁 CreditCardLink.cshtml 的呈現。
// 刻意不走 B2B 的 antd 風格、改貼近主站樣式，讓工程一看就知道是「複用主站這頁」、不是新刻：
//   - 卡號/到期/後三碼是 TapPay SDK 安全欄位（iframe，非一般 input）—— 這裡以空欄＋placeholder 表示
//   - 主站品牌綠 #4ba83b、max-width 750、訂單資訊卡 + 信用卡資訊卡 + 確認付款 + TapPay 提供字樣
//   - 成功/失敗 = 主站 CreditCardFinish（三步驟 + 恭喜訂購成功 / 訂購失敗 + 重新結帳）
// ─────────────────────────────────────────────
const GREEN = '#4ba83b'
const BORDER = '1px solid #d2d2d2'

export default function PaymentPage() {
  const [sp] = useSearchParams()
  const orderId = sp.get('order') || 'b2b-gm001'
  const order = useMemo(() => preOrders.find(o => o.id === orderId), [orderId])
  const [phase, setPhase] = useState('form')   // form | success | fail
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
      if (order && order.status === 'pending_payment') order.status = 'ordered'
      setPhase('success')
    }, 900)
  }

  // ── 主站站頭（簡化版：白底 + 無毒農 logo，代表這是 greenbox.tw 主站頁）──
  const SiteHeader = () => (
    <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '12px 0', textAlign: 'center' }}>
      <img src="https://greenboxcdn.azureedge.net/images/greenbox-logo-mark.png" alt="無毒農" style={{ height: 40 }} />
    </div>
  )

  const Shell = ({ children }) => (
    <div style={{ minHeight: '100vh', background: '#f4f4f4', fontSize: 16, color: '#333' }}>
      <SiteHeader />
      <div style={{ maxWidth: 750, margin: '20px auto', padding: '0 12px' }}>{children}</div>
      <div style={{ maxWidth: 750, margin: '4px auto 28px', padding: '12px', textAlign: 'center', color: '#999', fontSize: 12.5, lineHeight: 1.7 }}>
        ※ 此頁為示意。正式版將直接採用無毒農主站<strong style={{ color: '#888' }}>既有的信用卡付款頁（TapPay）</strong>，不會重新開發。
      </div>
      <DevPanel />
    </div>
  )

  // 情境切換（demo 工具；非頁面內容）
  const DevPanel = () => (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 50, background: '#fff',
      border: '1px solid #e0e0e0', borderRadius: 8, padding: '8px 10px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>情境切換</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[['form', '待付款'], ['success', '成功'], ['fail', '失敗']].map(([v, label]) => (
          <button key={v} onClick={() => setPhase(v)}
            style={{
              fontSize: 12, padding: '3px 10px', borderRadius: 4, cursor: 'pointer',
              border: phase === v ? `1px solid ${GREEN}` : '1px solid #d9d9d9',
              background: phase === v ? GREEN : '#fff', color: phase === v ? '#fff' : '#555',
            }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )

  // 主站卡片外框（.custon-border-style：標題列 + 內容）
  const Panel = ({ title, children }) => (
    <div style={{ border: BORDER, borderRadius: 2, background: '#fff', marginBottom: 20 }}>
      <div style={{ padding: '12px 16px', borderBottom: BORDER, fontWeight: 700, boxShadow: '0 2px 3px #f0f0f0' }}>{title}</div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  )

  // TapPay 安全欄位的呈現（真實頁是 TapPay SDK iframe，這裡用空欄＋placeholder 表示，非可輸入 input）
  const TapPayField = ({ label, placeholder, extra }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>{label}{extra}</label>
      <div style={{
        border: '1px solid #ccc', borderRadius: 4, height: 42, padding: '0 12px',
        display: 'flex', alignItems: 'center', color: '#bbb', background: '#fff',
      }}>
        {placeholder}
      </div>
    </div>
  )

  if (!order) {
    return <Shell><Panel title="付款"><div style={{ color: '#999' }}>此付款連結無效或已過期。</div></Panel></Shell>
  }

  // ── 成功 / 失敗頁 = 主站 CreditCardFinish ──
  if (phase === 'success' || phase === 'fail') {
    return (
      <Shell>
        <Panel title="">
          {/* 三步驟（主站 _PartialOrderFinish） */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24, color: '#999', fontSize: 14 }}>
            <span>1 確認訂單</span><span>＞</span><span>2 填寫資訊</span><span>＞</span>
            <span style={{ color: phase === 'success' ? GREEN : '#999', fontWeight: 700 }}>3 訂購{phase === 'success' ? '成功' : '失敗'}</span>
          </div>
          {phase === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: GREEN, marginBottom: 12 }}>恭喜您訂購成功</div>
              <div style={{ fontSize: 15, marginBottom: 4 }}>訂單 {order.b2b_order_no}</div>
              <div style={{ fontSize: 15, marginBottom: 20 }}>付款金額 <strong style={{ color: GREEN }}>NT$ {amount.toLocaleString()}</strong></div>
              <div style={{ color: '#888', fontSize: 14 }}>我們已收到您的款項，將盡快為您安排出貨。</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#cf1322', marginBottom: 12 }}>訂購失敗</div>
              <div style={{ fontSize: 15, color: '#595959', marginBottom: 20 }}>信用卡授權未通過，請確認卡片資訊或換一張卡再試。</div>
              <button onClick={() => setPhase('form')}
                style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 4, padding: '10px 28px', fontSize: 15, cursor: 'pointer' }}>
                重新結帳
              </button>
            </div>
          )}
        </Panel>
      </Shell>
    )
  }

  // ── 付款頁（CreditCardLink）──
  return (
    <Shell>
      {/* 訂單資訊 */}
      <Panel title="訂單資訊">
        {order.items.map(i => {
          const p = productMap[i.productId]
          return (
            <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 8 }}>
              <span>{i.productName}　規格：{i.unit}</span>
              <span>數量：{i.qty}</span>
            </div>
          )
        })}
        <div style={{ borderTop: BORDER, marginTop: 12, paddingTop: 12, textAlign: 'right' }}>
          訂單總金額：<strong style={{ color: GREEN, fontSize: '1.3em' }}>${amount.toLocaleString()}</strong>
        </div>
      </Panel>

      {/* 填寫信用卡資訊 */}
      <Panel title="填寫信用卡資訊">
        <TapPayField label="卡號" placeholder="**** **** **** ****" />
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}><TapPayField label="卡片到期日" placeholder="MM / YY" /></div>
          <div style={{ flex: 1 }}><TapPayField label="卡片後三碼" placeholder="後三碼" /></div>
        </div>
        <button
          onClick={pay}
          disabled={submitting}
          style={{
            background: GREEN, color: '#fff', border: 'none', borderRadius: 4,
            padding: '12px 0', width: '100%', fontSize: 16, cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1, marginTop: 4,
          }}>
          {submitting ? '處理中，請稍候…' : `確認付款 $${amount.toLocaleString()}`}
        </button>
        <div style={{ textAlign: 'center', marginTop: 14, color: '#666', fontSize: 13 }}>
          以上支付工具申請由 <strong style={{ color: '#2a7de1' }}>TapPay</strong> 提供
        </div>
      </Panel>
    </Shell>
  )
}
