import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Typography } from 'antd'
import {
  ShoppingCartOutlined, TeamOutlined, AppstoreOutlined,
  BarChartOutlined, ArrowLeftOutlined, FileTextOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const MENU_ITEMS = [
  { key: 'orders',    icon: <ShoppingCartOutlined />, label: '預訂 & 結算' },
  { key: 'products',  icon: <AppstoreOutlined />,     label: '商品管理' },
  { key: 'channels',  icon: <TeamOutlined />,          label: '通路名單' },
  { key: 'templates', icon: <FileTextOutlined />,      label: '品項表模板' },
  { key: 'analytics', icon: <BarChartOutlined />,      label: '損益分析' },
]

export default function AdminLayout() {
  const nav = useNavigate()
  const loc = useLocation()

  // /admin/orders → 'orders'
  const current = loc.pathname.split('/')[2] ?? 'orders'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>🌱 管理後台</span>
        </div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          style={{ color: '#fff' }}
          onClick={() => nav('/')}
        >
          返回入口
        </Button>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[current]}
            items={MENU_ITEMS}
            onClick={e => nav(`/admin/${e.key}`)}
            style={{ height: '100%', borderRight: 0, paddingTop: 8 }}
          />
        </Sider>
        <Layout style={{ background: '#f5f5f5' }}>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      <style>{`
        .row-error td { background: #fff1f0 !important; }
        .row-error:hover td { background: #ffe0de !important; }
      `}</style>
    </Layout>
  )
}
