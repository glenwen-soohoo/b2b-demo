import { useState, useMemo } from 'react'
import {
  Table, Button, Typography, Tag, Space, Drawer, Form, Input, InputNumber,
  Divider, Popconfirm, message, Badge, Alert, Modal, Checkbox, Dropdown,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  FileTextOutlined, HolderOutlined, DownOutlined,
} from '@ant-design/icons'
import { products, templates as initTemplates, channels as initChannels, categories, systemSettings } from '../../data/fakeData'
import { exportQuotationPdf } from '../../utils/exportQuotationPdf'
import { exportBlankOrder } from '../../utils/exportBlankOrder'

const { Title, Text } = Typography

const TEMP_ICON = { frozen: '❄️', ambient: '🌿' }

// 將商品對應到大分類：先比對子分類名稱，找不到則 fallback 溫層
function getProductCatId(product) {
  for (const cat of categories) {
    if (cat.subCategories.some(s => s.name === product.subCategory)) return cat.id
  }
  return categories.find(c => c.temperature === product.category)?.id ?? categories[0].id
}

// 商品依子分類分組
function groupBySubCat(prods) {
  const map = {}
  prods.forEach(p => {
    if (!map[p.subCategory]) map[p.subCategory] = []
    map[p.subCategory].push(p)
  })
  return map
}

// 取得所有子分類，依 categories 順序排列
function getOrderedSubCats() {
  const result = []
  for (const cat of categories) {
    for (const sub of cat.subCategories) {
      result.push({ subCatName: sub.name, catName: cat.name, temperature: cat.temperature })
    }
  }
  // 補上 products 裡有但 categories 沒列到的 subCategory
  const known = new Set(result.map(r => r.subCatName))
  for (const p of products) {
    if (!known.has(p.subCategory)) {
      result.push({ subCatName: p.subCategory, catName: '', temperature: p.category })
      known.add(p.subCategory)
    }
  }
  return result
}

const ORDERED_SUBCATS = getOrderedSubCats()

// 依子分類順序分組
function groupByOrderedSubCat(prods) {
  const map = {}
  prods.forEach(p => {
    if (!map[p.subCategory]) map[p.subCategory] = []
    map[p.subCategory].push(p)
  })
  return ORDERED_SUBCATS
    .filter(s => map[s.subCatName]?.length)
    .map(s => ({ ...s, items: map[s.subCatName] }))
}

// ── 左欄：已選品項（子分類固定順序，組內可拖曳，可改價）──
function SelectedPanel({ orderedIds, priceOverrides, onRemove, onReorder, onPriceChange }) {
  const [dragId,     setDragId]     = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const selectedProducts = orderedIds.map(id => products.find(p => p.id === id)).filter(Boolean)
  const groups = groupByOrderedSubCat(selectedProducts)

  if (groups.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>
        從右側點擊商品加入
      </div>
    )
  }

  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
    // 只允許同子分類內移動
    const dragProd   = products.find(p => p.id === dragId)
    const targetProd = products.find(p => p.id === targetId)
    if (dragProd?.subCategory !== targetProd?.subCategory) { setDragId(null); setDragOverId(null); return }
    const next      = [...orderedIds]
    const fromIdx   = next.indexOf(dragId)
    const toIdx     = next.indexOf(targetId)
    next.splice(fromIdx, 1)
    next.splice(toIdx, 0, dragId)
    onReorder(next)
    setDragId(null); setDragOverId(null)
  }

  let lastCatName = null
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {groups.map(({ subCatName, catName, temperature, items }) => {
        const showCatHeader = catName && catName !== lastCatName
        lastCatName = catName
        return (
          <div key={subCatName}>
            {showCatHeader && (
              <div style={{
                padding: '5px 8px', fontSize: 12, fontWeight: 700, color: '#fff',
                background: temperature === 'frozen' ? '#1677ff' : '#52c41a',
                letterSpacing: 1,
              }}>
                {TEMP_ICON[temperature]} {catName}
              </div>
            )}
            <div style={{
              padding: '3px 8px 3px 16px', fontSize: 11, fontWeight: 600, color: '#666',
              background: temperature === 'frozen' ? '#e6f7ff' : '#f6ffed',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{subCatName}</span>
              <span style={{ color: '#aaa', fontWeight: 400 }}>{items.length} 項</span>
            </div>
            {items.map(p => (
              <div
                key={p.id}
                draggable
                onDragStart={() => setDragId(p.id)}
                onDragOver={e => { e.preventDefault(); setDragOverId(p.id) }}
                onDrop={() => handleDrop(p.id)}
                onDragEnd={() => { setDragId(null); setDragOverId(null) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 8px',
                  background: dragOverId === p.id ? '#e6f4ff' : '#fff',
                  borderBottom: '1px solid #f5f5f5',
                  opacity: dragId === p.id ? 0.4 : 1,
                }}
              >
                <HolderOutlined style={{ color: '#ccc', cursor: 'grab', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.4 }}>
                  {p.spec && <div><Tag style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>{p.spec}</Tag></div>}
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                </div>
                <Text type="secondary" style={{ fontSize: 11, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  預設 ${p.b2bPrice}
                </Text>
                <InputNumber
                  size="small" min={0} prefix="$"
                  value={priceOverrides[p.id] ?? p.b2bPrice}
                  onChange={v => onPriceChange(p.id, v ?? p.b2bPrice)}
                  style={{ width: 90, flexShrink: 0 }}
                />
                <Button
                  type="text" size="small" danger
                  style={{ flexShrink: 0, padding: '0 4px' }}
                  onClick={() => onRemove(p.id)}
                >×</Button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ── 右欄：未選品項（點擊加入）──
function UnselectedPanel({ selectedIds, onAdd }) {
  const unselected = products.filter(p => !selectedIds.includes(p.id))
  const groups = groupByOrderedSubCat(unselected)

  if (groups.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>
        所有商品已全數選入
      </div>
    )
  }

  let lastCatName = null
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {groups.map(({ subCatName, catName, temperature, items }) => {
        const showCatHeader = catName && catName !== lastCatName
        lastCatName = catName
        return (
          <div key={subCatName}>
            {showCatHeader && (
              <div style={{
                padding: '5px 8px', fontSize: 12, fontWeight: 700, color: '#fff',
                background: temperature === 'frozen' ? '#1677ff' : '#52c41a',
                letterSpacing: 1,
              }}>
                {TEMP_ICON[temperature]} {catName}
              </div>
            )}
            <div style={{
              padding: '3px 8px 3px 16px', fontSize: 11, fontWeight: 600, color: '#666',
              background: temperature === 'frozen' ? '#e6f7ff' : '#f6ffed',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{subCatName}</span>
              <span style={{ color: '#aaa', fontWeight: 400 }}>{items.length} 項</span>
            </div>
            {items.map(p => (
              <div
                key={p.id}
                onClick={() => onAdd(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 8px',
                  background: '#fff',
                  borderBottom: '1px solid #f5f5f5',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <div style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.4 }}>
                  {p.spec && <div><Tag style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>{p.spec}</Tag></div>}
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#595959' }}>{p.name}</div>
                </div>
                <span style={{ color: '#1677ff', fontSize: 16, flexShrink: 0 }}>+</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ── 模板編輯 Drawer ──────────────────────────────────────
function TemplateDrawer({ open, onClose, onSave, initial, channelList }) {
  const [form]           = Form.useForm()
  const [orderedIds,     setOrderedIds]     = useState([])
  const [priceOverrides, setPriceOverrides] = useState({})
  const [assignedIds,    setAssignedIds]    = useState([])

  const handleAdd = (id) => {
    setOrderedIds(prev => prev.includes(id) ? prev : [...prev, id])
  }

  const handleRemove = (id) => {
    setOrderedIds(prev => prev.filter(x => x !== id))
  }

  const handleOpen = (visible) => {
    if (visible) {
      form.setFieldsValue({ name: initial?.name ?? '', remark: initial?.remark ?? '' })
      // 新增模板時預設全部商品都加入（依子分類順序）；編輯既有模板則維持原本清單
      const defaultAllIds = ORDERED_SUBCATS
        .flatMap(s => products.filter(p => p.subCategory === s.subCatName).map(p => p.id))
      // 補上 ORDERED_SUBCATS 沒涵蓋到的商品
      const missing = products.filter(p => !defaultAllIds.includes(p.id)).map(p => p.id)
      const allIds = [...defaultAllIds, ...missing]
      setOrderedIds(initial?.id ? (initial.productIds ?? []) : allIds)
      setPriceOverrides(initial?.productPrices ?? {})
      setAssignedIds(channelList.filter(c => c.templateId === initial?.id).map(c => c.id))
    }
  }

  const handleSave = () => {
    form.validateFields().then(({ name, remark }) => {
      if (orderedIds.length === 0) {
        message.warning('請至少選入一項商品')
        return
      }
      onSave({
        ...initial, name, remark: remark || null,
        productIds: orderedIds,
        productPrices: priceOverrides,
        assignedIds,
      })
      onClose()
    })
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={initial?.id ? '編輯模板' : '新增模板'}
      width={960}
      afterOpenChange={handleOpen}
      styles={{ body: { display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' } }}
      extra={
        <Button onClick={onClose}>取消</Button>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0 0' }}>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" size="large" onClick={handleSave}>儲存模板</Button>
          </Space>
        </div>
      }
    >
      {/* 基本資訊 */}
      <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Form form={form} layout="inline" style={{ flex: 1 }}>
            <Form.Item label="模板名稱" name="name" rules={[{ required: true, message: '請輸入模板名稱' }]} style={{ marginBottom: 8 }}>
              <Input placeholder="例：冷凍通路標準模板" style={{ width: 220 }} />
            </Form.Item>
            <Form.Item label="備註" name="remark" style={{ marginBottom: 8 }}>
              <Input placeholder="選填" style={{ width: 200 }} />
            </Form.Item>
          </Form>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 6, fontWeight: 600 }}>套用通路</div>
            <Checkbox.Group
              value={assignedIds}
              onChange={setAssignedIds}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}
            >
              {channelList.map(c => (
                <Checkbox key={c.id} value={c.id}>
                  <span style={{ fontSize: 13 }}>{c.name}</span>
                </Checkbox>
              ))}
            </Checkbox.Group>
          </div>
        </div>
        <Divider style={{ margin: '10px 0 0' }} />
      </div>

      {/* 左右雙欄 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左欄：已選（2/3） */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', borderRight: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', background: '#f6ffed', borderBottom: '1px solid #f0f0f0', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 13 }}>已選品項</Text>
            <Space size={4}>
              <Text style={{ fontSize: 12, color: '#1677ff' }}>{orderedIds.length} 項</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>｜拖曳可調整組內順序，改順序不可跨組</Text>
            </Space>
          </div>
          <SelectedPanel
            orderedIds={orderedIds}
            priceOverrides={priceOverrides}
            onRemove={handleRemove}
            onReorder={setOrderedIds}
            onPriceChange={(id, v) => setPriceOverrides(prev => ({ ...prev, [id]: v }))}
          />
        </div>

        {/* 右欄：未選（1/3） */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', background: '#fafafa', borderBottom: '1px solid #f0f0f0', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 13 }}>未選品項</Text>
            <Text style={{ fontSize: 12, color: '#888' }}>{products.length - orderedIds.length} 項｜點擊加入</Text>
          </div>
          <UnselectedPanel selectedIds={orderedIds} onAdd={handleAdd} />
        </div>
      </div>
    </Drawer>
  )
}


// ── 主頁面 ───────────────────────────────────────────────
export default function AdminTemplates() {
  const [templateList, setTemplateList] = useState(initTemplates)
  const [channelList,  setChannelList]  = useState(initChannels)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [editing,      setEditing]      = useState(null)

  const openAdd  = ()  => { setEditing(null); setDrawerOpen(true) }
  const openEdit = (t) => { setEditing(t);    setDrawerOpen(true) }

  const handleSave = ({ assignedIds, ...values }) => {
    const templateId = values.id ?? `t${Date.now()}`
    if (values.id) {
      setTemplateList(prev => prev.map(t => t.id === values.id ? { ...t, ...values } : t))
    } else {
      setTemplateList(prev => [...prev, { ...values, id: templateId }])
    }
    // 同步通路指派
    setChannelList(prev => prev.map(c => ({
      ...c,
      templateId: assignedIds.includes(c.id) ? templateId : (c.templateId === templateId ? undefined : c.templateId),
    })))
    message.success(values.id ? '模板已更新' : '模板已建立')
  }

  const handleDelete = (id) => {
    const inUse = channelList.some(c => c.templateId === id)
    if (inUse) {
      message.error('此模板仍有通路在使用，請先重新指派通路後再刪除')
      return
    }
    setTemplateList(prev => prev.filter(t => t.id !== id))
    message.success('模板已刪除')
  }

  const columns = [
    {
      title: '模板名稱', dataIndex: 'name',
      render: (v, r) => (
        <Space>
          <FileTextOutlined style={{ color: '#1677ff' }} />
          <Text strong>{v}</Text>
          {r.id === 't001' && <Tag color="blue">預設</Tag>}
        </Space>
      ),
    },
    {
      title: '備註', dataIndex: 'remark',
      render: v => v ? <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: '商品數量', dataIndex: 'productIds', width: 100, align: 'center',
      render: ids => <Badge count={ids?.length ?? 0} color="#1677ff" overflowCount={999} />,
    },
    {
      title: '冷凍 / 常溫', dataIndex: 'productIds', width: 130,
      render: ids => {
        if (!ids) return '-'
        const f = products.filter(p => ids.includes(p.id) && p.category === 'frozen').length
        const a = products.filter(p => ids.includes(p.id) && p.category === 'ambient').length
        return <Space><Tag color="blue">❄️ {f}</Tag><Tag color="green">🌿 {a}</Tag></Space>
      },
    },
    {
      title: '套用通路', width: 200,
      render: (_, r) => {
        const assigned = channelList.filter(c => c.templateId === r.id)
        return assigned.length > 0
          ? <Space wrap size={4}>{assigned.map(c => <Tag key={c.id}>{c.name}</Tag>)}</Space>
          : <Text type="secondary">尚未指派</Text>
      },
    },
    {
      title: '操作', width: 220, align: 'center',
      render: (_, r) => {
        const assigned = channelList.filter(c => c.templateId === r.id)

        // 依模板內容產生 productsByCat（套用模板價格覆寫）
        const buildTemplateProductsByCat = () => {
          const byCat = {}
          for (const pid of (r.productIds ?? [])) {
            const p = products.find(pp => pp.id === pid)
            if (!p) continue
            const overridePrice = r.productPrices?.[pid]
            const adjusted = overridePrice != null && overridePrice !== p.b2bPrice
              ? { ...p, b2bPrice: overridePrice }
              : p
            const cat = categories.find(c => c.subCategories.some(s => s.name === p.subCategory))
              ?? categories.find(c => c.temperature === p.category)
              ?? categories[0]
            if (!byCat[cat.id]) byCat[cat.id] = []
            byCat[cat.id].push(adjusted)
          }
          return byCat
        }

        const doQuotation = async (channel) => {
          try {
            message.loading({ content: '報價單 PDF 產生中…', key: 'exp', duration: 0 })
            await exportQuotationPdf({ template: r, channel })
            message.success({ content: '報價單已下載', key: 'exp' })
          } catch (err) {
            console.error(err)
            message.error({ content: err.message || '匯出失敗', key: 'exp' })
          }
        }

        const doBlankOrder = async (channel) => {
          try {
            message.loading({ content: '空白採購單 Excel 產生中…', key: 'exp', duration: 0 })
            await exportBlankOrder({
              channel: channel ?? { name: '客戶' },
              productsByCat: buildTemplateProductsByCat(),
              categories,
              systemSettings,
            })
            message.success({ content: '空白採購單已下載', key: 'exp' })
          } catch (err) {
            console.error(err)
            message.error({ content: err.message || '匯出失敗', key: 'exp' })
          }
        }

        // Dropdown menu：兩個分組
        const menuItems = [
          { key: 'quo-group', type: 'group', label: '📄 報價單 (PDF)' },
          { key: 'quo-generic', label: '通用報價單（空白客戶）' },
          ...assigned.map(c => ({ key: `quo-${c.id}`, label: `指定：${c.name}` })),
          { type: 'divider' },
          { key: 'bo-group', type: 'group', label: '📋 空白採購單 (Excel)' },
          { key: 'bo-generic', label: '通用空白採購單' },
          ...assigned.map(c => ({ key: `bo-${c.id}`, label: `指定：${c.name}` })),
        ]

        const onMenuClick = ({ key }) => {
          if (key === 'quo-generic')       return doQuotation(null)
          if (key === 'bo-generic')        return doBlankOrder(null)
          if (key.startsWith('quo-'))      return doQuotation(assigned.find(c => c.id === key.slice(4)))
          if (key.startsWith('bo-'))       return doBlankOrder(assigned.find(c => c.id === key.slice(3)))
        }

        return (
          <Space size={4}>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>編輯</Button>
            <Dropdown trigger={['click']} menu={{ items: menuItems, onClick: onMenuClick }}>
              <Button size="small">
                匯出 <DownOutlined style={{ fontSize: 10 }} />
              </Button>
            </Dropdown>
            <Popconfirm
              title="確認刪除此模板？"
              description="若仍有通路套用此模板將無法刪除。"
              okText="刪除" okButtonProps={{ danger: true }} cancelText="取消"
              onConfirm={() => handleDelete(r.id)}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>品項表模板管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增模板</Button>
      </div>

      {channelList.some(c => !c.templateId) && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          message="有通路尚未指派模板，廠商登入後將看不到任何商品。"
        />
      )}

      <Table
        dataSource={templateList}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
      />

      <TemplateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        initial={editing}
        channelList={channelList}
      />
    </div>
  )
}
