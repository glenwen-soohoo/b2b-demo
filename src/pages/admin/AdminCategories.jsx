import { useState } from 'react'
import {
  Button, Card, Tag, Typography, Space, Modal, Form, Input,
  Select, Popconfirm, message, Empty, Tooltip, Divider,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, HolderOutlined,
  MenuOutlined, SaveOutlined, CloseOutlined,
} from '@ant-design/icons'
import { categories as initCategories } from '../../data/fakeData'

const { Title, Text } = Typography

const TEMP_OPTIONS = [
  { value: 'frozen',  label: '❄️ 冷凍', color: 'blue'  },
  { value: 'ambient', label: '🌿 常溫', color: 'green' },
]

const tempTag = (temp) => {
  const opt = TEMP_OPTIONS.find(o => o.value === temp) ?? TEMP_OPTIONS[0]
  return <Tag color={opt.color} style={{ fontSize: 11 }}>{opt.label}</Tag>
}

// ── 大分類 Modal ──────────────────────────────
function CategoryModal({ open, onClose, onSave, initial }) {
  const [form] = Form.useForm()
  return (
    <Modal
      open={open} onCancel={onClose} destroyOnClose
      onOk={() => form.validateFields().then(v => { onSave({ ...initial, ...v }); onClose() })}
      title={initial?.id ? '編輯大分類' : '新增大分類'}
      okText="儲存" cancelText="取消"
      afterOpenChange={isOpen => {
        if (isOpen) form.setFieldsValue({ name: '', temperature: 'frozen', ...initial })
      }}
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

// ── 子分類 Modal ──────────────────────────────
function SubCategoryModal({ open, onClose, onSave, initial, parentName }) {
  const [form] = Form.useForm()
  return (
    <Modal
      open={open} onCancel={onClose} destroyOnClose
      onOk={() => form.validateFields().then(v => { onSave({ ...initial, ...v }); onClose() })}
      title={initial?.id ? `編輯子分類（${parentName}）` : `新增子分類（${parentName}）`}
      okText="儲存" cancelText="取消"
      afterOpenChange={isOpen => {
        if (isOpen) form.setFieldsValue({ name: '', ...initial })
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label="子分類名稱" name="name" rules={[{ required: true }]}>
          <Input placeholder="例：4-6個月-小寶" maxLength={30} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

// ── 插入線輔助元件（定義在外部，避免每次 render 被 React 視為新元件型別）──
function CardGap({ idx, insertAtIdx, dragCatIdx, onDragOver, onDrop }) {
  const active = insertAtIdx === idx && dragCatIdx !== null
  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver(idx) }}
      onDrop={() => onDrop(idx)}
      style={{
        width: active ? 28 : 10,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'width 0.12s',
      }}
    >
      {active && (
        <div style={{ width: 3, height: '80%', background: '#1677ff', borderRadius: 2 }} />
      )}
    </div>
  )
}

function SubGap({ catId, idx, insertBeforeSubIdx, dragSubId, onDragOver, onDrop }) {
  const active = insertBeforeSubIdx === idx && dragSubId !== null
  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver(idx) }}
      onDrop={() => onDrop(catId, idx)}
      style={{
        height: active ? 20 : 4,
        transition: 'height 0.1s',
        display: 'flex', alignItems: 'center',
        paddingLeft: 8,
      }}
    >
      {active && (
        <div style={{ height: 2, width: '100%', background: '#1677ff', borderRadius: 1 }} />
      )}
    </div>
  )
}

// ── 主頁面 ────────────────────────────────────
export default function AdminCategories() {
  const [cats,       setCats]       = useState(initCategories)
  const [selectedId, setSelectedId] = useState(initCategories[0]?.id ?? null)
  const [catModal,   setCatModal]   = useState({ open: false, initial: null })
  const [subModal,   setSubModal]   = useState({ open: false, initial: null })

  // 排序模式
  const [sortMode, setSortMode] = useState(false)
  const [draft,    setDraft]    = useState(null)   // 排序模式暫存

  // 大分類卡片拖曳
  const [dragCatIdx,  setDragCatIdx]  = useState(null)
  const [insertAtIdx, setInsertAtIdx] = useState(null)

  // 子分類拖曳
  const [dragSubId,       setDragSubId]       = useState(null)
  const [insertBeforeSubIdx, setInsertBeforeSubIdx] = useState(null)

  // 顯示用資料來源：排序模式用 draft，否則用正式資料
  const displayCats = sortMode && draft ? draft : cats
  const selected    = displayCats.find(c => c.id === selectedId)

  // ── 排序模式切換 ──
  const enterSortMode = () => {
    setDraft(cats.map(c => ({ ...c, subCategories: [...c.subCategories] })))
    setSortMode(true)
  }
  const cancelSortMode = () => {
    setDraft(null)
    setSortMode(false)
    setDragCatIdx(null); setInsertAtIdx(null)
    setDragSubId(null); setInsertBeforeSubIdx(null)
    message.info('已取消排序變更')
  }
  const saveSortMode = () => {
    setCats(draft)
    setDraft(null)
    setSortMode(false)
    message.success('排序已更新')
  }

  // ── 大分類卡片拖曳 ──（僅排序模式有效）
  const handleCatDrop = (insertIdx) => {
    if (!sortMode || dragCatIdx === null) return
    setDraft(prev => {
      const next = [...prev]
      const [item] = next.splice(dragCatIdx, 1)
      const adjusted = insertIdx > dragCatIdx ? insertIdx - 1 : insertIdx
      next.splice(adjusted, 0, item)
      return next
    })
    setDragCatIdx(null)
    setInsertAtIdx(null)
  }

  // ── 大分類 CRUD ──
  const saveCat = (values) => {
    if (values.id) {
      setCats(prev => prev.map(c => c.id === values.id ? { ...c, ...values } : c))
      message.success('大分類已更新')
    } else {
      const newCat = { ...values, id: `cat_${Date.now()}`, subCategories: [] }
      setCats(prev => [...prev, newCat])
      setSelectedId(newCat.id)
      message.success('大分類已新增')
    }
  }

  const deleteCat = (id) => {
    setCats(prev => {
      const next = prev.filter(c => c.id !== id)
      if (selectedId === id) setSelectedId(next[0]?.id ?? null)
      return next
    })
    message.success('大分類已刪除')
  }

  // ── 子分類拖曳 ──（僅排序模式有效）
  const handleSubDrop = (catId, insertBeforeIdx) => {
    if (!sortMode || !dragSubId) return
    setDraft(prev => prev.map(c => {
      if (c.id !== catId) return c
      const subs    = [...c.subCategories]
      const fromIdx = subs.findIndex(s => s.id === dragSubId)
      if (fromIdx === -1) return c
      const [item]  = subs.splice(fromIdx, 1)
      const toIdx   = insertBeforeIdx > fromIdx ? insertBeforeIdx - 1 : insertBeforeIdx
      subs.splice(toIdx, 0, item)
      return { ...c, subCategories: subs }
    }))
    setDragSubId(null)
    setInsertBeforeSubIdx(null)
  }

  // ── 子分類 CRUD ──
  const saveSub = (catId, values) => {
    setCats(prev => prev.map(c => {
      if (c.id !== catId) return c
      if (values.id) {
        return { ...c, subCategories: c.subCategories.map(s => s.id === values.id ? { ...s, ...values } : s) }
      }
      return { ...c, subCategories: [...c.subCategories, { ...values, id: `sc_${Date.now()}` }] }
    }))
    message.success(values.id ? '子分類已更新' : '子分類已新增')
  }

  const deleteSub = (catId, subId) => {
    setCats(prev => prev.map(c =>
      c.id === catId ? { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) } : c
    ))
    message.success('子分類已刪除')
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>分類管理</Title>
          {sortMode && (
            <Tag color="processing" style={{ marginLeft: 8 }}>排序模式中</Tag>
          )}
        </Space>
        <Space>
          {!sortMode ? (
            <>
              <Button icon={<MenuOutlined />} onClick={enterSortMode}>
                調整排序
              </Button>
              <Button type="primary" icon={<PlusOutlined />}
                onClick={() => setCatModal({ open: true, initial: null })}>
                新增大分類
              </Button>
            </>
          ) : (
            <>
              <Button icon={<CloseOutlined />} onClick={cancelSortMode}>
                取消
              </Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={saveSortMode}>
                儲存排序
              </Button>
            </>
          )}
        </Space>
      </div>

      {sortMode && (
        <div style={{
          padding: '8px 12px', marginBottom: 12,
          background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6,
          fontSize: 12, color: '#0958d9',
        }}>
          🔀 排序模式：可拖曳大分類卡片與子分類列調整順序，完成後按「儲存排序」；
          期間其他操作（新增／編輯／刪除）已暫停。
        </div>
      )}

      {/* ── 大分類卡片（插入式拖曳排序）── */}
      <div
        style={{ display: 'flex', marginBottom: 20, alignItems: 'stretch' }}
        onDragLeave={e => {
          // 只在離開整個容器時才清除
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setInsertAtIdx(null)
          }
        }}
      >
        {displayCats.map((cat, idx) => (
          <div key={cat.id} style={{ display: 'flex', flex: 1, minWidth: 0, alignItems: 'stretch' }}>
            <CardGap
              idx={idx}
              insertAtIdx={insertAtIdx}
              dragCatIdx={dragCatIdx}
              onDragOver={setInsertAtIdx}
              onDrop={handleCatDrop}
            />
            <div
              style={{ flex: 1 }}
              draggable={sortMode}
              onDragStart={() => sortMode && setDragCatIdx(idx)}
              onDragEnd={() => { setDragCatIdx(null); setInsertAtIdx(null) }}
            >
              <Card
                size="small" hoverable={!sortMode}
                style={{
                  cursor: sortMode ? 'grab' : 'pointer',
                  height: '100%',
                  border: selectedId === cat.id ? '2px solid #1677ff' : '1px solid #f0f0f0',
                  background: dragCatIdx === idx ? '#f5f5f5' : selectedId === cat.id ? '#e6f4ff' : '#fff',
                  opacity: dragCatIdx === idx ? 0.5 : 1,
                  transition: 'opacity 0.15s, background 0.15s',
                }}
                onClick={() => setSelectedId(cat.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {sortMode && <HolderOutlined style={{ color: '#1677ff', fontSize: 13 }} />}
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{cat.name}</span>
                    </div>
                    <Space size={4}>
                      {tempTag(cat.temperature)}
                      <Tag style={{ fontSize: 11 }}>{cat.subCategories.length} 個子分類</Tag>
                    </Space>
                  </div>
                  {!sortMode && (
                    <Space size={2} onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
                      <Button size="small" icon={<EditOutlined />}
                        onClick={() => setCatModal({ open: true, initial: cat })} />
                      <Popconfirm
                        title={`確認刪除「${cat.name}」？`}
                        description={cat.subCategories.length > 0
                          ? `此分類下有 ${cat.subCategories.length} 個子分類，也將一併刪除。`
                          : undefined}
                        okText="刪除" okButtonProps={{ danger: true }}
                        cancelText="取消" onConfirm={() => deleteCat(cat.id)}
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  )}
                </div>
              </Card>
            </div>
          </div>
        ))}
        {/* 最後一個 gap */}
        <CardGap
          idx={cats.length}
          insertAtIdx={insertAtIdx}
          dragCatIdx={dragCatIdx}
          onDragOver={setInsertAtIdx}
          onDrop={handleCatDrop}
        />
      </div>

      {/* ── 子分類面板 ── */}
      <Card
        title={
          selected
            ? <Space>
                <span style={{ fontWeight: 700 }}>{selected.name} ─ 子分類</span>
                {tempTag(selected.temperature)}
              </Space>
            : '請先點選一個大分類'
        }
        size="small"
        extra={
          selected && !sortMode && (
            <Button size="small" type="primary" icon={<PlusOutlined />}
              onClick={() => setSubModal({ open: true, initial: null })}>
              新增子分類
            </Button>
          )
        }
      >
        {!selected && (
          <Empty description="請在上方點選一個大分類" style={{ padding: '40px 0' }} />
        )}

        {selected && selected.subCategories.length === 0 && (
          <Empty description="尚無子分類，點擊右上角「新增子分類」" style={{ padding: '40px 0' }} />
        )}

        {selected && selected.subCategories.length > 0 && (
          <div
            onDragLeave={e => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setInsertBeforeSubIdx(null)
              }
            }}
          >
            {/* 欄頭 */}
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '4px 12px 4px 40px',
              background: '#fafafa', borderBottom: '1px solid #f0f0f0',
              fontSize: 12, color: '#999',
            }}>
              <span style={{ flex: 1 }}>子分類名稱</span>
              <span>操作</span>
            </div>

            {selected.subCategories.map((sub, idx) => (
              <div key={sub.id}>
                <SubGap
                  catId={selected.id}
                  idx={idx}
                  insertBeforeSubIdx={insertBeforeSubIdx}
                  dragSubId={dragSubId}
                  onDragOver={setInsertBeforeSubIdx}
                  onDrop={handleSubDrop}
                />
                <div
                  draggable={sortMode}
                  onDragStart={() => { if (sortMode) { setDragSubId(sub.id); setInsertBeforeSubIdx(null) } }}
                  onDragEnd={() => { setDragSubId(null); setInsertBeforeSubIdx(null) }}
                  onDragOver={e => {
                    if (!sortMode || !dragSubId) return
                    e.preventDefault()
                    const rect = e.currentTarget.getBoundingClientRect()
                    const isUpper = (e.clientY - rect.top) < rect.height / 2
                    setInsertBeforeSubIdx(isUpper ? idx : idx + 1)
                  }}
                  onDrop={e => {
                    if (!sortMode || !dragSubId) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const isUpper = (e.clientY - rect.top) < rect.height / 2
                    handleSubDrop(selected.id, isUpper ? idx : idx + 1)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px',
                    borderBottom: '1px solid #f5f5f5',
                    background: dragSubId === sub.id ? '#f5f5f5' : '#fff',
                    opacity: dragSubId === sub.id ? 0.5 : 1,
                    transition: 'background 0.1s',
                    cursor: sortMode ? 'grab' : 'default',
                  }}
                >
                  {sortMode
                    ? (
                      <Tooltip title="拖曳排序">
                        <HolderOutlined style={{ color: '#1677ff', cursor: 'grab' }} />
                      </Tooltip>
                    )
                    : <span style={{ width: 14 }} />}
                  <span style={{ color: '#999', fontSize: 12, width: 22, textAlign: 'right' }}>
                    {idx + 1}
                  </span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{sub.name}</span>
                  {!sortMode && (
                    <Space size={2}>
                      <Button size="small" icon={<EditOutlined />}
                        onClick={() => setSubModal({ open: true, initial: sub })} />
                      <Popconfirm
                        title={`確認刪除「${sub.name}」？`}
                        okText="刪除" okButtonProps={{ danger: true }}
                        cancelText="取消" onConfirm={() => deleteSub(selected.id, sub.id)}
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  )}
                </div>
              </div>
            ))}

            {/* 最後一個 gap */}
            <SubGap
              catId={selected.id}
              idx={selected.subCategories.length}
              insertBeforeSubIdx={insertBeforeSubIdx}
              dragSubId={dragSubId}
              onDragOver={setInsertBeforeSubIdx}
              onDrop={handleSubDrop}
            />

            <Divider style={{ margin: '4px 0' }} />
            <div style={{ padding: '4px 12px 8px', textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                共 {selected.subCategories.length} 個子分類
              </Text>
            </div>
          </div>
        )}
      </Card>

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
