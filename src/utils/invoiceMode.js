// ─────────────────────────────────────────────
// 發票模式（兩個正交軸）
//
// 發票一律由 B2B 自有 B2BInvoiceService 開立（先開後收）；主站不開 B2B 發票。
//
// invoicePeriod  = 結算頻率（多久開一張發票）
//   - 'monthly'   月結（彙整當月訂單壓一張；結算日後 3 天系統自動開立）
//   - 'per_order' 單筆開票（一訂單一張；到貨後 3 天系統自動開立）
//
// invoiceTaxScope = 發票統編範圍（每張發票的買受人怎麼決定）
//   - 'per_store'  依門市分別統編（用 address.buyerName / buyerTaxId）—— 現行一律走這個
//   - 'channel'    （已停用）通路統一統編；後台已移除此選項，僅保留以相容歷史快照資料
//
// 現行只剩 invoicePeriod 兩種（月結 / 單筆開票），統編一律 per_store。
// ─────────────────────────────────────────────

export const INVOICE_PERIOD_LABEL = {
  monthly:   '月結',
  per_order: '單筆開票',
}

export const INVOICE_TAX_SCOPE_LABEL = {
  channel:   '通路統一統編',
  per_store: '依門市分別統編',
}

// 完整中文 label（業務看到的描述）
// 統編一律 per_store，發票模式只看頻率（不再加註「門市統編」）
export function invoiceModeLabel(period) {
  if (period === 'monthly')   return '整合月結'
  if (period === 'per_order') return '單筆開票'
  return '—'
}

// 配色（讓 UI Tag 在不同模式下顏色一致）
export function invoiceModeColor(period, taxScope) {
  if (period === 'monthly'   && taxScope === 'channel')   return 'purple'
  if (period === 'monthly'   && taxScope === 'per_store') return 'geekblue'
  if (period === 'per_order' && taxScope === 'channel')   return 'default'
  if (period === 'per_order' && taxScope === 'per_store') return 'magenta'
  return 'default'
}

// 是否為訂單級開票（發票跟著訂單跑、不在結算單上手填）
export const isOrderLevelInvoice = (period) => period === 'per_order'

// 是否依門市分別統編（地址表格要顯示 buyerName / buyerTaxId 欄位）
export const allowsStoreTaxId = (taxScope) => taxScope === 'per_store'

// ── 結算日（後台只開放兩種）──
//   25     → 每月 25 日（隔日 26 號跑結算排程）
//   'last' → 每月最後一日（次月 1 日跑結算排程）
export const settlementDayLabel = (day) => (day === 'last' ? '每月最後一日' : `每月 ${day} 日`)
// 數值比較用（判斷「今天是否已過結算日」）：最後一日視為當月不會被超過
export const settlementCutoffDay = (day) => (day === 'last' ? 31 : (day ?? 25))

// 從 channel 物件取兩個軸（提供 fallback）
export function getInvoiceMode(channel) {
  return {
    period:   channel?.invoicePeriod   ?? 'monthly',
    taxScope: channel?.invoiceTaxScope ?? 'channel',
  }
}
