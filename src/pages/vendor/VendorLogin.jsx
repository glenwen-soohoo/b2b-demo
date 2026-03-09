import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Select, Button, Typography, Alert, Divider } from 'antd'
import { LoginOutlined, ArrowLeftOutlined, LockOutlined } from '@ant-design/icons'
import { channels } from '../../data/fakeData'
import { useVendor } from '../../context/VendorContext'

const { Title, Text } = Typography

// Demo 用的假帳密（通路 id → 密碼）
const DEMO_PASSWORDS = {
  c001: 'bb1234',
  c002: 'gf5678',
  c003: 'hr9012',
}

export default function VendorLogin() {
  const nav = useNavigate()
  const { login } = useVendor()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onFinish = ({ channelId, password }) => {
    setLoading(true)
    setTimeout(() => {
      if (DEMO_PASSWORDS[channelId] === password) {
        const ch = channels.find(c => c.id === channelId)
        login(ch)
        nav('/vendor/order')
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
      <Card style={{ width: 420, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏪</div>
          <Title level={3} style={{ marginBottom: 4 }}>廠商採購系統</Title>
          <Text type="secondary">請選擇通路並輸入密碼登入</Text>
        </div>

        {error && (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
        )}

        <Form layout="vertical" onFinish={onFinish} onValuesChange={() => setError('')}>
          <Form.Item label="合作通路" name="channelId"
            rules={[{ required: true, message: '請選擇通路' }]}>
            <Select
              placeholder="請選擇您的通路"
              options={channels.map(c => ({ value: c.id, label: c.name }))}
              size="large"
            />
          </Form.Item>

          <Form.Item label="登入密碼" name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}>
            <input
              type="password"
              placeholder="輸入密碼"
              style={{
                width: '100%', height: 40, padding: '0 12px',
                border: '1px solid #d9d9d9', borderRadius: 6,
                fontSize: 14, outline: 'none',
              }}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large"
            loading={loading} icon={<LoginOutlined />}
            style={{ background: '#52c41a', borderColor: '#52c41a', marginTop: 4 }}
          >
            登入
          </Button>
        </Form>

        <Divider plain><Text type="secondary" style={{ fontSize: 12 }}>Demo 測試帳號</Text></Divider>
        <div style={{ background: '#f6ffed', borderRadius: 8, padding: 12, fontSize: 12, color: '#555' }}>
          <div>🏪 貝比波士有限公司 → <Text code>bb1234</Text></div>
          <div style={{ marginTop: 4 }}>🏪 綠色小農超市 → <Text code>gf5678</Text></div>
          <div style={{ marginTop: 4 }}>🏪 好自然健康館 → <Text code>hr9012</Text></div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => nav('/')}>
            返回入口
          </Button>
        </div>
      </Card>
    </div>
  )
}
