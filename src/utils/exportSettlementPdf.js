// 月結結算單 PDF（v2 — 對齊採購確認單 / 報價單視覺）
import { channelMap } from '../data/fakeData'
import { COLOR, escapeHtml } from './exportTheme'
import { newA4Pdf, makeOffscreenContainer, renderDivToPdfPage, todayYmd } from './pdfRenderer'
import { BASE_URL } from '../config'

const LOGO_PATH = `${BASE_URL}assets/logo.png`

const STATUS_LABEL = {
  awaiting_payment: '待匯款',
  paid:             '已匯款 / 待財務確認',
  completed:        '已完成',
}

// ── 建單頁 HTML ────────────────────────────────────────
function buildSettlementPageHtml({ settlement, pageOrders, channel, pageInfo, meta }) {
  const isFirstPage = pageInfo.current === 1
  const isLastPage  = pageInfo.current === pageInfo.total

  // 訂單列
  const orderRows = pageOrders.map(o => {
    const items = o.adjustedItems ?? o.salesAdjustedItems ?? o.items ?? []
    const itemsTotal = items.reduce((s, i) => s + i.qty * i.price, 0)
    const discount = o.discount_amount ?? 0
    const net = itemsTotal - discount
    return `
      <tr>
        <td style="padding:7px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;vertical-align:middle;font-weight:700;color:${COLOR.brand};">
          ${escapeHtml(o.b2b_order_no || o.id)}
        </td>
        <td style="padding:7px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;text-align:center;vertical-align:middle;width:95px;">
          ${escapeHtml(o.createdAt || '')}
        </td>
        <td style="padding:7px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;vertical-align:middle;">
          ${o.store_label ? `<strong>${escapeHtml(o.store_label)}</strong>　` : ''}<span style="color:${COLOR.textMuted};font-size:10px;">${escapeHtml(o.shippingAddress || '')}</span>
        </td>
        <td style="padding:7px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;text-align:center;vertical-align:middle;width:55px;color:${COLOR.textMuted};">
          ${items.length}
        </td>
        <td style="padding:7px 10px;border:1px solid ${COLOR.borderGray};font-size:12px;text-align:right;vertical-align:middle;width:110px;font-weight:700;">
          $${net.toLocaleString()}
          ${discount > 0 ? `<div style="font-size:9px;font-weight:400;color:${COLOR.highlight};margin-top:2px;">折讓 -$${discount.toLocaleString()}</div>` : ''}
        </td>
      </tr>
    `
  }).join('')

  // 首頁摘要 banner
  const summaryBanner = isFirstPage ? `
    <div style="background:${COLOR.bgTotal};border:2px solid ${COLOR.borderTotal};padding:14px 18px;margin:10px 0;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:11px;color:${COLOR.textMuted};">結算應收總金額（含稅）</div>
        <div style="font-size:10px;color:${COLOR.textMuted};margin-top:3px;">
          結算月份 <strong style="color:${COLOR.text};">${escapeHtml(settlement.settlementMonth ?? '')}</strong>
          　·　共 <strong style="color:${COLOR.text};">${meta.totalOrders}</strong> 筆 B2B 訂單
        </div>
      </div>
      <div style="font-size:28px;font-weight:700;color:${COLOR.brand};letter-spacing:1px;">
        NT$ ${(settlement.totalAmount ?? 0).toLocaleString()}
      </div>
    </div>
  ` : ''

  // 摘要列（中間頁 / 最後頁表尾）
  const tableFooter = isLastPage ? `
    <tr>
      <td colspan="4" style="padding:10px 14px;border:2px solid ${COLOR.borderTotal};background:${COLOR.bgTotal};font-size:13px;font-weight:700;color:${COLOR.brand};text-align:right;">應收總金額</td>
      <td style="padding:10px 14px;border:2px solid ${COLOR.borderTotal};background:${COLOR.bgTotal};font-size:17px;font-weight:700;color:${COLOR.brand};text-align:right;">$${(settlement.totalAmount ?? 0).toLocaleString()}</td>
    </tr>
  ` : `
    <tr>
      <td colspan="5" style="padding:6px 12px;font-size:10px;color:${COLOR.textMuted};text-align:right;">本頁 ${pageOrders.length} 筆　·　結算尚有後續頁</td>
    </tr>
  `

  // 客戶資訊 + 匯款 + 條款 + 簽章（最後一頁）
  const footerHtml = isLastPage ? `
    <!-- 客戶資訊 -->
    <div style="margin-top:14px;">
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <colgroup>
          <col style="width:33.33%;"/>
          <col style="width:33.33%;"/>
          <col style="width:33.33%;"/>
        </colgroup>
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">結算單號</td>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">結算月份</td>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">結算日期</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;color:${COLOR.brand};">${escapeHtml(settlement.id ?? '')}</td>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(settlement.settlementMonth ?? '')}</td>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(settlement.createdAt ?? '')}</td>
        </tr>
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">客戶 / 通路</td>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">聯絡窗口</td>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">連絡電話</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(settlement.channelName ?? channel?.name ?? '')}</td>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(channel?.contactName ?? '—')}</td>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(channel?.contactPhone ?? '—')}</td>
        </tr>
        ${channel?.invoice_title || channel?.tax_id ? `
        <tr>
          <td style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">公司抬頭</td>
          <td colspan="2" style="padding:5px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:9px;color:${COLOR.textMuted};">統一編號</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(channel?.invoice_title ?? '—')}</td>
          <td colspan="2" style="padding:6px 10px;border:1px solid ${COLOR.borderGray};font-size:11px;font-weight:700;">${escapeHtml(channel?.tax_id ?? '—')}</td>
        </tr>` : ''}
      </table>
    </div>

    <!-- 匯款資訊 -->
    <div style="margin-top:12px;border:1px solid ${COLOR.termsBord};background:${COLOR.brandSoft};padding:8px 12px;">
      <div style="font-size:11px;font-weight:700;color:${COLOR.text};margin-bottom:4px;">💰  匯款資訊</div>
      <div style="font-size:10px;color:${COLOR.text};line-height:1.7;">
        <div>戶名：<strong>舒果農企業有限公司</strong>　·　銀行：兆豐國際商業銀行 蘆洲分行（代號 0170077）　·　帳號：<strong>00709001170</strong></div>
        <div style="color:${COLOR.textMuted};margin-top:2px;">匯款後請保留水單並回傳至業務窗口，以加快對帳作業。</div>
      </div>
    </div>

    <!-- 合作條款 -->
    <div style="margin-top:10px;border:1px solid ${COLOR.termsBord};background:${COLOR.brandSoft};padding:8px 12px;">
      <div style="font-size:11px;font-weight:700;color:${COLOR.text};margin-bottom:4px;">📋  合作條款</div>
      <div style="font-size:9px;color:${COLOR.text};line-height:1.65;">
        <div>1. 以上金額皆為含稅價，如對金額有疑義請於收到本結算單 7 日內通知業務窗口。</div>
        <div>2. 付款條件：月結 30 天（每月 25 日前付清當期帳款）。</div>
        <div>3. 合作方式：買斷；已出貨商品恕不退貨。</div>
        <div>4. 本結算單為對帳用途，非正式發票；發票將依貴司指定方式另行開立。</div>
      </div>
    </div>

    <!-- 簽章 -->
    <div style="margin-top:10px;padding:5px 10px;background:${COLOR.bgHeader};border:1px solid ${COLOR.borderGray};text-align:center;font-size:10px;color:${COLOR.textMuted};">
      請<span style="color:${COLOR.red};font-weight:700;">核對</span>並<span style="color:${COLOR.red};font-weight:700;">簽章</span>後回傳，以利後續匯款作業
    </div>
    <div style="display:flex;">
      <div style="flex:1;height:80px;border:1px solid ${COLOR.borderGray};border-top:none;border-right:none;"></div>
      <div style="flex:1;height:80px;border:1px solid ${COLOR.borderGray};border-top:none;"></div>
    </div>
    <div style="display:flex;">
      <div style="flex:1;padding:4px 10px;border:1px solid ${COLOR.borderGray};border-top:none;border-right:none;text-align:center;font-size:10px;color:${COLOR.textMuted};">財務確認簽章</div>
      <div style="flex:1;padding:4px 10px;border:1px solid ${COLOR.borderGray};border-top:none;text-align:center;font-size:10px;color:${COLOR.textMuted};">廠商確認簽章</div>
    </div>
  ` : ''

  return `
    <div style="width:794px;padding:24px 30px 20px;background:#fff;font-family:'Microsoft JhengHei','Noto Sans TC',Arial,sans-serif;color:${COLOR.text};box-sizing:border-box;">
      <!-- Letterhead -->
      <div style="position:relative;border:1px solid ${COLOR.borderGray};height:52px;">
        <img src="${LOGO_PATH}" style="position:absolute;left:10px;top:4px;height:44px;width:auto;" />
        <div style="text-align:center;font-size:20px;font-weight:700;letter-spacing:10px;line-height:52px;">月 結 結 算 單</div>
        <div style="position:absolute;right:10px;top:4px;font-size:9px;color:${COLOR.textMuted};">第 ${pageInfo.current} / ${pageInfo.total} 頁</div>
      </div>

      <!-- 狀態 header -->
      <div style="background:${COLOR.frozen || '#366092'};color:#fff;font-size:14px;font-weight:700;text-align:center;padding:6px 0;border:1px solid ${COLOR.borderGray};border-top:none;background:${COLOR.brand};">
        ${escapeHtml(settlement.channelName ?? channel?.name ?? '')}　·　${escapeHtml(settlement.settlementMonth ?? '')}　·　${STATUS_LABEL[settlement.status] ?? settlement.status ?? ''}
      </div>

      ${summaryBanner}

      <!-- 訂單列表 -->
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;">B2B 訂單編號</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:95px;">下單日期</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;">出貨門市 / 地址</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:55px;">品項</th>
            <th style="padding:6px 10px;border:1px solid ${COLOR.borderGray};background:${COLOR.bgHeader};font-size:11px;font-weight:700;color:${COLOR.textMuted};text-align:center;width:110px;">金額</th>
          </tr>
        </thead>
        <tbody>
          ${orderRows}
          ${tableFooter}
        </tbody>
      </table>

      ${footerHtml}
    </div>
  `
}

// 每頁最多容納訂單數
const PAGE_SIZE_NORMAL = 20
const PAGE_SIZE_LAST   = 8

// ── 主函式 ──────────────────────────────────────────────
export async function exportSettlementPdf({ settlement, relatedOrders }) {
  if (!settlement) throw new Error('找不到結算單資料')
  const orders = relatedOrders ?? []
  const channel = channelMap[settlement.channelId]

  // 切分為頁
  const pagesList = []
  if (orders.length === 0) {
    pagesList.push({ orders: [] })
  } else {
    let idx = 0
    while (idx < orders.length) {
      const take = Math.min(PAGE_SIZE_NORMAL, orders.length - idx)
      pagesList.push({ orders: orders.slice(idx, idx + take) })
      idx += take
    }
    // 最後頁留空間給 footer
    const last = pagesList[pagesList.length - 1]
    if (last.orders.length > PAGE_SIZE_LAST) {
      const overflow = last.orders.length - PAGE_SIZE_LAST
      const moved = last.orders.slice(0, overflow)
      last.orders = last.orders.slice(overflow)
      pagesList.splice(pagesList.length - 1, 0, { orders: moved })
    }
  }

  const meta = { totalOrders: orders.length }

  const container = makeOffscreenContainer()
  const pdf = newA4Pdf()

  try {
    for (let i = 0; i < pagesList.length; i++) {
      const { orders: pageOrders } = pagesList[i]
      const pageDiv = document.createElement('div')
      pageDiv.innerHTML = buildSettlementPageHtml({
        settlement,
        pageOrders,
        channel,
        pageInfo: { current: i + 1, total: pagesList.length },
        meta,
      })
      container.appendChild(pageDiv)
      await renderDivToPdfPage(pdf, pageDiv, i === 0)
    }
  } finally {
    document.body.removeChild(container)
  }

  pdf.save(`結算單_${settlement.id}_${todayYmd()}.pdf`)
}
