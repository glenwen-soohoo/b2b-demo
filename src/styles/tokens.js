// B2B Design Tokens
// 這裡是跨頁面、跨元件共用的樣式常數。
// 改這裡會全站生效，請謹慎。

// ── 溫層主題 ──────────────────────────────────────────────
// 原始值（bg / border / text / icon）
export const TEMP = {
  frozen:  { bg: '#e6f4ff', border: '#91caff', text: '#0958d9', icon: '❄️' },
  ambient: { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d', icon: '🌿' },
}

// CSS style 物件（可直接 spread 到 React style prop）
export const TEMP_STYLE = {
  frozen:  { background: TEMP.frozen.bg,  border: `1px solid ${TEMP.frozen.border}`,  color: TEMP.frozen.text  },
  ambient: { background: TEMP.ambient.bg, border: `1px solid ${TEMP.ambient.border}`, color: TEMP.ambient.text },
}

// 溫層圖示（快捷）
export const TEMP_ICON = { frozen: TEMP.frozen.icon, ambient: TEMP.ambient.icon }

// ── 品牌色 ────────────────────────────────────────────────
export const BRAND = {
  vendorHeader:  '#389e0d',   // 廠商前台 header（深綠）
  adminHeader:   '#D7F4DA',   // 管理後台 header（淺綠）
  adminSider:    '#32323a',   // 管理後台 sidebar
  adminContent:  '#f1f2f7',   // 管理後台內容區背景
  vendorSider:   '#f6ffed',   // 廠商前台 sidebar（= ambient.bg）
}

// ── 語意色（補充 antd 預設）────────────────────────────────
// antd primary (#1677ff) 透過 ConfigProvider 設定，不在這裡重複
export const COLOR = {
  success: '#52c41a',   // B2B 確認 / 送出 等正向操作
  warning: '#fa8c16',
  danger:  '#ff4d4f',
  purple:  '#722ed1',   // 已結算鎖定
  cyan:    '#13c2c2',   // 實收金額
}

// ── 版面 ──────────────────────────────────────────────────
export const LAYOUT = {
  pagePadding:        24,
  vendorMaxWidth:    960,
  profileMaxWidth:   800,
  shippingMaxWidth:  900,
}
