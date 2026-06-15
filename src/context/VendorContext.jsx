// ─────────────────────────────────────────────
// 廠商登入狀態 Context
//
// ⚠️ TODO_FRUIT_WEB（正式版改 JWT）：
// Demo 階段用 React state 直接存 channel 物件，重新整理頁面就會掉。
// 正式版改成 JWT（Access Token + Refresh Token）：
//   - login() → POST /api/b2b/auth/login → 取回 accessToken + refreshToken
//     accessToken 存記憶體（Context state），refreshToken 存 httpOnly cookie
//   - 每個 API 請求自動帶上 Authorization: Bearer <accessToken>
//   - accessToken 過期時用 refreshToken 換新（呼叫 /api/b2b/auth/refresh）
//   - logout() → POST /api/b2b/auth/logout → 後端標記 refreshToken 失效
//
// 帳號存 B2B 自有 B2BAccount 表（不建主站 Volunteers 假人）。詳細設計見模組 1（通路與帳號）§七。
// ─────────────────────────────────────────────
import { createContext, useContext, useState } from 'react'

const VendorContext = createContext(null)

export function VendorProvider({ children }) {
  const [channel, setChannel] = useState(null)

  // demo 簡化：login 直接把 channel 物件放進 state
  // 正式版：login 改回 axios.post('/api/b2b/auth/login', { account, password })
  //         成功後 setChannel(payload.channel) + 把 token 存好
  const login  = (ch) => setChannel(ch)
  const logout = ()   => setChannel(null)

  return (
    <VendorContext.Provider value={{ channel, login, logout }}>
      {children}
    </VendorContext.Provider>
  )
}

export function useVendor() {
  return useContext(VendorContext)
}
