import { createContext, useContext, useState } from 'react'

const VendorContext = createContext(null)

export function VendorProvider({ children }) {
  const [channel, setChannel] = useState(null)

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
