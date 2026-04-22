import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Breadcrumb } from 'antd'

const { Sider, Content } = Layout

const HEADER_H = 48
const SIDER_W  = 150

const PAGE_NAMES = {
  orders:      '訂單管理',
  settlements: '結算管理',
  products:    '商品管理',
  categories:  '分類管理',
  templates:   '品項表模板',
  channels:    '通路名單',
  analytics:   '損益分析',
}

const MENU_ITEMS = [
  {
    key: 'b2b',
    label: 'B2B管理',
    children: [
      { key: 'orders',      label: '訂單管理' },
      { key: 'settlements', label: '結算管理' },
      { key: 'products',    label: '商品管理' },
      { key: 'categories',  label: '分類管理' },
      { key: 'templates',   label: '品項表模板' },
      { key: 'channels',    label: '通路名單' },
      { key: 'analytics',   label: '損益分析' },
    ],
  },
]

export default function AdminLayout() {
  const nav = useNavigate()
  const loc = useLocation()

  const current = loc.pathname.split('/')[2] ?? 'orders'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1002,
        height: HEADER_H,
        background: '#D7F4DA',
        borderBottom: '1px solid rgb(209,210,207)',
        boxShadow: '13px 3px 20px rgba(0,0,0,.15)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
      }}>
        <img
          src="https://greenboxcdn.azureedge.net/images/greenbox-logo-mark.png"
          alt="無毒農"
          style={{ height: 32 }}
        />
        <Breadcrumb
          style={{ fontSize: 15 }}
          items={[
            { title: <span style={{ color: '#555' }}>B2B管理</span> },
            { title: <strong>{PAGE_NAMES[current] ?? ''}</strong> },
          ]}
        />
      </header>

      <Layout style={{ marginTop: HEADER_H }}>
        {/* ── Sidebar ── */}
        <Sider
          width={SIDER_W}
          style={{
            position: 'fixed', top: HEADER_H, left: 0,
            height: `calc(100vh - ${HEADER_H}px)`,
            background: '#32323a', overflow: 'auto',
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[current]}
            defaultOpenKeys={['b2b']}
            items={MENU_ITEMS}
            onClick={e => nav(`/admin/${e.key}`)}
            style={{ background: '#32323a', borderRight: 0, paddingTop: 8 }}
          />
        </Sider>

        {/* ── Content ── */}
        <Layout style={{ marginLeft: SIDER_W, background: '#f1f2f7', minHeight: `calc(100vh - ${HEADER_H}px)` }}>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <style>{`
        /* ── 基本文字 ── */
        .ant-menu-dark .ant-menu-item,
        .ant-menu-dark .ant-menu-submenu-title {
          color: #fff;
          font-size: 14px;
        }

        /* ── 隱藏所有 anticon（小圖示）── */
        .ant-menu-dark .ant-menu-item .anticon,
        .ant-menu-dark .ant-menu-submenu-title .anticon {
          display: none !important;
        }

        /* ── 隱藏 antd 預設右側箭頭 ── */
        .ant-menu-dark .ant-menu-submenu-arrow {
          display: none !important;
        }

        /* ── 左側自訂箭頭（▶ / ▼）── */
        .ant-menu-dark .ant-menu-submenu-title {
          padding-left: 16px !important;
          display: flex !important;
          align-items: center !important;
        }
        .ant-menu-dark .ant-menu-submenu-title::before {
          content: '▶';
          font-size: 9px;
          margin-right: 8px;
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .ant-menu-dark .ant-menu-submenu-open > .ant-menu-submenu-title::before {
          content: '▼';
        }

        /* ── Submenu title hover ── */
        .ant-menu-dark .ant-menu-submenu-title:hover,
        .ant-menu-dark .ant-menu-submenu-open > .ant-menu-submenu-title {
          background-color: #28282e !important;
          color: bisque !important;
        }

        /* ── 子項目 ── */
        .ant-menu-dark .ant-menu-sub {
          background: #28282e !important;
        }
        .ant-menu-dark .ant-menu-sub .ant-menu-item {
          padding-left: 28px !important;
          font-size: 14px;
        }
        .ant-menu-dark .ant-menu-item:hover {
          background-color: #28282e !important;
          color: bisque !important;
        }
        .ant-menu-dark .ant-menu-item-selected {
          background-color: #202025 !important;
          color: bisque !important;
        }

        /* ── row highlight ── */
        .row-error td { background: #fff1f0 !important; }
        .row-error:hover td { background: #ffe0de !important; }
      `}</style>
    </Layout>
  )
}
