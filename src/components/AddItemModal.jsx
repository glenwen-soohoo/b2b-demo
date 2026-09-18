import { useState } from 'react'
import { Modal, Select, InputNumber, Button, Space, Typography, Empty, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Text } = Typography

// 業務確認訂單時「臨時加品項」用的挑選彈窗：搜尋商品 + 填數量 → 加入（可連續加多項）
export default function AddItemModal({ open, onClose, availableProducts, onAdd }) {
  const [pid, setPid] = useState(null)
  const [qty, setQty] = useState(1)
  const product = availableProducts.find(p => p.id === pid)
  // 限量商品的可加購上限（無限量則不設上限）
  const maxQty = product?.stockMode === 'limited' ? product.stockLimit : undefined

  // 切換商品時，把數量收斂進新商品的庫存上限內
  const handlePick = (v) => {
    setPid(v)
    const picked = availableProducts.find(p => p.id === v)
    const lim = picked?.stockMode === 'limited' ? picked.stockLimit : undefined
    if (lim != null && qty > lim) setQty(lim)
  }

  const handleAdd = () => {
    if (!product || !qty) return
    const finalQty = maxQty != null ? Math.min(qty, maxQty) : qty
    onAdd(product, finalQty)
    message.success(`已加入 ${product.name} × ${finalQty}`)
    setPid(null)
    setQty(1)
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Space size={6}>
          <PlusOutlined style={{ color: '#52c41a' }} />確認階段增加品項
          <span style={{ color: '#999', fontWeight: 400, fontSize: 13 }}>（限同溫層）</span>
        </Space>
      }
      width={540}
      afterOpenChange={vis => { if (!vis) { setPid(null); setQty(1) } }}
      footer={[
        <Button key="done" type="primary" onClick={onClose}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}>
          完成
        </Button>,
      ]}
    >
      {availableProducts.length === 0 ? (
        <Empty description="沒有可加入的商品（同溫層、可供貨的品項都已在此訂單內）" />
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Select
              showSearch
              style={{ flex: 1 }}
              placeholder="搜尋商品名稱"
              value={pid}
              onChange={handlePick}
              optionFilterProp="label"
              options={availableProducts.map(p => ({
                value: p.id,
                label: p.spec ? `${p.name}（${p.spec}）` : p.name,
              }))}
            />
            <InputNumber min={1} max={maxQty} value={qty} onChange={v => setQty(v ?? 1)} style={{ width: 96 }} />
            <Button type="primary" icon={<PlusOutlined />} disabled={!product} onClick={handleAdd}>
              加入
            </Button>
          </div>
          {product && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
              採購單價 <Text strong>${product.b2bPrice}</Text>、成本 ${product.cost ?? '—'}（加入後可於品項表調整）
              {maxQty != null && <span style={{ color: '#fa8c16' }}>；此商品限量，可加購上限 {maxQty}</span>}
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
