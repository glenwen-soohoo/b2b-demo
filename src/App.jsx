import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage        from './pages/HomePage'
import AdminLayout     from './layouts/AdminLayout'
import VendorLayout    from './layouts/VendorLayout'
import VendorLogin     from './pages/vendor/VendorLogin'
import VendorOrderForm from './pages/vendor/VendorOrderForm'
import VendorHistory   from './pages/vendor/VendorHistory'
import VendorProfile   from './pages/vendor/VendorProfile'
import AdminOrders     from './pages/admin/AdminOrders'
import AdminProducts   from './pages/admin/AdminProducts'
import AdminChannels   from './pages/admin/AdminChannels'
import AdminTemplates  from './pages/admin/AdminTemplates'
import AnalyticsPage   from './pages/AnalyticsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<HomePage />} />

      {/* 廠商前台 */}
      <Route path="/vendor"        element={<VendorLogin />} />
      <Route path="/vendor/*"      element={<VendorLayout />}>
        <Route path="order"        element={<VendorOrderForm />} />
        <Route path="history"      element={<VendorHistory />} />
        <Route path="profile"      element={<VendorProfile />} />
        <Route path="*"            element={<Navigate to="order" replace />} />
      </Route>

      {/* 管理後台 */}
      <Route path="/admin/*"       element={<AdminLayout />}>
        <Route index              element={<Navigate to="orders" replace />} />
        <Route path="orders"      element={<AdminOrders />} />
        <Route path="products"    element={<AdminProducts />} />
        <Route path="channels"    element={<AdminChannels />} />
        <Route path="templates"   element={<AdminTemplates />} />
        <Route path="analytics"   element={<AnalyticsPage />} />
        <Route path="*"           element={<Navigate to="orders" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
