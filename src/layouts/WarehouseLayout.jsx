import { Outlet, useNavigate, Navigate } from 'react-router-dom'
import { Layout, Button, Space, Typography } from 'antd'
import { InboxOutlined, LogoutOutlined } from '@ant-design/icons'
import { useWarehouse } from '../context/WarehouseContext'

const { Header, Content } = Layout
const { Text } = Typography

export default function WarehouseLayout() {
  const nav = useNavigate()
  const { user, logout } = useWarehouse()

  if (!user) return <Navigate to="/warehouse/login" replace />

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        background: '#0050b3',
      }}>
        <Space>
          <InboxOutlined style={{ color: '#fff', fontSize: 20 }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>倉庫確認系統</span>
          <Text style={{ color: '#91caff', fontSize: 13 }}>— {user.name}</Text>
        </Space>
        <Button type="text" icon={<LogoutOutlined />} style={{ color: '#fff' }}
          onClick={() => { logout(); nav('/warehouse/login') }}>
          登出
        </Button>
      </Header>
      <Layout style={{ background: '#f0f5ff' }}>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
