import { useMemo, useState } from 'react'
import {
  Table, Tag, Typography, Card, Row, Col, Statistic, Select, Space,
  Button, Dropdown, Modal, Form, Input, InputNumber, Popconfirm, message,
  Switch, Segmented, Divider,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ExclamationCircleOutlined, LinkOutlined, DownOutlined, ReloadOutlined } from '@ant-design/icons'
import { products as initialProducts, categories as initCategories } from '../../data/fakeData'
import Barcode from '../../components/Barcode'
import { TEMP } from '../../styles/tokens'

const { Title, Text } = Typography

const TEMP_LABEL = { frozen: `${TEMP.frozen.icon} 冷凍`, ambient: `${TEMP.ambient.icon} 常溫` }

// 將商品對應到大分類（與前台、模板共用邏輯）
function getProductCatId(product, cats) {
  for (const cat of cats) {
    if (cat.subCategories.some(s => s.name === product.subCategory)) return cat.id
  }
  return cats.find(c => c.temperature === product.category)?.id ?? cats[0]?.id
}

const STOCK_MODE_OPTIONS = [
  { value: 'unlimited',    label: '不限數量' },
  { value: 'out_of_stock', label: '缺貨' },
  { value: 'limited',      label: '限定數量' },
]

function ProductModal({ open, onClose, onSave, initial, categories }) {
  const [form]                       = Form.useForm()
  const [catId,       setCatId]      = useState(initial?.mainCategoryId ?? categories[0]?.id ?? '')
  const [linkStatus,  setLinkStatus] = useState('none')   // 'none' | 'linked' | 'invalid'
  const [linking,     setLinking]    = useState(false)

  const currentCat = categories.find(c => c.id === catId)

  const handleOk = () => {
    form.validateFields().then(values => {
      const cat = categories.find(c => c.id === values.mainCategoryId)
      onSave({ ...initial, ...values, category: cat?.temperature ?? 'frozen' })
      onClose()
    })
  }

  // TODO_FRUIT_WEB: 串接 /api/products/detail/{id} 確認規格ID存在
  const handleLink = async () => {
    const fruitId = form.getFieldValue('fruitProductDetailId')
    if (!fruitId) { message.warning('請先輸入產品規格 ID'); return }
    setLinking(true)
    await new Promise(r => setTimeout(r, 500))   // mock 驗證延遲
    setLinking(false)
    setLinkStatus('linked')
    // mock thumbnail — 真實串接後由 API 回傳
    form.setFieldValue('thumbnailUrl', `https://placehold.co/80x80?text=${fruitId}`)
    message.success(`規格 ID ${fruitId} 連結成功`)
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      title={initial?.id ? '編輯商品' : '新增商品'}
      okText="儲存"
      cancelText="取消"
      width={600}
      destroyOnClose
      afterOpenChange={isOpen => {
        if (isOpen) {
          form.resetFields()
          const defaultCatId = initial?.mainCategoryId
            ?? (initial?.id ? getProductCatId(initial, categories) : null)
            ?? categories[0]?.id
          form.setFieldsValue({
            stockMode: 'unlimited',
            isListed: true,
            thumbnailUrl: '',
            ...initial,
            mainCategoryId: defaultCatId,
          })
          setCatId(defaultCatId)
          setLinkStatus(initial?.fruitProductDetailId ? 'linked' : 'none')
          setLinking(false)
        }
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        {/* === 基本資訊（含商品分類） === */}
        <Row gutter={16} align="bottom">
          <Col flex="96px">
            <Form.Item
              shouldUpdate={(p, c) => p.thumbnailUrl !== c.thumbnailUrl}
              style={{ marginBottom: 24 }}
            >
              {({ getFieldValue }) => {
                const url = getFieldValue('thumbnailUrl')
                if (url && linkStatus === 'linked') {
                  return <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0', display: 'block' }} />
                }
                return (
                  <div style={{
                    width: 80, height: 80, background: '#fafafa', border: '1px dashed #d9d9d9',
                    borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#bfbfbf', fontSize: 11, textAlign: 'center', padding: 4, lineHeight: 1.3,
                    whiteSpace: 'pre-line',
                  }}>
                    {linkStatus === 'invalid' ? '連結失效' : '無圖'}
                  </div>
                )
              }}
            </Form.Item>
          </Col>
          <Col flex="auto">
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
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="產品規格 ID (fruitProductDetailId)" name="fruitProductDetailId"
              rules={[{ required: true, message: '請輸入產品規格 ID' }]}>
              <Input
                placeholder="例：159476"
                disabled={linkStatus === 'linked'}
                addonAfter={
                  linkStatus === 'linked' ? (
                    <Dropdown
                      trigger={['click']}
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            icon: <LinkOutlined />,
                            label: '開啟後台編輯頁',
                            onClick: () => {
                              const fid = form.getFieldValue('fruitProductDetailId')
                              window.open(`https://greenbox.tw/GoX/Product/Edit18/${fid}?fun_id=3033`, '_blank')
                            },
                          },
                          { type: 'divider' },
                          {
                            key: 'relink',
                            icon: <ReloadOutlined />,
                            label: '重新連結',
                            danger: true,
                            onClick: () => {
                              setLinkStatus('none')
                              form.setFieldValue('thumbnailUrl', '')
                            },
                          },
                        ],
                      }}
                    >
                      <Button type="link" size="small"
                        style={{ padding: 0, color: '#52c41a', height: 'auto', fontSize: 12 }}
                      >
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        已連結
                        <DownOutlined style={{ fontSize: 9, marginLeft: 3 }} />
                      </Button>
                    </Dropdown>
                  ) : linkStatus === 'invalid' ? (
                    <span style={{ color: '#ff4d4f', fontSize: 12, userSelect: 'none' }}>
                      <ExclamationCircleOutlined style={{ marginRight: 4 }} />連結失效
                    </span>
                  ) : (
                    <Button type="link" size="small" loading={linking}
                      style={{ padding: 0, color: '#1677ff', height: 'auto' }}
                      onClick={handleLink}
                    >
                      {linking ? '' : '連結ID'}
                    </Button>
                  )
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="前台展示頁面 ID"
              shouldUpdate={(p, c) => p.frontend_product_id !== c.frontend_product_id}
            >
              {({ getFieldValue }) => {
                const fid = getFieldValue('frontend_product_id')
                return (
                  <Form.Item name="frontend_product_id" noStyle>
                    <Input
                      placeholder="例：163522"
                      addonAfter={
                        <Button
                          type="link" size="small" icon={<LinkOutlined />}
                          disabled={!fid}
                          style={{ padding: 0, height: 'auto', color: fid ? '#1677ff' : '#bfbfbf' }}
                          onClick={() => window.open(`https://greenbox.tw/Products/ItemDetail/${fid}`, '_blank')}
                        >
                          開啟頁面
                        </Button>
                      }
                    />
                  </Form.Item>
                )
              }}
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="大分類" name="mainCategoryId" rules={[{ required: true }]}>
              <Select
                options={categories.map(c => ({
                  value: c.id,
                  label: `${TEMP_LABEL[c.temperature] ?? ''} ${c.name}`,
                }))}
                onChange={v => { setCatId(v); form.setFieldValue('subCategory', undefined) }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="子分類" name="subCategory" rules={[{ required: true }]}>
              <Select
                options={(currentCat?.subCategories ?? []).map(s => ({ value: s.name, label: s.name }))}
                placeholder={catId ? '請選擇子分類' : '請先選大分類'}
                disabled={!catId}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '4px 0 12px' }} />

        {/* === 售價與庫存 === */}
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item label="單位" name="unit" rules={[{ required: true }]}>
              <Input placeholder="包 / 罐 / 盒" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="B2B 採購價" name="b2bPrice" rules={[{ required: true }]}>
              <InputNumber prefix="$" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="成本" name="cost">
              <InputNumber prefix="$" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12} align="bottom">
          <Col flex="100px">
            <Form.Item label="上下架" name="isListed" valuePropName="checked">
              <Switch checkedChildren="上架" unCheckedChildren="下架" />
            </Form.Item>
          </Col>
          <Col flex="auto">
            <Form.Item label="庫存模式" name="stockMode">
              <Segmented block options={STOCK_MODE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col flex="0 0 auto">
            <Form.Item
              label="庫存上限"
              shouldUpdate={(prev, cur) => prev.stockMode !== cur.stockMode}
            >
              {({ getFieldValue }) => {
                const isLimited = getFieldValue('stockMode') === 'limited'
                return (
                  <Form.Item
                    name="stockLimit"
                    noStyle
                    rules={isLimited ? [{ required: true, message: '請填寫庫存上限' }] : []}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: 110 }}
                      placeholder="例：100"
                      disabled={!isLimited}
                    />
                  </Form.Item>
                )
              }}
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '4px 0 12px' }} />

        {/* === 國際條碼 === */}
        <Row gutter={12} align="middle">
          <Col span={10}>
            <Form.Item label="EAN-13" name="barcode_ean13" style={{ marginBottom: 0 }}>
              <Input placeholder="12 或 13 碼" maxLength={13} />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item shouldUpdate={(p, c) => p.barcode_ean13 !== c.barcode_ean13} style={{ marginBottom: 0 }}>
              {({ getFieldValue }) => (
                <div style={{
                  padding: 8, background: '#fff', border: '1px solid #f0f0f0',
                  borderRadius: 6, display: 'flex', justifyContent: 'center', alignItems: 'center',
                  minHeight: 80,
                }}>
                  <Barcode value={getFieldValue('barcode_ean13')} height={48} moduleWidth={1.6} />
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0 12px' }} />

        {/* === 備註 === */}
        <Form.Item label="備註說明" name="remark" style={{ marginBottom: 0 }}>
          <Input.TextArea rows={2} placeholder="選填，內部備註（通路端不可見）" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default function AdminProducts() {
  const [productList,    setProductList]    = useState(initialProducts)
  const [categories]                        = useState(initCategories)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [editing,        setEditing]        = useState(null)
  const [modalOpen,      setModalOpen]      = useState(false)

  const filtered = useMemo(() =>
    productList.filter(p =>
      !categoryFilter || getProductCatId(p, categories) === categoryFilter
    ),
  [productList, categoryFilter, categories])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(p => {
      const catId   = getProductCatId(p, categories)
      const mainCat = categories.find(c => c.id === catId) ?? categories[0]
      const key = `${catId}__${p.subCategory}`
      if (!map[key]) map[key] = {
        mainCatId: catId, mainCatName: mainCat.name,
        temperature: mainCat.temperature, subCategory: p.subCategory, items: [],
      }
      map[key].items.push(p)
    })
    // 依大分類順序排列
    return Object.values(map).sort((a, b) => {
      const ai = categories.findIndex(c => c.id === a.mainCatId)
      const bi = categories.findIndex(c => c.id === b.mainCatId)
      return ai - bi
    })
  }, [filtered, categories])

  const openAdd    = () => { setEditing(null); setModalOpen(true) }
  const openEdit   = (p) => { setEditing(p);   setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = (values) => {
    if (values.id) {
      setProductList(prev => prev.map(p => p.id === values.id ? { ...p, ...values } : p))
      message.success('商品已更新')
    } else {
      const newId = `p${Date.now()}`
      setProductList(prev => [...prev, {
        ...values, id: newId,
        thumbnailUrl: values.thumbnailUrl ?? '',
        isListed:     values.isListed     ?? true,
        stockMode:    values.stockMode    ?? 'unlimited',
        stockLimit:   values.stockLimit   ?? null,
      }])
      message.success('商品已新增')
    }
  }

  const handleDelete = (id) => {
    setProductList(prev => prev.filter(p => p.id !== id))
    message.success('商品已刪除')
  }

  const handleToggleListed = (id, val) => {
    setProductList(prev => prev.map(p => p.id === id ? { ...p, isListed: val } : p))
  }

  const handleStockModeChange = (id, mode) => {
    setProductList(prev => prev.map(p => p.id === id
      ? { ...p, stockMode: mode, stockLimit: mode === 'limited' ? (p.stockLimit ?? 100) : null }
      : p
    ))
  }

  const handleStockLimitChange = (id, val) => {
    setProductList(prev => prev.map(p => p.id === id ? { ...p, stockLimit: val } : p))
  }

  const columns = [
    { title: '縮圖', dataIndex: 'thumbnailUrl', width: 56, align: 'center',
      render: v => v
        ? <img src={v} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
        : <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: 4, border: '1px dashed #d9d9d9' }} />
    },
    { title: '項次 ID', dataIndex: 'id', width: 70,
      render: v => <Text code style={{ fontSize: 11 }}>{v}</Text> },
    { title: '商品名稱', dataIndex: 'name',
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          {r.spec && <Tag style={{ fontSize: 11 }}>{r.spec}</Tag>}
          <span>{v}</span>
        </Space>
      )},
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
    { title: '上下架', dataIndex: 'isListed', width: 90, align: 'center',
      render: (v, r) => (
        <Switch
          size="small"
          checked={v !== false}
          checkedChildren="上架"
          unCheckedChildren="下架"
          onChange={val => handleToggleListed(r.id, val)}
        />
      )},
    { title: '庫存模式', width: 260,
      render: (_, r) => (
        <Space size={4}>
          <Segmented
            size="small"
            value={r.stockMode ?? 'unlimited'}
            onChange={mode => handleStockModeChange(r.id, mode)}
            options={STOCK_MODE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
          />
          {r.stockMode === 'limited' && (
            <InputNumber
              size="small"
              min={1}
              value={r.stockLimit ?? 100}
              onChange={val => handleStockLimitChange(r.id, val ?? 1)}
              style={{ width: 70 }}
              placeholder="上限"
            />
          )}
        </Space>
      )},
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
          { label: '商品總數',    value: productList.length },
          { label: '冷凍品項',    value: productList.filter(p => p.category === 'frozen').length },
          { label: '常溫品項',    value: productList.filter(p => p.category === 'ambient').length },
          { label: '缺貨 / 下架', value: productList.filter(p => p.stockMode === 'out_of_stock' || p.isListed === false).length, color: '#ff4d4f' },
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
        <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 160 }}
          options={[
            { value: '', label: '全部分類' },
            ...categories.map(c => ({
              value: c.id,
              label: `${TEMP[c.temperature]?.icon ?? ''} ${c.name}`,
            })),
          ]}
        />
      </Space>

      {grouped.map(g => {
        const ts = TEMP[g.temperature] ?? TEMP.frozen
        return (
          <div key={`${g.mainCatId}__${g.subCategory}`} style={{ marginBottom: 16 }}>
            <div style={{
              background: ts.bg, border: `1px solid ${ts.border}`,
              borderRadius: 4, padding: '4px 12px', fontWeight: 600, marginBottom: 6,
            }}>
              {ts.icon} <span style={{ color: '#888', fontWeight: 400, fontSize: 12, marginRight: 4 }}>{g.mainCatName} ›</span>
              {g.subCategory}
              <Tag style={{ marginLeft: 8, fontWeight: 400 }}>{g.items.length} 項</Tag>
            </div>
            <Table dataSource={g.items} columns={columns} rowKey="id" size="small" pagination={false}
              rowClassName={r => r.isListed === false ? 'row-unlisted' : ''} />
          </div>
        )
      })}

      <ProductModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initial={editing}
        categories={categories}
      />

      <style>{`
        .row-unlisted td { background: #fafafa !important; opacity: 0.6; }
      `}</style>
    </div>
  )
}
