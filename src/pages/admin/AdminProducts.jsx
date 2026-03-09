import { useMemo, useState } from 'react'
import {
  Table, Tag, Typography, Card, Row, Col, Statistic, Select, Space,
  Badge, Button, Modal, Form, Input, InputNumber, Popconfirm, message,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { products as initialProducts } from '../../data/fakeData'

const { Title, Text } = Typography

const CATEGORY_OPTIONS = [
  { value: 'frozen',  label: '❄️ 冷凍商品' },
  { value: 'ambient', label: '🌿 常溫商品' },
]

const SUB_CATEGORY_OPTIONS = {
  frozen: [
    '4-6個月-小寶', '7-9個月-中寶', '10-12個月-大寶',
    '一歲以上-燉飯', '高湯', '魚塊海鮮', '烏龍麵',
  ],
  ambient: [
    '常溫粥-單入', '常溫粥-組合', '常溫燉飯', '常溫拌醬', '細麵米餅', '凍乾',
  ],
}

function ProductModal({ open, onClose, onSave, initial }) {
  const [form] = Form.useForm()
  const [category, setCategory] = useState(initial?.category ?? 'frozen')

  const handleOk = () => {
    form.validateFields().then(values => {
      onSave({ ...initial, ...values })
      onClose()
    })
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      title={initial?.id ? '編輯商品' : '新增商品'}
      okText="儲存"
      cancelText="取消"
      width={560}
      destroyOnClose
      afterOpenChange={open => {
        if (open) {
          form.setFieldsValue(initial ?? {})
          setCategory(initial?.category ?? 'frozen')
        }
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Row gutter={12}>
          <Col span={16}>
            <Form.Item label="商品名稱" name="name" rules={[{ required: true }]}>
              <Input placeholder="例：中寶-玉米雞肉粥" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="規格備註" name="spec">
              <Input placeholder="例：新品、200g" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="分類" name="category" rules={[{ required: true }]}>
              <Select options={CATEGORY_OPTIONS} onChange={v => { setCategory(v); form.setFieldValue('subCategory', undefined) }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="子分類" name="subCategory" rules={[{ required: true }]}>
              <Select
                options={(SUB_CATEGORY_OPTIONS[category] ?? []).map(v => ({ value: v, label: v }))}
                placeholder="請先選分類"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item label="單位" name="unit" rules={[{ required: true }]}>
              <Input placeholder="包/罐/盒" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="B2B採購價" name="b2bPrice" rules={[{ required: true }]}>
              <InputNumber prefix="$" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="成本" name="cost">
              <InputNumber prefix="$" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="產品規格 ID" name="ezposId">
              <Input placeholder="例：159476" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="庫存數量" name="stock" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default function AdminProducts() {
  const [productList, setProductList] = useState(initialProducts)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [editing, setEditing] = useState(null)   // null = 關閉，{} = 新增，{...product} = 編輯
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = productList.filter(p => !categoryFilter || p.category === categoryFilter)

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(p => {
      const key = `${p.category}__${p.subCategory}`
      if (!map[key]) map[key] = { category: p.category, subCategory: p.subCategory, items: [] }
      map[key].items.push(p)
    })
    return Object.values(map)
  }, [filtered])

  const openAdd  = () => { setEditing({ category: 'frozen' }); setModalOpen(true) }
  const openEdit = (p) => { setEditing(p); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = (values) => {
    if (values.id) {
      setProductList(prev => prev.map(p => p.id === values.id ? { ...p, ...values } : p))
      message.success('商品已更新')
    } else {
      const newId = `p${Date.now()}`
      setProductList(prev => [...prev, { ...values, id: newId }])
      message.success('商品已新增')
    }
  }

  const handleDelete = (id) => {
    setProductList(prev => prev.filter(p => p.id !== id))
    message.success('商品已刪除')
  }

  const columns = [
    { title: '商品名稱', dataIndex: 'name',
      render: (v, r) => <Space>{v}{r.spec && <Tag style={{ fontSize: 11 }}>{r.spec}</Tag>}</Space> },
    { title: '單位', dataIndex: 'unit', width: 55 },
    { title: 'B2B採購價', dataIndex: 'b2bPrice', width: 95, render: v => `$${v}` },
    { title: '成本', dataIndex: 'cost', width: 75,
      render: v => v ? <Text type="secondary">${v}</Text> : '-' },
    { title: '毛利率', width: 80,
      render: (_, r) => {
        if (!r.cost) return '-'
        const m = Math.round((r.b2bPrice - r.cost) / r.b2bPrice * 100)
        return <Tag color={m >= 50 ? 'green' : m >= 30 ? 'gold' : 'red'}>{m}%</Tag>
      }},
    { title: '產品規格 ID', dataIndex: 'ezposId', width: 100,
      render: v => v ? <Text code style={{ fontSize: 11 }}>{v}</Text> : <Text type="secondary">-</Text> },
    { title: '庫存', dataIndex: 'stock', width: 80,
      render: v => <Badge count={v} style={{ backgroundColor: v <= 10 ? '#ff4d4f' : '#52c41a' }} overflowCount={999} /> },
    { title: '操作', width: 100, align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>編輯</Button>
          <Popconfirm title="確認刪除此商品？" okText="刪除" okButtonProps={{ danger: true }}
            cancelText="取消" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>B2B 商品管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增商品</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { label: '商品總數',       value: productList.length },
          { label: '冷凍品項',       value: productList.filter(p => p.category === 'frozen').length },
          { label: '常溫品項',       value: productList.filter(p => p.category === 'ambient').length },
          { label: '庫存不足(<10)', value: productList.filter(p => p.stock <= 10).length, color: '#ff4d4f' },
        ].map(s => (
          <Col span={6} key={s.label}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic title={s.label} value={s.value}
                valueStyle={{ color: s.color ?? '#1677ff', fontSize: 22 }} suffix="項" />
            </Card>
          </Col>
        ))}
      </Row>

      <Space style={{ marginBottom: 12 }}>
        <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 150 }}
          options={[{ value: '', label: '全部分類' }, ...CATEGORY_OPTIONS]} />
      </Space>

      {grouped.map(g => (
        <div key={`${g.category}__${g.subCategory}`} style={{ marginBottom: 16 }}>
          <div style={{
            background: g.category === 'frozen' ? '#e6f4ff' : '#f6ffed',
            border: `1px solid ${g.category === 'frozen' ? '#91caff' : '#b7eb8f'}`,
            borderRadius: 4, padding: '4px 12px', fontWeight: 600, marginBottom: 6,
          }}>
            {g.category === 'frozen' ? '❄️' : '🌿'} {g.subCategory}
            <Tag style={{ marginLeft: 8, fontWeight: 400 }}>{g.items.length} 項</Tag>
          </div>
          <Table dataSource={g.items} columns={columns} rowKey="id" size="small" pagination={false} />
        </div>
      ))}

      <ProductModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
