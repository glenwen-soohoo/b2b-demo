import { createContext, useContext, useState } from 'react'

// 假倉庫帳號
const WAREHOUSE_ACCOUNTS = [
  { id: 'w001', username: 'warehouse', password: '1234', name: '倉庫管理員' },
]

const WarehouseContext = createContext(null)

export function WarehouseProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (username, password) => {
    const account = WAREHOUSE_ACCOUNTS.find(
      a => a.username === username && a.password === password
    )
    if (account) {
      setUser(account)
      return true
    }
    return false
  }

  const logout = () => setUser(null)

  return (
    <WarehouseContext.Provider value={{ user, login, logout }}>
      {children}
    </WarehouseContext.Provider>
  )
}

export function useWarehouse() {
  return useContext(WarehouseContext)
}
