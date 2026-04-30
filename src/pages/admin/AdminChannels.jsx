import { useState, useMemo } from 'react'
import {
  Table, Button, Typography, Badge, Space, Modal, Form, Input,
  InputNumber, Select, Popconfirm, message, Divider, Row, Col, Tag, Dropdown,
} from 'antd'
import {
  EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, DownOutlined, ReloadOutlined,
} from '@ant-design/icons'
import { channels as initialChannels, templates, members } from '../../data/fakeData'
import ChannelDetail from '../../components/ChannelDetail'

const { Title } = Typography

const INVOICE_MODE_OPTIONS = [
  { value: 'per_order',         label: '訂單單筆開票' },
  { value: 'monthly_per_store', label: '門市分開月結' },
  { value: 'monthly_combined',  label: '整合月結' },
]

const DELIVERY_TYPE_OPTIONS = [
  { value: 'own_logistics', label: '自有物流' },
  { value: 'third_party',   label: '第三方物流' },
  { value: 'outsource',     label: '外包物流' },
  { value: 'self_pickup',   label: '廠商自取' },
]

const INVOICE_TYPE_OPTIONS = [
  { value: 'two_part',   label: '二聯式' },
  { value: 'three_part', label: '三聯式' },
]

const INVOICE_TYPE_COLOR = {
  two_part:   'default',
  three_part: 'cyan',
}

const INVOICE_MODE_COLOR = {
  per_order:         'default',
  monthly_per_store: 'geekblue',
  monthly_combined:  'purple',
}

function ChannelModal({ open, onClose, onSave, initial }) {
  const [form] = Form.useForm()
  const [bindStatus, setBindStatus] = useState('none')   // 'none' | 'linked' | 'invalid'
  const [binding,    setBinding]    = useState(false)

  // TODO_FRUIT_WEB: 串接 GET /api/Volunteers/findByAccount?account=xxx
  // 上線時改為打 API；找到回傳 { id, name, phone }；找不到回 404 → setBindStatus('invalid')
  const handleBind = async () => {
    const account = form.getFieldValue('memberAccount')
    if (!account) { message.warning('請先輸入會員帳號（Email）'); return }
    setBinding(true)
    await new Promise(r => setTimeout(r, 500))   // mock 驗證延遲
    setBinding(false)
    const found = members.find(m => m.account.toLowerCase() === account.toLowerCase())
    if (!found) {
      setBindStatus('invalid')
      message.error('查無此會員，請確認帳號是否正確')
      return
    }
    form.setFieldsValue({
      memberId:   found.id,
      memberName: found.name,
    })
    setBindStatus('linked')
    message.success(`已綁定會員：${found.name}`)
  }

  const handleUnlink = () => {
    form.setFieldsValue({ memberId: undefined, memberName: undefined })
    setBindStatus('none')
  }

  const handleOk = () => {
    if (bindStatus !== 'linked') {
      message.warning('請先完成會員帳號綁定')
      return
    }
    form.validateFields().then(values => {
      onSave({ ...initial, ...values })
      onClose()
    })
  }

  return (
    <Modal
      open={open} onCancel={onClose} onOk={handleOk}
      title={initial?.id ? '編輯通路' : '新增通路'}
      okText="儲存" cancelText="取消" width={640}
      destroyOnClose
      afterOpenChange={visible => {
        if (visible) {
          form.resetFields()
          form.setFieldsValue(initial ?? {})
          setBindStatus(initial?.memberId ? 'linked' : 'none')
          setBinding(false)
        }
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        {/* 隱藏欄位：儲存綁定後的會員 ID 和姓名 */}
        <Form.Item name="memberId" hidden><Input /></Form.Item>
        <Form.Item name="memberName" hidden><Input /></Form.Item>

        <Divider orientation="left" plain style={{ margin: '0 0 12px' }}>會員綁定</Divider>
        <Form.Item
          label={<span>無毒農會員帳號<span style={{ color: '#8c8c8c', fontWeight: 400, fontSize: 11, marginLeft: 4 }}>（通路即由此會員升級而來）</span></span>}
          name="memberAccount"
          rules={[
            { required: true, message: '請輸入會員帳號' },
            { type: 'email', message: '請輸入正確的 Email 格式' },
          ]}
        >
          <Input
            placeholder="例：buyer@example.com"
            disabled={bindStatus === 'linked'}
            addonAfter={
              bindStatus === 'linked' ? (
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: 'unlink',
                        icon: <ReloadOutlined />,
                        label: '重新綁定',
                        danger: true,
                        onClick: handleUnlink,
                      },
                    ],
                  }}
                >
                  <Button type="link" size="small"
                    style={{ padding: 0, color: '#52c41a', height: 'auto', fontSize: 12 }}
                  >
                    <CheckCircleOutlined style={{ marginRight: 4 }} />
                    已綁定 {form.getFieldValue('memberName')}
                    <DownOutlined style={{ fontSize: 9, marginLeft: 3 }} />
                  </Button>
                </Dropdown>
              ) : bindStatus === 'invalid' ? (
                <Button type="link" size="small" loading={binding}
                  style={{ padding: 0, color: '#ff4d4f', height: 'auto', fontSize: 12 }}
                  onClick={handleBind}
                >
                  <ExclamationCircleOutlined style={{ marginRight: 4 }} />查無會員，重試
                </Button>
              ) : (
                <Button type="link" size="small" loading={binding}
                  style={{ padding: 0, color: '#1677ff', height: 'auto' }}
                  onClick={handleBind}
                >
                  {binding ? '' : '綁定'}
                </Button>
              )
            }
          />
        </Form.Item>

        <Divider orientation="left" plain style={{ margin: '4px 0 12px' }}>基本資料</Divider>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="通路名稱" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="聯繫信箱" name="email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="聯繫窗口" name="contact" rules={[{ required: true }]}>
              <Input placeholder="姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="聯繫電話" name="contactPhone">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="公司抬頭" name="title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="統一編號" name="taxId" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain style={{ margin: '4px 0 12px' }}>結算 &amp; 發票設定</Divider>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item label="結算日" name="settlementDay" rules={[{ required: true }]}>
              <InputNumber min={1} max={31} addonBefore={<span style={{ whiteSpace: 'nowrap' }}>每月</span>} addonAfter="日" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="發票模式" name="invoice_mode" rules={[{ required: true }]}>
              <Select options={INVOICE_MODE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="發票類型" name="invoice_type" rules={[{ required: true }]}>
              <Select options={INVOICE_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="套用品項表模板" name="templateId" rules={[{ required: true }]}>
              <Select options={templates.map(t => ({ value: t.id, label: t.name }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="常用匯款末五碼" name="default_bank_last5">
              <Input placeholder="選填，5碼" maxLength={5} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain style={{ margin: '4px 0 12px' }}>備註</Divider>
        <Form.Item
          label={<span>預設下單備註<span style={{ color: '#8c8c8c', fontWeight: 400, fontSize: 11, marginLeft: 4 }}>（通路端亦可填寫）</span></span>}
          name="default_vendor_note"
        >
          <Input.TextArea
            rows={2}
            placeholder="例：收貨時若包裝破損請先拍照告知；逢週三早上倉庫收件時段為 9:00–12:00"
            maxLength={500}
            showCount
          />
        </Form.Item>
        <Form.Item label="議價說明" name="pricingNote">
          <Input.TextArea rows={2} placeholder="各品項特殊議價說明..." />
        </Form.Item>
        <Form.Item label="量折優惠" name="volumeDiscount">
          <Input.TextArea rows={2} placeholder="達標量折規則..." />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="內部折扣筆記" name="discount_note">
              <Input.TextArea rows={2} placeholder="後台人員使用..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span>預設客服備註<span style={{ color: '#8c8c8c', fontWeight: 400, fontSize: 11, marginLeft: 4 }}>（僅正式後台、自配單可見）</span></span>}
              name="internal_note"
            >
              <Input.TextArea rows={2} placeholder="僅後台可見..." />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default function AdminChannels() {
  const [channelList, setChannelList] = useState(initialChannels)
  const [searchText,  setSearchText]  = useState('')
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

  const filteredList = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    if (!q) return channelList
    return channelList.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.taxId?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    )
  }, [channelList, searchText])

  const columns = [
    { title: '通路名稱', dataIndex: 'name',
      render: (v, r) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => setViewing(r)}>{v}</Button>
      )},
    { title: '統一編號', dataIndex: 'taxId', width: 110 },
    { title: '聯繫信箱', dataIndex: 'email' },
    { title: '聯繫窗口', dataIndex: 'contact', width: 150,
      render: (v, r) => `${v ?? ''}　${r.contactPhone ?? ''}` },
    { title: '發票模式', dataIndex: 'invoice_mode', width: 110,
      render: v => v
        ? <Tag color={INVOICE_MODE_COLOR[v] ?? 'default'} style={{ fontSize: 11 }}>
            {INVOICE_MODE_OPTIONS.find(o => o.value === v)?.label ?? v}
          </Tag>
        : <span style={{ color: '#bbb' }}>—</span>
    },
    { title: '發票類型', dataIndex: 'invoice_type', width: 80,
      render: v => v
        ? <Tag color={INVOICE_TYPE_COLOR[v] ?? 'default'} style={{ fontSize: 11 }}>
            {INVOICE_TYPE_OPTIONS.find(o => o.value === v)?.label ?? v}
          </Tag>
        : <span style={{ color: '#bbb' }}>—</span>
    },
    { title: '結算日', dataIndex: 'settlementDay', width: 100,
      render: v => `每月 ${v} 日` },
    { title: '收件地址', dataIndex: 'addresses', width: 80, align: 'center',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>通路名單管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增通路</Button>
      </div>

      <Input
        prefix={<SearchOutlined />}
        placeholder="搜尋通路名稱 / 統一編號 / 信箱"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        allowClear
        style={{ width: 280, marginBottom: 16 }}
      />

      <Table dataSource={filteredList} columns={columns} rowKey="id" size="small" pagination={false} />

      <ChannelDetail channel={viewing} open={!!viewing} onClose={() => setViewing(null)} />

      <ChannelModal
        open={modalOpen} onClose={closeModal}
        onSave={handleSave} initial={editing}
      />
    </div>
  )
}
