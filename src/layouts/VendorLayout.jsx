import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Layout, Menu, Button, Space, Tag } from 'antd'
import { FormOutlined, HistoryOutlined, AccountBookOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useVendor } from '../context/VendorContext'

const { Header, Sider, Content } = Layout

const MENU_ITEMS = [
  { key: 'order',       icon: <FormOutlined />,        label: '商品採購' },
  { key: 'orders',      icon: <HistoryOutlined />,      label: 'B2B訂單紀錄' },
  { key: 'settlements', icon: <AccountBookOutlined />,  label: '結算紀錄' },
  { key: 'profile',     icon: <UserOutlined />,         label: '通路資料' },
]

export default function VendorLayout() {
  const nav = useNavigate()
  const loc = useLocation()
  const { channel, logout } = useVendor()

  if (!channel) return <Navigate to="/login" replace />

  const current = loc.pathname.split('/')[1] ?? 'order'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        background: '#389e0d',
      }}>
        <Space>
          <img src="https://greenboxcdn.azureedge.net/images/greenbox-logo-mark.png" alt="無毒農" style={{ height: 32, transform: 'translateY(-4px)'}} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>無毒農廠商採購系統</span>
          <Tag color="white" style={{ color: '#389e0d', fontWeight: 600 }}>
            {channel.name}
          </Tag>
        </Space>
        <Button type="text" icon={<LogoutOutlined />} style={{ color: '#fff' }}
          onClick={() => { logout(); nav('/login') }}>
          登出
        </Button>
      </Header>
      <Layout>
        <Sider width={180} style={{ background: '#f6ffed' }}>
          <Menu
            mode="inline"
            selectedKeys={[current]}
            items={MENU_ITEMS}
            onClick={e => nav(`/${e.key}`)}
            style={{ height: '100%', borderRight: 0, paddingTop: 8, background: '#f6ffed' }}
          />
        </Sider>
        <Layout style={{ background: '#f9f9f9' }}>
          <Content><Outlet /></Content>
        </Layout>
      </Layout>
    </Layout>
  )
}
