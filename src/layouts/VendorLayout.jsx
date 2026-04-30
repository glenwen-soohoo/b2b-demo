import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Layout, Menu, Button, Space, Tag, Badge } from 'antd'
import {
  FormOutlined, HistoryOutlined, AccountBookOutlined,
  LogoutOutlined, UserOutlined, BellOutlined, BellFilled,
} from '@ant-design/icons'
import { useVendor } from '../context/VendorContext'
import { announcement as rawAnn } from '../data/fakeData'
import { getChannelAnnouncement, isAcknowledged, addAckedId } from '../utils/announcementUtils'
import AnnouncementModal from '../components/AnnouncementModal'

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
  const [annOpen,     setAnnOpen]     = useState(false)
  const [ackVersion,  setAckVersion]  = useState(0)   // 強制重算已讀狀態

  if (!channel) return <Navigate to="/login" replace />

  const current = loc.pathname.split('/')[1] ?? 'order'

  // 取出該通路看得到的公告
  const ann      = getChannelAnnouncement(rawAnn, channel.id)
  const acked    = ann ? isAcknowledged(channel.id, ann.id) : true    // eslint-disable-line react-hooks/exhaustive-deps
  const hasUnread = ann && !acked

  // 重要公告 + 未確認 → 進入後 0.8 秒自動彈窗
  useEffect(() => {
    if (ann && ann.priority === 'important' && !isAcknowledged(channel.id, ann.id)) {
      const t = setTimeout(() => setAnnOpen(true), 800)
      return () => clearTimeout(t)
    }
  }, [ann?.id, channel.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAcknowledge = () => {
    if (ann) {
      addAckedId(channel.id, ann.id)
      setAckVersion(v => v + 1)  // 觸發重算
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        background: '#389e0d',
      }}>
        <Space>
          <img
            src="https://greenboxcdn.azureedge.net/images/greenbox-logo-mark.png"
            alt="無毒農"
            style={{ height: 32, transform: 'translateY(-4px)' }}
          />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>無毒農廠商採購系統</span>
          <Tag color="white" style={{ color: '#389e0d', fontWeight: 600 }}>
            {channel.name}
          </Tag>
        </Space>

        <Space size={4}>
          {ann && (
            <Badge dot={hasUnread} offset={[-4, 4]}>
              <Button
                type="text"
                icon={hasUnread
                  ? <BellFilled  style={{ fontSize: 18, color: '#fff' }} />
                  : <BellOutlined style={{ fontSize: 18, color: '#fff' }} />
                }
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setAnnOpen(true)}
                title="最新消息"
              />
            </Badge>
          )}

          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{ color: '#fff' }}
            onClick={() => { logout(); nav('/login') }}
          >
            登出
          </Button>
        </Space>
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

      <AnnouncementModal
        announcement={ann}
        open={annOpen}
        onClose={() => setAnnOpen(false)}
        onAcknowledge={handleAcknowledge}
      />
    </Layout>
  )
}
