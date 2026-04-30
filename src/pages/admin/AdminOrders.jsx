import { useState, useMemo } from 'react'
import {
  Table, Button, Space, Input, Card, Col, Row,
  Statistic, Tag, Typography, DatePicker, Select, Divider, Tooltip, message,
} from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import StatusTag from '../../components/StatusTag'
import OrderDetail from '../../components/OrderDetail'
import { preOrders as initPreOrders, productMap, channelMap } from '../../data/fakeData'

const { Text } = Typography
const { RangePicker } = DatePicker

const INVOICE_MODE_LABEL = {
  per_order:         '單筆開票',
  monthly_per_store: '門市月結',
  monthly_combined:  '整合月結',
}

const INVOICE_MODE_COLOR = {
  per_order:         'default',
  monthly_per_store: 'geekblue',
  monthly_combined:  'purple',
}

function temperatureZoneTag(items) {
  const zones = new Set(items.map(i => productMap[i.productId]?.category).filter(Boolean))
  return (
    <Space size={4}>
      {zones.has('frozen')  && <Tag color="blue"  style={{ margin: 0 }}>❄️ 冷凍</Tag>}
      {zones.has('ambient') && <Tag color="green" style={{ margin: 0 }}>🌿 常溫</Tag>}
    </Space>
  )
}

const STATUS_FILTERS = [
  { key: 'pending_sales', label: '待業務確認'   },
  { key: 'ordered',       label: '已成立訂單'   },
  { key: 'arrived',       label: '到貨等待結算' },
  { key: 'settling',      label: '結算中'       },
  { key: 'settled_done',  label: '結算完畢'     },
  { key: 'voided',        label: '作廢'         },
]

function getSettlementMonthOptions(orders) {
  const months = [...new Set(orders.map(o => o.settlementMonth).filter(Boolean))].sort().reverse()
  return months.map(m => ({ value: m, label: m }))
}

export default function AdminOrders() {
  const [preOrderList, setPreOrderList]       = useState(initPreOrders)
  const [filterText, setFilterText]           = useState('')
  const [activeStatuses, setActiveStatuses]   = useState([])
  const [tempFilter, setTempFilter]           = useState('all')         // 'all' | 'frozen' | 'ambient'
  const [dateMode, setDateMode]               = useState('createdAt')   // 'createdAt' | 'settlementMonth'
  const [dateRange, setDateRange]             = useState(null)           // [dayjs, dayjs] | null
  const [settlementMonth, setSettlementMonth] = useState(null)
  const [selected, setSelected]               = useState(null)

  const stats = useMemo(() => ({
    pendingSales: preOrderList.filter(o => o.status === 'pending_sales').length,
    ordered:      preOrderList.filter(o => o.status === 'ordered').length,
    unsettled:    preOrderList.filter(o => ['ordered', 'arrived'].includes(o.status) && !o.settlementId).length,
  }), [preOrderList])

  const settlementMonthOptions = useMemo(() => getSettlementMonthOptions(preOrderList), [preOrderList])

  const list = useMemo(() =>
    preOrderList
      .filter(o => {
        const q = filterText.trim()
        const matchText   = !q || o.id.includes(q) || o.channelName.includes(q) || (o.b2b_order_no ?? '').includes(q)
        const matchStatus = activeStatuses.length === 0 || activeStatuses.includes(o.status)
        const matchTemp   = (() => {
          if (tempFilter === 'all') return true
          const zones = new Set(o.items.map(i => productMap[i.productId]?.category).filter(Boolean))
          return zones.has(tempFilter)
        })()
        const matchDate   = (() => {
          if (dateMode === 'createdAt' && dateRange) {
            const d = dayjs(o.createdAt)
            return d.isAfter(dateRange[0].subtract(1, 'day')) && d.isBefore(dateRange[1].add(1, 'day'))
          }
          if (dateMode === 'settlementMonth' && settlementMonth) {
            return o.settlementMonth === settlementMonth
          }
          return true
        })()
        return matchText && matchStatus && matchTemp && matchDate
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [preOrderList, filterText, activeStatuses, tempFilter, dateMode, dateRange, settlementMonth])

  const toggleStatus = (key, checked) => {
    const next = checked
      ? [...activeStatuses, key]
      : activeStatuses.filter(s => s !== key)
    setActiveStatuses(next)
  }

  const handleStatusChange = (id, next, log, extra) => {
    setPreOrderList(prev => prev.map(o => {
      if (o.id !== id) return o
      const updated = {
        ...o,
        status: next,
        logs: log ? [...o.logs, log] : o.logs,
        ...(extra?.salesAdjustedItems !== undefined ? { salesAdjustedItems: extra.salesAdjustedItems } : {}),
        ...(extra?.adjustedItems      !== undefined ? { adjustedItems: extra.adjustedItems }           : {}),
        ...(extra?.shipping_note      !== undefined ? { shipping_note: extra.shipping_note }           : {}),
        ...(extra?.warehouse_note     !== undefined ? { warehouse_note: extra.warehouse_note }         : {}),
        ...(extra?.b2b_order_no       !== undefined ? { b2b_order_no: extra.b2b_order_no }             : {}),
        ...(extra?.discount_amount    !== undefined ? { discount_amount: extra.discount_amount }       : {}),
        ...(extra?.discount_note      !== undefined ? { discount_note: extra.discount_note }           : {}),
        ...(extra?.cs_note            !== undefined ? { cs_note: extra.cs_note }                       : {}),
        ...(extra?.b2b_note           !== undefined ? { b2b_note: extra.b2b_note }                     : {}),
        ...(extra?.settlementMonth    !== undefined ? { settlementMonth: extra.settlementMonth }       : {}),
        ...(extra?.voided_at          !== undefined ? { voided_at: extra.voided_at }                   : {}),
        ...(extra?.voided_reason      !== undefined ? { voided_reason: extra.voided_reason }           : {}),
      }
      setSelected(updated)
      return updated
    }))
  }

  // 重新建單：把新訂單 push 進列表前面
  const handleRecreate = (newOrder) => {
    setPreOrderList(prev => [newOrder, ...prev])
  }

  const handleSettlementMonthChange = (id, month) => {
    setPreOrderList(prev => prev.map(o =>
      o.id === id ? { ...o, settlementMonth: month } : o
    ))
    setSelected(prev => prev && prev.id === id ? { ...prev, settlementMonth: month } : prev)
  }

  const columns = [
    { title: '訂單編號', dataIndex: 'id', width: 170,
      render: (v, r) => {
        const isVoided = r.status === 'voided'
        return (
          <Space direction="vertical" size={0}>
            <Text code style={{ fontSize: 12 }}>{v}</Text>
            {r.backendOrderId && (
              <Text style={{ fontSize: 11, ...(isVoided ? null : { color: '#888' }) }}>
                {r.backendOrderId}
              </Text>
            )}
          </Space>
        )
      }},
    { title: '通路', dataIndex: 'channelName', width: 140 },
    { title: '下單日', dataIndex: 'createdAt', width: 100 },
    { title: '溫層', dataIndex: 'items', width: 110,
      render: items => temperatureZoneTag(items) },
    { title: '金額', width: 110,
      render: (_, r) => {
        const isVoided = r.status === 'voided'
        const items = r.adjustedItems ?? r.salesAdjustedItems ?? r.items
        const t = items.reduce((s, i) => s + i.qty * i.price, 0)
        const disc = r.discount_amount ?? 0
        return (
          <Space direction="vertical" size={0}>
            <Text strong style={isVoided ? null : { color: '#1677ff' }}>
              ${(t - disc).toLocaleString()}
            </Text>
            {disc > 0 && (
              <Text style={{ fontSize: 11, ...(isVoided ? null : { color: '#fa8c16' }) }}>
                已折扣 ${disc.toLocaleString()}
              </Text>
            )}
          </Space>
        )
      }},
    { title: '發票模式', dataIndex: 'invoice_mode_snapshot', width: 95,
      render: v => v
        ? <Tag color={INVOICE_MODE_COLOR[v] ?? 'default'} style={{ fontSize: 11 }}>{INVOICE_MODE_LABEL[v] ?? v}</Tag>
        : <Text type="secondary">—</Text> },
    { title: '品項摘要', dataIndex: 'items', ellipsis: true,
      render: items => items.map(i => i.productName).join('、') },
    { title: '狀態', dataIndex: 'status', width: 130,
      render: s => <StatusTag status={s} /> },
    { title: '操作', width: 80, align: 'center',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(r)}>查看</Button>
      )},
  ]

  const isAll = activeStatuses.length === 0

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { label: '待業務確認',   value: stats.pendingSales, color: '#1677ff' },
          { label: '已成立訂單',   value: stats.ordered,      color: '#13c2c2' },
          { label: '尚未結算訂單', value: stats.unsettled,    color: '#fa8c16' },
        ].map(s => (
          <Col span={8} key={s.label}>
            <Card size="small" bordered style={{ textAlign: 'center' }}>
              <Statistic title={s.label} value={s.value}
                valueStyle={{ color: s.color, fontSize: 28 }} suffix="筆" />
            </Card>
          </Col>
        ))}
      </Row>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          prefix={<SearchOutlined />} placeholder="搜尋訂單號 / B2B編號 / 通路名稱"
          value={filterText} onChange={e => setFilterText(e.target.value)}
          style={{ width: 240 }} allowClear
        />

        {/* 日期篩選 */}
        <Space.Compact>
          <Select
            value={dateMode}
            onChange={v => { setDateMode(v); setDateRange(null); setSettlementMonth(null) }}
            style={{ width: 100 }}
            options={[
              { value: 'createdAt',      label: '建單日期' },
              { value: 'settlementMonth', label: '結算月份' },
            ]}
          />
          {dateMode === 'createdAt' ? (
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              allowClear
              style={{ width: 230 }}
            />
          ) : (
            <Select
              value={settlementMonth}
              onChange={setSettlementMonth}
              placeholder="選擇月份"
              allowClear
              style={{ width: 140 }}
              options={settlementMonthOptions}
            />
          )}
        </Space.Compact>

        {/* 溫層篩選 */}
        <Space size={4}>
          {[
            { key: 'all',     label: '全部溫層' },
            { key: 'frozen',  label: '❄️ 冷凍'  },
            { key: 'ambient', label: '🌿 常溫'  },
          ].map(({ key, label }) => (
            <Button key={key} size="small"
              type={tempFilter === key ? 'primary' : 'default'}
              onClick={() => setTempFilter(key)}
            >
              {label}
            </Button>
          ))}
        </Space>

        <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />

        {/* 狀態篩選 */}
        <Space size={4}>
          <Button size="small" type={isAll ? 'primary' : 'default'} onClick={() => setActiveStatuses([])}>
            全部狀態
          </Button>
          {STATUS_FILTERS.map(f => (
            <Tag.CheckableTag
              key={f.key}
              checked={activeStatuses.includes(f.key)}
              onChange={checked => toggleStatus(f.key, checked)}
            >
              {f.label}
            </Tag.CheckableTag>
          ))}
        </Space>
      </Space>

      <Table
        dataSource={list}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 20, showSizeChanger: false }}
        rowClassName={r => {
          if (r.status === 'voided') return 'row-voided'
          if (r.status === 'settling' || r.status === 'settled_done') return 'row-settled'
          return ''
        }}
      />

      <OrderDetail
        order={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        onRecreate={handleRecreate}
      />

      <style>{`
        .row-settled td { background: #f9f0ff !important; color: #888; }
        .row-settled:hover td { background: #efdbff !important; }
        .row-voided td { background: #fafafa !important; color: #bfbfbf; text-decoration: line-through; }
        .row-voided td .ant-typography { color: #bfbfbf; }
        .row-voided:hover td { background: #f0f0f0 !important; }
        .row-voided .ant-tag { text-decoration: none; }
      `}</style>
    </div>
  )
}
