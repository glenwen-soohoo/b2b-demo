import { useState } from 'react'
import {
  Table, Button, Typography, Badge, Space, Modal, Form, Input,
  InputNumber, Select, Popconfirm, message, Divider, Row, Col,
} from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { channels as initialChannels, templates } from '../../data/fakeData'
import ChannelDetail from '../../components/ChannelDetail'

const { Title } = Typography

function ChannelModal({ open, onClose, onSave, initial }) {
  const [form] = Form.useForm()

  const handleOk = () => {
    form.validateFields().then(values => {
      onSave({ ...initial, ...values })
      onClose()
    })
  }

  return (
    <Modal
      open={open} onCancel={onClose} onOk={handleOk}
      title={initial?.id ? '編輯通路' : '新增通路'}
      okText="儲存" cancelText="取消" width={600}
      destroyOnClose
      afterOpenChange={visible => { if (visible) form.setFieldsValue(initial ?? {}) }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Divider orientation="left" plain style={{ margin: '0 0 12px' }}>基本資料</Divider>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="通路名稱" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="公司抬頭" name="title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item label="統一編號" name="taxId" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item label="聯繫信箱" name="email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={10}>
            <Form.Item label="聯繫窗口" name="contact" rules={[{ required: true }]}>
              <Input placeholder="姓名" />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item label="聯繫電話" name="contactPhone">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain style={{ margin: '4px 0 12px' }}>結算設定</Divider>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item label="結算日" name="settlementDay" rules={[{ required: true }]}>
              <InputNumber min={1} max={31} addonBefore="每月" addonAfter="日" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item label="月結方式" name="settlementMethod">
              <Input placeholder="例：由會計手開發票" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="套用品項表模板" name="templateId" rules={[{ required: true }]}>
          <Select options={templates.map(t => ({ value: t.id, label: t.name }))} />
        </Form.Item>

        <Divider orientation="left" plain style={{ margin: '4px 0 12px' }}>備註</Divider>
        <Form.Item label="議價說明" name="pricingNote">
          <Input.TextArea rows={3} placeholder="各品項特殊議價說明..." />
        </Form.Item>
        <Form.Item label="量折優惠" name="volumeDiscount">
          <Input.TextArea rows={3} placeholder="達標量折規則..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default function AdminChannels() {
  const [channelList, setChannelList] = useState(initialChannels)
  const [viewing,   setViewing]   = useState(null)
  const [editing,   setEditing]   = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const openAdd    = ()  => { setEditing({});  setModalOpen(true) }
  const openEdit   = (c) => { setEditing(c);   setModalOpen(true) }
  const closeModal = ()  => { setModalOpen(false); setEditing(null) }

  const handleSave = (values) => {
    if (values.id) {
      setChannelList(prev => prev.map(c => c.id === values.id ? { ...c, ...values } : c))
      message.success('通路資料已更新')
    } else {
      setChannelList(prev => [...prev, { ...values, id: `c${Date.now()}`, addresses: [] }])
      message.success('通路已新增')
    }
  }

  const handleDelete = (id) => {
    setChannelList(prev => prev.filter(c => c.id !== id))
    message.success('通路已刪除')
  }

  const columns = [
    { title: '通路名稱', dataIndex: 'name',
      render: (v, r) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => setViewing(r)}>{v}</Button>
      )},
    { title: '統一編號', dataIndex: 'taxId', width: 110 },
    { title: '聯繫信箱', dataIndex: 'email' },
    { title: '聯繫窗口', dataIndex: 'contact', width: 150,
      render: (v, r) => `${v ?? ''}　${r.contactPhone ?? ''}` },
    { title: '結算日', dataIndex: 'settlementDay', width: 100,
      render: v => `每月 ${v} 日` },
    { title: '收件地址', dataIndex: 'addresses', width: 90, align: 'center',
      render: arr => <Badge count={arr?.length ?? 0} color="#1677ff" /> },
    { title: '操作', width: 150, align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewing(r)}>詳情</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>編輯</Button>
          <Popconfirm
            title="確認刪除此通路？" okText="刪除"
            okButtonProps={{ danger: true }} cancelText="取消"
            onConfirm={() => handleDelete(r.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>通路名單管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增通路</Button>
      </div>

      <Table dataSource={channelList} columns={columns} rowKey="id" size="small" pagination={false} />

      <ChannelDetail channel={viewing} open={!!viewing} onClose={() => setViewing(null)} />

      <ChannelModal
        open={modalOpen} onClose={closeModal}
        onSave={handleSave} initial={editing}
      />
    </div>
  )
}
