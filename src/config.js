// Runtime configuration — works with Vite (dev/build) and future Webpack/ASP.NET MVC hosting.
//
// ASP.NET MVC 部署時，在 Razor view 的 <head> 設定：
//   <script>window.__B2B_CONFIG = { baseUrl: '@Url.Content("~/B2B/")' }</script>
// 未設定時退回 '/'。

const _cfg = (typeof window !== 'undefined' && window.__B2B_CONFIG) || {}

// Base URL for static assets (logo, etc.)
// Vite dev/build: falls back to import.meta.env.BASE_URL via vite.config.js define
/* global __VITE_BASE_URL__ */
export const BASE_URL = _cfg.baseUrl
  ?? (typeof __VITE_BASE_URL__ !== 'undefined' ? __VITE_BASE_URL__ : '/')
