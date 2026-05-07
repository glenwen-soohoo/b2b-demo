import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Alert } from 'antd'
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { channels } from '../../data/fakeData'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'

const { Title, Text } = Typography

// Demo 用：跟 VendorLogin 同一份「帳號 → 通路」的對應（正式版改成查 Volunteers）
const ACCOUNT_TO_CHANNEL = {
  babeboss:   'c001',
  greenfarm:  'c002',
  healthroot: 'c003',
}

/**
 * 忘記密碼頁
 *
 * Demo 行為：
 * - 廠商輸入「帳號」（不接受 email；正式版要先驗證帳號存在才能繼續）
 * - 點「寄送重設連結」→ 後端驗證帳號存在
 *   - 不存在 → 顯示錯誤
 *   - 存在 → 跳出 NotificationPreviewModal 預覽即將寄出的信
 * - 確認送出後顯示「重設信已寄出」訊息
 *
 * TODO_FRUIT_WEB: 正式版要：
 *   POST /api/b2b/auth/forgot-password { account }
 *   後端：
 *     1. 查 Volunteers WHERE Account=? AND Source='B2B' → 找不到回 404
 *     2. 找到則產生 reset token (32-byte random hex) → 存 B2BPasswordResetTokens 表（30 分鐘過期）
 *     3. 寄信到 channel.ContactEmail：含 https://b2b.greenbox.tw/reset-password?token=xxx
 */
export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  const onFinish = ({ account }) => {
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const acc = account?.trim().toLowerCase()
      const channelId = ACCOUNT_TO_CHANNEL[acc]
      if (!channelId) {
        setError(`找不到帳號「${account}」，請確認後再試。如忘記帳號請聯繫業務窗口。`)
        return
      }
      const ch = channels.find(c => c.id === channelId)
      setPreviewData({
        account: acc,
        contactName: ch?.contact ?? '通路窗口',
        contactEmail: ch?.email ?? 'contact@example.com',
        resetToken: `demo-${Math.random().toString(36).slice(2, 10)}`,
      })
      setPreviewOpen(true)
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6ffed 0%, #e8f5e9 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>忘記密碼</Title>
          <Text type="secondary">輸入您的帳號，我們將寄送重設連結至此帳號綁定的聯絡信箱</Text>
        </div>

        {submitted ? (
          <>
            <Alert
              type="success"
              message="重設密碼信件已寄出"
              description={previewData?.contactEmail
                ? `已寄至 ${previewData.contactEmail}，連結 30 分鐘內有效。若未收到，請聯繫業務窗口協助。`
                : '請至您的聯絡信箱查看，連結 30 分鐘內有效。'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Link to="/login">
              <Button block icon={<ArrowLeftOutlined />}>返回登入</Button>
            </Link>
          </>
        ) : (
          <Form layout="vertical" onFinish={onFinish} onValuesChange={() => setError('')}>
            {error && (
              <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
            )}
            <Form.Item
              label="帳號"
              name="account"
              rules={[{ required: true, message: '請輸入帳號' }]}
            >
              <Input
                size="large"
                placeholder="例：b2b_channel_001（demo: babeboss / greenfarm / healthroot）"
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                autoComplete="username"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              寄送重設連結
            </Button>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Link to="/login" style={{ fontSize: 13, color: '#888' }}>
                <ArrowLeftOutlined style={{ marginRight: 4 }} />
                返回登入
              </Link>
            </div>
          </Form>
        )}
      </Card>

      <NotificationPreviewModal
        open={previewOpen}
        type="password_reset_email"
        data={previewData}
        onClose={() => setPreviewOpen(false)}
        onConfirm={() => {
          setPreviewOpen(false)
          setSubmitted(true)
        }}
      />
    </div>
  )
}
