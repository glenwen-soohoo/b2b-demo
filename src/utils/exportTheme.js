// Shared color/style tokens for all export utilities (PDF + Excel)

export const COLOR = {
  text:        '#2C2C2C',
  textMuted:   '#8C8C8C',
  textLight:   '#BFBFBF',
  red:         '#C00000',
  link:        '#1677FF',
  brand:       '#8B5D3B',
  brandSoft:   '#FFFBEA',
  bgBlue:      '#DDEBF7',
  frozen:      '#366092',
  ambient:     '#76933C',
  bgHeader:    '#F5F5F5',
  bgTotal:     '#FFF1B8',
  borderTotal: '#FFC000',
  termsBord:   '#FFE58F',
  borderGray:  '#BFBFBF',
  highlight:   '#C41D7F',
}

// Excel uses ARGB (FF prefix = fully opaque)
export const ARGB = Object.fromEntries(
  Object.entries(COLOR).map(([k, v]) => [k, 'FF' + v.slice(1).toUpperCase()])
)

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}
