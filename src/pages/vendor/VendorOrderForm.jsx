import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card, Tabs, Button, Space, Typography,
  Tag, Alert, Modal, message,
} from 'antd'
import {
  ShoppingCartOutlined, WarningOutlined, DownloadOutlined,
} from '@ant-design/icons'
import { products, templates, categories, systemSettings, shippingSettings } from '../../data/fakeData'
import { useVendor } from '../../context/VendorContext'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'
import OrderPreviewModal from '../../components/OrderPreviewModal'
import ProductSection, { ComingSoonTab } from '../../components/ProductSection'
import { exportBlankOrder } from '../../utils/exportBlankOrder'
import { TEMP_ICON } from '../../styles/tokens'

const { Title, Text } = Typography

function getProductCatId(product) {
  for (const cat of categories) {
    if (cat.subCategories.some(s => s.name === product.subCategory)) return cat.id
  }
  return categories.find(c => c.temperature === product.category)?.id ?? categories[0].id
}

export default function VendorOrderForm() {
  const { channel } = useVendor()
  const nav = useNavigate()
  const location = useLocation()
  const [qtyMap,             setQtyMap]             = useState({})
  const [previewOpen,        setPreviewOpen]        = useState(false)
  const [notifOpen,          setNotifOpen]          = useState(false)
  const [notifData,          setNotifData]          = useState(null)
  const [pendingSubmit,      setPendingSubmit]      = useState(null)
  const [conflictModalOpen,  setConflictModalOpen]  = useState(false)
  const [conflicts,          setConflicts]          = useState([])
  const processedPrefill = useRef(false)

  if (!channel) {
    nav('/login')
    return null
  }

  const tpl = templates.find(t => t.id === channel.templateId)
  const tplProducts = products.filter(p =>
    tpl?.productIds.includes(p.id) && p.isListed !== false
  )

  const productsByCat = categories.reduce((acc, cat) => {
    acc[cat.id] = tplProducts.filter(p => getProductCatId(p) === cat.id)
    return acc
  }, {})

  const hasPricingNote    = !!channel.pricingNote
  const hasVolumeDiscount = !!(channel.volumeDiscount && channel.volumeDiscount !== '無')

  // ── 重複下單：帶入上次品項數量，並檢查衝突 ──
  useEffect(() => {
    if (processedPrefill.current || !location.state?.prefill) return
    processedPrefill.current = true

    const tplAll = products.filter(p => tpl?.productIds.includes(p.id))
    const prefill = location.state.prefill
    const newQtyMap = {}
    const conflictList = []

    for (const item of prefill) {
      const product = tplAll.find(p => p.id === item.productId)
      if (!product) {
        conflictList.push({ name: item.productName ?? item.productId, reason: '已從本通路品項表中移除' })
        continue
      }
      if (product.isListed === false) {
        conflictList.push({ name: product.name, reason: '商品已下架，未帶入' })
        continue
      }
      if (product.stockMode === 'out_of_stock') {
        conflictList.push({ name: product.name, reason: '商品目前缺貨，未帶入' })
        continue
      }
      if (product.stockMode === 'limited' && item.qty > product.stockLimit) {
        conflictList.push({
          name: product.name,
          reason: `原下訂 ${item.qty}，超過庫存上限 ${product.stockLimit}，已自動調整為 ${product.stockLimit}`,
        })
        newQtyMap[product.id] = product.stockLimit
        continue
      }
      newQtyMap[product.id] = item.qty
    }

    setQtyMap(newQtyMap)
    if (conflictList.length > 0) {
      setConflicts(conflictList)
      setConflictModalOpen(true)
    }
  }, [channel])

  const setQty = (id, val) => setQtyMap(prev => ({ ...prev, [id]: val }))

  const orderedItems = tplProducts
    .filter(p => (qtyMap[p.id] ?? 0) > 0 && p.stockMode !== 'out_of_stock')
    .map(p => ({ ...p, qty: qtyMap[p.id] }))

  const frozenOrdered  = orderedItems.filter(i => i.category === 'frozen')
  const ambientOrdered = orderedItems.filter(i => i.category === 'ambient')
  const frozenTotal    = frozenOrdered.reduce((s, i) => s + i.qty * i.b2bPrice, 0)
  const ambientTotal   = ambientOrdered.reduce((s, i) => s + i.qty * i.b2bPrice, 0)
  const frozenBelowThreshold  = frozenOrdered.length > 0 && frozenTotal < shippingSettings.frozen.freeShippingThreshold
  const ambientBelowThreshold = ambientOrdered.length > 0 && ambientTotal < shippingSettings.ambient.freeShippingThreshold
  const total = frozenTotal + ambientTotal

  // 第一步：關閉預覽 Modal，開啟通知預覽
  const handleConfirm = ({ addrLabels, settlementMonth, vendorNote }) => {
    setPreviewOpen(false)
    const now = new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', '')
    const ordersPerAddr = (frozenOrdered.length > 0 ? 1 : 0) + (ambientOrdered.length > 0 ? 1 : 0)
    setPendingSubmit({ addrLabels, settlementMonth, vendorNote })
    setNotifData({
      channelName:    channel.name,
      settlementMonth,
      itemCount:      orderedItems.length,
      total,
      frozenCount:    frozenOrdered.length,
      frozenTotal,
      ambientCount:   ambientOrdered.length,
      ambientTotal,
      vendorNote:     vendorNote || null,
      addrCount:      addrLabels.length,
      orderCount:     addrLabels.length * ordersPerAddr,
      submittedAt:    now,
    })
    setNotifOpen(true)
  }

  // 第二步：通知確認後送出
  const handleNotifConfirm = () => {
    setNotifOpen(false)
    setPendingSubmit(null)
    setQtyMap({})
    message.success({ content: 'B2B訂單已送出！業務確認後將通知您。', duration: 4 })
    nav('/orders')
  }

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <style>{`
        .vendor-qty-input .ant-input-number-input { text-align: center !important; }
        .row-out-of-stock td { background: #fafafa !important; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>商品採購</Title>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={async () => {
              try {
                await exportBlankOrder({ channel, productsByCat, categories, systemSettings })
                message.success('空白採購單已下載')
              } catch (err) {
                console.error(err)
                message.error('匯出失敗，請檢查瀏覽器 console')
              }
            }}
          >
            下載空白採購單
          </Button>
          <div style={{
            background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8,
            padding: '5px 14px', fontSize: 14, fontWeight: 600, color: '#389e0d',
          }}>
            月結日：每月 {channel.settlementDay} 日
          </div>
        </Space>
      </div>

      {(hasPricingNote || hasVolumeDiscount) && (
        <div style={{
          background: '#e6f4ff', border: '1px solid #91caff',
          borderRadius: 6, padding: '12px 16px', marginBottom: 12,
        }}>
          {hasPricingNote && (
            <div style={{ marginBottom: hasVolumeDiscount ? 12 : 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#0958d9' }}>
                【個別品項議價】
              </div>
              <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-line', color: '#333' }}>
                {channel.pricingNote}
              </pre>
            </div>
          )}
          {hasVolumeDiscount && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#0958d9' }}>
                【量折優惠】
              </div>
              <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-line', color: '#333' }}>
                {channel.volumeDiscount}
              </pre>
            </div>
          )}
        </div>
      )}

      {orderedItems.length === 0 ? (
        <Card size="small" style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>尚未選購任何商品</Text>
        </Card>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {frozenOrdered.length > 0 && (
            <Card size="small" style={{ flex: 1, borderColor: frozenBelowThreshold ? '#ffd591' : '#91caff', background: frozenBelowThreshold ? '#fffbe6' : '#f0f5ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>❄️ 冷凍　已選 <Text strong>{frozenOrdered.length}</Text> 項</span>
                <Text strong style={{ color: '#1677ff' }}>${frozenTotal.toLocaleString()}</Text>
              </div>
              {frozenBelowThreshold && (
                <div style={{ fontSize: 11, color: '#d46b08', marginTop: 2 }}>
                  未達免運門檻 ${shippingSettings.frozen.freeShippingThreshold.toLocaleString()}，每筆加收運費 ${shippingSettings.frozen.shippingFee}
                </div>
              )}
            </Card>
          )}
          {ambientOrdered.length > 0 && (
            <Card size="small" style={{ flex: 1, borderColor: ambientBelowThreshold ? '#ffd591' : '#b7eb8f', background: ambientBelowThreshold ? '#fffbe6' : '#f6ffed' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🌿 常溫　已選 <Text strong>{ambientOrdered.length}</Text> 項</span>
                <Text strong style={{ color: '#389e0d' }}>${ambientTotal.toLocaleString()}</Text>
              </div>
              {ambientBelowThreshold && (
                <div style={{ fontSize: 11, color: '#d46b08', marginTop: 2 }}>
                  未達免運門檻 ${shippingSettings.ambient.freeShippingThreshold.toLocaleString()}，每筆加收運費 ${shippingSettings.ambient.shippingFee}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      <Card
        title="請填寫採購數量"
        extra={
          <Button
            type="primary" icon={<ShoppingCartOutlined />}
            disabled={orderedItems.length === 0}
            onClick={() => setPreviewOpen(true)}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            預覽 & 送出
          </Button>
        }
      >
        <Tabs
          items={categories.map(cat => {
            const catProds = productsByCat[cat.id] ?? []
            const icon     = TEMP_ICON[cat.temperature] ?? ''
            return {
              key: cat.id,
              label: catProds.length > 0
                ? `${icon} ${cat.name}（${catProds.length} 項）`
                : `${icon} ${cat.name}`,
              children: catProds.length > 0
                ? <ProductSection
                    prods={catProds} qtyMap={qtyMap} setQty={setQty}
                    temperature={cat.temperature}
                  />
                : <ComingSoonTab emoji={icon} />,
            }
          })}
        />
      </Card>

      <OrderPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        items={orderedItems}
        channel={channel}
        onConfirm={handleConfirm}
      />

      <NotificationPreviewModal
        open={notifOpen}
        onClose={() => { setNotifOpen(false); setPendingSubmit(null) }}
        onConfirm={handleNotifConfirm}
        type="order_submitted"
        data={notifData}
      />

      <Modal
        open={conflictModalOpen}
        onOk={() => setConflictModalOpen(false)}
        onCancel={() => setConflictModalOpen(false)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="我知道了"
        title={<Space><WarningOutlined style={{ color: '#fa8c16' }} />重複下單注意事項</Space>}
        width={480}
      >
        <Alert type="warning" showIcon
          message="以下品項因庫存或上架狀態有差異，數量已調整或未帶入："
          style={{ marginBottom: 16 }}
        />
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {conflicts.map((c, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <Text strong>{c.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>— {c.reason}</Text>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 16, fontSize: 13, color: '#888' }}>
          其他品項數量已正常帶入，請確認後再送出B2B訂單。
        </div>
      </Modal>
    </div>
  )
}
