import { InputNumber, Tag, Typography, Tooltip } from 'antd'

const { Text } = Typography

/**
 * OrderDetail 的三份 column 定義。
 * 把 ~110 行的 column 物件從主元件中移出，保持主元件專注在狀態與 JSX 結構。
 */
export function useOrderDetailColumns({
  adjQtyMap, setAdjQtyMap,
  adjPriceMap, setAdjPriceMap,
  editItems, setEditItems,
}) {
  const salesConfirmCols = [
    { title: '品項', dataIndex: 'productName' },
    { title: '廠商下訂', dataIndex: 'qty', width: 80, align: 'center' },
    {
      title: '業務確認數量', width: 130, align: 'center',
      render: (_, r) => (
        <InputNumber
          min={0} size="small"
          value={adjQtyMap[r.productId] ?? r.qty}
          onChange={v => setAdjQtyMap(prev => ({ ...prev, [r.productId]: v ?? 0 }))}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '數量差異', width: 75, align: 'center',
      render: (_, r) => {
        const diff = (adjQtyMap[r.productId] ?? r.qty) - r.qty
        if (diff === 0) return <Tag>—</Tag>
        return <Tag color={diff < 0 ? 'red' : 'green'}>{diff > 0 ? '+' : ''}{diff}</Tag>
      },
    },
    {
      title: <Tooltip title="B2B採購價，與後台系統無關">採購單價 ⓘ</Tooltip>,
      width: 130, align: 'right',
      render: (_, r) => (
        <InputNumber
          min={0} size="small" prefix="$"
          value={adjPriceMap[r.productId] ?? r.price}
          onChange={v => setAdjPriceMap(prev => ({ ...prev, [r.productId]: v ?? 0 }))}
          style={{ width: 95 }}
        />
      ),
    },
    { title: '成本', dataIndex: 'cost', width: 65, align: 'right',
      render: v => v ? <span style={{ color: '#999' }}>${v}</span> : '-' },
    {
      title: '小計', width: 90, align: 'right',
      render: (_, r) => `$${((adjQtyMap[r.productId] ?? r.qty) * (adjPriceMap[r.productId] ?? r.price)).toLocaleString()}`,
    },
    {
      title: '毛利', width: 85, align: 'right',
      render: (_, r) => {
        const q = adjQtyMap[r.productId] ?? r.qty
        const p = adjPriceMap[r.productId] ?? r.price
        const g = q * (p - (r.cost ?? 0))
        return <span style={{ color: g >= 0 ? '#52c41a' : '#ff4d4f' }}>${g.toLocaleString()}</span>
      },
    },
  ]

  const editCols = [
    { title: '品項', dataIndex: 'productName' },
    { title: '單位', dataIndex: 'unit', width: 55 },
    {
      title: '數量', width: 110, align: 'center',
      render: (_, r) => (
        <InputNumber
          min={0} size="small" value={r.qty}
          onChange={v => setEditItems(prev =>
            prev.map(i => i.productId === r.productId ? { ...i, qty: v ?? 0 } : i)
          )}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '採購單價', width: 110, align: 'right',
      render: (_, r) => (
        <InputNumber
          min={0} size="small" prefix="$" value={r.price}
          onChange={v => setEditItems(prev =>
            prev.map(i => i.productId === r.productId ? { ...i, price: v ?? 0 } : i)
          )}
          style={{ width: 85 }}
        />
      ),
    },
    { title: '成本', dataIndex: 'cost', width: 65, align: 'right',
      render: v => v ? <span style={{ color: '#999' }}>${v}</span> : '-' },
    { title: '小計', width: 90, align: 'right',
      render: (_, r) => `$${(r.qty * r.price).toLocaleString()}` },
    {
      title: '毛利', width: 85, align: 'right',
      render: (_, r) => {
        const g = r.qty * (r.price - (r.cost ?? 0))
        return <span style={{ color: g >= 0 ? '#52c41a' : '#ff4d4f' }}>${g.toLocaleString()}</span>
      },
    },
  ]

  const itemCols = [
    { title: '品項', dataIndex: 'productName' },
    { title: '單位', dataIndex: 'unit', width: 55 },
    { title: '數量', dataIndex: 'qty', width: 65 },
    { title: '採購單價', dataIndex: 'price', width: 85, render: v => `$${v}` },
    { title: '成本', dataIndex: 'cost', width: 65,
      render: v => v ? <span style={{ color: '#999' }}>${v}</span> : '-' },
    { title: '小計', width: 90, render: (_, r) => `$${(r.qty * r.price).toLocaleString()}` },
    {
      title: '毛利', width: 85,
      render: (_, r) => {
        const g = r.qty * (r.price - (r.cost ?? 0))
        return <span style={{ color: g >= 0 ? '#52c41a' : '#ff4d4f' }}>${g.toLocaleString()}</span>
      },
    },
  ]

  return { salesConfirmCols, editCols, itemCols }
}
