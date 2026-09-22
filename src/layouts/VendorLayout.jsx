import { useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Layout, Menu, Button, Space, Tag } from 'antd'
import {
  FormOutlined, HistoryOutlined, AccountBookOutlined,
  LogoutOutlined, UserOutlined,
  NotificationOutlined, FileProtectOutlined,
} from '@ant-design/icons'
import { useVendor } from '../context/VendorContext'
import { announcements } from '../data/fakeData'
import {
  getChannelAnnouncements, getUnreadCount, getNextForcePopup,
  addAckedId, markRead, subscribeReadUpdates,
} from '../utils/announcementUtils'
import AnnouncementModal from '../components/AnnouncementModal'
import ContractModal from '../components/ContractModal'
import { getCurrentContractVersion } from '../data/contractData'
import { needsConsent, getConsentState, subscribeContractUpdates } from '../utils/contractStore'

const { Header, Sider, Content } = Layout

export default function VendorLayout() {
  const nav = useNavigate()
  const loc = useLocation()
  const { channel, logout } = useVendor()
  const [annOpen,    setAnnOpen]    = useState(false)
  const [popupAnn,   setPopupAnn]   = useState(null)   // 強制彈窗的那一則
  const [ackVersion, setAckVersion] = useState(0)      // 強制重算未讀
  const [contractTick, setContractTick] = useState(0)  // 同意合約後重算 gating

  if (!channel) return <Navigate to="/login" replace />

  const current = loc.pathname.split('/')[1] ?? 'order'

  // ── 該通路看得到的公告（已讀統計用） ──
  const visibleAnns = useMemo(
    () => getChannelAnnouncements(announcements, channel.id),
    [channel.id, ackVersion]
  )
  const unreadCount = useMemo(
    () => getUnreadCount(announcements, channel.id),
    [channel.id, ackVersion]
  )

  // ── 訂閱已讀變更（VendorAnnouncements 頁標記已讀時，這裡的紅點即時消失） ──
  useEffect(() => {
    const unsub = subscribeReadUpdates(() => setAckVersion(v => v + 1))
    return unsub
  }, [])

  // ── 訂閱合約同意變更（同意後 gating 立即重算） ──
  useEffect(() => subscribeContractUpdates(() => setContractTick(t => t + 1)), [])

  // ── 合約 gating：未同意（或需重簽）就硬擋，同意才能使用 ──
  const contractVersion = getCurrentContractVersion()
  const mustConsent  = needsConsent(channel.id)          // 依 contractTick 重算
  const consentState = getConsentState(channel.id)
  void contractTick

  // ── 進入廠商端 0.8 秒後，若有重要+未讀公告 → 強制彈窗（只彈第一則，避免連續轟炸） ──
  //    合約未同意時先讓合約 gating 擋著，公告等同意後再彈。
  useEffect(() => {
    if (needsConsent(channel.id)) return
    const next = getNextForcePopup(announcements, channel.id)
    if (next) {
      const t = setTimeout(() => {
        setPopupAnn(next)
        setAnnOpen(true)
      }, 800)
      return () => clearTimeout(t)
    }
  }, [channel.id, contractTick])

  const handleAcknowledge = () => {
    if (popupAnn) {
      addAckedId(channel.id, popupAnn.id)          // localStorage：本裝置不再彈窗
      markRead(announcements, popupAnn.id, channel.id)  // 資料層：標記已讀
      setAckVersion(v => v + 1)
    }
  }

  // ── 左側選單（包含未讀紅點） ──
  const MENU_ITEMS = [
    {
      key: 'announcements',
      icon: <NotificationOutlined />,
      label: (
        <Space size={6}>
          最新資訊
          {unreadCount > 0 && (
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#ff4d4f', display: 'inline-block', flexShrink: 0,
            }} />
          )}
        </Space>
      ),
    },
    { key: 'order',         icon: <FormOutlined />,         label: '商品採購' },
    { key: 'orders',        icon: <HistoryOutlined />,       label: 'B2B訂單紀錄' },
    { key: 'settlements',   icon: <AccountBookOutlined />,   label: '結算紀錄' },
    { key: 'profile',       icon: <UserOutlined />,          label: '通路資料' },
    { key: 'contract',      icon: <FileProtectOutlined />,   label: '通路合約' },
  ]

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
        announcement={popupAnn}
        open={annOpen}
        onClose={() => setAnnOpen(false)}
        onAcknowledge={handleAcknowledge}
      />

      {/* 合約 gating：未同意（或需重簽）時硬擋，同意才能使用 */}
      <ContractModal
        open={mustConsent}
        channel={channel}
        version={contractVersion}
        closable={false}
        reconsent={consentState === 'need_reconsent'}
        onAgreed={() => setContractTick(t => t + 1)}
      />
    </Layout>
  )
}
