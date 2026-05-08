import { useState, useMemo } from 'react'
import {
  Table, Button, Typography, Badge, Space, Modal, Form, Input,
  InputNumber, Select, Popconfirm, message, Divider, Row, Col, Tag, Alert,
} from 'antd'
import {
  EyeOutlined, EditOutlined, PlusOutlined, SearchOutlined,
  KeyOutlined, StopOutlined, PlayCircleOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import { channels as initialChannels, templates } from '../../data/fakeData'
import ChannelDetail from '../../components/ChannelDetail'
import NotificationPreviewModal from '../../components/NotificationPreviewModal'
import { invoiceModeLabel, invoiceModeColor } from '../../utils/invoiceMode'

const { Title, Text } = Typography

// 發票模式為兩個正交軸（語意說明見 utils/invoiceMode.js）：
//   invoicePeriod   = 結算頻率（monthly / per_order）
//   invoiceTaxScope = 統編範圍（channel / per_store）
const INVOICE_PERIOD_OPTIONS = [
  { value: 'monthly',   label: '月結（彙總到月底結算單）' },
  { value: 'per_order', label: '單筆開票（每筆訂單到貨即開）' },
]

const INVOICE_TAX_SCOPE_OPTIONS = [
  { value: 'channel',   label: '通路統一統編' },
  { value: 'per_store', label: '依門市分別統編' },
]

const DELIVERY_TYPE_OPTIONS = [
  { value: 'own_logistics', label: '自有物流' },
  { value: 'third_party',   label: '第三方物流' },
  { value: 'outsource',     label: '外包物流' },
  { value: 'self_pickup',   label: '廠商自取' },
]

const INVOICE_MODE_OPTIONS = [
  { value: 'two_copy',   label: '二聯式' },
  { value: 'three_copy', label: '三聯式' },
]

const INVOICE_MODE_COLOR = {
  two_copy:   'default',
  three_copy: 'cyan',
}

function ChannelModal({ open, onClose, onSave, onResetPassword, onDisable, onEnable, initial }) {
  const [form] = Form.useForm()
  const isEdit = !!initial?.id
  const isDisabled = initial?.enabled === false

  const handleOk = () => {
    form.validateFields().then(values => {
      // 新增通路：帳號建立後不能修改，先彈出確認
      if (!isEdit) {
        Modal.confirm({
          title: '確認建立通路？',
          content: (
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              帳號 <Text code>{values.account}</Text> 一經建立後<strong style={{ color: '#cf1322' }}>無法修改</strong>，請確認無誤。
            </div>
          ),
          okText: '確認建立',
          cancelText: '回去檢查',
          onOk: () => {
            onSave({ ...initial, ...values })
            onClose()
          },
        })
        return
      }
      onSave({ ...initial, ...values })
      onClose()
    })
  }

  // 編輯彈窗左下角的「重設密碼」「停用 / 啟用」（只在編輯模式顯示）
  const footerExtra = isEdit ? (
    <Space size={8}>
      <Popconfirm
        title="重設密碼"
        description={`系統將產生新密碼並寄至 ${initial?.contactEmail}。確認執行？`}
        okText="確認重設" cancelText="取消"
        onConfirm={() => onResetPassword?.(initial)}
      >
        <Button danger icon={<KeyOutlined />} disabled={isDisabled}>重設密碼</Button>
      </Popconfirm>
      {isDisabled ? (
        <Popconfirm
          title="重新啟用通路？"
          okText="啟用" cancelText="取消"
          onConfirm={() => { onEnable?.(initial.id); onClose() }}
        >
          <Button type="primary" icon={<PlayCircleOutlined />}>啟用通路</Button>
        </Popconfirm>
      ) : (
        <Popconfirm
          title="確認停用此通路？"
          description="停用後廠商將無法登入，但歷史訂單與結算紀錄保留。"
          okText="停用" okButtonProps={{ danger: true }} cancelText="取消"
          onConfirm={() => { onDisable?.(initial.id); onClose() }}
        >
          <Button danger icon={<StopOutlined />}>停用通路</Button>
        </Popconfirm>
      )}
    </Space>
  ) : null

  return (
    <Modal
      open={open} onCancel={onClose} onOk={handleOk}
      title={isEdit ? '編輯通路' : '新增通路'}
      okText="儲存" cancelText="取消" width={640}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{footerExtra}</div>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" onClick={handleOk}>儲存</Button>
          </Space>
        </div>
      }
      afterOpenChange={visible => {
        if (visible) {
          form.resetFields()
          form.setFieldsValue(initial ?? {
            invoiceMode: 'three_copy',
            invoicePeriod: 'monthly',
            invoiceTaxScope: 'channel',
          })
        }
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        {!isEdit && (
          <Alert
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            message="新增通路：請填寫帳號"
            description={
              <div style={{ fontSize: 12 }}>
                <Form.Item
                  name="account"
                  rules={[
                    { required: true, message: '請輸入帳號' },
                    { pattern: /^[a-z0-9_]{4,30}$/, message: '請使用 4–30 字英數小寫或底線' },
                  ]}
                  style={{ margin: '8px 0 4px', width: '50%' }}
                >
                  <Input placeholder="例：b2b_channel_001" />
                </Form.Item>
                <div style={{ color: '#595959' }}>
                  預設密碼將寄至下方填寫的「聯繫信箱」。
                </div>
              </div>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        <Divider orientation="left" plain style={{ margin: '4px 0 12px' }}>基本資料</Divider>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="通路名稱" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="聯繫信箱" name="contactEmail" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="聯繫窗口" name="contactName" rules={[{ required: true }]}>
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

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="常用匯款末五碼" name="default_bank_last5">
              <Input placeholder="選填，5碼" maxLength={5} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="套用品項表模板" name="templateId" rules={[{ required: true }]}>
              <Select options={templates.map(t => ({ value: t.id, label: t.name }))} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain style={{ margin: '4px 0 12px' }}>結算 &amp; 發票設定</Divider>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="結算日" name="settlementDay" rules={[{ required: true }]}>
              <InputNumber min={1} max={31} addonBefore={<span style={{ whiteSpace: 'nowrap' }}>每月</span>} addonAfter="日" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="結算頻率" name="invoicePeriod" rules={[{ required: true }]}>
              <Select options={INVOICE_PERIOD_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="發票統編" name="invoiceTaxScope" rules={[{ required: true }]}>
              <Select options={INVOICE_TAX_SCOPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="發票類型" name="invoiceMode" rules={[{ required: true }]}>
              <Select options={INVOICE_MODE_OPTIONS} />
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

  // 重設密碼信件預覽
  const [pwdPreviewOpen, setPwdPreviewOpen] = useState(false)
  const [pwdPreviewData, setPwdPreviewData] = useState(null)

  const openAdd    = ()  => { setEditing({});  setModalOpen(true) }
  const openEdit   = (c) => { setEditing(c);   setModalOpen(true) }
  const closeModal = ()  => { setModalOpen(false); setEditing(null) }

  const handleSave = (values) => {
    if (values.id) {
      setChannelList(prev => prev.map(c => c.id === values.id ? { ...c, ...values } : c))
      message.success('通路資料已更新')
    } else {
      // 新增通路：帳號由業務輸入（建立後不可修改），模擬寄送預設密碼
      const account = values.account
      setChannelList(prev => [...prev, {
        ...values,
        id: `c${Date.now()}`,
        addresses: [],
        memberAccount: account,
        enabled: true,             // 預設啟用
      }])
      message.success(`通路已新增；帳號 ${account}，預設密碼已寄至 ${values.contactEmail}`)
    }
  }

  // 重設密碼：先彈出信件預覽，確認後才寄送
  const handleResetPassword = (channel) => {
    const newPwd = Math.random().toString(36).slice(2, 14)  // 12 碼亂數密碼（demo）
    setPwdPreviewData({
      account: channel.memberAccount ?? 'b2b_channel_xxx',
      contactName: channel.contactName ?? '通路窗口',
      contactEmail: channel.contactEmail,
      newPassword: newPwd,
      channelName: channel.name,
    })
    setPwdPreviewOpen(true)
  }

  // 停用通路（soft delete）：channel.enabled = false
  const handleDisable = (id) => {
    setChannelList(prev => prev.map(c => c.id === id ? { ...c, enabled: false } : c))
    message.success('通路已停用')
  }

  // 重新啟用通路
  const handleEnable = (id) => {
    setChannelList(prev => prev.map(c => c.id === id ? { ...c, enabled: true } : c))
    message.success('通路已重新啟用')
  }

  const filteredList = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    if (!q) return channelList
    return channelList.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.taxId?.toLowerCase().includes(q) ||
      c.contactEmail?.toLowerCase().includes(q)
    )
  }, [channelList, searchText])

  const columns = [
    { title: '通路名稱', dataIndex: 'name',
      render: (v, r) => (
        <Space size={6}>
          <Button type="link" style={{ padding: 0 }} onClick={() => setViewing(r)}>{v}</Button>
          {r.enabled === false && <Tag color="default" style={{ fontSize: 10, margin: 0 }}>已停用</Tag>}
        </Space>
      )},
    { title: '統一編號', dataIndex: 'taxId', width: 110 },
    { title: '聯繫信箱', dataIndex: 'contactEmail' },
    { title: '聯繫窗口', dataIndex: 'contactName', width: 150,
      render: (v, r) => `${v ?? ''}　${r.contactPhone ?? ''}` },
    { title: '發票模式', width: 130,
      render: (_, r) => {
        if (!r.invoicePeriod || !r.invoiceTaxScope) return <span style={{ color: '#bbb' }}>—</span>
        return (
          <Tag color={invoiceModeColor(r.invoicePeriod, r.invoiceTaxScope)} style={{ fontSize: 11 }}>
            {invoiceModeLabel(r.invoicePeriod, r.invoiceTaxScope)}
          </Tag>
        )
      }
    },
    { title: '發票類型', dataIndex: 'invoiceMode', width: 80,
      render: v => v
        ? <Tag color={INVOICE_MODE_COLOR[v] ?? 'default'} style={{ fontSize: 11 }}>
            {INVOICE_MODE_OPTIONS.find(o => o.value === v)?.label ?? v}
          </Tag>
        : <span style={{ color: '#bbb' }}>—</span>
    },
    { title: '結算日', dataIndex: 'settlementDay', width: 100,
      render: v => `每月 ${v} 日` },
    { title: '收件地址', dataIndex: 'addresses', width: 80, align: 'center',
      render: arr => <Badge count={arr?.length ?? 0} color="#1677ff" /> },
    { title: '操作', width: 130, align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewing(r)}>詳情</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>編輯</Button>
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
        onSave={handleSave}
        onResetPassword={handleResetPassword}
        onDisable={handleDisable}
        onEnable={handleEnable}
        initial={editing}
      />

      <NotificationPreviewModal
        open={pwdPreviewOpen}
        type="admin_password_reset"
        data={pwdPreviewData}
        onClose={() => setPwdPreviewOpen(false)}
        onConfirm={() => {
          setPwdPreviewOpen(false)
          message.success(`新密碼已寄至 ${pwdPreviewData?.contactEmail}`)
        }}
      />
    </div>
  )
}
