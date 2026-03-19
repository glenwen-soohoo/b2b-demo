import { useNavigate } from 'react-router-dom'
import { Button, Typography, Space } from 'antd'
import { ShopOutlined, SettingOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function HomePage() {
  const nav = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6ffed 0%, #e3f2fd 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🌱</div>
        <Title level={3} style={{ marginBottom: 4 }}>粥寶寶 B2B 通路系統</Title>
        <Text type="secondary">Demo 版本</Text>
      </div>

      <Space size={16}>
        <Button
          size="large"
          type="primary"
          icon={<ShopOutlined />}
          style={{ background: '#52c41a', borderColor: '#52c41a', height: 48, paddingInline: 32 }}
          onClick={() => nav('/login')}
        >
          廠商入口
        </Button>
        <Button
          size="large"
          icon={<SettingOutlined />}
          style={{ height: 48, paddingInline: 32 }}
          onClick={() => nav('/admin')}
        >
          管理後台
        </Button>
      </Space>
    </div>
  )
}
