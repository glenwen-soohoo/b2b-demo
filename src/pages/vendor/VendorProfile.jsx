import { useState } from 'react'
import {
  Card, Form, Input, Button, Typography, Divider, Space,
  Table, message, Popconfirm, Modal, Descriptions,
} from 'antd'
import {
  EditOutlined, SaveOutlined, PlusOutlined,
  DeleteOutlined, EnvironmentOutlined, LockOutlined,
} from '@ant-design/icons'
import { useVendor } from '../../context/VendorContext'
import { invoiceModeLabel, allowsStoreTaxId } from '../../utils/invoiceMode'

// 票面類型 label
const INVOICE_MODE_LABEL = {
  three_copy: '三聯式',
  two_copy:   '二聯式',
}

const { Title, Text } = Typography

function AddressModal({ open, onClose, onSave, initial, showStoreTaxFields }) {
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
        {showStoreTaxFields && (
          <>
            <Divider plain style={{ margin: '8px 0 12px', fontSize: 12, color: '#999' }}>
              發票買受人（選填）
            </Divider>
            <div style={{ marginBottom: 12, fontSize: 11, color: '#999' }}>
              填寫此門市專屬的發票抬頭與統編；未填則沿用通路統一抬頭。
            </div>
            <Form.Item label="發票抬頭" name="buyerName">
              <Input placeholder="選填，例：分公司或加盟主名稱" />
            </Form.Item>
            <Form.Item label="統一編號" name="buyerTaxId">
              <Input placeholder="選填，8 碼" maxLength={8} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  )
}

/**
 * 修改密碼彈窗
 *
 * Demo 行為：開啟彈窗 form，提交後顯示成功訊息（不真的改）
 * TODO_FRUIT_WEB: 正式版要 POST /api/b2b/auth/change-password { currentPassword, newPassword }
 *   後端驗證舊密碼後更新 B2BAccount.PasswordHash
 */
function ChangePasswordModal({ open, onClose }) {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const onSubmit = () => {
    form.validateFields().then(() => {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        form.resetFields()
        message.success('密碼已修改成功')
        onClose()
      }, 600)
    })
  }

  return (
    <Modal
      open={open}
      onCancel={() => { form.resetFields(); onClose() }}
      title={<Space><LockOutlined />修改密碼</Space>}
      okText="儲存" cancelText="取消"
      confirmLoading={loading}
      destroyOnClose
      onOk={onSubmit}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item
          label="當前密碼"
          name="currentPassword"
          rules={[{ required: true, message: '請輸入當前密碼' }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item
          label="新密碼"
          name="newPassword"
          rules={[
            { required: true, message: '請輸入新密碼' },
            { min: 8, message: '密碼至少 8 個字元' },
          ]}
        >
          <Input.Password autoComplete="new-password" placeholder="至少 8 字元" />
        </Form.Item>
        <Form.Item
          label="確認新密碼"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '請再次輸入新密碼' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('兩次輸入的密碼不一致'))
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
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

  // 修改密碼彈窗
  const [pwdModalOpen, setPwdModalOpen] = useState(false)

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
      next = addrList.map(a =>
        a.storeId === editingAddr.storeId ? { ...a, ...values } : a
      )
    } else {
      // 新增地址自動產生 storeId（demo 模擬）
      const newStoreId = `s${Date.now().toString(36).slice(-4)}`
      next = [...addrList, { ...values, storeId: newStoreId }]
    }
    setAddrList(next)
    login({ ...info, addresses: next })
    message.success('地址已更新')
  }

  const deleteAddr = (storeId) => {
    const next = addrList.filter(a => a.storeId !== storeId)
    setAddrList(next)
    login({ ...info, addresses: next })
    message.success('地址已刪除')
  }

  const showStoreTax = allowsStoreTaxId(info.invoiceTaxScope)
  const addrCols = [
    { title: '門市/倉別', dataIndex: 'label', width: 110, ellipsis: true },
    { title: '收件人',   dataIndex: 'recipient', width: 110, ellipsis: true },
    { title: '電話',     dataIndex: 'phone', width: 110 },
    // 顯示門市統編時，地址欄改用較窄的固定寬 + ellipsis；不顯示時撐滿剩餘空間
    ...(showStoreTax
      ? [{ title: '地址', dataIndex: 'address', width: 160, ellipsis: true }]
      : [{ title: '地址', dataIndex: 'address', ellipsis: true }]),
    // 條件顯示：channel 允許各門市分開設定統編時才顯示
    ...(showStoreTax ? [
      { title: '發票抬頭', dataIndex: 'buyerName', width: 130, ellipsis: true,
        render: v => v || <Text type="secondary" style={{ fontSize: 11 }}>沿用通路</Text> },
      { title: '統編', dataIndex: 'buyerTaxId', width: 90,
        render: v => v || <Text type="secondary" style={{ fontSize: 11 }}>沿用通路</Text> },
    ] : []),
    {
      title: '操作', width: 80, align: 'center', fixed: showStoreTax ? 'right' : undefined,
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditAddr(r)} />
          <Popconfirm title="確認刪除此地址？" okText="刪除" okButtonProps={{ danger: true }}
            cancelText="取消" onConfirm={() => deleteAddr(r.storeId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>通路資料</Title>
        {!editing
          ? <Space>
              <Button icon={<LockOutlined />} onClick={() => setPwdModalOpen(true)}>修改密碼</Button>
              <Button icon={<EditOutlined />} onClick={startEdit}>編輯資料</Button>
            </Space>
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
              <Form.Item label="聯繫信箱" name="contactEmail" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="聯繫窗口" name="contactName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="聯繫電話" name="contactPhone">
                <Input />
              </Form.Item>
              <Form.Item label="常用匯款末五碼（選填）" name="default_bank_last5">
                <Input placeholder="5碼" maxLength={5} />
              </Form.Item>
            </div>
            <Form.Item
              label="預設下單備註（下單時自動帶入，送出前可修改）"
              name="default_vendor_note"
              style={{ marginBottom: 0 }}
            >
              <Input.TextArea
                rows={3}
                placeholder="例：收貨時若包裝破損請先拍照告知；逢週三早上倉庫收件時段為 9:00–12:00"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        ) : (
          <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {[
              { label: '通路名稱', value: info.name },
              { label: '聯絡信箱', value: info.contactEmail },
              { label: '聯繫窗口', value: info.contactName },
              { label: '聯繫電話', value: info.contactPhone },
              { label: '公司抬頭', value: info.title },
              { label: '統一編號', value: info.taxId },
              { label: '常用匯款末五碼', value: info.default_bank_last5 || null },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 14 }}>{f.value || <Text type="secondary">—</Text>}</div>
              </div>
            ))}
          </div>
          <Divider style={{ margin: '14px 0' }} />
          <div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
              預設下單備註
              <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                （未來下單時會自動帶入備註欄位，送出前可依當次情況修改）
              </Text>
            </div>
            <div style={{
              fontSize: 13, whiteSpace: 'pre-line',
              minHeight: 20, color: info.default_vendor_note ? '#262626' : '#bfbfbf',
            }}>
              {info.default_vendor_note || '尚未設定，點「編輯資料」可新增。'}
            </div>
          </div>
          </>
        )}
      </Card>

      {/* 結算資訊（唯讀，需聯繫業務修改） */}
      <Card
        size="small"
        style={{ marginBottom: 20, background: '#fffbe6', border: '1px solid #ffe58f' }}
      >
        <div style={{ fontSize: 12, color: '#ad8b00', marginBottom: 10, fontWeight: 600 }}>
          結算資訊（如需修改請聯繫業務窗口）
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          {[
            { label: '結算日',  value: `每月 ${info.settlementDay} 日` },
            { label: '匯款帳號', value: '00709001170（兆豐銀行）' },
            { label: '發票模式', value: invoiceModeLabel(info.invoicePeriod, info.invoiceTaxScope) },
            { label: '發票類型', value: INVOICE_MODE_LABEL[info.invoiceMode] ?? '—' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 14 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 收件地址 */}
      <Card
        title={<Space><EnvironmentOutlined />收件地址</Space>}
        extra={<Button size="small" icon={<PlusOutlined />} onClick={openAddAddr}>新增地址</Button>}
      >
        {addrList.length === 0
          ? <Text type="secondary">尚未設定收件地址，請點擊「新增地址」新增。</Text>
          : <Table
              dataSource={addrList} columns={addrCols} rowKey="storeId"
              size="small" pagination={false}
              scroll={showStoreTax ? { x: 'max-content' } : undefined}
            />
        }
      </Card>

      <AddressModal
        open={addrModal}
        onClose={() => setAddrModal(false)}
        onSave={saveAddr}
        initial={editingAddr}
        showStoreTaxFields={allowsStoreTaxId(info.invoiceTaxScope)}
      />

      <ChangePasswordModal
        open={pwdModalOpen}
        onClose={() => setPwdModalOpen(false)}
      />
    </div>
  )
}
