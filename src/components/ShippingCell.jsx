import { Typography } from 'antd'
import { LinkOutlined } from '@ant-design/icons'

const { Text } = Typography

/**
 * 物流單號 + 黑貓追蹤連結（不顯示貨態，貨態由訂單狀態表達）
 *
 * 用於：OrderDetail 詳情側窗（後台 only，廠商前台不顯示）
 *
 * @param {string} shippingNumber - 黑貓託運單號（11 碼）
 */
export default function ShippingCell({ shippingNumber }) {
  if (!shippingNumber) return <Text type="secondary">—</Text>

  const trackingUrl = `https://www.t-cat.com.tw/inquire?BillID=${shippingNumber}`

  return (
    <a href={trackingUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
      {shippingNumber}
      <LinkOutlined style={{ marginLeft: 4, fontSize: 11 }} />
    </a>
  )
}
