// ─────────────────────────────────────────────
// 公告工具函式
// ─────────────────────────────────────────────

/**
 * （舊版相容）取出該通路應該看到的「單則」公告。
 * 新程式碼請改用 getChannelAnnouncements。
 */
export function getChannelAnnouncement(ann, channelId) {
  if (!ann || !ann.isVisible) return null
  if (ann.audience === 'all') return ann
  if (Array.isArray(ann.audience) && ann.audience.includes(channelId)) return ann
  return null
}

/**
 * 取出該通路看得到的「公告陣列」。
 * - 已 isVisible
 * - audience 對得上（'all' 或包含 channelId）
 * - 新到舊排序（依 publishedAt）
 */
export function getChannelAnnouncements(list, channelId) {
  if (!Array.isArray(list)) return []
  return list
    .filter(a => a.isVisible)
    .filter(a => a.audience === 'all' || (Array.isArray(a.audience) && a.audience.includes(channelId)))
    .slice()  // 不直接動到原陣列
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
}

// ── 資料層已讀追蹤（寫入公告物件的 readBy 陣列） ────────────────

/** 該通路是否已讀此則公告（依資料層 readBy） */
export function isRead(ann, channelId) {
  return Array.isArray(ann?.readBy) && ann.readBy.includes(channelId)
}

// ── 已讀變更 pub/sub（讓 VendorLayout 即時更新紅點） ────────────
let readUpdateListeners = []

/** 訂閱已讀變更，回傳 unsubscribe 函式 */
export function subscribeReadUpdates(fn) {
  readUpdateListeners.push(fn)
  return () => { readUpdateListeners = readUpdateListeners.filter(f => f !== fn) }
}

function notifyReadUpdated() {
  readUpdateListeners.forEach(fn => fn())
}

/**
 * 標記已讀：直接 mutate 公告物件的 readBy（與 fakeData 同一個 reference）。
 * 呼叫後自動廣播，讓所有訂閱者（VendorLayout 等）即時更新計數。
 * @param {object[]} annList  — 完整公告陣列（fakeData.announcements）
 * @param {string}   annId    — 公告 id
 * @param {string}   channelId
 */
export function markRead(annList, annId, channelId) {
  const ann = annList.find(a => a.id === annId)
  if (!ann) return
  if (!Array.isArray(ann.readBy)) ann.readBy = []
  if (!ann.readBy.includes(channelId)) {
    ann.readBy.push(channelId)
    notifyReadUpdated()
  }
}

/** 該通路在當前公告陣列下，未讀的數量（依資料層 readBy） */
export function getUnreadCount(list, channelId) {
  const visible = getChannelAnnouncements(list, channelId)
  return visible.filter(a => !isRead(a, channelId)).length
}

/**
 * 取出第一則「重要 + 本裝置彈窗未確認」的公告。
 * 彈窗確認與否使用 localStorage（裝置層），與已讀/未讀資料層分開。
 */
export function getNextForcePopup(list, channelId) {
  const visible = getChannelAnnouncements(list, channelId)
  const popped  = new Set(getAckedIds(channelId))   // localStorage：本裝置已彈過
  // 從舊到新彈，避免一次彈最新的、忽略還沒看的舊重要公告
  return [...visible].reverse().find(a => a.priority === 'important' && !popped.has(a.id)) ?? null
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
