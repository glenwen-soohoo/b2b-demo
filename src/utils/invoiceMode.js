// ─────────────────────────────────────────────
// 發票模式（兩個正交軸）
//
// invoicePeriod  = 結算頻率（多久開一張發票）
//   - 'monthly'   月結（所有訂單彙總到月底結算單，業務手動開立）
//   - 'per_order' 單筆開票（每筆訂單到貨即開，走主站 InvoiceService）
//
// invoiceTaxScope = 發票統編範圍（每張發票的買受人怎麼決定）
//   - 'channel'    通路統一統編（一律用通路 invoiceTitle / taxId）
//   - 'per_store'  依門市分別統編（用 address.buyerName / buyerTaxId）
//
// 4 種組合對應到舊的 invoiceTiming：
//   monthly   + channel   = combined                   整合月結
//   monthly   + per_store = per_store                  門市月結
//   per_order + channel   = per_order                  單筆開票
//   per_order + per_store = per_order_with_store_tax   單筆開票（門市統編）
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
export function invoiceModeLabel(period, taxScope) {
  if (period === 'monthly'   && taxScope === 'channel')   return '整合月結'
  if (period === 'monthly'   && taxScope === 'per_store') return '門市月結'
  if (period === 'per_order' && taxScope === 'channel')   return '單筆開票'
  if (period === 'per_order' && taxScope === 'per_store') return '單筆開票（門市統編）'
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

// 從 channel 物件取兩個軸（提供 fallback）
export function getInvoiceMode(channel) {
  return {
    period:   channel?.invoicePeriod   ?? 'monthly',
    taxScope: channel?.invoiceTaxScope ?? 'channel',
  }
}
