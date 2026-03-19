import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card, Tabs, Table, InputNumber, Button, Space, Typography,
  Tag, Alert, Descriptions, Modal, message, Divider, Select, Input, Checkbox,
} from 'antd'
import dayjs from 'dayjs'
import {
  ShoppingCartOutlined, FileTextOutlined, SendOutlined,
  EnvironmentOutlined, WarningOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import { products, templates } from '../../data/fakeData'
import { useVendor } from '../../context/VendorContext'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'

const { Title, Text } = Typography

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
function OrderPreviewModal({ open, onClose, items, channel, onConfirm }) {
  const [addrLabels,      setAddrLabels]      = useState([])
  const [settlementMonth, setSettlementMonth] = useState(dayjs().format('YYYY-MM'))
  const [vendorNote,      setVendorNote]      = useState('')
  const addresses    = channel?.addresses ?? []
  const monthOptions = getSettlementMonthOptions()

  if (!channel) return null
  const total = items.reduce((s, i) => s + i.qty * i.b2bPrice, 0)

  const toggleAddr = (label, checked) => {
    setAddrLabels(prev =>
      checked ? [...prev, label] : prev.filter(l => l !== label)
    )
  }

  return (
    <Modal
      open={open} onCancel={onClose}
      title={<Space><FileTextOutlined />採購單確認</Space>}
      width={720}
      afterOpenChange={vis => {
        if (vis) {
          setAddrLabels(addresses.length > 0 ? [addresses[0].label] : [])
          setSettlementMonth(dayjs().format('YYYY-MM'))
          setVendorNote('')
        }
      }}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="confirm" type="primary" icon={<SendOutlined />}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
          disabled={addrLabels.length === 0}
          onClick={() => onConfirm({ addrLabels, settlementMonth, vendorNote })}
        >
          確認送出B2B訂單{addrLabels.length > 1 ? `（共 ${addrLabels.length} 筆）` : ''}
        </Button>,
      ]}
    >
      {/* ── 基本資訊 + 結算月份 ── */}
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="通路名稱">{channel.name}</Descriptions.Item>
        <Descriptions.Item label="統一編號">{channel.taxId}</Descriptions.Item>
        <Descriptions.Item label="結算月份">
          <Select value={settlementMonth} onChange={setSettlementMonth}
            style={{ width: '100%' }} options={monthOptions} />
        </Descriptions.Item>
        <Descriptions.Item label="付款方式">
          {channel.settlementMethod}，次月 {channel.settlementDay} 日前付款
        </Descriptions.Item>
      </Descriptions>

      {/* ── 品項表格 ── */}
      <Table
        dataSource={items} rowKey="id" size="small" pagination={false}
        columns={[
          { title: '縮圖', width: 56, align: 'center',
            render: (_, r) => r.thumbnailUrl
              ? <img src={r.thumbnailUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
              : <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4 }} /> },
          { title: '品項', dataIndex: 'name',
            render: (v, r) => (
              <Space direction="vertical" size={0}>
                <Space>{v}{r.spec && <Tag style={{ fontSize: 11 }}>{r.spec}</Tag>}</Space>
                <Text type="secondary" style={{ fontSize: 11 }}>#{r.id}</Text>
              </Space>
            )},
          { title: '單位', dataIndex: 'unit', width: 60 },
          { title: '採購價', dataIndex: 'b2bPrice', width: 80, render: v => `$${v}` },
          { title: '數量', dataIndex: 'qty', width: 70 },
          { title: '小計', width: 100,
            render: (_, r) => <Text strong>${(r.qty * r.b2bPrice).toLocaleString()}</Text> },
        ]}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={5} align="right"><strong>訂購總金額</strong></Table.Summary.Cell>
            <Table.Summary.Cell>
              <strong style={{ color: '#1677ff', fontSize: 16 }}>${total.toLocaleString()}</strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />

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
        {addrLabels.length > 1 && (
          <div style={{
            marginTop: 10, padding: '8px 12px',
            background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, fontSize: 13,
          }}>
            <InfoCircleOutlined style={{ color: '#1677ff', marginRight: 6 }} />
            已選 <Text strong>{addrLabels.length}</Text> 個門市，確認後將各別產生{' '}
            <Text strong>{addrLabels.length}</Text> 筆B2B訂單，每筆品項數量相同
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
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>備註（選填）</div>
        <Input.TextArea rows={2} placeholder="如有特殊出貨需求或備註，請在此說明..."
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
function ProductSection({ prods, qtyMap, setQty }) {
  const grouped   = groupBySubCategory(prods)
  const firstKey  = Object.keys(grouped)[0]
  return (
    <>
      {Object.entries(grouped).map(([subCat, items]) => (
        <div key={subCat} style={{ marginBottom: 20 }}>
          <div style={{
            background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6,
            padding: '6px 14px', fontWeight: 600, marginBottom: 6, fontSize: 13,
          }}>
            {subCat}
          </div>
          <Table
            dataSource={items} rowKey="id" size="small"
            pagination={false} showHeader={subCat === firstKey}
            columns={[
              { title: '縮圖', width: 56, align: 'center',
                render: (_, r) => r.thumbnailUrl
                  ? <img src={r.thumbnailUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                  : <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4 }} />
              },
              { title: '品項名稱', render: (_, r) => (
                <Space direction="vertical" size={0}>
                  <Space>
                    {r.name}
                    {r.spec && <Tag style={{ fontSize: 11 }}>{r.spec}</Tag>}
                    {r.stockMode === 'out_of_stock' && (
                      <Tag color="orange" style={{ fontSize: 11 }}>暫時缺貨</Tag>
                    )}
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>#{r.id}</Text>
                </Space>
              )},
              { title: '單位', dataIndex: 'unit', width: 60, align: 'center' },
              { title: '採購價', dataIndex: 'b2bPrice', width: 90, align: 'right',
                render: (v, r) => r.stockMode === 'out_of_stock'
                  ? <Text type="secondary">${v}</Text>
                  : <Text strong>${v}</Text> },
              { title: '數量', width: 170, align: 'center',
                render: (_, r) => {
                  const isOutOfStock = r.stockMode === 'out_of_stock'
                  const max = r.stockMode === 'limited' ? r.stockLimit : undefined
                  return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                      <InputNumber
                        min={0} max={max} size="small"
                        value={qtyMap[r.id] ?? 0}
                        onChange={v => setQty(r.id, v ?? 0)}
                        style={{ width: 100 }}
                        disabled={isOutOfStock}
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
                  const q = qtyMap[r.id] ?? 0
                  return q > 0
                    ? <Text strong style={{ color: '#389e0d' }}>${(q * r.b2bPrice).toLocaleString()}</Text>
                    : <Text type="secondary">—</Text>
                }},
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

  const frozenProds  = tplProducts.filter(p => p.category === 'frozen' && p.subCategory !== '高湯')
  const ambientProds = tplProducts.filter(p => p.category === 'ambient')
  const soupProds    = tplProducts.filter(p => p.subCategory === '高湯')

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

  const total = orderedItems.reduce((s, i) => s + i.qty * i.b2bPrice, 0)

  // 第一步：關閉預覽 Modal，開啟通知預覽
  const handleConfirm = ({ addrLabels, settlementMonth, vendorNote }) => {
    setPreviewOpen(false)
    const now = new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', '')
    setPendingSubmit({ addrLabels, settlementMonth, vendorNote })
    setNotifData({
      channelName:   channel.name,
      settlementMonth,
      itemCount:     orderedItems.length,
      total,
      vendorNote:    vendorNote || null,
      addrCount:     addrLabels.length,
      submittedAt:   now,
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
      <style>{`.vendor-qty-input .ant-input-number-input { text-align: center !important; }`}</style>

      {/* ── 標題列 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>商品採購</Title>
        <div style={{
          background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8,
          padding: '5px 14px', fontSize: 14, fontWeight: 600, color: '#389e0d',
        }}>
          月結日：每月 {channel.settlementDay} 日
        </div>
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
      <Card size="small" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <Space wrap style={{ flex: 1 }}>
            <Text>
              已選 <Text strong>{orderedItems.length}</Text> 項
            </Text>
            {orderedItems.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>尚未選購任何商品</Text>
            ) : (
              orderedItems.map(i => (
                <Tag key={i.id} closable onClose={() => setQty(i.id, 0)}>
                  {i.name} × {i.qty}
                </Tag>
              ))
            )}
          </Space>
          <div style={{ whiteSpace: 'nowrap', paddingTop: 2 }}>
            合計 <Text strong style={{ color: '#1677ff' }}>${total.toLocaleString()}</Text>
          </div>
        </div>
      </Card>

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
          items={[
            {
              key: 'frozen',
              label: `❄️ 冷凍商品（${frozenProds.length} 項）`,
              children: <ProductSection prods={frozenProds} qtyMap={qtyMap} setQty={setQty} />,
            },
            {
              key: 'ambient',
              label: `🌿 常溫商品（${ambientProds.length} 項）`,
              children: <ProductSection prods={ambientProds} qtyMap={qtyMap} setQty={setQty} />,
            },
            {
              key: 'adult',
              label: soupProds.length > 0 ? `🍲 大人系（${soupProds.length} 項）` : '🍲 大人系',
              children: soupProds.length > 0
                ? <ProductSection prods={soupProds} qtyMap={qtyMap} setQty={setQty} />
                : <ComingSoonTab emoji="🍲" />,
            },
            {
              key: 'green',
              label: '🍹 綠時光',
              children: <ComingSoonTab emoji="🍹" />,
            },
          ]}
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
