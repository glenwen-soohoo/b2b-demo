import { useState } from 'react'
import { Modal, Select, InputNumber, Button, Space, Typography, Empty, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Text } = Typography

// 業務確認訂單時「臨時加品項」用的挑選彈窗：搜尋商品 + 填數量 → 加入（可連續加多項）
export default function AddItemModal({ open, onClose, availableProducts, onAdd }) {
  const [pid, setPid] = useState(null)
  const [qty, setQty] = useState(1)
  const product = availableProducts.find(p => p.id === pid)

  const handleAdd = () => {
    if (!product || !qty) return
    onAdd(product, qty)
    message.success(`已加入 ${product.name} × ${qty}`)
    setPid(null)
    setQty(1)
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<Space><PlusOutlined style={{ color: '#52c41a' }} />確認階段增加品項</Space>}
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
        <Empty description="沒有可加入的商品（此訂單已包含所有上架品項）" />
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Select
              showSearch
              style={{ flex: 1 }}
              placeholder="搜尋商品名稱"
              value={pid}
              onChange={setPid}
              optionFilterProp="label"
              options={availableProducts.map(p => ({
                value: p.id,
                label: p.spec ? `${p.name}（${p.spec}）` : p.name,
              }))}
            />
            <InputNumber min={1} value={qty} onChange={v => setQty(v ?? 1)} style={{ width: 96 }} />
            <Button type="primary" icon={<PlusOutlined />} disabled={!product} onClick={handleAdd}>
              加入
            </Button>
          </div>
          {product && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
              採購單價 <Text strong>${product.b2bPrice}</Text>、成本 ${product.cost ?? '—'}（加入後可於品項表調整）
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
