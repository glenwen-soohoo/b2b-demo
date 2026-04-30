// ─────────────────────────────────────────────
// 公告工具函式
// ─────────────────────────────────────────────

/**
 * 取出該通路應該看到的公告。
 * 回傳 null 代表「無公告顯示」。
 */
export function getChannelAnnouncement(ann, channelId) {
  if (!ann || !ann.isVisible) return null
  if (ann.audience === 'all') return ann
  if (Array.isArray(ann.audience) && ann.audience.includes(channelId)) return ann
  return null
}

// ── localStorage 已讀記錄 ──────────────────────
// key: b2b_ack_{channelId}  value: JSON array of acknowledged ann.id
const ACK_KEY = channelId => `b2b_ack_${channelId}`

export function getAckedIds(channelId) {
  try { return JSON.parse(localStorage.getItem(ACK_KEY(channelId))) ?? [] } catch { return [] }
}

export function addAckedId(channelId, annId) {
  const ids = getAckedIds(channelId)
  if (!ids.includes(annId)) {
    localStorage.setItem(ACK_KEY(channelId), JSON.stringify([...ids, annId]))
  }
}

export function isAcknowledged(channelId, annId) {
  return getAckedIds(channelId).includes(annId)
}

// ── 簡易 Markdown → HTML ─────────────────────
function escapeHtml(t) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inlineMd(text) {
  let t = escapeHtml(text)
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>')
  t = t.replace(/`(.+?)`/g, '<code style="background:#f5f5f5;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;">$1</code>')
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#1677ff;text-decoration:underline;">$1</a>')
  return t
}

export function renderMarkdown(text) {
  if (!text) return ''
  const lines = text.split('\n')
  let html = ''
  let inList = false
  let listHtml = ''

  const flushList = () => {
    if (inList) {
      html += `<ul style="margin:6px 0 8px 0;padding-left:20px;">${listHtml}</ul>`
      listHtml = ''
      inList = false
    }
  }

  for (const raw of lines) {
    if (raw.startsWith('### ')) {
      flushList()
      html += `<h4 style="margin:10px 0 4px;font-size:13px;font-weight:700;">${inlineMd(raw.slice(4))}</h4>`
    } else if (raw.startsWith('## ')) {
      flushList()
      html += `<h3 style="margin:14px 0 6px;font-size:14px;font-weight:700;">${inlineMd(raw.slice(3))}</h3>`
    } else if (raw.startsWith('# ')) {
      flushList()
      html += `<h2 style="margin:16px 0 6px;font-size:16px;font-weight:700;">${inlineMd(raw.slice(2))}</h2>`
    } else if (raw.startsWith('- ') || raw.startsWith('* ')) {
      inList = true
      listHtml += `<li style="margin:3px 0;">${inlineMd(raw.slice(2))}</li>`
    } else if (raw.trim() === '') {
      flushList()
      html += '<div style="height:8px;"></div>'
    } else {
      flushList()
      html += `<p style="margin:3px 0;line-height:1.75;">${inlineMd(raw)}</p>`
    }
  }
  flushList()
  return html
}
