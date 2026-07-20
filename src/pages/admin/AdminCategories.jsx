import { useState, Fragment } from 'react'
import {
  Button, Card, Tag, Typography, Space, Modal, Form, Input,
  Select, Popconfirm, message, Empty,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, HolderOutlined, SaveOutlined, UndoOutlined,
} from '@ant-design/icons'
import { categories as initCategories, products as initProducts } from '../../data/fakeData'

const { Title, Text } = Typography
const LINE = '#1677ff'

const TEMP_OPTIONS = [
  { value: 'frozen',  label: '❄️ 冷凍', color: 'blue'  },
  { value: 'ambient', label: '🌿 常溫', color: 'green' },
]
const tempTag = (temp) => {
  const opt = TEMP_OPTIONS.find(o => o.value === temp) ?? TEMP_OPTIONS[0]
  return <Tag color={opt.color} style={{ fontSize: 11, margin: 0 }}>{opt.label}</Tag>
}

// 把 fromId 依「插入到 toId 之前/之後」重排
function reorder(arr, fromId, toId, before) {
  if (fromId === toId) return arr
  const item = arr.find(x => x.id === fromId)
  if (!item) return arr
  const without = arr.filter(x => x.id !== fromId)
  let idx = without.findIndex(x => x.id === toId)
  if (idx < 0) return arr
  if (!before) idx += 1
  const next = [...without]
  next.splice(idx, 0, item)
  return next
}

const orderSig = (cs, ps) => JSON.stringify([
  cs.map(c => c.id),
  cs.map(c => c.subCategories.map(s => s.id)),
  ps.map(p => p.id),
])

// 插入線 + 落點：畫在兩項之間的間隙，本身也是有效 drop 目標
function DropLine({ active, indent = 0, onDragOver, onDrop }) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ paddingLeft: indent, height: active ? 14 : 7, display: 'flex', alignItems: 'center', transition: 'height .08s' }}
    >
      {active && <div style={{ height: 3, width: '100%', background: LINE, borderRadius: 2 }} />}
    </div>
  )
}

function CategoryModal({ open, onClose, onSave, initial }) {
  const [form] = Form.useForm()
  return (
    <Modal
      open={open} onCancel={onClose} destroyOnClose
      onOk={() => form.validateFields().then(v => { onSave({ ...initial, ...v }); onClose() })}
      title={initial?.id ? '編輯大分類' : '新增大分類'} okText="儲存" cancelText="取消"
      afterOpenChange={isOpen => { if (isOpen) form.setFieldsValue({ name: '', temperature: 'frozen', ...initial }) }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label="分類名稱" name="name" rules={[{ required: true }]}>
          <Input placeholder="例：大人系" maxLength={20} />
        </Form.Item>
        <Form.Item label="溫層" name="temperature" rules={[{ required: true }]}>
          <Select options={TEMP_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

function SubCategoryModal({ open, onClose, onSave, initial, parentName }) {
  const [form] = Form.useForm()
  return (
    <Modal
      open={open} onCancel={onClose} destroyOnClose
      onOk={() => form.validateFields().then(v => { onSave({ ...initial, ...v }); onClose() })}
      title={initial?.id ? `編輯子分類（${parentName}）` : `新增子分類（${parentName}）`} okText="儲存" cancelText="取消"
      afterOpenChange={isOpen => { if (isOpen) form.setFieldsValue({ name: '', ...initial }) }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label="子分類名稱" name="name" rules={[{ required: true }]}>
          <Input placeholder="例：4-6個月-小寶" maxLength={30} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default function AdminCategories() {
  const [cats, setCats]   = useState(initCategories)
  const [prods, setProds] = useState(initProducts)
  const [savedCats, setSavedCats]   = useState(initCategories)
  const [savedProds, setSavedProds] = useState(initProducts)

  const [selectedId, setSelectedId] = useState(initCategories[0]?.id ?? null)
  const [catModal, setCatModal] = useState({ open: false, initial: null })
  const [subModal, setSubModal] = useState({ open: false, initial: null })

  const [drag,   setDrag]   = useState(null)   // { kind, id }
  const [marker, setMarker] = useState(null)   // { kind, id, before }

  const selected = cats.find(c => c.id === selectedId)
  const dirty = orderSig(cats, prods) !== orderSig(savedCats, savedProds)

  const saveOrder   = () => { setSavedCats(cats); setSavedProds(prods); message.success('排序已儲存（寫回資料庫）') }
  const revertOrder = () => { setCats(savedCats); setProds(savedProds); setMarker(null); message.info('已還原為上次儲存的排序') }

  const gapIndex = (kind, ids) => {
    if (!marker || marker.kind !== kind) return -1
    const i = ids.indexOf(marker.id)
    if (i < 0) return -1
    return marker.before ? i : i + 1
  }
  const endDrag = () => { setDrag(null); setMarker(null) }

  // 落點提示：滑過「列」時依上/下半判定 before/after
  const overRow = (kind, id, guardOk = true) => (e) => {
    if (!drag || drag.kind !== kind || !guardOk) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'   // 沒設會被瀏覽器判定不可放，drop 不會觸發
    const r = e.currentTarget.getBoundingClientRect()
    setMarker({ kind, id, before: (e.clientY - r.top) < r.height / 2 })
  }
  // 落點提示：滑過「間隙」時直接指定該間隙的落點
  const overGap = (kind, target) => (e) => {
    if (!drag || drag.kind !== kind || !target) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setMarker({ kind, ...target })
  }
  // 放開：一律用目前 marker 落點寫入（列或間隙放開都適用）
  const commitDrop = (kind) => {
    if (drag && marker && marker.kind === kind) {
      const { id: targetId, before } = marker
      if (kind === 'cat') setCats(prev => reorder(prev, drag.id, targetId, before))
      else if (kind === 'sub') setCats(prev => prev.map(c => c.id === selectedId ? { ...c, subCategories: reorder(c.subCategories, drag.id, targetId, before) } : c))
      else if (kind === 'prod') {
        const dp = prods.find(p => p.id === drag.id), tp = prods.find(p => p.id === targetId)
        if (dp && tp && dp.subCategory === tp.subCategory) setProds(prev => reorder(prev, drag.id, targetId, before))
      }
    }
    endDrag()
  }

  const applyCats = (fn) => { setCats(prev => fn(prev)); setSavedCats(prev => fn(prev)) }
  const saveCat = (values) => {
    if (values.id) { applyCats(prev => prev.map(c => c.id === values.id ? { ...c, ...values } : c)); message.success('大分類已更新') }
    else {
      const newCat = { ...values, id: `cat_${Date.now()}`, subCategories: [] }
      applyCats(prev => [...prev, newCat]); setSelectedId(newCat.id); message.success('大分類已新增')
    }
  }
  const deleteCat = (id) => {
    applyCats(prev => prev.filter(c => c.id !== id))
    if (selectedId === id) setSelectedId(cats.filter(c => c.id !== id)[0]?.id ?? null)
    message.success('大分類已刪除')
  }
  const saveSub = (catId, values) => {
    // id 先算好再進 applyCats：applyCats 會對 cats / savedCats 各跑一次函式，
    // 若在函式內產生 id（Date.now）兩份資料可能拿到不同 id，導致誤判 dirty。
    const newSub = values.id ? null : { ...values, id: `sc_${Date.now()}` }
    applyCats(prev => prev.map(c => {
      if (c.id !== catId) return c
      if (values.id) return { ...c, subCategories: c.subCategories.map(s => s.id === values.id ? { ...s, ...values } : s) }
      return { ...c, subCategories: [...c.subCategories, newSub] }
    }))
    message.success(values.id ? '子分類已更新' : '子分類已新增')
  }
  const deleteSub = (catId, subId) => {
    applyCats(prev => prev.map(c => c.id === catId ? { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) } : c))
    message.success('子分類已刪除')
  }

  const prodsOfSub = (subName) => prods.filter(p => p.subCategory === subName)
  const catIds = cats.map(c => c.id)
  const catGap = gapIndex('cat', catIds)
  const subIds = selected ? selected.subCategories.map(s => s.id) : []
  const subGap = selected ? gapIndex('sub', subIds) : -1

  // 間隙 g 對應的落點（before 第 g 項；g===長度時 = after 最後一項）
  const gapTarget = (ids, g) => ids.length === 0 ? null : (g < ids.length ? { id: ids[g], before: true } : { id: ids[ids.length - 1], before: false })

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ margin: '0 0 12px' }}>分類管理</Title>

      {dirty && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '8px 14px', marginBottom: 12,
          background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8,
        }}>
          <span style={{ fontSize: 13, color: '#ad6800', lineHeight: 1.6 }}>
            排序已變更，尚未寫回資料庫。<br />
            按「儲存排序」將一次寫回，新排序將全站前後台共用。
          </span>
          <Space>
            <Button size="small" icon={<UndoOutlined />} onClick={revertOrder}>還原</Button>
            <Button size="small" type="primary" icon={<SaveOutlined />} onClick={saveOrder}>儲存排序</Button>
          </Space>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* ── 左欄：大分類 ── */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px 4px' }}>
            <Text strong style={{ fontSize: 14 }}>大分類</Text>
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setCatModal({ open: true, initial: null })}>
              新增大分類
            </Button>
          </div>

          {cats.map((cat, i) => {
            const isSel = selectedId === cat.id
            return (
              <Fragment key={cat.id}>
                <DropLine active={catGap === i} onDragOver={overGap('cat', gapTarget(catIds, i))} onDrop={() => commitDrop('cat')} />
                <div
                  draggable
                  onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDrag({ kind: 'cat', id: cat.id }) }}
                  onDragEnd={endDrag}
                  onDragOver={overRow('cat', cat.id)}
                  onDrop={() => commitDrop('cat')}
                  onClick={() => setSelectedId(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8,
                    cursor: 'pointer',
                    border: `1px solid ${isSel ? '#91caff' : '#f0f0f0'}`,
                    borderLeft: `3px solid ${isSel ? LINE : 'transparent'}`,
                    background: drag?.id === cat.id ? '#f5f5f5' : isSel ? '#f0f7ff' : '#fff',
                    opacity: drag?.id === cat.id ? 0.4 : 1,
                    boxShadow: isSel ? '0 1px 4px rgba(22,119,255,0.12)' : 'none',
                  }}
                >
                  <HolderOutlined style={{ color: '#bbb', cursor: 'grab', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: isSel ? '#0958d9' : '#262626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</div>
                    <Space size={6} style={{ marginTop: 3 }}>
                      {tempTag(cat.temperature)}
                      <Text type="secondary" style={{ fontSize: 11 }}>{cat.subCategories.length} 子分類</Text>
                    </Space>
                  </div>
                  <Space size={0} onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
                    <Button size="small" type="text" icon={<EditOutlined />} onClick={() => setCatModal({ open: true, initial: cat })} />
                    <Popconfirm
                      title={`確認刪除「${cat.name}」？`}
                      description={cat.subCategories.length > 0 ? `此分類下有 ${cat.subCategories.length} 個子分類，也將一併刪除。` : undefined}
                      okText="刪除" okButtonProps={{ danger: true }} cancelText="取消" onConfirm={() => deleteCat(cat.id)}
                    >
                      <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>
              </Fragment>
            )
          })}
          <DropLine active={catGap === cats.length} onDragOver={overGap('cat', gapTarget(catIds, cats.length))} onDrop={() => commitDrop('cat')} />
        </div>

        {/* ── 右欄：子分類 + 商品 ── */}
        <Card
          style={{ flex: 1, minWidth: 0 }} size="small"
          title={selected
            ? <Space><span style={{ fontWeight: 700 }}>{selected.name}的子分類</span>{tempTag(selected.temperature)}</Space>
            : '請先點選一個大分類'}
          extra={selected && (
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setSubModal({ open: true, initial: null })}>
              新增子分類
            </Button>
          )}
        >
          {!selected && <Empty description="請在左側點選一個大分類" style={{ padding: '40px 0' }} />}
          {selected && selected.subCategories.length === 0 && (
            <Empty description="尚無子分類，點右上角「新增子分類」" style={{ padding: '40px 0' }} />
          )}

          {selected && selected.subCategories.map((sub, si) => {
            const items = prodsOfSub(sub.name)
            const itemIds = items.map(p => p.id)
            const accent = selected.temperature === 'frozen' ? '#1677ff' : '#52c41a'
            const softBg = selected.temperature === 'frozen' ? '#f0f7ff' : '#f4fbef'
            const prodGap = gapIndex('prod', itemIds)
            const dragProdInThisSub = drag?.kind === 'prod' && prods.find(x => x.id === drag.id)?.subCategory === sub.name
            return (
              <Fragment key={sub.id}>
                <DropLine active={subGap === si} onDragOver={overGap('sub', gapTarget(subIds, si))} onDrop={() => commitDrop('sub')} />
                {/* 整個子分類區塊都是子分類的放置目標（滑過任一處都能重排，不用對準細縫） */}
                <div
                  onDragOver={overRow('sub', sub.id)}
                  onDrop={() => commitDrop('sub')}
                  style={{ border: '1px solid #eef0f2', borderRadius: 8, overflow: 'hidden' }}
                >
                  {/* 子分類標頭（拖曳把手） */}
                  <div
                    draggable
                    onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDrag({ kind: 'sub', id: sub.id }) }}
                    onDragEnd={endDrag}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                      background: drag?.id === sub.id ? '#f5f5f5' : softBg,
                      borderLeft: `3px solid ${accent}`,
                      opacity: drag?.id === sub.id ? 0.4 : 1, cursor: 'grab',
                    }}
                  >
                    <HolderOutlined style={{ color: accent, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 14, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</span>
                    <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>{items.length} 項</Text>
                    <Space size={0} onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
                      <Button size="small" type="text" icon={<EditOutlined />} onClick={() => setSubModal({ open: true, initial: sub })} />
                      <Popconfirm title={`確認刪除「${sub.name}」？`} okText="刪除" okButtonProps={{ danger: true }} cancelText="取消" onConfirm={() => deleteSub(selected.id, sub.id)}>
                        <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </div>

                  {/* 商品（縮排 + 留白呈現層級；插入線在項目之間） */}
                  <div style={{ padding: '4px 8px 6px 20px' }}>
                    {items.length === 0
                      ? <div style={{ padding: '8px 4px', color: '#bbb', fontSize: 12 }}>此子分類尚無商品（商品的分類歸屬於「商品管理」設定）</div>
                      : <>
                        {items.map((p, pi) => (
                          <Fragment key={p.id}>
                            <DropLine active={prodGap === pi} onDragOver={overGap('prod', dragProdInThisSub ? gapTarget(itemIds, pi) : null)} onDrop={() => commitDrop('prod')} />
                            <div
                              draggable
                              onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDrag({ kind: 'prod', id: p.id }) }}
                              onDragEnd={endDrag}
                              onDragOver={overRow('prod', p.id, dragProdInThisSub)}
                              onDrop={() => commitDrop('prod')}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6,
                                background: drag?.id === p.id ? '#f5f5f5' : '#fff',
                                opacity: drag?.id === p.id ? 0.4 : 1, cursor: 'grab',
                              }}
                            >
                              <HolderOutlined style={{ color: '#ccc', flexShrink: 0, fontSize: 12 }} />
                              <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.spec && <Tag style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px', marginRight: 4 }}>{p.spec}</Tag>}
                                {p.name}
                              </span>
                              {!p.isListed && <Tag color="default" style={{ fontSize: 10, margin: 0 }}>未上架</Tag>}
                              <Text type="secondary" style={{ fontSize: 13, flexShrink: 0 }}>${p.b2bPrice}</Text>
                            </div>
                          </Fragment>
                        ))}
                        <DropLine active={prodGap === items.length} onDragOver={overGap('prod', dragProdInThisSub ? gapTarget(itemIds, items.length) : null)} onDrop={() => commitDrop('prod')} />
                      </>}
                  </div>
                </div>
              </Fragment>
            )
          })}
          {selected && selected.subCategories.length > 0 && (
            <DropLine active={subGap === selected.subCategories.length} onDragOver={overGap('sub', gapTarget(subIds, selected.subCategories.length))} onDrop={() => commitDrop('sub')} />
          )}
        </Card>
      </div>

      <CategoryModal
        open={catModal.open}
        onClose={() => setCatModal({ open: false, initial: null })}
        onSave={saveCat}
        initial={catModal.initial}
      />
      <SubCategoryModal
        open={subModal.open}
        onClose={() => setSubModal({ open: false, initial: null })}
        onSave={(values) => selected && saveSub(selected.id, values)}
        initial={subModal.initial}
        parentName={selected?.name ?? ''}
      />
    </div>
  )
}
