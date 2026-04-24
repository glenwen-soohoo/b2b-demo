import { Table, InputNumber, Space, Tag, Typography, Button } from 'antd'
import { TEMP_STYLE } from '../styles/tokens'

const { Text } = Typography

function groupBySubCategory(prods) {
  return prods.reduce((acc, p) => {
    if (!acc[p.subCategory]) acc[p.subCategory] = []
    acc[p.subCategory].push(p)
    return acc
  }, {})
}

export function ComingSoonTab({ emoji = '🌱' }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 0', color: '#bbb' }}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>{emoji}</div>
      <div style={{ fontSize: 14 }}>商品即將上架，敬請期待</div>
    </div>
  )
}

export default function ProductSection({ prods, qtyMap, setQty, temperature = 'ambient' }) {
  const grouped  = groupBySubCategory(prods)
  const firstKey = Object.keys(grouped)[0]
  const style    = TEMP_STYLE[temperature] ?? TEMP_STYLE.ambient
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
                    {r.spec && <Tag style={{ fontSize: 11, opacity: isOut ? 0.6 : 1 }}>{r.spec}</Tag>}
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
                    <Button size="small" type="link"
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
