// 通知歷史頁（對應正式版 B2BNotificationLog 表）
//
// 後台查詢每封寄出的通知信，篩選條件：
//   - 通路（channelId）
//   - 通知類型（type）
//   - 狀態（delivered / failed）
//   - 日期範圍
//
// 失敗的可重寄（demo 用 message 模擬，正式版呼叫對應 API）
import { useState, useMemo } from 'react'
import {
  Table, Tag, Typography, Card, Space, Input, Select, DatePicker,
  Button, message, Tooltip,
} from 'antd'
import { SearchOutlined, RedoOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { b2bNotificationLog, channels } from '../../data/fakeData'

const { Text } = Typography
const { RangePicker } = DatePicker

// 通知類型 → 中文 label + 顏色
const TYPE_META = {
  order_received:        { label: '訂單已接收',  color: 'blue' },
  order_confirmed:       { label: '訂單已成立',  color: 'cyan' },
  settlement_created:    { label: '結算單產生',  color: 'purple' },
  payment_confirmed:     { label: '匯款已確認',  color: 'green' },
  invoice_issued:        { label: '發票開立完成', color: 'gold' },
  password_reset_email:  { label: '密碼重設信',  color: 'magenta' },
  admin_password_reset:  { label: '後台重設密碼', color: 'magenta' },
  invoice_failed:        { label: '發票開立失敗', color: 'red' },
}

const STATUS_META = {
  delivered: { label: '已送達', color: 'green' },
  failed:    { label: '寄送失敗', color: 'red' },
}

export default function AdminNotificationLog() {
  const [logs, setLogs] = useState(b2bNotificationLog)
  const [channelFilter, setChannelFilter] = useState(null)
  const [typeFilter,    setTypeFilter]    = useState(null)
  const [statusFilter,  setStatusFilter]  = useState(null)
  const [dateRange,     setDateRange]     = useState(null)
  const [searchText,    setSearchText]    = useState('')

  const channelMap = useMemo(
    () => Object.fromEntries(channels.map(c => [c.id, c.name])),
    [],
  )

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (channelFilter && log.channelId !== channelFilter) return false
      if (typeFilter && log.type !== typeFilter) return false
      if (statusFilter && log.status !== statusFilter) return false
      if (dateRange && dateRange.length === 2) {
        const sentDay = dayjs(log.sentAt)
        if (sentDay.isBefore(dateRange[0], 'day') || sentDay.isAfter(dateRange[1], 'day')) return false
      }
      if (searchText) {
        const q = searchText.toLowerCase()
        const matches = log.subject?.toLowerCase().includes(q)
          || log.toEmail?.toLowerCase().includes(q)
          || log.relatedId?.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [logs, channelFilter, typeFilter, statusFilter, dateRange, searchText])

  const handleResend = (log) => {
    message.loading({ content: '重新寄送中…', key: log.id, duration: 1 })
    setTimeout(() => {
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const newLog = {
        ...log,
        id:           `log-${Date.now()}`,
        sentAt:       now,
        status:       'delivered',
        errorMessage: null,
      }
      setLogs(prev => [newLog, ...prev])
      message.success({ content: '已重新寄送', key: log.id })
    }, 800)
  }

  const stats = useMemo(() => ({
    total:      logs.length,
    delivered:  logs.filter(l => l.status === 'delivered').length,
    failed:     logs.filter(l => l.status === 'failed').length,
  }), [logs])

  const columns = [
    { title: '寄送時間', dataIndex: 'sentAt', width: 160,
      render: v => <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{v}</Text> },
    { title: '通路', dataIndex: 'channelId', width: 140,
      render: v => channelMap[v] ?? v },
    { title: '通知類型', dataIndex: 'type', width: 130,
      render: v => {
        const m = TYPE_META[v]
        return m ? <Tag color={m.color}>{m.label}</Tag> : <Tag>{v}</Tag>
      }},
    { title: '收件人', dataIndex: 'toEmail', width: 200, ellipsis: true,
      render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: '主旨', dataIndex: 'subject', ellipsis: true,
      render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: '狀態', dataIndex: 'status', width: 100,
      render: (v, r) => {
        const m = STATUS_META[v]
        const tag = m ? <Tag color={m.color}>{m.label}</Tag> : <Tag>{v}</Tag>
        return r.errorMessage
          ? <Tooltip title={r.errorMessage}>{tag}</Tooltip>
          : tag
      }},
    { title: '操作', width: 90, align: 'center',
      render: (_, r) => r.status === 'failed'
        ? <Button size="small" icon={<RedoOutlined />} onClick={() => handleResend(r)}>重寄</Button>
        : null },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
        <Space size="large">
          <span><Text type="secondary">總筆數</Text>　<Text strong>{stats.total}</Text></span>
          <span><Text type="secondary">已送達</Text>　<Text strong style={{ color: '#52c41a' }}>{stats.delivered}</Text></span>
          <span><Text type="secondary">寄送失敗</Text>　<Text strong style={{ color: '#ff4d4f' }}>{stats.failed}</Text></span>
        </Space>
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜尋主旨 / 收件人 / 關聯單號"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 260 }}
          />
          <Select
            placeholder="通路"
            value={channelFilter}
            onChange={setChannelFilter}
            allowClear
            style={{ width: 160 }}
            options={channels.map(c => ({ value: c.id, label: c.name }))}
          />
          <Select
            placeholder="通知類型"
            value={typeFilter}
            onChange={setTypeFilter}
            allowClear
            style={{ width: 160 }}
            options={Object.entries(TYPE_META).map(([v, m]) => ({ value: v, label: m.label }))}
          />
          <Select
            placeholder="狀態"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 120 }}
            options={Object.entries(STATUS_META).map(([v, m]) => ({ value: v, label: m.label }))}
          />
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder={['起始日', '結束日']}
          />
        </Space>
      </Card>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 20 }}
      />
    </div>
  )
}
