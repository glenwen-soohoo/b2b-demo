// 採購確認單 PDF（v3 — 對齊空白採購單 Excel 視覺、僅列實際訂購品項；有折扣時才顯示折扣列）
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { makeEan13PngBuffer } from './barcodePng'
import { productMap, categories as allCats, shippingSettings } from '../data/fakeData'

const LOGO_PATH = `${import.meta.env.BASE_URL}assets/logo.png`

const COLOR = {
  text:        '#2C2C2C',
  textMuted:   '#8C8C8C',
  textLight:   '#BFBFBF',
  red:         '#C00000',
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
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

function getProductCatId(product) {
  for (const cat of allCats) {
    if (cat.subCategories.some(s => s.name === product.subCategory)) return cat.id
  }
  return allCats.find(c => c.temperature === product.category)?.id ?? allCats[0].id
}

// 回傳指定溫層下所有子分類名稱（依 categories 順序）
function getSubCatsOfTemperature(temperature) {
  const result = []
  const seen = new Set()
  for (const cat of allCats) {
    if (cat.temperature !== temperature) continue
    for (const sc of cat.subCategories) {
      if (!seen.has(sc.name)) {
        result.push(sc.name)
        seen.add(sc.name)
      }
    }
  }
  return result
}

function ean13DataUrl(value) {
  const png = makeEan13PngBuffer(value, { moduleWidth: 1.6, height: 30, fontSize: 9 })
  if (!png) return null
  const bytes = new Uint8Array(png.buffer)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return `data:image/png;base64,${btoa(bin)}`
}

// ── 建單頁 HTML（一個溫層一頁）────────────────────────
function buildTemperaturePageHtml({ temperature, groupItems, order, channel, systemSettings, pageInfo }) {
  const tempBg    = temperature === 'frozen' ? COLOR.frozen : COLOR.ambient
  const tempIcon  = temperature === 'frozen' ? '❄️' : '🌿'
  const tempLabel = temperature === 'frozen' ? '冷凍品項' : '常溫品項'
  const settlementDay = channel?.settlementDay ?? 25
  // 按溫層取運費設定
  const tempSetting = shippingSettings[temperature] ?? shippingSettings.frozen
  const freeThr     = tempSetting.freeShippingThreshold
  const shippingFee = tempSetting.shippingFee

  // 子分類分組
  const bySub = {}
  for (const it of groupItems) {
    const p = productMap[it.productId]
    const subCat = p?.subCategory ?? '未分類'
    if (!bySub[subCat]) bySub[subCat] = []
    bySub[subCat].push({ item: it, product: p })
  }
  const subOrderTemplate = getSubCatsOfTemperature(temperature)
  const orderedSubs = subOrderTemplate.filter(n => bySub[n]?.length)
  Object.keys(bySub).forEach(n => { if (!orderedSubs.includes(n)) orderedSubs.push(n) })

  // 整個訂單的小計、運費、折扣、總金額（不只本頁，供最後一頁顯示）
  const orderSubtotal = order.__orderSubtotal ?? groupItems.reduce((s, i) => s + i.qty * i.price, 0)
  const hasDiscount = (order.discount_amount ?? 0) > 0
  const discount = order.discount_amount ?? 0
  // 本訂單是否需加運費（未達免運門檻）
  const shipping = orderSubtotal >= freeThr ? 0 : shippingFee
  const grandTotal = orderSubtotal + shipping - discount

  const isLastPage = pageInfo.current === pageInfo.total

  // 表格列
  const productRows = orderedSubs.map(subName => {
    const rows = bySub[subName].map(({ item, product }) => {
      const lineSubtotal = item.qty * item.price
      const barcodeUrl = product?.barcode_ean13 ? ean13DataUrl(product.barcode_ean13) : null
      return `
        <tr>
          <td style="padding:8px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;vertical-align:middle;">
            <div style="font-weight:700;color:${COLOR.text};line-height:1.3;">${escapeHtml(product?.name ?? item.productName ?? '')}</div>
            ${product?.spec ? `<div style="font-size:9px;color:${COLOR.textMuted};margin-top:3px;line-height:1.2;">${escapeHtml(product.spec)}</div>` : ''}
          </td>
          <td style="padding:8px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;text-align:right;vertical-align:middle;width:60px;">$${item.price.toLocaleString()}</td>
          <td style="padding:8px 8px;border:1px solid ${COLOR.borderGray};font-size:12px;text-align:center;vertical-align:middle;width:50px;font-weight:700;color:${COLOR.brand};">${item.qty}</td>
          <td style="padding:8px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;text-align:right;vertical-align:middle;width:75px;font-weight:700;">$${lineSubtotal.toLocaleString()}</td>
          <td style="padding:4px 6px;border:1px solid ${COLOR.borderGray};text-align:center;vertical-align:middle;width:140px;">
            ${barcodeUrl ? `<img src="${barcodeUrl}" style="max-width:135px;max-height:34px;display:inline-block;vertical-align:middle;" />` : ''}
          </td>
          <td style="padding:8px 10px;border:1px solid ${COLOR.borderGray};font-size:10px;color:${COLOR.textMuted};vertical-align:middle;width:110px;"></td>
        </tr>
      `
    }).join('')

    return `
      <tr>
        <td colspan="6" style="padding:4px 14px;border:1px solid ${COLOR.borderGray};background:${COLOR.brandSoft};color:${COLOR.brand};font-size:11px;font-weight:700;">
          ${escapeHtml(subName)}
        </td>
      </tr>
      ${rows}
    `
  }).join('')

  // 合計列（僅最後一頁）
  const totalsHtml = isLastPage ? `
    <tr>
      <td colspan="3" style="padding:7px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgBlue};font-size:11px;text-align:right;">品項小計</td>
      <td style="padding:7px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgBlue};font-size:12px;font-weight:700;text-align:right;">$${orderSubtotal.toLocaleString()}</td>
      <td colspan="2" style="border:1px solid ${COLOR.borderGray};"></td>
    </tr>
    <tr>
      <td colspan="3" style="padding:7px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgBlue};font-size:11px;text-align:right;">運費</td>
      <td style="padding:7px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgBlue};font-size:12px;font-weight:700;text-align:right;">$${shipping.toLocaleString()}</td>
      <td colspan="2" style="padding:4px 10px;border:1px solid ${COLOR.borderGray};font-size:9px;color:${COLOR.textMuted};">
        ${shipping === 0 ? `已達免運門檻 $${freeThr.toLocaleString()}，免運費` : `未達免運門檻 $${freeThr.toLocaleString()}，每筆加收運費 $${shippingFee}`}
      </td>
    </tr>
    ${hasDiscount ? `
    <tr>
      <td colspan="3" style="padding:7px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.brandSoft};font-size:11px;text-align:right;">折扣</td>
      <td style="padding:7px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.brandSoft};font-size:12px;font-weight:700;text-align:right;color:${COLOR.red};">−$${discount.toLocaleString()}</td>
      <td colspan="2" style="padding:4px 10px;border:1px solid ${COLOR.borderGray};font-size:9px;color:${COLOR.textMuted};">${escapeHtml(order.discount_note || '')}</td>
    </tr>` : ''}
    <tr>
      <td colspan="3" style="padding:10px 10px;border:2px solid ${COLOR.borderTotal};background:${COLOR.bgTotal};font-size:13px;font-weight:700;color:${COLOR.brand};text-align:right;">訂單總金額</td>
      <td style="padding:10px 10px;border:2px solid ${COLOR.borderTotal};background:${COLOR.bgTotal};font-size:17px;font-weight:700;color:${COLOR.brand};text-align:right;">$${grandTotal.toLocaleString()}</td>
      <td colspan="2" style="border:1px solid ${COLOR.borderGray};"></td>
    </tr>
  ` : `
    <tr>
      <td colspan="6" style="padding:6px 12px;font-size:10px;color:${COLOR.textMuted};text-align:right;">本頁小計：<span style="color:${COLOR.text};font-weight:600;">$${groupItems.reduce((s, i) => s + i.qty * i.price, 0).toLocaleString()}</span>　・　訂單尚有後續頁</td>
    </tr>
  `

  const termsHtml = isLastPage ? `
    <div style="margin-top:12px;border:1px solid ${COLOR.termsBord};background:${COLOR.brandSoft};padding:7px 12px;">
      <div style="font-size:11px;font-weight:700;color:${COLOR.text};margin-bottom:4px;">📋  合作條款</div>
      <div style="font-size:9px;color:${COLOR.text};line-height:1.65;">
        <div>1. 本訂單金額皆為含稅價，合作方式為買斷，已出貨商品恕不退換。</div>
        <div>2. 付款方式：月結 30 天（每月 ${settlementDay} 日前付清當期帳款）。</div>
        <div>3. 出貨方式：黑貓宅配；冷凍與常溫各自產生獨立訂單出貨。</div>
        <div>4. 【匯款資訊】戶名：舒果農企業有限公司 / 金融機構代碼：兆豐 0170077 / 帳號：00709001170</div>
      </div>
    </div>
  ` : ''

  // 客戶資訊 + 簽章（僅最後一頁）
  const customerInfoHtml = isLastPage ? `
    <div style="margin-top:16px;">
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <colgroup>
          <col style="width:33.33%;"/>
          <col style="width:33.33%;"/>
          <col style="width:33.33%;"/>
        </colgroup>
        <!-- Row 1 labels -->
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">客戶 / 通路</td>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">下單日期</td>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">結算月份</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(channel?.name ?? order.channelName ?? '')}${order.store_label ? `　<span style="color:${COLOR.textMuted};font-weight:400;font-size:10px;">${escapeHtml(order.store_label)}</span>` : ''}</td>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(order.createdAt || '')}</td>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(order.settlementMonth || '')}（每月 ${settlementDay} 日結帳）</td>
        </tr>
        <!-- Row 2：連絡電話 / 出貨地址（跨 2 欄）-->
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">連絡電話</td>
          <td colspan="2" style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">出貨地址</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(channel?.contactPhone || '')}</td>
          <td colspan="2" style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(order.shippingAddress || '')}</td>
        </tr>
        <!-- Row 3：B2B 訂單編號 / 無毒農訂單編號 / 付款方式 -->
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">B2B 訂單編號</td>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">無毒農訂單編號</td>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">付款方式</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;color:${COLOR.brand};">${escapeHtml(order.b2b_order_no || order.id)}</td>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${order.backendOrderId ? escapeHtml(order.backendOrderId) : `<span style="color:${COLOR.textLight};font-weight:400;">—</span>`}</td>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">月結 30 天</td>
        </tr>
        ${order.cs_note ? `
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">客服備註</td>
          <td colspan="2" style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;">${escapeHtml(order.cs_note)}</td>
        </tr>` : ''}
        ${order.b2b_note ? `
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">B2B 備註</td>
          <td colspan="2" style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;">${escapeHtml(order.b2b_note)}</td>
        </tr>` : ''}
      </table>

      <!-- 簽章 -->
      <div style="margin-top:10px;padding:5px 10px;background:${COLOR.bgHeader};border:1px solid ${COLOR.borderGray};text-align:center;font-size:10px;color:${COLOR.textMuted};">
        請<span style="color:${COLOR.red};font-weight:700;">蓋章</span>及<span style="color:${COLOR.red};font-weight:700;">簽名</span>後回傳 (公司發票章及訂購人簽名)
      </div>
      <div style="height:80px;border-left:1px solid ${COLOR.borderGray};border-right:1px solid ${COLOR.borderGray};"></div>
      <div style="padding:5px 10px;border:1px solid ${COLOR.borderGray};border-top:none;text-align:center;font-size:10px;color:${COLOR.text};">日期：___________________</div>
    </div>
  ` : ''

  return `
    <div style="width:794px;padding:24px 30px 20px;background:#fff;font-family:'Microsoft JhengHei','Noto Sans TC',Arial,sans-serif;color:${COLOR.text};box-sizing:border-box;">
      <!-- Letterhead: LOGO + Title -->
      <div style="position:relative;border:1px solid ${COLOR.borderGray};height:52px;margin-bottom:0;">
        <img src="${LOGO_PATH}" style="position:absolute;left:10px;top:4px;height:44px;width:auto;" />
        <div style="text-align:center;font-size:20px;font-weight:700;letter-spacing:10px;line-height:52px;">採 購 確 認 單</div>
        <div style="position:absolute;right:10px;top:4px;font-size:9px;color:${COLOR.textMuted};">第 ${pageInfo.current} / ${pageInfo.total} 頁</div>
      </div>

      <!-- Temperature header -->
      <div style="background:${tempBg};color:#fff;font-size:15px;font-weight:700;text-align:center;padding:6px 0;border:1px solid ${COLOR.borderGray};border-top:none;">
        ${tempIcon}　${tempLabel}
      </div>

      <!-- Product table -->
      <table style="width:100%;border-collapse:collapse;border-top:none;">
        <thead>
          <tr>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;">品　項</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:60px;">單　價</th>
            <th style="padding:6px 8px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:50px;">數量</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:75px;">總金額</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:140px;">國際條碼</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:110px;">備　註</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
          ${totalsHtml}
        </tbody>
      </table>

      ${termsHtml}
      ${customerInfoHtml}
    </div>
  `
}

// ── 主函式 ────────────────────────────────────────────
export async function exportOrderPdf({ order, channel, systemSettings }) {
  const items = order.adjustedItems ?? order.salesAdjustedItems ?? order.items ?? []
  // 依溫層分組（frozen / ambient）
  const byTemp = { frozen: [], ambient: [] }
  for (const it of items) {
    const p = productMap[it.productId]
    if (!p) continue
    // 從 product 找溫層（也可用 cat 反推）
    const cat = allCats.find(c => c.subCategories.some(s => s.name === p.subCategory))
      ?? allCats.find(c => c.temperature === p.category)
    const temperature = cat?.temperature ?? p.category ?? 'frozen'
    if (byTemp[temperature]) byTemp[temperature].push(it)
  }
  const tempsInOrder = ['frozen', 'ambient'].filter(t => byTemp[t].length > 0)
  if (tempsInOrder.length === 0) throw new Error('此訂單沒有可匯出的品項')

  const orderSubtotal = items.reduce((s, i) => s + i.qty * i.price, 0)

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.style.zIndex = '-1'
  document.body.appendChild(container)

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const pageW = pdf.internal.pageSize.getWidth()

  try {
    for (let i = 0; i < tempsInOrder.length; i++) {
      const temperature = tempsInOrder[i]
      const pageDiv = document.createElement('div')
      pageDiv.innerHTML = buildTemperaturePageHtml({
        temperature,
        groupItems: byTemp[temperature],
        order: { ...order, __orderSubtotal: orderSubtotal },
        channel,
        systemSettings,
        pageInfo: { current: i + 1, total: tempsInOrder.length },
      })
      container.appendChild(pageDiv)

      // 等 LOGO + 條碼 img 載入
      const imgs = pageDiv.querySelectorAll('img')
      await Promise.all(Array.from(imgs).map(img => img.complete
        ? Promise.resolve()
        : new Promise(res => { img.onload = img.onerror = res })
      ))
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

      const canvas = await html2canvas(pageDiv.firstElementChild, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      const imgW = pageW
      const imgH = (canvas.height * imgW) / canvas.width

      if (i > 0) pdf.addPage()
      const pageH = pdf.internal.pageSize.getHeight()
      if (imgH <= pageH) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH, undefined, 'FAST')
      } else {
        const pxPerPage = (pageH / imgW) * canvas.width
        let remaining = canvas.height
        let y = 0
        let first = true
        while (remaining > 0) {
          const sliceH = Math.min(pxPerPage, remaining)
          const sliceCanvas = document.createElement('canvas')
          sliceCanvas.width = canvas.width
          sliceCanvas.height = sliceH
          sliceCanvas.getContext('2d').drawImage(canvas, 0, -y)
          const sliceData = sliceCanvas.toDataURL('image/png')
          const sliceHPt = (sliceH * imgW) / canvas.width
          if (!first) pdf.addPage()
          pdf.addImage(sliceData, 'PNG', 0, 0, imgW, sliceHPt, undefined, 'FAST')
          first = false
          y += sliceH
          remaining -= sliceH
        }
      }
    }
  } finally {
    document.body.removeChild(container)
  }

  const today = new Date()
  const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const orderNo = order.b2b_order_no || order.id
  pdf.save(`採購確認單_${orderNo}_${ymd}.pdf`)
}
