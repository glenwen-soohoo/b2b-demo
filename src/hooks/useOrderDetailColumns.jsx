import { InputNumber, Tag, Typography, Tooltip } from 'antd'

const { Text } = Typography

/**
 * OrderDetail 的三份 column 定義。
 * 把 ~110 行的 column 物件從主元件中移出，保持主元件專注在狀態與 JSX 結構。
 * onRemoveExtra：移除「業務新增」的臨時品項（只有 _extra 的列會顯示移除鈕）。
 */
export function useOrderDetailColumns({
  adjQtyMap, setAdjQtyMap,
  adjPriceMap, setAdjPriceMap,
  editItems, setEditItems,
  onRemoveExtra,
}) {
  const salesConfirmCols = [
    { title: '品項',
      // 品項名 + 標籤用行內流排版（標籤接在名稱後、不預留固定寬度），避免壓縮名稱造成新增列特別高
      render: (_, r) => (
        <span>
          {r.productName}
          {r.spec && <Tag style={{ fontSize: 11, marginLeft: 4, marginRight: 0 }}>{r.spec}</Tag>}
          {r._extra && (
            <Tag color="green" style={{ fontSize: 11, marginLeft: 4, marginRight: 0 }}
              closable={!!onRemoveExtra}
              onClose={e => { e.preventDefault(); onRemoveExtra(r.productId) }}>
              業務新增
            </Tag>
          )}
        </span>
      ),
    },
    { title: '廠商下訂', dataIndex: 'qty', width: 80, align: 'center',
      render: (v, r) => r._extra ? <Text type="secondary">—</Text> : v },
    {
      title: '業務確認數量', width: 112, align: 'center',
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
        if (r._extra) return <Tag>—</Tag>   // 業務新增品項沒有「廠商下訂」基準可比
        const diff = (adjQtyMap[r.productId] ?? r.qty) - r.qty
        if (diff === 0) return <Tag>—</Tag>
        return <Tag color={diff < 0 ? 'red' : 'green'}>{diff > 0 ? '+' : ''}{diff}</Tag>
      },
    },
    {
      title: <Tooltip title="B2B採購價，與後台系統無關">採購單價 ⓘ</Tooltip>,
      width: 112, align: 'right',
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
    {
      title: '毛利率', width: 80, align: 'right',
      render: (_, r) => {
        const q = adjQtyMap[r.productId] ?? r.qty
        const p = adjPriceMap[r.productId] ?? r.price
        const sub = q * p
        const g = q * (p - (r.cost ?? 0))
        const m = sub > 0 ? (g / sub * 100).toFixed(1) : '0.0'
        return <span style={{ color: g >= 0 ? '#52c41a' : '#ff4d4f' }}>{m}%</span>
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
    {
      title: '毛利率', width: 80, align: 'right',
      render: (_, r) => {
        const sub = r.qty * r.price
        const g = r.qty * (r.price - (r.cost ?? 0))
        const m = sub > 0 ? (g / sub * 100).toFixed(1) : '0.0'
        return <span style={{ color: g >= 0 ? '#52c41a' : '#ff4d4f' }}>{m}%</span>
      },
    },
  ]

  const itemCols = [
    { title: '品項', dataIndex: 'productName' },
    { title: '單位', dataIndex: 'unit', width: 55, align: 'center' },
    { title: '數量', dataIndex: 'qty', width: 65, align: 'center' },
    { title: '採購單價', dataIndex: 'price', width: 85, align: 'right', render: v => `$${v}` },
    { title: '成本', dataIndex: 'cost', width: 65, align: 'right',
      render: v => v ? <span style={{ color: '#999' }}>${v}</span> : '-' },
    { title: '小計', width: 90, align: 'right', render: (_, r) => `$${(r.qty * r.price).toLocaleString()}` },
    {
      title: '毛利', width: 85, align: 'right',
      render: (_, r) => {
        const g = r.qty * (r.price - (r.cost ?? 0))
        return <span style={{ color: g >= 0 ? '#52c41a' : '#ff4d4f' }}>${g.toLocaleString()}</span>
      },
    },
    {
      title: '毛利率', width: 80, align: 'right',
      render: (_, r) => {
        const sub = r.qty * r.price
        const g = r.qty * (r.price - (r.cost ?? 0))
        const m = sub > 0 ? (g / sub * 100).toFixed(1) : '0.0'
        return <span style={{ color: g >= 0 ? '#52c41a' : '#ff4d4f' }}>{m}%</span>
      },
    },
  ]

  return { salesConfirmCols, editCols, itemCols }
}
