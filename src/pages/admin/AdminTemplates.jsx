import { useState, useMemo } from 'react'
import {
  Table, Button, Typography, Tag, Space, Drawer, Form, Input,
  Tabs, Checkbox, Divider, Popconfirm, message, Badge, Alert, Modal, Select,
  Row, Col, Statistic, Card,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  FileTextOutlined, TeamOutlined, AppstoreOutlined,
} from '@ant-design/icons'
import { products, templates as initTemplates, channels as initChannels } from '../../data/fakeData'

const { Title, Text } = Typography

// ── 商品依 category → subCategory 分組 ─────────────────
function groupProducts(prods) {
  const map = {}
  prods.forEach(p => {
    const k = p.subCategory
    if (!map[k]) map[k] = []
    map[k].push(p)
  })
  return map
}

const frozenProds  = products.filter(p => p.category === 'frozen')
const ambientProds = products.filter(p => p.category === 'ambient')

// ── 商品勾選面板 ─────────────────────────────────────────
function ProductPicker({ value = [], onChange }) {
  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id])
  }
  const toggleGroup = (ids) => {
    const allIn = ids.every(id => value.includes(id))
    if (allIn) onChange(value.filter(id => !ids.includes(id)))
    else       onChange([...new Set([...value, ...ids])])
  }

  function Section({ prods }) {
    const grouped = groupProducts(prods)
    return (
      <>
        {Object.entries(grouped).map(([subCat, items]) => {
          const ids    = items.map(p => p.id)
          const allIn  = ids.every(id => value.includes(id))
          const someIn = ids.some(id => value.includes(id))
          return (
            <div key={subCat} style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fafafa', padding: '4px 10px',
                borderRadius: 4, marginBottom: 6, border: '1px solid #f0f0f0',
              }}>
                <Checkbox
                  checked={allIn}
                  indeterminate={someIn && !allIn}
                  onChange={() => toggleGroup(ids)}
                />
                <Text strong style={{ fontSize: 13 }}>{subCat}</Text>
                <Tag style={{ marginLeft: 'auto' }}>
                  {ids.filter(id => value.includes(id)).length} / {ids.length}
                </Tag>
              </div>
              <div style={{ paddingLeft: 8, display: 'flex', flexWrap: 'wrap', gap: '4px 0' }}>
                {items.map(p => (
                  <div key={p.id} style={{ width: '50%' }}>
                    <Checkbox
                      checked={value.includes(p.id)}
                      onChange={() => toggle(p.id)}
                    >
                      <span style={{ fontSize: 13 }}>{p.name}</span>
                      {p.spec && <Tag style={{ fontSize: 11, marginLeft: 4 }}>{p.spec}</Tag>}
                    </Checkbox>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  const frozenCount  = frozenProds.filter(p => value.includes(p.id)).length
  const ambientCount = ambientProds.filter(p => value.includes(p.id)).length

  const selectAll   = () => onChange(products.map(p => p.id))
  const clearAll    = () => onChange([])
  const selectFrozen  = () => onChange([...new Set([...value, ...frozenProds.map(p => p.id)])])
  const selectAmbient = () => onChange([...new Set([...value, ...ambientProds.map(p => p.id)])])

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>快速選取：</Text>
        <Button size="small" onClick={selectAll}>全選</Button>
        <Button size="small" onClick={clearAll}>清除</Button>
        <Button size="small" onClick={selectFrozen}>全選冷凍</Button>
        <Button size="small" onClick={selectAmbient}>全選常溫</Button>
        <Text style={{ marginLeft: 'auto', fontSize: 13, color: '#1677ff' }}>
          已選 <strong>{value.length}</strong> / {products.length} 項
        </Text>
      </div>
      <Tabs
        size="small"
        items={[
          {
            key: 'frozen',
            label: `❄️ 冷凍（${frozenCount}/${frozenProds.length}）`,
            children: <Section prods={frozenProds} />,
          },
          {
            key: 'ambient',
            label: `🌿 常溫（${ambientCount}/${ambientProds.length}）`,
            children: <Section prods={ambientProds} />,
          },
        ]}
      />
    </div>
  )
}

// ── 模板編輯 Drawer ──────────────────────────────────────
function TemplateDrawer({ open, onClose, onSave, initial }) {
  const [form]        = Form.useForm()
  const [selectedIds, setSelectedIds] = useState([])

  const handleOpen = (visible) => {
    if (visible) {
      form.setFieldsValue({ name: initial?.name ?? '' })
      setSelectedIds(initial?.productIds ?? [])
    }
  }

  const handleSave = () => {
    form.validateFields().then(({ name }) => {
      if (selectedIds.length === 0) {
        message.warning('請至少勾選一項商品')
        return
      }
      onSave({ ...initial, name, productIds: selectedIds })
      onClose()
    })
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={initial?.id ? '編輯模板' : '新增模板'}
      width={720}
      afterOpenChange={handleOpen}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSave}>儲存模板</Button>
        </Space>
      }
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="模板名稱" name="name" rules={[{ required: true, message: '請輸入模板名稱' }]}>
          <Input placeholder="例：冷凍通路標準模板" style={{ maxWidth: 360 }} />
        </Form.Item>
      </Form>

      <Divider orientation="left" plain>商品清單設定</Divider>
      <ProductPicker value={selectedIds} onChange={setSelectedIds} />
    </Drawer>
  )
}

// ── 指派通路 Modal ───────────────────────────────────────
function AssignModal({ open, onClose, template, channelList, onAssign }) {
  const [selected, setSelected] = useState([])

  const handleOpen = (vis) => {
    if (vis) {
      setSelected(channelList.filter(c => c.templateId === template?.id).map(c => c.id))
    }
  }

  return (
    <Modal
      open={open} onCancel={onClose}
      title={<Space><TeamOutlined />指派通路 — {template?.name}</Space>}
      okText="儲存" cancelText="取消"
      afterOpenChange={handleOpen}
      onOk={() => { onAssign(template?.id, selected); onClose() }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        選擇要套用此模板的通路（可多選）
      </Text>
      <Checkbox.Group
        value={selected}
        onChange={setSelected}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {channelList.map(c => (
          <Checkbox key={c.id} value={c.id}>
            <Space>
              {c.name}
              {c.templateId === template?.id && <Tag color="blue">目前套用</Tag>}
            </Space>
          </Checkbox>
        ))}
      </Checkbox.Group>
    </Modal>
  )
}

// ── 主頁面 ───────────────────────────────────────────────
export default function AdminTemplates() {
  const [templateList, setTemplateList] = useState(initTemplates)
  const [channelList,  setChannelList]  = useState(initChannels)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [assigning,    setAssigning]    = useState(null)

  const openAdd  = ()  => { setEditing(null); setDrawerOpen(true) }
  const openEdit = (t) => { setEditing(t);    setDrawerOpen(true) }

  const handleSave = (values) => {
    if (values.id) {
      setTemplateList(prev => prev.map(t => t.id === values.id ? { ...t, ...values } : t))
      message.success('模板已更新')
    } else {
      setTemplateList(prev => [...prev, { ...values, id: `t${Date.now()}` }])
      message.success('模板已建立')
    }
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

  const handleAssign = (templateId, channelIds) => {
    setChannelList(prev => prev.map(c => ({
      ...c,
      templateId: channelIds.includes(c.id) ? templateId : c.templateId,
    })))
    message.success('通路指派已更新')
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
      title: '操作', width: 160, align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<TeamOutlined />}
            onClick={() => setAssigning(r)}>指派通路</Button>
          <Button size="small" icon={<EditOutlined />}
            onClick={() => openEdit(r)}>編輯</Button>
          <Popconfirm
            title="確認刪除此模板？"
            description="若仍有通路套用此模板將無法刪除。"
            okText="刪除" okButtonProps={{ danger: true }} cancelText="取消"
            onConfirm={() => handleDelete(r.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>品項表模板管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增模板</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic title="模板數量" value={templateList.length} suffix="個"
              valueStyle={{ color: '#1677ff', fontSize: 22 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic title="已指派通路" value={channelList.filter(c => c.templateId).length} suffix="個"
              valueStyle={{ color: '#52c41a', fontSize: 22 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic title="未指派通路" value={channelList.filter(c => !c.templateId).length} suffix="個"
              valueStyle={{ color: '#ff4d4f', fontSize: 22 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic title="可用商品總數" value={products.length} suffix="項"
              valueStyle={{ color: '#888', fontSize: 22 }} />
          </Card>
        </Col>
      </Row>

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
      />

      <AssignModal
        open={!!assigning}
        onClose={() => setAssigning(null)}
        template={assigning}
        channelList={channelList}
        onAssign={handleAssign}
      />
    </div>
  )
}
