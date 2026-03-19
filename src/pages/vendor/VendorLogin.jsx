import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Alert } from 'antd'
import { LoginOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { channels } from '../../data/fakeData'
import { useVendor } from '../../context/VendorContext'

const { Title, Text } = Typography

// 帳號對應 channelId
const ACCOUNTS = {
  babeboss:    { channelId: 'c001', password: 'bb1234' },
  greenfarm:   { channelId: 'c002', password: 'gf5678' },
  healthroot:  { channelId: 'c003', password: 'hr9012' },
}

export default function VendorLogin() {
  const nav = useNavigate()
  const { login } = useVendor()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onFinish = ({ account, password }) => {
    setLoading(true)
    setTimeout(() => {
      const matched = ACCOUNTS[account?.trim().toLowerCase()]
      if (matched && matched.password === password) {
        const ch = channels.find(c => c.id === matched.channelId)
        login(ch)
        nav('/order')
      } else {
        setError('帳號或密碼錯誤，請再試一次')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6ffed 0%, #e8f5e9 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* 主登入卡片 */}
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="https://greenboxcdn.azureedge.net/images/greenbox-logo-mark.png" alt="logo" style={{ height: 56, marginBottom: 8 }} />
          <Title level={3} style={{ marginBottom: 4 }}>廠商採購登入</Title>
          <Text type="secondary">無毒農通路系統</Text>
        </div>

        {error && (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
        )}

        <Form layout="vertical" onFinish={onFinish} onValuesChange={() => setError('')}>
          <Form.Item label="帳號" name="account"
            rules={[{ required: true, message: '請輸入帳號' }]}>
            <Input size="large" placeholder="輸入帳號" autoComplete="username" />
          </Form.Item>

          <Form.Item label="密碼" name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}>
            <Input.Password size="large" placeholder="輸入密碼" autoComplete="current-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large"
            loading={loading} icon={<LoginOutlined />}
            style={{ background: '#52c41a', borderColor: '#52c41a', marginTop: 4 }}
          >
            登入
          </Button>
        </Form>

      </Card>

      {/* 右下角 Demo 說明卡片 */}
      <Card
        size="small"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 280, borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          border: '1px solid #b7eb8f',
          background: '#f6ffed',
        }}
        title={
          <span style={{ fontSize: 12, color: '#389e0d' }}>
            <InfoCircleOutlined style={{ marginRight: 6 }} />
            Demo 測試帳號
          </span>
        }
      >
        <div style={{ fontSize: 12, color: '#555', lineHeight: 2 }}>
          <div><Text code>babeboss</Text> / <Text code>bb1234</Text> — 貝比波士</div>
          <div><Text code>greenfarm</Text> / <Text code>gf5678</Text> — 綠色小農</div>
          <div><Text code>healthroot</Text> / <Text code>hr9012</Text> — 好自然健康館</div>
        </div>
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
          正式上線後此區塊將移除，改接後端認證
        </Text>
      </Card>
    </div>
  )
}
