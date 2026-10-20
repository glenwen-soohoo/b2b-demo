import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, Tabs, Button, Space, Typography, Select, Tag, message,
} from 'antd'
import {
  ShoppingCartOutlined, ArrowLeftOutlined, ShopOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  products, templates, categories, channels, channelMap, preOrders,
} from '../../data/fakeData'
import { settlementDayLabel } from '../../utils/invoiceMode'
import ProductSection, { ComingSoonTab } from '../../components/ProductSection'
import OrderPreviewModal from '../../components/OrderPreviewModal'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'
import { TEMP_ICON } from '../../styles/tokens'

const { Title, Text } = Typography

// demo：代建單的業務署名（正式版會帶登入業務的帳號）
const ADMIN_STAFF = '業務 · 王小明'

function getProductCatId(product) {
  for (const cat of categories) {
    if (cat.subCategories.some(s => s.name === product.subCategory)) return cat.id
  }
  return categories.find(c => c.temperature === product.category)?.id ?? categories[0].id
}

export default function AdminOrderCreate() {
  const nav = useNavigate()
  const [channelId,   setChannelId]   = useState(null)
  const [qtyMap,      setQtyMap]      = useState({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [notifData,   setNotifData]   = useState(null)
  const [pending,     setPending]     = useState(null)   // 待送出的訂單物件

  const channel   = channelId ? channelMap[channelId] : null
  const isGroupMom = (channel?.channelType ?? 'enterprise') === 'groupmom'

  // 通路選項（依身分分組）
  const channelOptions = [
    {
      label: '企業通路',
      options: channels
        .filter(c => (c.channelType ?? 'enterprise') === 'enterprise')
        .map(c => ({ label: c.name, value: c.id })),
    },
    {
      label: '團媽通路',
      options: channels
        .filter(c => c.channelType === 'groupmom')
        .map(c => ({ label: c.name, value: c.id })),
    },
  ]

  const tpl = channel ? templates.find(t => t.id === channel.templateId) : null
  const tplProducts = products.filter(p => tpl?.productIds.includes(p.id) && p.isListed !== false)
  const productsByCat = categories.reduce((acc, cat) => {
    acc[cat.id] = tplProducts.filter(p => getProductCatId(p) === cat.id)
    return acc
  }, {})

  const setQty = (id, val) => setQtyMap(prev => ({ ...prev, [id]: val }))

  const orderedItems = tplProducts
    .filter(p => (qtyMap[p.id] ?? 0) > 0 && p.stockMode !== 'out_of_stock')
    .map(p => ({ ...p, qty: qtyMap[p.id] }))
  const total = orderedItems.reduce((s, i) => s + i.qty * i.b2bPrice, 0)

  // ── 步驟一：預覽確認 → 組出訂單物件（一律待業務確認）+ 開通知預覽 ──
  const handleConfirm = ({ settlementMonth, vendorNote }) => {
    setPreviewOpen(false)
    const ym  = dayjs().format('YYYYMM')
    const seq = String(preOrders.length + 1).padStart(3, '0')
    const b2bOrderNo = `B2B-${ym}-A${seq}`

    const newOrder = {
      id: `b2b-adm${Date.now()}`,
      channelId: channel.id,
      channelName: channel.name,
      items: orderedItems.map(i => ({
        productId: i.id, productName: i.name, unit: i.unit, qty: i.qty, price: i.b2bPrice, cost: i.cost,
      })),
      status: 'pending_sales',
      salesAdjustedItems: null,
      adjustedItems: null,
      vendorNote: vendorNote || '',
      warehouse_note: null, shipping_note: null,
      backendOrderId: null,
      settlementId: null,
      b2b_order_no: b2bOrderNo,
      discount_amount: 0, discount_note: null,
      cs_note: null, b2b_note: null,
      invoicePeriodSnapshot: 'per_order',
      invoiceTaxScopeSnapshot: 'per_store',
      settlementMonth,
      createdAt: dayjs().format('YYYY-MM-DD'),
      orderSource: 'admin',
      createdBy: ADMIN_STAFF,
      logs: [{ time: dayjs().format('YYYY-MM-DD HH:mm'), action: '後台業務代為建單（待業務確認）' }],
    }

    setPending(newOrder)
    setNotifData({
      channelName: channel.name,
      createdBy: ADMIN_STAFF,
      b2bOrderNo,
      settlementMonth,
      itemCount: orderedItems.length,
      total,
      vendorNote: vendorNote || null,
      submittedAt: dayjs().format('YYYY-MM-DD HH:mm'),
    })
    setNotifOpen(true)
  }

  // ── 步驟二：通知確認 → 真正寫入訂單 ──
  const handleNotifConfirm = () => {
    setNotifOpen(false)
    if (pending) preOrders.unshift(pending)   // demo：寫入模組資料，返回列表即可見
    message.success('已完成後台代建單，並寄出通知給廠商')
    nav('/admin/orders')
  }

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <style>{`.vendor-qty-input .ant-input-number-input { text-align: center !important; }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => nav('/admin/orders')}>返回訂單列表</Button>
          <Title level={4} style={{ margin: 0 }}>後台代客建單</Title>
        </Space>
      </div>

      {/* 代建單設定：選通路（建單一律為待業務確認，先寄給廠商確認） */}
      <Card size="small" style={{ marginBottom: 12 }}>
        <Space size={8} wrap>
          <ShopOutlined style={{ color: '#389e0d' }} />
          <Text strong>代哪個通路下單</Text>
          <Select
            style={{ width: 240 }}
            placeholder="選擇通路（企業 / 團媽）"
            value={channelId}
            onChange={id => { setChannelId(id); setQtyMap({}) }}
            options={channelOptions}
          />
          {channel && (
            <Tag color={isGroupMom ? 'magenta' : 'blue'}>{isGroupMom ? '團媽' : '企業'}</Tag>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            建立後為「待業務確認」，將寄通知給廠商確認內容
          </Text>
        </Space>
      </Card>

      {!channel ? (
        <Card><Text type="secondary">請先於上方選擇要代為下單的通路。</Text></Card>
      ) : (
        <>
          {orderedItems.length > 0 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8,
              padding: '8px 16px', marginBottom: 12,
            }}>
              <span>已選 <Text strong>{orderedItems.length}</Text> 項</span>
              <span>合計 <Text strong style={{ color: '#389e0d', fontSize: 16 }}>${total.toLocaleString()}</Text></span>
            </div>
          )}

          <Card
            title="請填寫採購數量"
            extra={
              <Space>
                {!isGroupMom && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    月結日：{settlementDayLabel(channel.settlementDay)}
                  </Text>
                )}
                <Button
                  type="primary" icon={<ShoppingCartOutlined />}
                  disabled={orderedItems.length === 0}
                  onClick={() => setPreviewOpen(true)}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  預覽 & 建單
                </Button>
              </Space>
            }
          >
            <Tabs
              items={categories.map(cat => {
                const catProds = productsByCat[cat.id] ?? []
                const icon = TEMP_ICON[cat.temperature] ?? ''
                return {
                  key: cat.id,
                  label: catProds.length > 0 ? `${icon} ${cat.name}（${catProds.length} 項）` : `${icon} ${cat.name}`,
                  children: catProds.length > 0
                    ? <ProductSection prods={catProds} qtyMap={qtyMap} setQty={setQty} temperature={cat.temperature} />
                    : <ComingSoonTab emoji={icon} />,
                }
              })}
            />
          </Card>
        </>
      )}

      <OrderPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        items={orderedItems}
        channel={channel}
        onConfirm={handleConfirm}
      />

      {/* 代建單通知：反向寄給廠商 */}
      <NotificationPreviewModal
        open={notifOpen}
        onClose={() => { setNotifOpen(false); setPending(null) }}
        onConfirm={handleNotifConfirm}
        type="admin_created_order"
        data={notifData}
      />
    </div>
  )
}
