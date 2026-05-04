import { useMemo, useState } from 'react'
import { Card, List, Tag, Typography, Empty, Badge, Button } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { useVendor } from '../../context/VendorContext'
import { announcements } from '../../data/fakeData'
import {
  getChannelAnnouncements,
  isRead,
  markRead,
} from '../../utils/announcementUtils'
import AnnouncementModal from '../../components/AnnouncementModal'

const { Title, Text } = Typography

export default function VendorAnnouncements() {
  const { channel } = useVendor()
  const [ackVer,    setAckVer]   = useState(0)
  const [modalAnn,  setModalAnn] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // 當前通路可見公告（新到舊）
  const list = useMemo(
    () => (channel ? getChannelAnnouncements(announcements, channel.id) : []),
    [channel?.id],
  )

  // 已讀集合從資料層 readBy 衍生（ackVer 變化時重算）
  const ackedSet = useMemo(
    () => new Set(list.filter(a => isRead(a, channel?.id)).map(a => a.id)),
    [list, channel?.id, ackVer],
  )

  // 點「查看詳細資訊」→ 標記已讀 + 開彈窗
  const handleOpen = (ann) => {
    setModalAnn(ann)
    setModalOpen(true)
    if (channel && !ackedSet.has(ann.id)) {
      markRead(announcements, ann.id, channel.id)  // 同時廣播 → layout 紅點即時消失
      setAckVer(v => v + 1)
    }
  }

  if (!channel) return null

  if (list.length === 0) {
    return (
      <div style={{ padding: 32 }}>
        <Title level={4} style={{ margin: 0, marginBottom: 16 }}>最新資訊</Title>
        <Card size="small">
          <Empty description="目前沒有任何公告" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>最新資訊</Title>
      </div>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <List
          dataSource={list}
          renderItem={item => {
            const isUnread = !ackedSet.has(item.id)
            return (
              <List.Item
                style={{ padding: '12px 16px' }}
                extra={
                  <Button size="small" onClick={() => handleOpen(item)}>
                    查看詳細資訊
                  </Button>
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                  {isUnread && <Badge color="#ff4d4f" style={{ flexShrink: 0 }} />}
                  {item.priority === 'important' && (
                    <Tag
                      color="red"
                      style={{ margin: 0, fontSize: 11, padding: '0 6px', lineHeight: '18px', flexShrink: 0 }}
                    >
                      重要
                    </Tag>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <Text
                      strong={isUnread}
                      style={{
                        display: 'block', fontSize: 13,
                        color: isUnread ? '#1a1a1a' : '#555',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {item.publishedAt?.slice(0, 10) ?? '—'}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )
          }}
        />
      </Card>

      <AnnouncementModal
        announcement={modalAnn}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAcknowledge={() => {}}
      />
    </div>
  )
}
