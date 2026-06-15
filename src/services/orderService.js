// B2B → fruit_web 訂單服務層
// 目前為 prototype（假資料模式），上線時替換 API 呼叫。
//
// TODO_FRUIT_WEB: 上線時的串接點
//   - createFruitOrderFromB2B → POST /api/b2b/orders/create
//   - markOrderArrived        → PUT  /api/b2b/orders/{fruitOrderNumber}/arrived
//   - addToSettlement         → POST /api/b2b/settlements/{settlementId}/orders
//
// 對應 fruit_web 入口：重用既有「企業訂單匯入」邏輯
//   GoX/OrdersController.CreateOrderByExcelEnterprise → OrderImporter.CreateOrdersByExcelImportForEnterprise → OrdersExtension.SetMainOrders
//   B2B 一鍵匯單 = 組等價 import item 呼叫同一套建單邏輯，並帶：
//     - OrdersFrom = 4（新增 B2B 列舉值；ORDER_ORIGIN 目前 Constant.cs 最大為 APP_END=3）
//     - VolunteersId = 固定既有會員「無毒農」(0900000000)；寄件人=無毒農、收件人=通路門市
//     - TotalPrice = 0（主站訂單金額帶 0；主站 TotalPrice>0 閘門自動不開 B2B 發票；真實金額在 B2B 端）
//     - 不新增 Orders.IsB2B 欄位（區分 B2B 靠 OrdersFrom=4）


function generateB2bOrderNo() {
  const d = new Date()
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `B2B-${ym}-${seq}`
}

/**
 * 將 B2B 訂單轉入 fruit_web 正式建單（prototype）。
 *
 * TODO_FRUIT_WEB: 替換為真實 API 呼叫，回傳 { fruitOrderNumber, fruitOrderId }
 *
 * @param {object} b2bOrder - B2B 訂單物件（含 adjustedItems / salesAdjustedItems / items）
 * @param {object} channel  - 通路物件（含 taxId、title 等）
 * @returns {Promise<{ fruitOrderNumber: string, fruitOrderId: number }>}
 */
// eslint-disable-next-line no-unused-vars
export async function createFruitOrderFromB2B(b2bOrder, channel) {
  // ── Prototype: 模擬 API 延遲 + 產生假的 fruitOrderNumber ─────────
  // 註：channel 參數保留給正式版傳給 fruit_web API 用（買受人抬頭/統編等資訊）
  await new Promise(r => setTimeout(r, 600))

  const items = b2bOrder.adjustedItems ?? b2bOrder.salesAdjustedItems ?? b2bOrder.items ?? []
  if (items.length === 0) throw new Error('訂單沒有有效品項，無法建單')

  const now = new Date()
  const dateSeq = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const fruitOrderId = parseInt(`${dateSeq}${String(Math.floor(Math.random() * 9000) + 1000)}`)
  const fruitOrderNumber = String(fruitOrderId)

  return { fruitOrderNumber, fruitOrderId }
}

/**
 * 業務確認 B2B 訂單（pending_sales → ordered）。
 * 產生 b2b_order_no（若尚無），鎖定 salesAdjustedItems。
 *
 * @param {object} order      - 原始 B2B 訂單
 * @param {Array}  adjItems   - 業務確認後的品項列表
 * @param {string} b2bNote    - 業務備註
 * @returns {object} 更新後的訂單欄位 patch
 */
export function buildSalesConfirmPatch(order, adjItems, b2bNote) {
  const b2bOrderNo = order.b2b_order_no ?? generateB2bOrderNo()
  const now = new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', '')
  const unchanged = adjItems.every((it, idx) => {
    const orig = order.items[idx]
    return orig && it.qty === orig.qty && it.price === orig.price
  })
  const logMsg = unchanged
    ? '[手動操作] 業務確認完成，建立正式訂單（數量無變動）'
    : `[手動操作] 業務確認完成，建立正式訂單（${
        adjItems.filter((it, idx) => it.qty !== (order.items[idx]?.qty ?? it.qty))
          .map(it => {
            const orig = order.items.find(o => o.productId === it.productId)
            return orig ? `${it.productName}: ${orig.qty}→${it.qty}` : ''
          })
          .filter(Boolean).join('、')
      }）`

  return {
    status: 'ordered',
    b2b_order_no: b2bOrderNo,
    salesAdjustedItems: adjItems,
    b2b_note: b2bNote || order.b2b_note,
    logs: [...(order.logs ?? []), { time: now, action: logMsg }],
  }
}

// 註：原 buildWarehouseConfirmPatch（倉庫端確認轉入後台）已於倉庫端移除後刪除。
// 正式版改由：
//   1. 業務在後台手動匯單 → 呼叫 createFruitOrderFromB2B
//   2. arrived 狀態由主站黑貓貨態爬蟲（BlackCatHelper.ScratchOrdersState）自動推進
// 詳見交接文件 模組 8（結算與發票）§6.4 + 模組 9（出貨與黑貓貨態）。

/**
 * 計算結算應收金額（含折扣）。
 * @param {Array}  items           - 品項列表
 * @param {number} discountAmount  - 折讓金額
 */
export function calcSettlementTotal(items, discountAmount = 0) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  return subtotal - discountAmount
}

/**
 * 作廢 B2B 訂單（任一狀態 → voided），並呼叫 fruit_web 刪單 API。
 *
 * TODO_FRUIT_WEB: 上線時需在此呼叫 fruit_web 刪單 API
 *   POST /api/OrdersWebApi/DeleteOrder
 *   body: { orderId: order.backendOrderId, userId: <當前後台帳號 ID> }   // 正式版統一為 MainOrderId（見 Schema §4.2）
 *   檔案：HuashanCRM/Controllers/Api/Orders/OrdersWebApiController.cs:103
 *
 *   API 自動處理：
 *     - Orders.direction = 3（已取消，軟刪除，不實刪資料）
 *     - OrderDetail 同步軟刪
 *     - 庫存回補、紅利點數收回、優惠券返還、訂閱取消
 *
 *   ⚠️ 不會自動處理（需後台人員手動）：
 *     - 發票作廢（Phase 1 B2BInvoiceService 只開立、不作廢；已開過的發票需到綠界後台手動作廢 / 重開）
 *     - 黑貓物流取消（需到黑貓系統直接操作）
 *
 *   ⚠️ B2B 庫存對齊：fruit_web 會把品項加回線上庫存，但 B2B 採購商品
 *     實際是另外進貨，作廢時要視情況決定是否真的回補線上庫存
 *     （建議後台另設參數控制，或提示人員手動調整）。
 *
 * @param {object} order   - B2B 訂單
 * @param {string} reason  - 作廢原因（可選，記入 logs）
 * @returns {Promise<object>} 更新後的訂單欄位 patch
 */
export async function buildVoidPatch(order, reason = '') {
  // ── Prototype: 模擬呼叫 fruit_web 刪單 API（已匯單、有主站正式訂單號才呼叫）──
  if (order.backendOrderId) {
    await new Promise(r => setTimeout(r, 400))
  }

  const now = new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', '')
  const logMsg = reason
    ? `[手動操作] 訂單作廢（${reason}）` + (order.backendOrderId ? `，已呼叫 fruit_web 刪單 ${order.backendOrderId}` : '')
    : `[手動操作] 訂單作廢` + (order.backendOrderId ? `，已呼叫 fruit_web 刪單 ${order.backendOrderId}` : '')

  return {
    status: 'voided',
    voided_at: now,
    voided_reason: reason || null,
    logs: [...(order.logs ?? []), { time: now, action: logMsg }],
  }
}

/**
 * 將舊訂單複製成一筆新的 B2B 待業務確認訂單（重新建單）。
 * 後台正式訂單號清空、業務調整品項清空、備註與折扣全清，重新走流程。
 *
 * @param {object} oldOrder - 要被複製的訂單（通常是 voided 狀態）
 * @returns {object} 新訂單物件（呼叫端負責 push 進 list）
 */
export function buildRecreatedOrder(oldOrder) {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const newId = `b2b-${String(Math.floor(Math.random() * 90000) + 10000)}`
  const newB2bNo = generateB2bOrderNo()
  const timestamp = now.toLocaleString('zh-TW', { hour12: false }).replace(',', '')

  return {
    id: newId,
    channelId:    oldOrder.channelId,
    channelName:  oldOrder.channelName,
    items:        oldOrder.items.map(i => ({ ...i })),  // 完整帶入原始品項
    shippingAddress: oldOrder.shippingAddress,
    vendorNote:   oldOrder.vendorNote ?? null,

    // 重設所有後續流程欄位
    status: 'pending_sales',
    b2b_order_no: newB2bNo,
    backendOrderId: null,
    salesAdjustedItems: null,
    adjustedItems: null,
    shipping_note: oldOrder.shipping_note ?? null,
    warehouse_note: null,
    cs_note: null,
    b2b_note: null,
    discount_amount: 0,
    discount_note: null,
    settlementMonth: null,
    settlementId: null,
    invoicePeriodSnapshot:   oldOrder.invoicePeriodSnapshot,
    invoiceTaxScopeSnapshot: oldOrder.invoiceTaxScopeSnapshot,

    // 溯源紀錄
    recreated_from: oldOrder.id,
    createdAt: today,
    logs: [{
      time: timestamp,
      action: `[手動操作] 由訂單 ${oldOrder.id} 重新建單`,
    }],
  }
}

/**
 * 取得訂單最終確認品項（warehouse > sales > original）。
 */
export function getConfirmedItems(order) {
  return order.adjustedItems ?? order.salesAdjustedItems ?? order.items ?? []
}

export { generateB2bOrderNo }
