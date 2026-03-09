import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { VendorProvider } from './context/VendorContext'
import App from './App.jsx'
import 'antd/dist/reset.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <VendorProvider>
        <App />
      </VendorProvider>
    </BrowserRouter>
  </StrictMode>,
)
