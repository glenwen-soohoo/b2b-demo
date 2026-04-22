// 空白採購單 Excel（v6 — 對齊範例 PDF）
import ExcelJS from 'exceljs'
import { makeEan13PngBuffer } from './barcodePng'

const LOGO_PATH = `${import.meta.env.BASE_URL}assets/logo.png`

// 色票
const C = {
  text:        'FF2C2C2C',
  textMuted:   'FF8C8C8C',
  red:         'FFC00000',
  white:       'FFFFFFFF',
  brand:       'FF8B5D3B',
  brandSoft:   'FFFFFBEA',   // 淡米黃（子分類 / 折扣 / 條款 底）
  bgBlue:      'FFDDEBF7',   // 淡藍（小計 / 運費 底）
  frozen:      'FF366092',   // 冷凍深藍
  ambient:     'FF76933C',   // 常溫橄欖綠
  bgHeader:    'FFF5F5F5',   // 灰色（欄頭 / 客戶資訊 label / 簽章說明）
  bgTotal:     'FFFFF1B8',   // 黃色（訂單總金額 底）
  borderTotal: 'FFFFC000',
  termsBord:   'FFFFE58F',
  borderGray:  'FFBFBFBF',   // 淺灰邊框
}

const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
const font = (opts = {}) => ({ name: 'Microsoft JhengHei', size: 11, ...opts })

// 邊框 preset
const THIN = { style: 'thin', color: { argb: C.borderGray } }
const TERMS_BD = { style: 'thin', color: { argb: C.termsBord } }
const MED_YL = { style: 'medium', color: { argb: C.borderTotal } }
const BORDER_ALL = { top: THIN, bottom: THIN, left: THIN, right: THIN }

function sanitizeSheetName(name) {
  return String(name).replace(/[\\/?*:[\]]/g, '_').slice(0, 31)
}

// ── 組單張工作表 ──────────────────────────────────────
function buildSheet(wb, logoImageId, { cat, prods, channel, systemSettings }) {
  const ws = wb.addWorksheet(sanitizeSheetName(cat.name), {
    pageSetup: {
      orientation: 'portrait', paperSize: 9,
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    },
    properties: { defaultRowHeight: 20 },
  })

  ws.columns = [
    { width: 3 },       // A
    { width: 38 },      // B
    { width: 10 },      // C
    { width: 8.43 },    // D
    { width: 11 },      // E
    { width: 24 },      // F
    { width: 18 },      // G
    { width: 3 },       // H
  ]

  const tempColor = cat.temperature === 'frozen' ? C.frozen : C.ambient
  const tempIcon  = cat.temperature === 'frozen' ? '❄️' : '🌿'
  const tempLabel = cat.temperature === 'frozen' ? '冷凍品項' : '常溫品項'

  let row = 1

  // ══════ Row 1：LOGO + 訂購單標題 ══════
  ws.getRow(row).height = 60
  ws.mergeCells(`B${row}:G${row}`)
  const title = ws.getCell(`B${row}`)
  title.value = '訂  購  單'
  title.font = font({ size: 22, bold: true, color: { argb: C.text } })
  title.alignment = { horizontal: 'center', vertical: 'middle' }
  title.border = BORDER_ALL

  if (logoImageId !== null) {
    ws.addImage(logoImageId, {
      tl: { col: 1.1, row: 0.1 },
      ext: { width: 130, height: 50 },
      editAs: 'oneCell',
    })
  }
  row++

  // ══════ Row 2：溫層 header ══════
  ws.getRow(row).height = 36
  ws.mergeCells(`B${row}:G${row}`)
  const tempCell = ws.getCell(`B${row}`)
  tempCell.value = `${tempIcon}   ${tempLabel}`
  tempCell.font = font({ size: 18, bold: true, color: { argb: C.white } })
  tempCell.alignment = { horizontal: 'center', vertical: 'middle' }
  tempCell.fill = fill(tempColor)
  tempCell.border = BORDER_ALL
  row++

  // ══════ Row 3：欄標頭 ══════
  ws.getRow(row).height = 24
  const headers = [
    { col: 2, text: '品\u3000項' },
    { col: 3, text: '單\u3000價' },
    { col: 4, text: '數量' },
    { col: 5, text: '總金額' },
    { col: 6, text: '國際條碼' },
    { col: 7, text: '備\u3000註' },
  ]
  for (const h of headers) {
    const c = ws.getCell(row, h.col)
    c.value = h.text
    c.font = font({ size: 11, bold: true, color: { argb: C.textMuted } })
    c.alignment = { horizontal: 'center', vertical: 'middle' }
    c.fill = fill(C.bgHeader)
    c.border = BORDER_ALL
  }
  row++

  // ══════ 品項表 ══════
  const bySub = {}
  for (const p of prods) {
    if (!bySub[p.subCategory]) bySub[p.subCategory] = []
    bySub[p.subCategory].push(p)
  }
  const orderedSubs = cat.subCategories.map(s => s.name).filter(n => bySub[n]?.length)
  Object.keys(bySub).forEach(n => { if (!orderedSubs.includes(n)) orderedSubs.push(n) })

  let firstProductRow = null
  let lastProductRow  = null

  for (const subName of orderedSubs) {
    // 子分類
    ws.getRow(row).height = 22
    ws.mergeCells(`B${row}:G${row}`)
    const subCell = ws.getCell(`B${row}`)
    subCell.value = subName
    subCell.font = font({ size: 11, bold: true, color: { argb: C.brand } })
    subCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    subCell.fill = fill(C.brandSoft)
    subCell.border = BORDER_ALL
    row++

    // 品項列
    for (const p of bySub[subName]) {
      ws.getRow(row).height = 40

      // B: 品項（richText：名稱粗 + 規格小灰）
      const nameCell = ws.getCell(`B${row}`)
      const nameFont = { name: 'Microsoft JhengHei', size: 11, bold: true, color: { argb: C.text } }
      const specFont = { name: 'Microsoft JhengHei', size: 9, color: { argb: C.textMuted } }
      nameCell.value = p.spec
        ? { richText: [
            { text: p.name, font: nameFont },
            { text: `\n${p.spec}`, font: specFont },
          ] }
        : { richText: [{ text: p.name, font: nameFont }] }
      nameCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 1 }
      nameCell.border = BORDER_ALL

      // C: 單價（$ 前綴，靠右）
      const priceCell = ws.getCell(`C${row}`)
      priceCell.value = p.b2bPrice
      priceCell.font = font({ size: 11 })
      priceCell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }
      priceCell.numFmt = '"$"#,##0'
      priceCell.border = BORDER_ALL

      // D: 數量（空白）
      const qtyCell = ws.getCell(`D${row}`)
      qtyCell.font = font({ size: 11 })
      qtyCell.alignment = { horizontal: 'center', vertical: 'middle' }
      qtyCell.border = BORDER_ALL

      // E: 總金額（公式）
      const sumCell = ws.getCell(`E${row}`)
      sumCell.value = { formula: `C${row}*D${row}`, result: 0 }
      sumCell.font = font({ size: 11, bold: true })
      sumCell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }
      sumCell.numFmt = '"$"#,##0;-"$"#,##0;""'
      sumCell.border = BORDER_ALL

      // F: 國際條碼
      const barcodeCell = ws.getCell(`F${row}`)
      barcodeCell.alignment = { horizontal: 'center', vertical: 'middle' }
      barcodeCell.border = BORDER_ALL
      if (p.barcode_ean13) {
        const png = makeEan13PngBuffer(p.barcode_ean13, { moduleWidth: 1.6, height: 30, fontSize: 9 })
        if (png) {
          const imgId = wb.addImage({ buffer: png.buffer, extension: 'png' })
          ws.addImage(imgId, {
            tl: { col: 5 + 0.08, row: row - 1 + 0.1 },
            ext: { width: png.width, height: png.height },
            editAs: 'oneCell',
          })
        }
      }

      // G: 備註（空白）
      const noteCell = ws.getCell(`G${row}`)
      noteCell.font = font({ size: 10, color: { argb: C.textMuted } })
      noteCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 1 }
      noteCell.border = BORDER_ALL

      if (firstProductRow === null) firstProductRow = row
      lastProductRow = row
      row++
    }
  }

  // Spacer
  ws.getRow(row).height = 12
  row++

  // ══════ 小計 / 運費 / 折扣 / 訂單總金額 ══════
  const freeThr     = systemSettings?.freeShippingThreshold ?? 3500
  const shippingFee = systemSettings?.shippingFee ?? 150
  const sumRange = firstProductRow
    ? `E${firstProductRow}:E${lastProductRow}`
    : `E${row - 2}:E${row - 2}`

  // 品項小計 — B:D / E 淡藍底；F:G 空白白底
  ws.getRow(row).height = 22
  ws.mergeCells(`B${row}:D${row}`)
  ws.mergeCells(`F${row}:G${row}`)

  const stRow = row

  const stLabelCell = ws.getCell(`B${row}`)
  stLabelCell.value = '品項小計'
  stLabelCell.font = font({ size: 11 })
  stLabelCell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }
  stLabelCell.fill = fill(C.bgBlue)

  const stValueCell = ws.getCell(`E${row}`)
  stValueCell.value = { formula: `SUM(${sumRange})`, result: 0 }
  stValueCell.font = font({ size: 11, bold: true })
  stValueCell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }
  stValueCell.numFmt = '"$"#,##0'
  stValueCell.fill = fill(C.bgBlue)
  // F:G 空白白底
  row++

  // 運費 — B:D / E 淡藍底；F:G 放動態運費說明，白底
  ws.getRow(row).height = 22
  ws.mergeCells(`B${row}:D${row}`)
  ws.mergeCells(`F${row}:G${row}`)
  const fLabel = ws.getCell(`B${row}`)
  fLabel.value = '運費'
  fLabel.font = font({ size: 11 })
  fLabel.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }
  fLabel.fill = fill(C.bgBlue)

  const fValue = ws.getCell(`E${row}`)
  fValue.value = { formula: `IF(E${stRow}>=${freeThr},0,${shippingFee})`, result: shippingFee }
  fValue.font = font({ size: 11, bold: true })
  fValue.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }
  fValue.numFmt = '"$"#,##0'
  fValue.fill = fill(C.bgBlue)

  const fNote = ws.getCell(`F${row}`)
  fNote.value = {
    formula: `IF(E${stRow}>=${freeThr},"已達免運門檻 $${freeThr.toLocaleString()}，免運費","未達免運門檻 $${freeThr.toLocaleString()}，每筆加收運費 $${shippingFee}")`,
    result: `未達免運門檻 $${freeThr.toLocaleString()}，每筆加收運費 $${shippingFee}`,
  }
  fNote.font = font({ size: 9, color: { argb: C.textMuted } })
  fNote.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  // F:G 白底（無 fill）

  const feeRow = row
  row++

  // 訂單總金額 — 黃底、medium 黃邊（空白採購單不含折扣列）
  ws.getRow(row).height = 32
  ws.mergeCells(`B${row}:D${row}`)
  ws.mergeCells(`F${row}:G${row}`)
  const totalLabel = ws.getCell(`B${row}`)
  totalLabel.value = '訂單總金額'
  totalLabel.font = font({ size: 13, bold: true, color: { argb: C.brand } })
  totalLabel.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }
  totalLabel.fill = fill(C.bgTotal)
  totalLabel.border = { top: MED_YL, bottom: MED_YL, left: MED_YL }

  const totalValue = ws.getCell(`E${row}`)
  totalValue.value = { formula: `E${stRow}+E${feeRow}`, result: shippingFee }
  totalValue.font = font({ size: 16, bold: true, color: { argb: C.brand } })
  totalValue.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }
  totalValue.numFmt = '"$"#,##0'
  totalValue.fill = fill(C.bgTotal)
  totalValue.border = { top: MED_YL, bottom: MED_YL, right: MED_YL }
  row++

  // Spacer
  ws.getRow(row).height = 14
  row++

  // ══════ 合作條款 ══════
  ws.getRow(row).height = 22
  ws.mergeCells(`B${row}:G${row}`)
  const termsTitle = ws.getCell(`B${row}`)
  termsTitle.value = '📋  合作條款'
  termsTitle.font = font({ size: 11, bold: true, color: { argb: C.text } })
  termsTitle.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  termsTitle.fill = fill(C.brandSoft)
  termsTitle.border = { top: TERMS_BD, left: TERMS_BD, right: TERMS_BD }
  row++

  const settlementDay = channel?.settlementDay ?? 25
  const terms = [
    '1. 本訂單金額皆為含稅價，合作方式為買斷，已出貨商品恕不退換。',
    `2. 付款方式：月結 30 天（每月 ${settlementDay} 日前付清當期帳款）。`,
    '3. 合作方式：買斷',
    '4. 出貨方式：黑貓宅配；冷凍與常溫各自產生獨立訂單出貨。',
    '5. 請於【數量】欄填入欲訂購數量，【小計】將自動計算。',
    '6. 【匯款資訊】戶名：舒果農企業有限公司 / 金融機構代碼：兆豐 0170077 / 帳號：00709001170',
  ]
  for (let i = 0; i < terms.length; i++) {
    ws.getRow(row).height = 18
    ws.mergeCells(`B${row}:G${row}`)
    const t = ws.getCell(`B${row}`)
    t.value = terms[i]
    t.font = font({ size: 10, color: { argb: C.text } })
    t.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    t.fill = fill(C.brandSoft)
    t.border = {
      left: TERMS_BD,
      right: TERMS_BD,
      ...(i === terms.length - 1 ? { bottom: TERMS_BD } : {}),
    }
    row++
  }

  // Spacer
  ws.getRow(row).height = 18
  row++

  // ══════ 客戶資訊表 ══════
  const today = new Date()
  const autoSettlement = today.getDate() > settlementDay
    ? `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2, '0')}`
    : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const defaultAddr = channel?.addresses?.[0]?.address ?? ''
  const contactPhone = channel?.contactPhone ?? ''

  // Label row 1
  ws.getRow(row).height = 18
  ws.mergeCells(`C${row}:E${row}`)
  ws.mergeCells(`F${row}:G${row}`)
  ;[
    { cell: `B${row}`, text: '客戶 / 通路' },
    { cell: `C${row}`, text: '下單日期' },
    { cell: `F${row}`, text: '結算月份' },
  ].forEach(d => {
    const c = ws.getCell(d.cell)
    c.value = d.text
    c.font = font({ size: 9, color: { argb: C.textMuted } })
    c.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    c.fill = fill(C.bgHeader)
    c.border = BORDER_ALL
  })
  row++

  // Value row 1
  ws.getRow(row).height = 20
  ws.mergeCells(`C${row}:E${row}`)
  ws.mergeCells(`F${row}:G${row}`)
  ;[
    { cell: `B${row}`, val: channel?.name ?? '' },
    { cell: `C${row}`, val: today, fmt: 'yyyy/m/d' },
    { cell: `F${row}`, val: `${autoSettlement}（每月 ${settlementDay} 日結帳）` },
  ].forEach(d => {
    const c = ws.getCell(d.cell)
    c.value = d.val
    c.font = font({ size: 11, bold: true, color: { argb: C.text } })
    c.alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true }
    if (d.fmt) c.numFmt = d.fmt
    c.border = BORDER_ALL
  })
  row++

  // Label row 2
  ws.getRow(row).height = 18
  ws.mergeCells(`C${row}:G${row}`)
  ;[
    { cell: `B${row}`, text: '連絡電話' },
    { cell: `C${row}`, text: '出貨地址' },
  ].forEach(d => {
    const c = ws.getCell(d.cell)
    c.value = d.text
    c.font = font({ size: 9, color: { argb: C.textMuted } })
    c.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    c.fill = fill(C.bgHeader)
    c.border = BORDER_ALL
  })
  row++

  // Value row 2
  ws.getRow(row).height = 20
  ws.mergeCells(`C${row}:G${row}`)
  ;[
    { cell: `B${row}`, val: contactPhone },
    { cell: `C${row}`, val: defaultAddr },
  ].forEach(d => {
    const c = ws.getCell(d.cell)
    c.value = d.val
    c.font = font({ size: 11, bold: true, color: { argb: C.text } })
    c.alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true }
    c.border = BORDER_ALL
  })
  row++

  // ══════ 簽章區 ══════
  // Row：請蓋章及簽名… — 灰底、紅字關鍵詞、center
  ws.getRow(row).height = 20
  ws.mergeCells(`B${row}:G${row}`)
  const sigNote = ws.getCell(`B${row}`)
  sigNote.value = {
    richText: [
      { text: '請', font: { name: 'Microsoft JhengHei', size: 10, color: { argb: C.textMuted } } },
      { text: '蓋章', font: { name: 'Microsoft JhengHei', size: 10, bold: true, color: { argb: C.red } } },
      { text: '及', font: { name: 'Microsoft JhengHei', size: 10, color: { argb: C.textMuted } } },
      { text: '簽名', font: { name: 'Microsoft JhengHei', size: 10, bold: true, color: { argb: C.red } } },
      { text: '後回傳 (公司發票章及訂購人簽名)', font: { name: 'Microsoft JhengHei', size: 10, color: { argb: C.textMuted } } },
    ]
  }
  sigNote.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  sigNote.fill = fill(C.bgHeader)
  sigNote.border = BORDER_ALL
  row++

  // Row：簽章大空白
  ws.getRow(row).height = 120
  ws.mergeCells(`B${row}:G${row}`)
  const sigSpace = ws.getCell(`B${row}`)
  sigSpace.value = ''
  sigSpace.alignment = { horizontal: 'center', vertical: 'middle' }
  sigSpace.border = { top: THIN, left: THIN, right: THIN }
  row++

  // Row：日期
  ws.getRow(row).height = 20
  ws.mergeCells(`B${row}:G${row}`)
  const dateRow = ws.getCell(`B${row}`)
  dateRow.value = '日期：___________________'
  dateRow.font = font({ size: 10 })
  dateRow.alignment = { horizontal: 'center', vertical: 'middle' }
  dateRow.border = { bottom: THIN, left: THIN, right: THIN }
}

// ── 主函式 ────────────────────────────────────────────
export async function exportBlankOrder({ channel, productsByCat, categories, systemSettings }) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'B2B 系統'
  wb.created = new Date()

  // 載入 LOGO
  let logoImageId = null
  try {
    const resp = await fetch(LOGO_PATH)
    if (resp.ok) {
      const buf = await resp.arrayBuffer()
      logoImageId = wb.addImage({ buffer: buf, extension: 'png' })
    }
  } catch (err) {
    console.warn('LOGO 載入失敗', err)
  }

  let added = 0
  for (const cat of categories) {
    const prods = productsByCat[cat.id] ?? []
    if (prods.length === 0) continue
    buildSheet(wb, logoImageId, { cat, prods, channel, systemSettings })
    added++
  }

  if (added === 0) {
    const ws = wb.addWorksheet('空白採購單')
    ws.getCell('B2').value = '此通路未指派商品，無可產出之空白採購單'
    ws.getCell('B2').font = font({ size: 11 })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const today = new Date()
  const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const safeName = (channel?.name ?? '客戶').replace(/[\\/:*?"<>|]/g, '_')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `空白採購單_${safeName}_${ymd}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
