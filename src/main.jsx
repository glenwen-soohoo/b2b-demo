import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { VendorProvider } from './context/VendorContext'
import { WarehouseProvider } from './context/WarehouseContext'
import App from './App.jsx'
import 'antd/dist/reset.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <VendorProvider>
        <WarehouseProvider>
          <App />
        </WarehouseProvider>
      </VendorProvider>
    </BrowserRouter>
  </StrictMode>,
)
