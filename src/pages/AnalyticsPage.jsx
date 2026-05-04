import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import {
  Card, Row, Col, Statistic, Table, Segmented, Typography,
  Space, Tag, Empty, Divider, Button, DatePicker,
} from 'antd'
import { preOrders, productMap, channels } from '../data/fakeData'
import { TEMP, COLOR, LAYOUT } from '../styles/tokens'

const { Title, Text } = Typography

// ── 狀態白名單：算入損益的訂單必須是「已成立」之後的狀態 ─────────
const VALID_STATUSES = new Set([
  'ordered', 'arrived', 'settling', 'settled_done',
])

// ── 時間範圍快捷選項 ─────────────────────────────
// 注意：所有 range 都會被當成 [起, 迄] 處理，包含端點
const PRESETS = [
  { key: 'all',        label: '全部',     getRange: () => null },
  { key: 'this_year',  label: '本年累計',
    getRange: () => [dayjs().startOf('year'), dayjs().endOf('day')] },
  { key: 'recent_3m',  label: '近 3 個月',
    getRange: () => [dayjs().subtract(2, 'month').startOf('month'), dayjs().endOf('day')] },
  { key: 'this_month', label: '本月',
    getRange: () => [dayjs().startOf('month'), dayjs().endOf('month')] },
  { key: 'last_month', label: '上月',
    getRange: () => [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ] },
]

// ── 工具函式 ─────────────────────────────────────
const fmtMoney = v => `$${Math.round(v).toLocaleString()}`

const marginColor = m =>
  m >= 30 ? COLOR.success :
  m >= 15 ? COLOR.warning :
  COLOR.danger

// preOrder 真正「出貨」的品項：以 adjustedItems > salesAdjustedItems > items 為序
const realItems = o => o.adjustedItems ?? o.salesAdjustedItems ?? o.items ?? []

// 用 settlementMonth；若沒有就退回到 createdAt 的年月
const orderMonth = o => o.settlementMonth || dayjs(o.createdAt).format('YYYY-MM')

const filterItemsByTemp = (items, temp) => {
  if (temp === 'all') return items
  return items.filter(i => productMap[i.productId]?.category === temp)
}

const aggregate = items => {
  const revenue = items.reduce((s, i) => s + i.qty * i.price, 0)
  const cost    = items.reduce((s, i) => s + i.qty * (i.cost ?? 0), 0)
  return {
    revenue, cost,
    profit: revenue - cost,
    margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
  }
}

// 把 items 依品項聚合成排名陣列
const aggregateByProduct = items => {
  const map = {}
  items.forEach(i => {
    const p = productMap[i.productId]
    if (!map[i.productId]) {
      map[i.productId] = {
        productId: i.productId,
        name: i.productName,
        unit: i.unit,
        category: p?.category ?? 'ambient',
        totalQty: 0,
        revenue: 0,
        cost: 0,
      }
    }
    map[i.productId].totalQty += i.qty
    map[i.productId].revenue  += i.qty * i.price
    map[i.productId].cost     += i.qty * (i.cost ?? 0)
  })
  return Object.values(map).map(r => ({
    ...r,
    profit: r.revenue - r.cost,
    margin: r.revenue > 0 ? ((r.revenue - r.cost) / r.revenue) * 100 : 0,
  }))
}

// 把 orders 依月份聚合
const aggregateByMonth = orders => {
  const map = {}
  orders.forEach(o => {
    const m = orderMonth(o)
    if (!map[m]) map[m] = { month: m, orders: 0, items: [] }
    map[m].orders++
    map[m].items.push(...o.items)  // 注意：這裡的 o.items 已是溫層過濾後的結果
  })
  return Object.keys(map).sort().map(m => {
    const { items, orders, month } = map[m]
    return { month, orders, ...aggregate(items) }
  })
}

// ───────────── 子元件：KPI 卡片組 ─────────────
function KpiRow({ data, includeOrderCount = false }) {
  const cards = [
    ...(includeOrderCount
      ? [{ label: '訂單數', value: data.orders, suffix: '筆', color: '#1677ff' }]
      : []),
    { label: '總銷售額', value: data.revenue, color: '#1677ff', formatter: fmtMoney },
    { label: '總成本',   value: data.cost,    color: '#888',    formatter: fmtMoney },
    { label: '總毛利',   value: data.profit,
      color: data.profit >= 0 ? COLOR.success : COLOR.danger, formatter: fmtMoney },
    { label: '毛利率',   value: data.margin.toFixed(1),
      suffix: '%', color: marginColor(data.margin) },
  ]
  return (
    <Row gutter={12}>
      {cards.map(c => (
        <Col flex="1 1 0" key={c.label}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={c.label}
              value={c.formatter ? c.formatter(c.value) : c.value}
              suffix={c.suffix}
              valueStyle={{ color: c.color, fontSize: 22, fontWeight: 600 }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}

// ───────────── 子元件：月份趨勢表 ─────────────
function MonthlyTrendTable({ data }) {
  if (!data.length) return <Empty description="無資料" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)

  const cols = [
    {
      title: '月份',
      dataIndex: 'month',
      width: 80,
      render: v => <Text strong>{v}</Text>,
    },
    {
      title: '訂單',
      dataIndex: 'orders',
      width: 50,
      align: 'center',
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: '銷售額',
      dataIndex: 'revenue',
      render: (v, _r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{fmtMoney(v)}</Text>
          <div style={{
            marginTop: 2,
            height: 5,
            background: '#f0f0f0',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(v / maxRevenue) * 100}%`,
              height: '100%',
              background: '#1677ff',
              borderRadius: 2,
            }} />
          </div>
        </div>
      ),
    },
    {
      title: '毛利',
      dataIndex: 'profit',
      width: 110,
      align: 'right',
      render: (v, r) => (
        <Text style={{ color: v >= 0 ? COLOR.success : COLOR.danger, fontWeight: 600 }}>
          {fmtMoney(v)}
        </Text>
      ),
    },
    {
      title: '毛利率',
      dataIndex: 'margin',
      width: 80,
      align: 'right',
      render: v => (
        <Text style={{ color: marginColor(v), fontWeight: 600 }}>
          {v.toFixed(1)}%
        </Text>
      ),
    },
  ]

  return (
    <Table
      dataSource={data}
      columns={cols}
      rowKey="month"
      size="small"
      pagination={false}
    />
  )
}

// ───────────── 子元件：品項排名表 ─────────────
function ProductRankTable({ items, sortBy }) {
  const sorted = useMemo(() => (
    [...items].sort((a, b) =>
      sortBy === 'qty' ? b.totalQty - a.totalQty : b.revenue - a.revenue
    )
  ), [items, sortBy])

  const cols = [
    {
      title: '#',
      width: 40,
      align: 'center',
      render: (_, __, i) => {
        const colors = ['#fadb14', '#bfbfbf', '#fa8c16']
        const isTop3 = i < 3
        return (
          <Text strong style={{
            color: isTop3 ? colors[i] : '#999',
            fontSize: isTop3 ? 14 : 12,
          }}>
            {i + 1}
          </Text>
        )
      },
    },
    {
      title: '品項',
      dataIndex: 'name',
      ellipsis: true,
      render: (v, r) => (
        <Space size={6}>
          <span style={{ fontSize: 12 }}>
            {r.category === 'frozen' ? TEMP.frozen.icon : TEMP.ambient.icon}
          </span>
          <Text style={{ fontSize: 13 }}>{v}</Text>
        </Space>
      ),
    },
    {
      title: '銷量',
      dataIndex: 'totalQty',
      width: 90,
      align: 'right',
      render: (v, r) => (
        <Text strong style={{ fontSize: 13 }}>
          {v.toLocaleString()} <Text type="secondary" style={{ fontSize: 11 }}>{r.unit}</Text>
        </Text>
      ),
    },
    {
      title: '銷售額',
      dataIndex: 'revenue',
      width: 100,
      align: 'right',
      render: v => <Text style={{ fontSize: 13 }}>{fmtMoney(v)}</Text>,
    },
    {
      title: '毛利率',
      dataIndex: 'margin',
      width: 75,
      align: 'right',
      render: v => (
        <Text style={{ color: marginColor(v), fontWeight: 600, fontSize: 13 }}>
          {v.toFixed(1)}%
        </Text>
      ),
    },
  ]

  return (
    <Table
      dataSource={sorted}
      columns={cols}
      rowKey="productId"
      size="small"
      pagination={{ pageSize: 8, size: 'small', showSizeChanger: false }}
    />
  )
}

// ───────────── 主頁面 ─────────────
export default function AnalyticsPage() {
  const [view,         setView]         = useState('overall')   // 'overall' | 'channel'
  const [tempFilter,   setTempFilter]   = useState('all')       // 'all' | 'frozen' | 'ambient'
  const [selectedCid,  setSelectedCid]  = useState(null)
  const [overallSort,  setOverallSort]  = useState('revenue')   // 'revenue' | 'qty'
  const [channelSort,  setChannelSort]  = useState('revenue')

  // ── 時間範圍狀態 ──
  // preset: PRESETS 的 key，或 'custom'
  // customRange: 只在 preset === 'custom' 時生效，[dayjs, dayjs]
  const [preset,       setPreset]       = useState('all')
  const [customRange,  setCustomRange]  = useState(null)

  const effectiveRange = useMemo(() => {
    if (preset === 'custom') return customRange
    return PRESETS.find(p => p.key === preset)?.getRange() ?? null
  }, [preset, customRange])

  const rangeLabel = useMemo(() => {
    if (!effectiveRange?.[0] || !effectiveRange?.[1]) return '全部歷史'
    return `${effectiveRange[0].format('YYYY-MM-DD')} ~ ${effectiveRange[1].format('YYYY-MM-DD')}`
  }, [effectiveRange])

  // ── 1. 取「真正成立」的訂單，套用日期區間 + 溫層過濾 ──
  const validOrders = useMemo(() => {
    let list = preOrders.filter(o => VALID_STATUSES.has(o.status))
    if (effectiveRange?.[0] && effectiveRange?.[1]) {
      const startMs = effectiveRange[0].startOf('day').valueOf()
      const endMs   = effectiveRange[1].endOf('day').valueOf()
      list = list.filter(o => {
        const ms = dayjs(o.createdAt).valueOf()
        return ms >= startMs && ms <= endMs
      })
    }
    return list
      .map(o => ({
        ...o,
        items: filterItemsByTemp(realItems(o), tempFilter),
      }))
      .filter(o => o.items.length > 0)
  }, [tempFilter, effectiveRange])

  // ── 2. 整體 KPI ──
  const overall = useMemo(
    () => aggregate(validOrders.flatMap(o => o.items)),
    [validOrders]
  )

  // ── 3. 整體 月份趨勢 ──
  const overallMonthly = useMemo(
    () => aggregateByMonth(validOrders),
    [validOrders]
  )

  // ── 4. 整體 品項排名 ──
  const overallProducts = useMemo(
    () => aggregateByProduct(validOrders.flatMap(o => o.items)),
    [validOrders]
  )

  // ── 5. 各通路排名（含 KPI） ──
  const channelRank = useMemo(() => {
    const map = {}
    validOrders.forEach(o => {
      if (!map[o.channelId]) {
        map[o.channelId] = {
          channelId: o.channelId,
          channelName: o.channelName,
          orders: 0,
          items: [],
        }
      }
      map[o.channelId].orders++
      map[o.channelId].items.push(...o.items)
    })
    return Object.values(map)
      .map(r => ({ ...r, ...aggregate(r.items) }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [validOrders])

  // ── 6. 預設選第 1 名通路；若資料變動或被清空，再 fallback ──
  const effectiveCid = selectedCid && channelRank.find(c => c.channelId === selectedCid)
    ? selectedCid
    : channelRank[0]?.channelId
  const selectedChannel = channelRank.find(c => c.channelId === effectiveCid)

  // ── 7. 該通路的月份趨勢 / 品項排名 ──
  const channelMonthly = useMemo(() => {
    if (!effectiveCid) return []
    return aggregateByMonth(validOrders.filter(o => o.channelId === effectiveCid))
  }, [validOrders, effectiveCid])

  const channelProducts = useMemo(() => {
    if (!effectiveCid) return []
    const items = validOrders
      .filter(o => o.channelId === effectiveCid)
      .flatMap(o => o.items)
    return aggregateByProduct(items)
  }, [validOrders, effectiveCid])

  // ── 通路排名表欄位 ──
  const channelCols = [
    {
      title: '#',
      width: 40,
      align: 'center',
      render: (_, __, i) => {
        const colors = ['#fadb14', '#bfbfbf', '#fa8c16']
        const isTop3 = i < 3
        return (
          <Text strong style={{
            color: isTop3 ? colors[i] : '#999',
            fontSize: isTop3 ? 14 : 12,
          }}>
            {i + 1}
          </Text>
        )
      },
    },
    {
      title: '通路名稱',
      dataIndex: 'channelName',
      render: (v, r) => (
        <Space>
          <Text strong>{v}</Text>
          {r.channelId === effectiveCid &&
            <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>檢視中</Tag>}
        </Space>
      ),
    },
    {
      title: '訂單數',
      dataIndex: 'orders',
      width: 80,
      align: 'center',
      render: v => <Text>{v} 筆</Text>,
    },
    {
      title: '銷售額',
      dataIndex: 'revenue',
      width: 110,
      align: 'right',
      render: v => <Text strong>{fmtMoney(v)}</Text>,
    },
    {
      title: '成本',
      dataIndex: 'cost',
      width: 100,
      align: 'right',
      render: v => <Text type="secondary">{fmtMoney(v)}</Text>,
    },
    {
      title: '毛利',
      dataIndex: 'profit',
      width: 110,
      align: 'right',
      render: v => (
        <Text style={{ color: v >= 0 ? COLOR.success : COLOR.danger, fontWeight: 600 }}>
          {fmtMoney(v)}
        </Text>
      ),
    },
    {
      title: '毛利率',
      dataIndex: 'margin',
      width: 90,
      align: 'right',
      render: v => (
        <Text style={{ color: marginColor(v), fontWeight: 600 }}>
          {v.toFixed(1)}%
        </Text>
      ),
    },
  ]

  return (
    <div style={{ padding: LAYOUT.pagePadding }}>

      {/* ── 頁首 ── */}
      <Row align="middle" justify="space-between" style={{ marginBottom: 12 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>損益分析</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            僅統計已成立 / 已結算的 B2B 訂單 · 範圍{' '}
            <Text strong style={{ fontSize: 12 }}>{rangeLabel}</Text>
            {' · '}共 {validOrders.length} 筆訂單
          </Text>
        </Col>
        <Col>
          <Space size={12}>
            <Segmented
              value={tempFilter}
              onChange={setTempFilter}
              options={[
                { label: '全部溫層', value: 'all' },
                { label: <span>{TEMP.frozen.icon} 冷凍</span>,  value: 'frozen' },
                { label: <span>{TEMP.ambient.icon} 常溫</span>, value: 'ambient' },
              ]}
            />
            <Divider type="vertical" style={{ height: 28, margin: 0 }} />
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { label: '整體',   value: 'overall' },
                { label: '各通路', value: 'channel' },
              ]}
            />
          </Space>
        </Col>
      </Row>

      {/* ── 時間範圍 ── */}
      <div style={{
        marginBottom: 16,
        padding: '10px 14px',
        background: '#fafafa',
        border: '1px solid #f0f0f0',
        borderRadius: 6,
      }}>
        <Space size={[12, 8]} wrap align="center">
          <Text strong style={{ fontSize: 13 }}>時間範圍</Text>
          <Space size={4}>
            {PRESETS.map(p => (
              <Button
                key={p.key}
                size="small"
                type={preset === p.key ? 'primary' : 'default'}
                onClick={() => { setPreset(p.key); setCustomRange(null) }}
              >
                {p.label}
              </Button>
            ))}
          </Space>
          <Divider type="vertical" style={{ height: 20, margin: 0 }} />
          <Space size={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>或自訂日期：</Text>
            <DatePicker.RangePicker
              size="small"
              value={preset === 'custom' ? customRange : null}
              onChange={dates => {
                if (dates && dates[0] && dates[1]) {
                  setPreset('custom')
                  setCustomRange(dates)
                } else {
                  setPreset('all')
                  setCustomRange(null)
                }
              }}
              style={{ width: 240 }}
              placeholder={['起始日', '結束日']}
            />
          </Space>
        </Space>
      </div>

      {/* ── 整體視圖 ── */}
      {view === 'overall' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <KpiRow data={overall} />
          </div>

          <Row gutter={16}>
            <Col span={11}>
              <Card title="月份趨勢損益" size="small">
                <MonthlyTrendTable data={overallMonthly} />
              </Card>
            </Col>
            <Col span={13}>
              <Card
                title="各品項銷售排名"
                size="small"
                extra={
                  <Segmented
                    size="small"
                    value={overallSort}
                    onChange={setOverallSort}
                    options={[
                      { label: '依金額', value: 'revenue' },
                      { label: '依銷量', value: 'qty' },
                    ]}
                  />
                }
              >
                <ProductRankTable items={overallProducts} sortBy={overallSort} />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* ── 各通路視圖 ── */}
      {view === 'channel' && (
        <>
          <Card
            title="通路損益排名"
            size="small"
            style={{ marginBottom: 16 }}
            extra={
              <Text type="secondary" style={{ fontSize: 11 }}>
                點擊任一列查看該通路詳細
              </Text>
            }
          >
            <Table
              dataSource={channelRank}
              columns={channelCols}
              rowKey="channelId"
              size="small"
              pagination={false}
              onRow={r => ({
                onClick: () => setSelectedCid(r.channelId),
                style: { cursor: 'pointer' },
              })}
              rowClassName={r => r.channelId === effectiveCid ? 'row-selected-channel' : ''}
            />
          </Card>

          {selectedChannel && (
            <>
              <div style={{ marginBottom: 8, padding: '0 4px' }}>
                <Space size={8} align="baseline">
                  <Text strong style={{ fontSize: 14 }}>{selectedChannel.channelName}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    月份趨勢與品項排名
                  </Text>
                </Space>
              </div>

              <Row gutter={16}>
                <Col span={11}>
                  <Card title="月份趨勢損益" size="small">
                    <MonthlyTrendTable data={channelMonthly} />
                  </Card>
                </Col>
                <Col span={13}>
                  <Card
                    title="各品項銷售排名"
                    size="small"
                    extra={
                      <Segmented
                        size="small"
                        value={channelSort}
                        onChange={setChannelSort}
                        options={[
                          { label: '依金額', value: 'revenue' },
                          { label: '依銷量', value: 'qty' },
                        ]}
                      />
                    }
                  >
                    <ProductRankTable items={channelProducts} sortBy={channelSort} />
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {channelRank.length === 0 && (
            <Card size="small">
              <Empty description="此溫層下無通路成交資料" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          )}
        </>
      )}

      <style>{`
        .row-selected-channel td {
          background: #e6f4ff !important;
        }
        .row-selected-channel:hover td {
          background: #bae0ff !important;
        }
      `}</style>
    </div>
  )
}
