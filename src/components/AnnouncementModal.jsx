import { useEffect, useRef, useState } from 'react'
import { Button } from 'antd'
import { CloseOutlined, NotificationOutlined } from '@ant-design/icons'
import { renderMarkdown } from '../utils/announcementUtils'

/**
 * 廠商端公告 modal
 * - 重要公告：VendorLayout 自動觸發 open=true（強制彈窗一次）
 * - 一般公告：Header 鈴鐺點擊觸發 open=true
 * - 關閉動畫：modal 縮小至右上角（往鈴鐺方向）
 */
export default function AnnouncementModal({ announcement, open, onClose, onAcknowledge }) {
  // phase: hidden | entering | visible | closing
  const [phase, setPhase] = useState('hidden')
  const timerRef = useRef(null)

  // open → entering → visible
  useEffect(() => {
    if (open && announcement) {
      setPhase('entering')
      const t = setTimeout(() => setPhase('visible'), 16) // 等瀏覽器完成第一次渲染
      return () => clearTimeout(t)
    }
  }, [open, announcement?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // 關閉：visible → closing → hidden
  const startClose = (ack = false) => {
    if (phase === 'closing' || phase === 'hidden') return
    setPhase('closing')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setPhase('hidden')
      if (ack) onAcknowledge?.()
      onClose?.()
    }, 340)
  }

  // 外部把 open 改 false 時（例：父層直接關）
  useEffect(() => {
    if (!open && phase !== 'hidden') startClose(false)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(timerRef.current), [])

  if (phase === 'hidden' || !announcement) return null

  const isVisible = phase === 'visible'
  const isClosing = phase === 'closing'

  return (
    /* 半透明遮罩 */
    <div
      onClick={e => { if (e.target === e.currentTarget) startClose(false) }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isVisible ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
        transition: isClosing ? 'background 0.34s ease-in' : 'background 0.2s ease-out',
      }}
    >
      {/* modal 本體 */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          width: 540,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '78vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          // transformOrigin 指向右上角，縮小時往鈴鐺方向飛
          transformOrigin: 'top right',
          transform: isVisible
            ? 'scale(1)'
            : isClosing
            ? 'scale(0.04)'
            : 'scale(0.88)',
          opacity: isVisible ? 1 : 0,
          transition: isClosing
            ? 'transform 0.34s cubic-bezier(0.55,0,1,0.45), opacity 0.28s ease-in'
            : 'transform 0.22s cubic-bezier(0,0,0.2,1), opacity 0.18s ease-out',
        }}
      >
        {/* ── 標題列 ── */}
        <div style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0,
        }}>
          <NotificationOutlined style={{ color: '#1677ff', fontSize: 15, flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: '#1a1a1a', lineHeight: 1.3 }}>
            {announcement.title}
          </span>
          <Button
            type="text" size="small"
            icon={<CloseOutlined />}
            style={{ color: '#aaa', flexShrink: 0 }}
            onClick={() => startClose(false)}
          />
        </div>

        {/* ── 內文 ── */}
        <div
          style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontSize: 13, color: '#333' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(announcement.content) }}
        />

        {/* ── 底列 ── */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
          background: '#fafafa',
        }}>
          <span style={{ fontSize: 11, color: '#bbb' }}>
            {announcement.publishedAt?.slice(0, 10)}
            {announcement.expiresAt ? ` ～ ${announcement.expiresAt.slice(0, 10)}` : ''}
          </span>
          <Button type="primary" onClick={() => startClose(true)}>
            我知道了
          </Button>
        </div>
      </div>
    </div>
  )
}
