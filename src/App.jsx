import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage          from './pages/HomePage'
import AdminLayout       from './layouts/AdminLayout'
import VendorLayout      from './layouts/VendorLayout'
import VendorLogin       from './pages/vendor/VendorLogin'
import VendorOrderForm   from './pages/vendor/VendorOrderForm'
import VendorOrders      from './pages/vendor/VendorOrders'
import VendorSettlements from './pages/vendor/VendorSettlements'
import VendorProfile     from './pages/vendor/VendorProfile'
import AdminOrders       from './pages/admin/AdminOrders'
import AdminSettlements  from './pages/admin/AdminSettlements'
import AdminProducts     from './pages/admin/AdminProducts'
import AdminCategories  from './pages/admin/AdminCategories'
import AdminChannels     from './pages/admin/AdminChannels'
import AdminTemplates    from './pages/admin/AdminTemplates'
import AdminShipping     from './pages/admin/AdminShipping'
import AnalyticsPage     from './pages/AnalyticsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<HomePage />} />

      {/* 廠商前台 */}
      <Route path="/login"         element={<VendorLogin />} />
      <Route element={<VendorLayout />}>
        <Route path="/order"        element={<VendorOrderForm />} />
        <Route path="/orders"       element={<VendorOrders />} />
        <Route path="/settlements"  element={<VendorSettlements />} />
        <Route path="/profile"      element={<VendorProfile />} />
        <Route path="/history"      element={<Navigate to="/orders" replace />} />
      </Route>

      {/* 管理後台 */}
      <Route path="/admin/*"       element={<AdminLayout />}>
        <Route index              element={<Navigate to="orders" replace />} />
        <Route path="orders"      element={<AdminOrders />} />
        <Route path="settlements" element={<AdminSettlements />} />
        <Route path="products"    element={<AdminProducts />} />
        <Route path="categories"  element={<AdminCategories />} />
        <Route path="shipping"    element={<AdminShipping />} />
        <Route path="channels"    element={<AdminChannels />} />
        <Route path="templates"   element={<AdminTemplates />} />
        <Route path="analytics"   element={<AnalyticsPage />} />
        <Route path="*"           element={<Navigate to="orders" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
