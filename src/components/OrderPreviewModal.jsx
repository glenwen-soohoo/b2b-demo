import { useState } from 'react'
import {
  Modal, Button, Input, Space, Descriptions, Checkbox,
  Table, Tag, Typography,
} from 'antd'
import {
  FileTextOutlined, SendOutlined,
  EnvironmentOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { shippingSettings } from '../data/fakeData'
import { TEMP } from '../styles/tokens'

const { Text } = Typography

function ItemTable({ items, showHeader = true }) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.b2bPrice, 0)
  const columns = [
    { title: '縮圖', width: 56, align: 'center',
      render: (_, r) => r.thumbnailUrl
        ? <img src={r.thumbnailUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
        : <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4 }} /> },
    { title: '品項', dataIndex: 'name',
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          {r.spec && <Tag style={{ fontSize: 11 }}>{r.spec}</Tag>}
          <span>{v}</span>
          <Text type="secondary" style={{ fontSize: 11 }}>#{r.id}</Text>
        </Space>
      )},
    { title: '單位', dataIndex: 'unit', width: 60 },
    { title: '採購價', dataIndex: 'b2bPrice', width: 80, render: v => `$${v}` },
    { title: '數量', dataIndex: 'qty', width: 70 },
    { title: '小計', width: 100,
      render: (_, r) => <Text strong>${(r.qty * r.b2bPrice).toLocaleString()}</Text> },
  ]
  return (
    <Table
      dataSource={items} rowKey="id" size="small" pagination={false}
      showHeader={showHeader}
      columns={columns}
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={5} align="right"><strong>小計</strong></Table.Summary.Cell>
          <Table.Summary.Cell>
            <strong style={{ color: '#389e0d' }}>${subtotal.toLocaleString()}</strong>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
    />
  )
}

export default function OrderPreviewModal({ open, onClose, items, channel, onConfirm }) {
  const [addrLabels, setAddrLabels] = useState([])
  const [vendorNote, setVendorNote] = useState('')
  const addresses = channel?.addresses ?? []

  const now = dayjs()
  const settlementMonth = now.date() > (channel?.settlementDay ?? 25)
    ? now.add(1, 'month').format('YYYY-MM')
    : now.format('YYYY-MM')

  if (!channel) return null

  const frozenItems  = items.filter(i => i.category === 'frozen')
  const ambientItems = items.filter(i => i.category === 'ambient')
  const frozenSubtotal  = frozenItems.reduce((s, i) => s + i.qty * i.b2bPrice, 0)
  const ambientSubtotal = ambientItems.reduce((s, i) => s + i.qty * i.b2bPrice, 0)
  const frozenCfg  = shippingSettings.frozen
  const ambientCfg = shippingSettings.ambient
  const frozenShipping  = frozenItems.length > 0 && frozenSubtotal < frozenCfg.freeShippingThreshold
    ? frozenCfg.shippingFee * addrLabels.length : 0
  const ambientShipping = ambientItems.length > 0 && ambientSubtotal < ambientCfg.freeShippingThreshold
    ? ambientCfg.shippingFee * addrLabels.length : 0
  const total = frozenSubtotal + ambientSubtotal + frozenShipping + ambientShipping
  const ordersPerAddr = (frozenItems.length > 0 ? 1 : 0) + (ambientItems.length > 0 ? 1 : 0)
  const totalOrders   = addrLabels.length * ordersPerAddr

  const toggleAddr = (label, checked) =>
    setAddrLabels(prev => checked ? [...prev, label] : prev.filter(l => l !== label))

  const confirmLabel = addrLabels.length === 0
    ? '確認送出B2B訂單'
    : `確認送出B2B訂單（共 ${totalOrders} 筆）`

  return (
    <Modal
      open={open} onCancel={onClose}
      title={<Space><FileTextOutlined />採購單確認</Space>}
      width={720}
      afterOpenChange={vis => {
        if (vis) {
          setAddrLabels(addresses.length > 0 ? [addresses[0].label] : [])
          setVendorNote(channel?.default_vendor_note ?? '')
        }
      }}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="confirm" type="primary" icon={<SendOutlined />}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
          disabled={addrLabels.length === 0}
          onClick={() => onConfirm({ addrLabels, settlementMonth, vendorNote })}
        >
          {confirmLabel}
        </Button>,
      ]}
    >
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="通路名稱">{channel.name}</Descriptions.Item>
        <Descriptions.Item label="統一編號">{channel.taxId}</Descriptions.Item>
        <Descriptions.Item label="結算月份">
          <Text strong>{settlementMonth}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="付款方式">
          於 {channel.settlementDay} 日收到結算單後匯款
        </Descriptions.Item>
      </Descriptions>

      {frozenItems.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            background: TEMP.frozen.bg, border: `1px solid ${TEMP.frozen.border}`, borderRadius: '6px 6px 0 0',
            padding: '5px 12px', fontWeight: 600, fontSize: 13, color: TEMP.frozen.text,
          }}>
            {TEMP.frozen.icon} 冷凍商品（將獨立產生一筆B2B訂單）
          </div>
          <ItemTable items={frozenItems} />
          {frozenSubtotal < frozenCfg.freeShippingThreshold && (
            <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderTop: 'none', padding: '6px 12px', fontSize: 12, color: '#d46b08' }}>
              ⚠ 冷凍訂單金額 ${frozenSubtotal.toLocaleString()} 未達免運門檻 ${frozenCfg.freeShippingThreshold.toLocaleString()}，
              {addrLabels.length > 0
                ? `每門市加收運費 $${frozenCfg.shippingFee}（共 ${addrLabels.length} 門市 = $${(frozenCfg.shippingFee * addrLabels.length).toLocaleString()}）`
                : `每筆將加收運費 $${frozenCfg.shippingFee}`
              }
            </div>
          )}
        </div>
      )}

      {ambientItems.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            background: TEMP.ambient.bg, border: `1px solid ${TEMP.ambient.border}`, borderRadius: '6px 6px 0 0',
            padding: '5px 12px', fontWeight: 600, fontSize: 13, color: TEMP.ambient.text,
          }}>
            {TEMP.ambient.icon} 常溫商品（將獨立產生一筆B2B訂單）
          </div>
          <ItemTable items={ambientItems} showHeader={frozenItems.length === 0} />
          {ambientSubtotal < ambientCfg.freeShippingThreshold && (
            <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderTop: 'none', padding: '6px 12px', fontSize: 12, color: '#d46b08' }}>
              ⚠ 常溫訂單金額 ${ambientSubtotal.toLocaleString()} 未達免運門檻 ${ambientCfg.freeShippingThreshold.toLocaleString()}，
              {addrLabels.length > 0
                ? `每門市加收運費 $${ambientCfg.shippingFee}（共 ${addrLabels.length} 門市 = $${(ambientCfg.shippingFee * addrLabels.length).toLocaleString()}）`
                : `每筆將加收運費 $${ambientCfg.shippingFee}`
              }
            </div>
          )}
        </div>
      )}

      <div style={{
        textAlign: 'right', padding: '8px 12px', marginBottom: 12,
        background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6,
      }}>
        {(frozenShipping + ambientShipping) > 0 && (
          <div style={{ fontSize: 12, color: '#d46b08', marginBottom: 4 }}>
            運費合計：+${(frozenShipping + ambientShipping).toLocaleString()}
          </div>
        )}
        訂購總金額（含運費）：<strong style={{ color: '#1677ff', fontSize: 16 }}>${total.toLocaleString()}</strong>
      </div>

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
        {addrLabels.length > 0 && ordersPerAddr > 0 && (
          <div style={{
            marginTop: 10, padding: '8px 12px',
            background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, fontSize: 13,
          }}>
            <InfoCircleOutlined style={{ color: '#1677ff', marginRight: 6 }} />
            已選 <Text strong>{addrLabels.length}</Text> 個門市 ×{' '}
            <Text strong>{ordersPerAddr}</Text> 種溫層，確認後將產生{' '}
            <Text strong>{totalOrders}</Text> 筆B2B訂單
            {ordersPerAddr > 1 && '（冷凍、常溫各自獨立）'}
          </div>
        )}
        {addrLabels.length === 0 && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#ff4d4f' }}>請至少選擇一個出貨門市</div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
          備註（選填）
          {channel?.default_vendor_note && (
            <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
              已自動帶入通路資料的預設備註，可直接修改。
            </Text>
          )}
        </div>
        <Input.TextArea rows={3} placeholder="如有特殊出貨需求或備註，請在此說明..."
          value={vendorNote} onChange={e => setVendorNote(e.target.value)} />
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#888', lineHeight: 2 }}>
        <div>1. 以上價格皆為含稅價</div>
        <div>2. 合作方式：買斷　出貨方式：黑貓宅配</div>
      </div>
    </Modal>
  )
}
