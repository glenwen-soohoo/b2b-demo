// ─────────────────────────────────────────────
// 合約同意紀錄 store
//
// 需求：資料庫要記錄廠商勾選同意的時間點；合約更新且設定需重新同意時，
// 「不洗掉前次同意的時間紀錄」前提下再加記一筆新的同意時間。
//
// Demo 實作：種子紀錄在 contractData.seedContractAgreements（模擬資料庫既有資料），
// 新產生的同意寫進 localStorage 持久化（模擬寫回資料庫），兩者合併後對外提供查詢。
// 每一次「勾選同意」都是 append 一筆 { channelId, version, agreedAt, ip }，永不覆蓋舊筆。
//
// ⚠️ TODO_FRUIT_WEB：正式版改為 B2BContractAgreement 資料表（append-only），
//   欄位 channelId / version / agreedAt / ip / userAgent；由後端寫入、後台唯讀查詢。
// ─────────────────────────────────────────────
import {
  seedContractAgreements,
  getCurrentContractVersion,
} from '../data/contractData'

const LS_KEY = 'b2b_contract_agreements'

// ── localStorage：demo 期間新產生的同意紀錄 ──
function loadNew() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? [] } catch { return [] }
}
function saveNew(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)) } catch { /* 忽略（無痕視窗等） */ }
}

// ── 變更 pub/sub（廠商端 gating、合約頁、後台查詢即時更新） ──
let listeners = []
export function subscribeContractUpdates(fn) {
  listeners.push(fn)
  return () => { listeners = listeners.filter(f => f !== fn) }
}
function notify() { listeners.forEach(fn => fn()) }

// ── 查詢 ──
/** 全部同意紀錄（種子 + demo 新增），供後台唯讀追查 */
export function getAllAgreements() {
  return [...seedContractAgreements, ...loadNew()]
}

/** 某通路的同意紀錄，新到舊 */
export function getChannelAgreements(channelId) {
  return getAllAgreements()
    .filter(a => a.channelId === channelId)
    .sort((a, b) => (b.agreedAt ?? '').localeCompare(a.agreedAt ?? ''))
}

/** 某通路最近一次同意紀錄 */
export function getLatestAgreement(channelId) {
  return getChannelAgreements(channelId)[0] ?? null
}

/** 某通路是否已同意指定版本 */
export function hasAgreedVersion(channelId, version) {
  return getAllAgreements().some(a => a.channelId === channelId && a.version === version)
}

/** 某通路是否已同意現行版本 */
export function hasAgreedCurrent(channelId) {
  return hasAgreedVersion(channelId, getCurrentContractVersion().version)
}

/**
 * 同意狀態：
 *   'agreed_current'         已同意現行版本 → 正常使用
 *   'need_first'             從未同意 → 進場硬擋（首次同意）
 *   'need_reconsent'         同意過舊版、現行版標記需重新同意 → 進場硬擋（重簽）
 *   'agreed_outdated_minor'  同意過舊版、現行版為小幅更新（不需重簽）→ 可正常使用，合約頁提示有新版
 */
export function getConsentState(channelId) {
  if (hasAgreedCurrent(channelId)) return 'agreed_current'
  const hasAny = getChannelAgreements(channelId).length > 0
  if (!hasAny) return 'need_first'
  return getCurrentContractVersion().requireReconsent ? 'need_reconsent' : 'agreed_outdated_minor'
}

/** 進場是否需要硬擋（強制彈窗同意才能使用） */
export function needsConsent(channelId) {
  const s = getConsentState(channelId)
  return s === 'need_first' || s === 'need_reconsent'
}

// ── 寫入 ──
function nowStamp() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// demo 用的假 IP（模擬後端記錄的來源位址）
function demoIp() {
  return `118.161.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`
}

/**
 * 記錄一筆新的同意（append，不覆蓋舊紀錄）。
 * 回傳新增的紀錄。
 */
export function recordAgreement(channelId) {
  const version = getCurrentContractVersion().version
  const entry = { channelId, version, agreedAt: nowStamp(), ip: demoIp() }
  saveNew([...loadNew(), entry])
  notify()
  return entry
}
