import { useState } from 'react'
import {
  Card, Form, Input, Button, Typography, Divider, Space, Tag,
  Table, message, Popconfirm, Modal,
} from 'antd'
import {
  EditOutlined, SaveOutlined, PlusOutlined,
  DeleteOutlined, EnvironmentOutlined,
} from '@ant-design/icons'
import { useVendor } from '../../context/VendorContext'

const { Title, Text } = Typography

function AddressModal({ open, onClose, onSave, initial }) {
  const [form] = Form.useForm()
  return (
    <Modal
      open={open} onCancel={onClose}
      title={initial ? '編輯收件地址' : '新增收件地址'}
      okText="儲存" cancelText="取消"
      destroyOnClose
      onOk={() => form.validateFields().then(v => { onSave(v); onClose() })}
      afterOpenChange={vis => { if (vis) form.setFieldsValue(initial ?? {}) }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label="門市/倉別名稱" name="label" rules={[{ required: true }]}>
          <Input placeholder="例：林口店、總倉" />
        </Form.Item>
        <Form.Item label="收件人" name="recipient" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="聯絡電話" name="phone" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="收件地址" name="address" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="營業時間" name="hours">
          <Input placeholder="例：週一至週五 09:00-17:00" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default function VendorProfile() {
  const { channel, login } = useVendor()

  // 用 local state 維護可編輯的通路資料
  const [info, setInfo]         = useState({ ...channel })
  const [editing, setEditing]   = useState(false)
  const [form]                  = Form.useForm()

  // 收件地址相關
  const [addrList, setAddrList]       = useState(channel.addresses ?? [])
  const [addrModal, setAddrModal]     = useState(false)
  const [editingAddr, setEditingAddr] = useState(null)

  const startEdit = () => {
    form.setFieldsValue(info)
    setEditing(true)
  }

  const saveInfo = () => {
    form.validateFields().then(values => {
      const updated = { ...info, ...values }
      setInfo(updated)
      login({ ...updated, addresses: addrList })   // 同步更新 Context
      setEditing(false)
      message.success('通路資料已儲存')
    })
  }

  const openAddAddr  = ()  => { setEditingAddr(null); setAddrModal(true) }
  const openEditAddr = (a) => { setEditingAddr(a);    setAddrModal(true) }

  const saveAddr = (values) => {
    let next
    if (editingAddr) {
      next = addrList.map(a => a.label === editingAddr.label ? { ...a, ...values } : a)
    } else {
      next = [...addrList, values]
    }
    setAddrList(next)
    login({ ...info, addresses: next })
    message.success('地址已更新')
  }

  const deleteAddr = (label) => {
    const next = addrList.filter(a => a.label !== label)
    setAddrList(next)
    login({ ...info, addresses: next })
    message.success('地址已刪除')
  }

  const addrCols = [
    { title: '門市/倉別', dataIndex: 'label', width: 110 },
    { title: '收件人',   dataIndex: 'recipient', width: 140 },
    { title: '電話',     dataIndex: 'phone', width: 130 },
    { title: '地址',     dataIndex: 'address', ellipsis: true },
    { title: '營業時間', dataIndex: 'hours', ellipsis: true },
    {
      title: '操作', width: 100, align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditAddr(r)} />
          <Popconfirm title="確認刪除此地址？" okText="刪除" okButtonProps={{ danger: true }}
            cancelText="取消" onConfirm={() => deleteAddr(r.label)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>通路資料</Title>
        {!editing
          ? <Button icon={<EditOutlined />} onClick={startEdit}>編輯資料</Button>
          : <Space>
              <Button onClick={() => setEditing(false)}>取消</Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={saveInfo}>儲存</Button>
            </Space>
        }
      </div>

      <Card style={{ marginBottom: 20 }}>
        {editing ? (
          <Form form={form} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item label="通路名稱" name="name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="公司抬頭" name="title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="統一編號" name="taxId" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="聯繫信箱" name="email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="聯繫窗口" name="contact" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="聯繫電話" name="contactPhone">
                <Input />
              </Form.Item>
            </div>
          </Form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {[
              { label: '通路名稱', value: info.name },
              { label: '公司抬頭', value: info.title },
              { label: '統一編號', value: info.taxId },
              { label: '聯繫信箱', value: info.email },
              { label: '聯繫窗口', value: info.contact },
              { label: '聯繫電話', value: info.contactPhone },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 14 }}>{f.value || <Text type="secondary">—</Text>}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 結算資訊（唯讀，需聯繫業務修改） */}
      <Card
        size="small"
        style={{ marginBottom: 20, background: '#fffbe6', border: '1px solid #ffe58f' }}
      >
        <div style={{ fontSize: 12, color: '#ad8b00', marginBottom: 8, fontWeight: 600 }}>
          結算資訊（如需修改請聯繫業務窗口）
        </div>
        <Space split={<Divider type="vertical" />} wrap>
          <Text>結算日：每月 <strong>{info.settlementDay}</strong> 日</Text>
          <Text>月結方式：{info.settlementMethod}</Text>
          <Text>匯款帳號：<Text code>00709001170</Text>（兆豐銀行）</Text>
        </Space>
      </Card>

      {/* 收件地址 */}
      <Card
        title={<Space><EnvironmentOutlined />收件地址</Space>}
        extra={<Button size="small" icon={<PlusOutlined />} onClick={openAddAddr}>新增地址</Button>}
      >
        {addrList.length === 0
          ? <Text type="secondary">尚未設定收件地址，請點擊「新增地址」新增。</Text>
          : <Table dataSource={addrList} columns={addrCols} rowKey="label" size="small" pagination={false} />
        }
      </Card>

      <AddressModal
        open={addrModal}
        onClose={() => setAddrModal(false)}
        onSave={saveAddr}
        initial={editingAddr}
      />
    </div>
  )
}
