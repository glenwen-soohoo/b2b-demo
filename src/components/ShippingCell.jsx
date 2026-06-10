import { Typography } from 'antd'
import { LinkOutlined } from '@ant-design/icons'

const { Text } = Typography

// ─────────────────────────────────────────────
// 黑貓貨態（對應主站 Orders.BlackCatStatus，由 BlackCatHelper.ScratchOrdersState 爬蟲寫入）
// 主站爬蟲規則：未出貨時欄位為 NULL/空字串，出貨後才開始寫入下列其中一個值。
// ─────────────────────────────────────────────
export const BLACK_CAT_STATUS_LABEL = {
  '已出貨':   '已出貨',
  '配送中':   '配送中',
  '順利送達': '順利送達',
}

/**
 * 把 Orders.BlackCatStatus 翻譯成顯示文字。
 * NULL / 空字串 → '未出貨'（demo 端 UI 用，DB 不要塞「未出貨」字串）
 */
export function formatBlackCatStatus(value) {
  if (!value) return '未出貨'
  return BLACK_CAT_STATUS_LABEL[value] ?? value
}

/**
 * 物流單號 + 黑貓追蹤連結（不顯示貨態，貨態由訂單狀態表達）
 *
 * 用於：OrderDetail 詳情側窗（後台 only，廠商前台不顯示）
 *
 * 對應主站欄位：Orders.BlackCatNum (NVarChar(50))
 *
 * @param {string} blackCatNum - 黑貓託運單號
 */
export default function ShippingCell({ blackCatNum }) {
  if (!blackCatNum) return <Text type="secondary">—</Text>

  const trackingUrl = `https://www.t-cat.com.tw/inquire?BillID=${blackCatNum}`

  return (
    <a href={trackingUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
      {blackCatNum}
      <LinkOutlined style={{ marginLeft: 4, fontSize: 11 }} />
    </a>
  )
}
