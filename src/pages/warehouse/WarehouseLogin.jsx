import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd'
import { InboxOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { useWarehouse } from '../../context/WarehouseContext'

const { Title, Text } = Typography

export default function WarehouseLogin() {
  const { login } = useWarehouse()
  const nav = useNavigate()
  const [error, setError] = useState(false)

  const handleFinish = ({ username, password }) => {
    const ok = login(username, password)
    if (ok) {
      nav('/warehouse/orders', { replace: true })
    } else {
      setError(true)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f0f5ff',
    }}>
      <Card style={{ width: 360, borderRadius: 12, boxShadow: '0 4px 24px #0001' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <InboxOutlined style={{ fontSize: 40, color: '#1677ff' }} />
          <Title level={4} style={{ margin: '12px 0 4px' }}>倉庫確認系統</Title>
          <Text type="secondary">請使用倉庫帳號登入</Text>
        </div>

        {error && (
          <Alert type="error" message="帳號或密碼錯誤" showIcon style={{ marginBottom: 16 }} />
        )}

        <Form layout="vertical" onFinish={handleFinish} onChange={() => setError(false)}>
          <Form.Item name="username" label="帳號" rules={[{ required: true, message: '請輸入帳號' }]}>
            <Input prefix={<UserOutlined />} placeholder="warehouse" />
          </Form.Item>
          <Form.Item name="password" label="密碼" rules={[{ required: true, message: '請輸入密碼' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>登入</Button>
        </Form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#aaa' }}>
          Demo 帳號：warehouse / 1234
        </div>
      </Card>
    </div>
  )
}
