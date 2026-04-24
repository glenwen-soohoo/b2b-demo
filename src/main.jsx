import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { VendorProvider } from './context/VendorContext'
import { WarehouseProvider } from './context/WarehouseContext'
import App from './App.jsx'
import { BASE_URL } from './config'
import 'antd/dist/reset.css'
import './index.css'

const antdTheme = {
  token: {
    fontFamily: "'Noto Sans TC', system-ui, -apple-system, sans-serif",
  },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={BASE_URL}>
      <ConfigProvider theme={antdTheme}>
        <VendorProvider>
          <WarehouseProvider>
            <App />
          </WarehouseProvider>
        </VendorProvider>
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
)
