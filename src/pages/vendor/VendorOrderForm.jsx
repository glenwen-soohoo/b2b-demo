import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card, Tabs, Table, InputNumber, Button, Space, Typography,
  Tag, Alert, Descriptions, Modal, message, Input, Checkbox,
} from 'antd'
import dayjs from 'dayjs'
import {
  ShoppingCartOutlined, FileTextOutlined, SendOutlined,
  EnvironmentOutlined, WarningOutlined, InfoCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { products, templates, categories, systemSettings } from '../../data/fakeData'
import { useVendor } from '../../context/VendorContext'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'
import { exportBlankOrder } from '../../utils/exportBlankOrder'

const { Title, Text } = Typography

const TEMP_ICON  = { frozen: '❄️', ambient: '🌿' }
const TEMP_STYLE = {
  frozen:  { background: '#e6f4ff', border: '1px solid #91caff', color: '#0958d9' },
  ambient: { background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d' },
}

// 將商品對應到大分類（與後台共用邏輯）
function getProductCatId(product) {
  for (const cat of categories) {
    if (cat.subCategories.some(s => s.name === product.subCategory)) return cat.id
  }
  return categories.find(c => c.temperature === product.category)?.id ?? categories[0].id
}

function getSettlementMonthOptions() {
  const now = dayjs()
  return [
    { value: now.format('YYYY-MM'),                 label: `${now.format('YYYY-MM')}（本月）` },
    { value: now.add(1, 'month').format('YYYY-MM'), label: `${now.add(1, 'month').format('YYYY-MM')}（下個月）` },
    { value: now.add(2, 'month').format('YYYY-MM'), label: `${now.add(2, 'month').format('YYYY-MM')}（下下個月）` },
  ]
}

function groupBySubCategory(prods) {
  return prods.reduce((acc, p) => {
    if (!acc[p.subCategory]) acc[p.subCategory] = []
    acc[p.subCategory].push(p)
    return acc
  }, {})
}

// ── 採購單確認 Modal ──────────────────────────────────────
function ItemTable({ items, showHeader = true }) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.b2bPrice, 0)
  const columns = [
    { title: '縮圖', width: 56, align: 'center',
      render: (_, r) => r.thumbnailUrl
        ? <img src={r.thumbnailUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
        : <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4 }} /> },
    { title: '品項', dataIndex: 'name',
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          {r.spec && <Tag style={{ fontSize: 11 }}>{r.spec}</Tag>}
          <span>{v}</span>
          <Text type="secondary" style={{ fontSize: 11 }}>#{r.id}</Text>
        </Space>
      )},
    { title: '單位', dataIndex: 'unit', width: 60 },
    { title: '採購價', dataIndex: 'b2bPrice', width: 80, render: v => `$${v}` },
    { title: '數量', dataIndex: 'qty', width: 70 },
    { title: '小計', width: 100,
      render: (_, r) => <Text strong>${(r.qty * r.b2bPrice).toLocaleString()}</Text> },
  ]
  return (
    <Table
      dataSource={items} rowKey="id" size="small" pagination={false}
      showHeader={showHeader}
      columns={columns}
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={5} align="right"><strong>小計</strong></Table.Summary.Cell>
          <Table.Summary.Cell>
            <strong style={{ color: '#389e0d' }}>${subtotal.toLocaleString()}</strong>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
    />
  )
}

function OrderPreviewModal({ open, onClose, items, channel, onConfirm }) {
  const [addrLabels, setAddrLabels] = useState([])
  const [vendorNote, setVendorNote] = useState('')
  const addresses = channel?.addresses ?? []

  // 結算月份自動計算：今天日期 > settlementDay → 下月；否則 → 本月
  const now = dayjs()
  const settlementMonth = now.date() > (channel?.settlementDay ?? 25)
    ? now.add(1, 'month').format('YYYY-MM')
    : now.format('YYYY-MM')

  if (!channel) return null

  const frozenItems  = items.filter(i => i.category === 'frozen')
  const ambientItems = items.filter(i => i.category === 'ambient')
  const frozenSubtotal  = frozenItems.reduce((s, i) => s + i.qty * i.b2bPrice, 0)
  const ambientSubtotal = ambientItems.reduce((s, i) => s + i.qty * i.b2bPrice, 0)
  const { freeShippingThreshold, shippingFee } = systemSettings
  const frozenShipping  = frozenItems.length > 0 && frozenSubtotal < freeShippingThreshold ? shippingFee * addrLabels.length : 0
  const ambientShipping = ambientItems.length > 0 && ambientSubtotal < freeShippingThreshold ? shippingFee * addrLabels.length : 0
  const total = frozenSubtotal + ambientSubtotal + frozenShipping + ambientShipping
  const ordersPerAddr = (frozenItems.length > 0 ? 1 : 0) + (ambientItems.length > 0 ? 1 : 0)
  const totalOrders   = addrLabels.length * ordersPerAddr

  const toggleAddr = (label, checked) => {
    setAddrLabels(prev =>
      checked ? [...prev, label] : prev.filter(l => l !== label)
    )
  }

  const confirmLabel = addrLabels.length === 0
    ? '確認送出B2B訂單'
    : `確認送出B2B訂單（共 ${totalOrders} 筆）`

  return (
    <Modal
      open={open} onCancel={onClose}
      title={<Space><FileTextOutlined />採購單確認</Space>}
      width={720}
      afterOpenChange={vis => {
        if (vis) {
          setAddrLabels(addresses.length > 0 ? [addresses[0].label] : [])
          setVendorNote(channel?.default_vendor_note ?? '')
        }
      }}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="confirm" type="primary" icon={<SendOutlined />}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
          disabled={addrLabels.length === 0}
          onClick={() => onConfirm({ addrLabels, settlementMonth, vendorNote })}
        >
          {confirmLabel}
        </Button>,
      ]}
    >
      {/* ── 基本資訊 + 結算月份 ── */}
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="通路名稱">{channel.name}</Descriptions.Item>
        <Descriptions.Item label="統一編號">{channel.taxId}</Descriptions.Item>
        <Descriptions.Item label="結算月份">
          <Text strong>{settlementMonth}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="付款方式">
          於 {channel.settlementDay} 日收到結算單後匯款
        </Descriptions.Item>
      </Descriptions>

      {/* ── 冷凍商品 ── */}
      {frozenItems.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            background: '#e6f4ff', border: '1px solid #91caff', borderRadius: '6px 6px 0 0',
            padding: '5px 12px', fontWeight: 600, fontSize: 13, color: '#0958d9',
          }}>
            ❄️ 冷凍商品（將獨立產生一筆B2B訂單）
          </div>
          <ItemTable items={frozenItems} />
          {frozenItems.length > 0 && frozenSubtotal < freeShippingThreshold && (
            <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderTop: 'none', padding: '6px 12px', fontSize: 12, color: '#d46b08' }}>
              ⚠ 冷凍訂單金額 ${frozenSubtotal.toLocaleString()} 未達免運門檻 ${freeShippingThreshold.toLocaleString()}，
              {addrLabels.length > 0
                ? `每門市加收運費 $${shippingFee}（共 ${addrLabels.length} 門市 = $${(shippingFee * addrLabels.length).toLocaleString()}）`
                : `每筆將加收運費 $${shippingFee}`
              }
            </div>
          )}
        </div>
      )}

      {/* ── 常溫商品 ── */}
      {ambientItems.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px 6px 0 0',
            padding: '5px 12px', fontWeight: 600, fontSize: 13, color: '#389e0d',
          }}>
            🌿 常溫商品（將獨立產生一筆B2B訂單）
          </div>
          <ItemTable items={ambientItems} showHeader={frozenItems.length === 0} />
          {ambientItems.length > 0 && ambientSubtotal < freeShippingThreshold && (
            <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderTop: 'none', padding: '6px 12px', fontSize: 12, color: '#d46b08' }}>
              ⚠ 常溫訂單金額 ${ambientSubtotal.toLocaleString()} 未達免運門檻 ${freeShippingThreshold.toLocaleString()}，
              {addrLabels.length > 0
                ? `每門市加收運費 $${shippingFee}（共 ${addrLabels.length} 門市 = $${(shippingFee * addrLabels.length).toLocaleString()}）`
                : `每筆將加收運費 $${shippingFee}`
              }
            </div>
          )}
        </div>
      )}

      {/* ── 合計 ── */}
      <div style={{
        textAlign: 'right', padding: '8px 12px', marginBottom: 12,
        background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6,
      }}>
        {(frozenShipping + ambientShipping) > 0 && (
          <div style={{ fontSize: 12, color: '#d46b08', marginBottom: 4 }}>
            運費合計：+${(frozenShipping + ambientShipping).toLocaleString()}
          </div>
        )}
        訂購總金額（含運費）：<strong style={{ color: '#1677ff', fontSize: 16 }}>${total.toLocaleString()}</strong>
      </div>

      {/* ── 收貨地址選擇（多選）── */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          <EnvironmentOutlined style={{ marginRight: 6, color: '#1677ff' }} />選擇收貨地址
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {addresses.map(a => (
            <Checkbox
              key={a.label}
              checked={addrLabels.includes(a.label)}
              onChange={e => toggleAddr(a.label, e.target.checked)}
            >
              <Text strong>{a.label}</Text>
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                {a.recipient}　{a.address}
              </Text>
            </Checkbox>
          ))}
        </div>
        {addrLabels.length > 0 && ordersPerAddr > 0 && (
          <div style={{
            marginTop: 10, padding: '8px 12px',
            background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, fontSize: 13,
          }}>
            <InfoCircleOutlined style={{ color: '#1677ff', marginRight: 6 }} />
            已選 <Text strong>{addrLabels.length}</Text> 個門市 ×{' '}
            <Text strong>{ordersPerAddr}</Text> 種溫層，確認後將產生{' '}
            <Text strong>{totalOrders}</Text> 筆B2B訂單
            {ordersPerAddr > 1 && '（冷凍、常溫各自獨立）'}
          </div>
        )}
        {addrLabels.length === 0 && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#ff4d4f' }}>
            請至少選擇一個出貨門市
          </div>
        )}
      </div>

      {/* ── 備註 ── */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
          備註（選填）
          {channel?.default_vendor_note && (
            <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
              已自動帶入通路資料的預設備註，可直接修改。
            </Text>
          )}
        </div>
        <Input.TextArea rows={3} placeholder="如有特殊出貨需求或備註，請在此說明..."
          value={vendorNote} onChange={e => setVendorNote(e.target.value)} />
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#888', lineHeight: 2 }}>
        <div>1. 以上價格皆為含稅價</div>
        <div>2. 合作方式：買斷　出貨方式：黑貓宅配</div>
      </div>
    </Modal>
  )
}

// ── 商品分類列表 ──────────────────────────────────────────
function ProductSection({ prods, qtyMap, setQty, temperature = 'ambient' }) {
  const grouped   = groupBySubCategory(prods)
  const firstKey  = Object.keys(grouped)[0]
  const style     = TEMP_STYLE[temperature] ?? TEMP_STYLE.ambient
  return (
    <>
      {Object.entries(grouped).map(([subCat, items]) => (
        <div key={subCat} style={{ marginBottom: 20 }}>
          <div style={{
            ...style, borderRadius: 6,
            padding: '6px 14px', fontWeight: 600, marginBottom: 6, fontSize: 13,
          }}>
            {subCat}
          </div>
          <Table
            dataSource={items} rowKey="id" size="small"
            pagination={false} showHeader={subCat === firstKey}
            rowClassName={r => r.stockMode === 'out_of_stock' ? 'row-out-of-stock' : ''}
            columns={[
              { title: '縮圖', width: 56, align: 'center',
                render: (_, r) => {
                  const img = r.thumbnailUrl
                    ? <img src={r.thumbnailUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    : <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4 }} />
                  return r.stockMode === 'out_of_stock'
                    ? <div style={{ opacity: 0.45, filter: 'grayscale(0.8)' }}>{img}</div>
                    : img
                }
              },
              { title: '品項名稱', render: (_, r) => {
                const isOut = r.stockMode === 'out_of_stock'
                return (
                  <Space direction="vertical" size={0} style={isOut ? { color: '#bfbfbf' } : undefined}>
                    {r.spec && (
                      <Tag style={{ fontSize: 11, opacity: isOut ? 0.6 : 1 }}>{r.spec}</Tag>
                    )}
                    <span style={isOut ? { color: '#bfbfbf' } : undefined}>{r.name}</span>
                    <Text type="secondary" style={{ fontSize: 11 }}>#{r.id}</Text>
                  </Space>
                )
              }},
              { title: '單位', dataIndex: 'unit', width: 60, align: 'center',
                render: (v, r) => r.stockMode === 'out_of_stock'
                  ? <Text style={{ color: '#bfbfbf' }}>{v}</Text>
                  : v },
              { title: '採購價', dataIndex: 'b2bPrice', width: 90, align: 'right',
                render: (v, r) => r.stockMode === 'out_of_stock'
                  ? <Text style={{ color: '#bfbfbf' }}>${v}</Text>
                  : <Text strong>${v}</Text> },
              { title: '數量', width: 120, align: 'center',
                render: (_, r) => {
                  if (r.stockMode === 'out_of_stock') {
                    return <Text style={{ color: '#bfbfbf', fontSize: 13 }}>暫時缺貨</Text>
                  }
                  const max = r.stockMode === 'limited' ? r.stockLimit : undefined
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <InputNumber
                        min={0} max={max} size="small"
                        value={qtyMap[r.id] ?? 0}
                        onChange={v => setQty(r.id, v ?? 0)}
                        style={{ width: 100 }}
                        className="vendor-qty-input"
                      />
                      {r.stockMode === 'limited' && (
                        <Text type="secondary" style={{ fontSize: 11 }}>上限 {r.stockLimit}</Text>
                      )}
                    </div>
                  )
                }},
              { title: '小計', width: 100, align: 'right',
                render: (_, r) => {
                  if (r.stockMode === 'out_of_stock') return <Text style={{ color: '#bfbfbf' }}>—</Text>
                  const q = qtyMap[r.id] ?? 0
                  return q > 0
                    ? <Text strong style={{ color: '#389e0d' }}>${(q * r.b2bPrice).toLocaleString()}</Text>
                    : <Text type="secondary">—</Text>
                }},
              { title: '產品展示', width: 90, align: 'center',
                render: (_, r) => r.frontend_product_id
                  ? (
                    <Button
                      size="small"
                      type="link"
                      onClick={() => window.open('https://www.google.com', '_blank')}
                    >
                      查看
                    </Button>
                  )
                  : <Text type="secondary" style={{ fontSize: 11 }}>—</Text>
              },
            ]}
          />
        </div>
      ))}
    </>
  )
}

function ComingSoonTab({ emoji = '🌱' }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 0', color: '#bbb' }}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>{emoji}</div>
      <div style={{ fontSize: 14 }}>商品即將上架，敬請期待</div>
    </div>
  )
}

// ── 主元件 ────────────────────────────────────────────────
export default function VendorOrderForm() {
  const { channel } = useVendor()
  const nav = useNavigate()
  const location = useLocation()
  const [qtyMap, setQtyMap] = useState({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifData, setNotifData] = useState(null)
  const [pendingSubmit, setPendingSubmit] = useState(null)
  const [conflictModalOpen, setConflictModalOpen] = useState(false)
  const [conflicts, setConflicts] = useState([])
  const processedPrefill = useRef(false)

  if (!channel) {
    nav('/login')
    return null
  }

  const tpl = templates.find(t => t.id === channel.templateId)
  const tplProducts = products.filter(p =>
    tpl?.productIds.includes(p.id) && p.isListed !== false
  )

  // 依大分類歸類（與後台共用邏輯）
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
  const { freeShippingThreshold, shippingFee } = systemSettings
  const frozenBelowThreshold  = frozenOrdered.length > 0 && frozenTotal < freeShippingThreshold
  const ambientBelowThreshold = ambientOrdered.length > 0 && ambientTotal < freeShippingThreshold
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
    <div style={{ padding: 24, maxWidth: 960 }}>
      <style>{`
        .vendor-qty-input .ant-input-number-input { text-align: center !important; }
        .row-out-of-stock td { background: #fafafa !important; }
      `}</style>

      {/* ── 標題列 ── */}
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

      {/* ── 議價備註（移除大標題，各類別各自顯示）── */}
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

      {/* ── 已選品項摘要（常駐）── */}
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
                  未達免運門檻 ${freeShippingThreshold.toLocaleString()}，每筆加收運費 ${shippingFee}
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
                  未達免運門檻 ${freeShippingThreshold.toLocaleString()}，每筆加收運費 ${shippingFee}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ── 填寫採購數量 ── */}
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

      {/* ── 重複下單衝突提示 ── */}
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
