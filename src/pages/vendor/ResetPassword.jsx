import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Alert, message } from 'antd'
import { LockOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

/**
 * 重設密碼頁
 *
 * URL 格式：/reset-password?token=xxx
 *
 * Demo 行為：
 * - URL 沒帶 token → 顯示錯誤頁（連結無效）
 * - 有 token → 輸入新密碼兩次 → 提交 → 顯示成功 → 3 秒後跳回 /login
 * - Demo 不真的驗 token、不真的改密碼
 *
 * TODO_FRUIT_WEB: 正式版要：
 *   POST /api/b2b/auth/reset-password { token, newPassword }
 *   後端：
 *     1. hash token 後查 B2BPasswordResetTokens 表
 *     2. 驗有效（未過期、未使用）
 *     3. 更新 Volunteers.Password
 *     4. 標記 token Used = 1
 *     5. 撤銷該 channel 所有現存的 refresh token（強制其他裝置重新登入）
 */
export default function ResetPassword() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // 沒帶 token → 顯示錯誤
  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6ffed 0%, #e8f5e9 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <Alert
            type="error"
            message="連結無效"
            description="此重設連結缺少必要參數。請重新申請忘記密碼，或聯繫業務窗口協助。"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Link to="/forgot-password">
            <Button block type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
              重新申請忘記密碼
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const onFinish = ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      message.error('兩次輸入的密碼不一致')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      // 3 秒後跳回登入
      setTimeout(() => nav('/login'), 3000)
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
          <Title level={3} style={{ marginBottom: 4 }}>重設密碼</Title>
          <Text type="secondary">請設定您的新密碼</Text>
        </div>

        {submitted ? (
          <Alert
            type="success"
            icon={<CheckCircleOutlined />}
            message="密碼已重設成功"
            description="3 秒後將自動跳轉至登入頁，請使用新密碼登入。"
            showIcon
          />
        ) : (
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="新密碼"
              name="password"
              rules={[
                { required: true, message: '請輸入新密碼' },
                { min: 8, message: '密碼至少 8 個字元' },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="輸入新密碼（至少 8 字元）"
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label="確認新密碼"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '請再次輸入新密碼' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('兩次輸入的密碼不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="再次輸入新密碼"
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                autoComplete="new-password"
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
              確認重設密碼
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
    </div>
  )
}
