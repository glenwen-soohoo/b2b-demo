// B2B 預留庫存服務層（Phase 3.5）
//
// 與產品層 stockMode/stockLimit 完全分開，兩邊獨立計算。
// 沒有 b2bReservedInventory 記錄的產品，B2B 庫存視為「不限量」。
//
// TODO_FRUIT_WEB: 上線時替換為真實 API 呼叫：
//   getB2bInventory    → GET  /api/b2b/inventory/{productId}
//   reserveB2bStock    → POST /api/b2b/inventory/{productId}/reserve
//   releaseB2bStock    → POST /api/b2b/inventory/{productId}/release
//   updateB2bStock     → PUT  /api/b2b/inventory/{productId}/stock
//   對應後端表：B2BReservedStock（ProductId, TotalStock, AllocatedQty, LastUpdated）

import { b2bReservedInventory } from '../data/fakeData'

// ── 本地可變狀態（prototype 用，上線時由後端管理）────────────────────────
let _inventory = b2bReservedInventory.map(r => ({ ...r }))

// ── 讀取 ──────────────────────────────────────────────────────────────────

/**
 * 取得單一產品的 B2B 庫存記錄。
 * 找不到時回傳 null（代表「不限量」）。
 *
 * @param {string} productId
 * @returns {{ productId, b2bStock, b2bAllocated, lastUpdated } | null}
 */
export function getB2bInventory(productId) {
  return _inventory.find(r => r.productId === productId) ?? null
}

/**
 * 取得所有 B2B 庫存記錄（Admin 列表用）。
 *
 * @returns {Array}
 */
export function getAllB2bInventory() {
  return [..._inventory]
}

/**
 * 計算 B2B 可用數量。
 * 無記錄（不限量）回傳 Infinity；庫存不足回傳 0。
 *
 * @param {string} productId
 * @returns {number}  可用數量；Infinity 代表不限量
 */
export function getB2bAvailable(productId) {
  const rec = getB2bInventory(productId)
  if (!rec) return Infinity
  return Math.max(0, rec.b2bStock - rec.b2bAllocated)
}

/**
 * 判斷某數量是否可下單。
 *
 * @param {string} productId
 * @param {number} qty
 * @returns {boolean}
 */
export function canB2bOrder(productId, qty) {
  return getB2bAvailable(productId) >= qty
}

// ── 寫入（prototype 為本地狀態，上線時改 API call）────────────────────────

/**
 * 建單時佔用 B2B 庫存（pending_sales → ordered 時呼叫）。
 * 若無庫存記錄（不限量），直接成功。
 *
 * TODO_FRUIT_WEB: POST /api/b2b/inventory/{productId}/reserve  { qty }
 *
 * @param {string} productId
 * @param {number} qty
 * @returns {Promise<void>}
 * @throws {Error} 庫存不足時拋出
 */
export async function reserveB2bStock(productId, qty) {
  await new Promise(r => setTimeout(r, 100))
  const rec = getB2bInventory(productId)
  if (!rec) return
  const available = rec.b2bStock - rec.b2bAllocated
  if (available < qty) {
    throw new Error(`${productId} B2B 庫存不足（可用 ${available}，需求 ${qty}）`)
  }
  rec.b2bAllocated += qty
  rec.lastUpdated = new Date().toISOString().slice(0, 10)
}

/**
 * 取消或調減訂單時釋放 B2B 庫存。
 *
 * TODO_FRUIT_WEB: POST /api/b2b/inventory/{productId}/release  { qty }
 *
 * @param {string} productId
 * @param {number} qty
 * @returns {Promise<void>}
 */
export async function releaseB2bStock(productId, qty) {
  await new Promise(r => setTimeout(r, 100))
  const rec = getB2bInventory(productId)
  if (!rec) return
  rec.b2bAllocated = Math.max(0, rec.b2bAllocated - qty)
  rec.lastUpdated = new Date().toISOString().slice(0, 10)
}

/**
 * 倉庫端更新 B2B 可用總庫存量。
 * 若產品目前無記錄，自動建立一筆。
 *
 * TODO_FRUIT_WEB: PUT /api/b2b/inventory/{productId}/stock  { b2bStock }
 *
 * @param {string} productId
 * @param {number} newStock
 * @returns {Promise<void>}
 */
export async function updateB2bStock(productId, newStock) {
  await new Promise(r => setTimeout(r, 100))
  const rec = getB2bInventory(productId)
  if (rec) {
    rec.b2bStock = newStock
    rec.lastUpdated = new Date().toISOString().slice(0, 10)
  } else {
    _inventory.push({
      productId,
      b2bStock: newStock,
      b2bAllocated: 0,
      lastUpdated: new Date().toISOString().slice(0, 10),
    })
  }
}

/**
 * 重置為初始假資料（測試 / 開發用）。
 */
export function _resetInventory() {
  _inventory = b2bReservedInventory.map(r => ({ ...r }))
}
