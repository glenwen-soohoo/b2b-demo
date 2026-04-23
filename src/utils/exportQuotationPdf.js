// 報價單 PDF（v2 — 對齊採購確認單視覺）
// 依模板產出，用於合作前確認開放品項與價格；依溫層分頁
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { makeEan13PngBuffer } from './barcodePng'
import { products, categories as allCats, shippingSettings } from '../data/fakeData'

const LOGO_PATH = `${import.meta.env.BASE_URL}assets/logo.png`
// 前台商品頁 URL 樣板（之後可替換為正式網域）
const FRONTEND_URL = () => 'https://www.google.com'

const COLOR = {
  text:        '#2C2C2C',
  textMuted:   '#8C8C8C',
  textLight:   '#BFBFBF',
  red:         '#C00000',
  link:        '#1677FF',
  brand:       '#8B5D3B',
  brandSoft:   '#FFFBEA',
  frozen:      '#366092',
  ambient:     '#76933C',
  bgHeader:    '#F5F5F5',
  termsBord:   '#FFE58F',
  borderGray:  '#BFBFBF',
  highlight:   '#C41D7F',
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

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
  const png = makeEan13PngBuffer(value, { moduleWidth: 1.6, height: 28, fontSize: 9 })
  if (!png) return null
  const bytes = new Uint8Array(png.buffer)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return `data:image/png;base64,${btoa(bin)}`
}

// ── 單頁 HTML（一個溫層一頁）─────────────────────────
function buildTemperaturePageHtml({ temperature, groupProducts, template, channel, pageInfo, meta }) {
  const tempBg    = temperature === 'frozen' ? COLOR.frozen : COLOR.ambient
  const tempIcon  = temperature === 'frozen' ? '❄️' : '🌿'
  const tempLabel = temperature === 'frozen' ? '冷凍品項' : '常溫品項'
  const isLastPage = pageInfo.current === pageInfo.total

  // 子分類分組
  const bySub = {}
  for (const p of groupProducts) {
    if (!bySub[p.subCategory]) bySub[p.subCategory] = []
    bySub[p.subCategory].push(p)
  }
  const subOrderTemplate = getSubCatsOfTemperature(temperature)
  const orderedSubs = subOrderTemplate.filter(n => bySub[n]?.length)
  Object.keys(bySub).forEach(n => { if (!orderedSubs.includes(n)) orderedSubs.push(n) })

  // 產品列
  const productRowsHtml = orderedSubs.map(subName => {
    const rows = bySub[subName].map(p => {
      const price = template.productPrices?.[p.id] ?? p.b2bPrice
      const isOverride = template.productPrices?.[p.id] != null
        && template.productPrices[p.id] !== p.b2bPrice
      const barcodeUrl = p.barcode_ean13 ? ean13DataUrl(p.barcode_ean13) : null
      const pageUrl = p.frontend_product_id ? FRONTEND_URL(p.frontend_product_id) : null

      return `
        <tr>
          <td style="padding:8px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;vertical-align:middle;">
            <div style="font-weight:700;color:${COLOR.text};line-height:1.3;">${escapeHtml(p.name)}</div>
            ${p.spec ? `<div style="font-size:9px;color:${COLOR.textMuted};margin-top:3px;line-height:1.2;">${escapeHtml(p.spec)}</div>` : ''}
          </td>
          <td style="padding:8px 10px;border:1px solid ${COLOR.borderGray};font-size:12px;text-align:right;vertical-align:middle;width:82px;font-weight:700;color:${isOverride ? COLOR.highlight : COLOR.text};">
            $${price.toLocaleString()}${isOverride ? '<span style="font-size:9px;font-weight:400;">＊</span>' : ''}
          </td>
          <td style="padding:4px 6px;border:1px solid ${COLOR.borderGray};text-align:center;vertical-align:middle;width:145px;">
            ${barcodeUrl ? `<img src="${barcodeUrl}" style="max-width:138px;max-height:32px;display:inline-block;vertical-align:middle;" />` : ''}
          </td>
          <td style="padding:8px 8px;border:1px solid ${COLOR.borderGray};font-size:10px;text-align:center;vertical-align:middle;width:128px;line-height:1.3;">
            ${pageUrl ? `
              <div style="color:${COLOR.link};font-weight:700;">🔗 查看商品頁</div>
              <div style="font-size:8px;color:${COLOR.textMuted};word-break:break-all;margin-top:2px;">${escapeHtml(pageUrl)}</div>
            ` : `<span style="color:${COLOR.textLight};">—</span>`}
          </td>
          <td style="padding:8px 10px;border:1px solid ${COLOR.borderGray};font-size:10px;color:${COLOR.textMuted};vertical-align:middle;width:110px;"></td>
        </tr>
      `
    }).join('')

    return `
      <tr>
        <td colspan="5" style="padding:4px 14px;border:1px solid ${COLOR.borderGray};background:${COLOR.brandSoft};color:${COLOR.brand};font-size:11px;font-weight:700;">
          ${escapeHtml(subName)}
        </td>
      </tr>
      ${rows}
    `
  }).join('')

  // 摘要列（最後一頁顯示）
  const summaryHtml = isLastPage ? `
    <tr>
      <td colspan="5" style="padding:6px 14px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:10px;color:${COLOR.textMuted};text-align:right;">
        本報價單共 <strong style="color:${COLOR.text};">${meta.totalItems}</strong> 項商品
        ${meta.hasOverride ? `　／　<span style="color:${COLOR.highlight};">＊</span> 表示本合作案專屬價，非標準 B2B 價` : ''}
      </td>
    </tr>
  ` : `
    <tr>
      <td colspan="5" style="padding:6px 14px;font-size:10px;color:${COLOR.textMuted};text-align:right;">
        本頁 ${groupProducts.length} 項　·　報價尚有後續頁
      </td>
    </tr>
  `

  // 合作條款 + 客戶資訊 + 簽章（最後一頁）
  const termsHtml = isLastPage ? `
    <div style="margin-top:12px;border:1px solid ${COLOR.termsBord};background:${COLOR.brandSoft};padding:7px 12px;">
      <div style="font-size:11px;font-weight:700;color:${COLOR.text};margin-bottom:4px;">📋  合作條款</div>
      <div style="font-size:9px;color:${COLOR.text};line-height:1.65;">
        <div>1. 本報價單有效期至 <strong style="color:${COLOR.highlight};">${meta.validUntil}</strong>，逾期請另洽業務重新報價。</div>
        <div>2. 以上價格皆為 <strong>含稅</strong> 之 B2B 合作價；實際出貨金額以訂單確認為準。</div>
        <div>3. 付款方式：月結 30 天（每月 25 日前付清當期帳款）。</div>
        <div>4. 合作方式：買斷；已出貨商品恕不退換。出貨方式：黑貓宅配。</div>
        <div>5. 運費說明：冷凍單筆未滿 NT$ ${shippingSettings.frozen.freeShippingThreshold.toLocaleString()} 酌收 NT$ ${shippingSettings.frozen.shippingFee}，常溫單筆未滿 NT$ ${shippingSettings.ambient.freeShippingThreshold.toLocaleString()} 酌收 NT$ ${shippingSettings.ambient.shippingFee}。</div>
        <div>6. 【匯款資訊】戶名：舒果農企業有限公司 / 金融機構代碼：兆豐 0170077 / 帳號：00709001170</div>
      </div>
    </div>
  ` : ''

  const customerInfoHtml = isLastPage ? `
    <div style="margin-top:12px;">
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <colgroup>
          <col style="width:33.33%;"/>
          <col style="width:33.33%;"/>
          <col style="width:33.33%;"/>
        </colgroup>
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">報價單號</td>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">報價日期</td>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">有效期至</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;color:${COLOR.brand};">${escapeHtml(meta.quotationNo)}</td>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(meta.today)}</td>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;color:${COLOR.highlight};">${escapeHtml(meta.validUntil)}</td>
        </tr>
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">客戶 / 通路</td>
          <td colspan="2" style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">報價模板</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">
            ${channel?.name
              ? escapeHtml(channel.name)
              : `<span style="color:${COLOR.textLight};font-weight:400;">______________________________</span>`}
          </td>
          <td colspan="2" style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(template.name ?? '')}</td>
        </tr>
        ${channel?.contactName || channel?.contactPhone ? `
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">聯絡窗口</td>
          <td colspan="2" style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">連絡電話</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(channel?.contactName ?? '—')}</td>
          <td colspan="2" style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(channel?.contactPhone ?? '—')}</td>
        </tr>` : ''}
      </table>

      <!-- 簽章 -->
      <div style="margin-top:10px;padding:5px 10px;background:${COLOR.bgHeader};border:1px solid ${COLOR.borderGray};text-align:center;font-size:10px;color:${COLOR.textMuted};">
        請<span style="color:${COLOR.red};font-weight:700;">蓋章</span>及<span style="color:${COLOR.red};font-weight:700;">簽名</span>確認後回傳，以利後續合作作業
      </div>
      <div style="display:flex;">
        <div style="flex:1;height:72px;border:1px solid ${COLOR.borderGray};border-top:none;border-right:none;"></div>
        <div style="flex:1;height:72px;border:1px solid ${COLOR.borderGray};border-top:none;"></div>
      </div>
      <div style="display:flex;">
        <div style="flex:1;padding:4px 10px;border:1px solid ${COLOR.borderGray};border-top:none;border-right:none;text-align:center;font-size:10px;color:${COLOR.textMuted};">我方業務代表簽章</div>
        <div style="flex:1;padding:4px 10px;border:1px solid ${COLOR.borderGray};border-top:none;text-align:center;font-size:10px;color:${COLOR.textMuted};">客戶確認簽章</div>
      </div>
    </div>
  ` : ''

  return `
    <div style="width:794px;padding:24px 30px 20px;background:#fff;font-family:'Microsoft JhengHei','Noto Sans TC',Arial,sans-serif;color:${COLOR.text};box-sizing:border-box;">
      <!-- Letterhead -->
      <div style="position:relative;border:1px solid ${COLOR.borderGray};height:52px;">
        <img src="${LOGO_PATH}" style="position:absolute;left:10px;top:4px;height:44px;width:auto;" />
        <div style="text-align:center;font-size:20px;font-weight:700;letter-spacing:12px;line-height:52px;">報　價　單</div>
        <div style="position:absolute;right:10px;top:4px;font-size:9px;color:${COLOR.textMuted};">第 ${pageInfo.current} / ${pageInfo.total} 頁</div>
      </div>

      <!-- Temperature header -->
      <div style="background:${tempBg};color:#fff;font-size:15px;font-weight:700;text-align:center;padding:6px 0;border:1px solid ${COLOR.borderGray};border-top:none;">
        ${tempIcon}　${tempLabel}
      </div>

      <!-- Product table -->
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;">品　項</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:82px;">合作單價</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:145px;">國際條碼</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:128px;">前台展示頁面</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:110px;">備　註</th>
          </tr>
        </thead>
        <tbody>
          ${productRowsHtml}
          ${summaryHtml}
        </tbody>
      </table>

      ${termsHtml}
      ${customerInfoHtml}
    </div>
  `
}

// ── 蒐集 PDF 內 link 區域（提供 jsPDF 加上 link annotation）──
function computeLinkAreas(pageDiv) {
  const areas = []
  pageDiv.querySelectorAll('[data-link-url]').forEach(el => {
    const rect = el.getBoundingClientRect()
    const containerRect = pageDiv.getBoundingClientRect()
    areas.push({
      x: rect.left - containerRect.left,
      y: rect.top  - containerRect.top,
      w: rect.width,
      h: rect.height,
      url: el.dataset.linkUrl,
    })
  })
  return areas
}

// 每頁最多容納產品數（A4 限制）
const PAGE_SIZE_NORMAL = 15  // 非最後頁
const PAGE_SIZE_LAST   = 5   // 最後頁留空間給條款 + 客戶資訊 + 簽章

// ── 主函式 ────────────────────────────────────────────
export async function exportQuotationPdf({ template, channel }) {
  if (!template) throw new Error('找不到報價模板資料')
  if (!(template.productIds?.length > 0)) throw new Error('此模板尚無任何品項，無法匯出報價單')

  // 依 template.productIds 順序取出商品，再依溫層分組
  const tplProducts = template.productIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean)
  const byTemp = { frozen: [], ambient: [] }
  for (const p of tplProducts) {
    const cat = allCats.find(c => c.subCategories.some(s => s.name === p.subCategory))
      ?? allCats.find(c => c.temperature === p.category)
    const temperature = cat?.temperature ?? p.category ?? 'frozen'
    if (byTemp[temperature]) byTemp[temperature].push(p)
  }
  const tempsInOrder = ['frozen', 'ambient'].filter(t => byTemp[t].length > 0)

  // 切分為頁（每頁單一溫層）
  const pagesList = []
  for (const temp of tempsInOrder) {
    const prods = byTemp[temp]
    let idx = 0
    while (idx < prods.length) {
      const take = Math.min(PAGE_SIZE_NORMAL, prods.length - idx)
      pagesList.push({ temp, products: prods.slice(idx, idx + take) })
      idx += take
    }
  }
  // 最後一頁需留空間給 footer；若最後一頁產品數 > PAGE_SIZE_LAST，拆到新頁
  if (pagesList.length > 0) {
    const last = pagesList[pagesList.length - 1]
    if (last.products.length > PAGE_SIZE_LAST) {
      const overflow = last.products.length - PAGE_SIZE_LAST
      const moved = last.products.slice(0, overflow)
      last.products = last.products.slice(overflow)
      pagesList.splice(pagesList.length - 1, 0, { temp: last.temp, products: moved })
    }
  }

  // meta
  const today = new Date()
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const validUntil = new Date(today.getTime() + 30 * 86400000)
  const quotationNo = `Q-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${(template.id || 'T').toString().slice(-4)}`
  const hasOverride = tplProducts.some(p => {
    const o = template.productPrices?.[p.id]
    return o != null && o !== p.b2bPrice
  })
  const meta = {
    quotationNo,
    today: ymd(today),
    validUntil: ymd(validUntil),
    totalItems: tplProducts.length,
    hasOverride,
  }

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.style.zIndex = '-1'
  document.body.appendChild(container)

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const pageW = pdf.internal.pageSize.getWidth()

  try {
    for (let i = 0; i < pagesList.length; i++) {
      const { temp, products: pageProducts } = pagesList[i]
      const pageDiv = document.createElement('div')
      pageDiv.innerHTML = buildTemperaturePageHtml({
        temperature: temp,
        groupProducts: pageProducts,
        template,
        channel,
        pageInfo: { current: i + 1, total: pagesList.length },
        meta,
      })
      container.appendChild(pageDiv)

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

  const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const safeName = (channel?.name || template.name || '報價單').replace(/[\\/:*?"<>|]/g, '_')
  pdf.save(`報價單_${safeName}_${todayStr}.pdf`)
}
