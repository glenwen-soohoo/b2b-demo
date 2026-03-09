import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, Tabs, Table, InputNumber, Button, Space, Typography,
  Tag, Alert, Descriptions, Modal, message, Divider,
} from 'antd'
import { ShoppingCartOutlined, FileTextOutlined, SendOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { products, templates } from '../../data/fakeData'
import { useVendor } from '../../context/VendorContext'

const { Title, Text } = Typography

function groupBySubCategory(prods) {
  return prods.reduce((acc, p) => {
    if (!acc[p.subCategory]) acc[p.subCategory] = []
    acc[p.subCategory].push(p)
    return acc
  }, {})
}

function OrderPreviewModal({ open, onClose, items, channel, onConfirm }) {
  if (!channel) return null
  const addr = channel.addresses?.[0] ?? {}
  const total = items.reduce((s, i) => s + i.qty * i.b2bPrice, 0)

  return (
    <Modal
      open={open} onCancel={onClose}
      title={<Space><FileTextOutlined />採購單確認</Space>}
      width={720}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="confirm" type="primary" icon={<SendOutlined />}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
          onClick={onConfirm}
        >
          確認送出預訂
        </Button>,
      ]}
    >
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="通路名稱">{channel.name}</Descriptions.Item>
        <Descriptions.Item label="統一編號">{channel.taxId}</Descriptions.Item>
        <Descriptions.Item label={<><EnvironmentOutlined /> 收件人</>}>{addr.recipient}</Descriptions.Item>
        <Descriptions.Item label="收件電話">{addr.phone}</Descriptions.Item>
        <Descriptions.Item label="收件地址" span={2}>{addr.address}</Descriptions.Item>
        <Descriptions.Item label="付款方式" span={2}>
          {channel.settlementMethod}，次月 {channel.settlementDay} 日前付款
        </Descriptions.Item>
      </Descriptions>

      <Table
        dataSource={items}
        rowKey="id"
        size="small"
        pagination={false}
        columns={[
          { title: '品項', dataIndex: 'name',
            render: (v, r) => <Space>{v}{r.spec && <Tag style={{ fontSize: 11 }}>{r.spec}</Tag>}</Space> },
          { title: '單位', dataIndex: 'unit', width: 60 },
          { title: '採購價', dataIndex: 'b2bPrice', width: 80, render: v => `$${v}` },
          { title: '數量', dataIndex: 'qty', width: 70 },
          { title: '小計', width: 100,
            render: (_, r) => <Text strong>${(r.qty * r.b2bPrice).toLocaleString()}</Text> },
        ]}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={4} align="right"><strong>訂購總金額</strong></Table.Summary.Cell>
            <Table.Summary.Cell>
              <strong style={{ color: '#1677ff', fontSize: 16 }}>${total.toLocaleString()}</strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />

      <div style={{ marginTop: 16, fontSize: 12, color: '#888', lineHeight: 2 }}>
        <div>1. 以上價格皆為含稅價</div>
        <div>2. 匯款資訊：戶名 舒果農企業有限公司 ／ 兆豐銀行 0170077 ／ 帳號 00709001170</div>
        <div>3. 合作方式：買斷　出貨方式：黑貓宅配</div>
      </div>
    </Modal>
  )
}

function ProductSection({ prods, qtyMap, setQty }) {
  const grouped = groupBySubCategory(prods)
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
            pagination={false} showHeader={items === Object.values(grouped)[0]}
            columns={[
              { title: '品項名稱', render: (_, r) => (
                <Space>
                  {r.name}
                  {r.spec && <Tag style={{ fontSize: 11 }}>{r.spec}</Tag>}
                  {r.stock <= 10 && <Tag color="red" style={{ fontSize: 11 }}>庫存僅剩 {r.stock}</Tag>}
                </Space>
              )},
              { title: '單位', dataIndex: 'unit', width: 60, align: 'center' },
              { title: '採購價', dataIndex: 'b2bPrice', width: 90, align: 'right',
                render: v => <Text strong>${v}</Text> },
              { title: '數量', width: 140, align: 'center',
                render: (_, r) => (
                  <InputNumber
                    min={0} max={r.stock} size="small"
                    value={qtyMap[r.id] ?? 0}
                    onChange={v => setQty(r.id, v ?? 0)}
                    style={{ width: 100 }}
                  />
                )},
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

export default function VendorOrderForm() {
  const { channel } = useVendor()
  const nav = useNavigate()
  const [qtyMap, setQtyMap] = useState({})
  const [previewOpen, setPreviewOpen] = useState(false)

  if (!channel) {
    nav('/vendor')
    return null
  }

  const tpl = templates.find(t => t.id === channel.templateId)
  const tplProducts = products.filter(p => tpl?.productIds.includes(p.id))
  const frozenProds  = tplProducts.filter(p => p.category === 'frozen')
  const ambientProds = tplProducts.filter(p => p.category === 'ambient')

  const setQty = (id, val) => setQtyMap(prev => ({ ...prev, [id]: val }))

  const orderedItems = tplProducts.filter(p => (qtyMap[p.id] ?? 0) > 0)
    .map(p => ({ ...p, qty: qtyMap[p.id] }))

  const total = orderedItems.reduce((s, i) => s + i.qty * i.b2bPrice, 0)

  const handleConfirm = () => {
    setPreviewOpen(false)
    setQtyMap({})
    message.success({ content: '預訂已送出！系統將發送通知信給業務人員。', duration: 4 })
    nav('/vendor/history')
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 4 }}>商品採購</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
        套用模板：{tpl?.name}　｜　月結日：每月 {channel.settlementDay} 日
      </Text>

      {channel.pricingNote && (
        <Alert type="info" showIcon style={{ marginBottom: 16 }}
          message="本通路議價備註"
          description={<pre style={{ margin:0, fontSize:12, whiteSpace:'pre-line' }}>{channel.pricingNote}</pre>}
        />
      )}

      <Card
        title="請填寫採購數量"
        extra={
          <Space>
            {orderedItems.length > 0 && (
              <Text style={{ color: '#389e0d', fontWeight: 600 }}>
                已選 {orderedItems.length} 項 ／ 小計 ${total.toLocaleString()}
              </Text>
            )}
            <Button
              type="primary" icon={<ShoppingCartOutlined />}
              disabled={orderedItems.length === 0}
              onClick={() => setPreviewOpen(true)}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              預覽 & 送出
            </Button>
          </Space>
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
          ]}
        />
      </Card>

      {orderedItems.length > 0 && (
        <Card size="small" style={{ marginTop: 12 }}>
          <Space wrap>
            <Text strong>已選：</Text>
            {orderedItems.map(i => (
              <Tag key={i.id} closable onClose={() => setQty(i.id, 0)}>
                {i.name} × {i.qty}
              </Tag>
            ))}
            <Divider type="vertical" />
            <Text strong style={{ color: '#1677ff' }}>合計 ${total.toLocaleString()}</Text>
          </Space>
        </Card>
      )}

      <OrderPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        items={orderedItems}
        channel={channel}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
