import { useRef, useState, useEffect } from 'react'
import dayjs from 'dayjs'
import {
  Card, Form, Input, Select, Radio, Switch, Button, Drawer, Table, Modal,
  Divider, Typography, Row, Col, Space, Tag, Popconfirm, message, DatePicker, Empty,
} from 'antd'
import {
  BoldOutlined, UnorderedListOutlined, LinkOutlined,
  EyeOutlined, SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  NotificationOutlined, CloseOutlined,
} from '@ant-design/icons'
import { announcements as initialList, channels } from '../../data/fakeData'
import { renderMarkdown } from '../../utils/announcementUtils'
import { LAYOUT } from '../../styles/tokens'

const { Title, Text } = Typography

const PRIORITY_TAG = {
  important: { color: 'red',     label: '重要（強制彈窗）' },
  normal:    { color: 'default', label: '一般' },
}

// ── Markdown 工具列：在游標位置插入語法 ──────
function insertSyntax(textareaRef, form, syntax, setPreview) {
  const el = textareaRef.current?.resizableTextArea?.textArea
  if (!el) return
  el.focus()
  const s   = el.selectionStart
  const e   = el.selectionEnd
  const val = el.value
  const sel = val.slice(s, e)

  const insert =
    syntax === 'bold' ? `**${sel || '粗體文字'}**` :
    syntax === 'list' ? `\n- ${sel || '項目'}` :
    `[${sel || '連結文字'}](https://)`

  const next = val.slice(0, s) + insert + val.slice(e)
  form.setFieldValue('content', next)
  setPreview(renderMarkdown(next))

  requestAnimationFrame(() => {
    el.selectionStart = s + insert.length
    el.selectionEnd   = s + insert.length
  })
}

// ── 編輯 Drawer ──
function AnnouncementEditor({ open, draft, onClose, onSave }) {
  const [form] = Form.useForm()
  const [preview,      setPreview]      = useState('')
  const [previewOpen,  setPreviewOpen]  = useState(false)
  const [audienceMode, setAudienceMode] = useState('all')
  const textareaRef = useRef(null)

  // 開啟時把 draft 灌到 form
  useEffect(() => {
    if (open && draft) {
      form.setFieldsValue({
        title:            draft.title ?? '',
        content:          draft.content ?? '',
        priority:         draft.priority ?? 'normal',
        isVisible:        draft.isVisible ?? true,
        audienceChannels: Array.isArray(draft.audience) ? draft.audience : [],
        publishedAt:      draft.publishedAt ? dayjs(draft.publishedAt) : dayjs(),
      })
      setAudienceMode(draft.audience === 'all' ? 'all' : 'specific')
      setPreview(renderMarkdown(draft.content ?? ''))
      setPreviewOpen(false)
    }
  }, [open, draft])  // eslint-disable-line react-hooks/exhaustive-deps

  const channelOptions = channels.map(c => ({ value: c.id, label: c.name }))

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const audience = audienceMode === 'all'
        ? 'all'
        : (values.audienceChannels?.length ? values.audienceChannels : 'all')
      const next = {
        ...draft,
        title:       values.title,
        content:     values.content,
        priority:    values.priority,
        isVisible:   values.isVisible,
        audience,
        publishedAt: values.publishedAt
          ? values.publishedAt.format('YYYY-MM-DD HH:mm')
          : dayjs().format('YYYY-MM-DD HH:mm'),
      }
      onSave(next)
    })
  }

  // 當前標題（用於預覽顯示）
  const previewTitle = Form.useWatch('title', form) ?? ''
  const previewDate  = Form.useWatch('publishedAt', form)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={draft?.id ? '編輯公告' : '新增公告'}
      width={600}
      destroyOnClose
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}>儲存</Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        {/* ── 控制列 ── */}
        <Row gutter={16} align="bottom">
          <Col flex="0 0 auto">
            <Form.Item label="顯示給廠商" name="isVisible" valuePropName="checked" style={{ marginBottom: 8 }}>
              <Switch checkedChildren="顯示中" unCheckedChildren="已隱藏" />
            </Form.Item>
          </Col>
          <Col flex="0 0 200px">
            <Form.Item label="重要等級" name="priority" style={{ marginBottom: 8 }}>
              <Select options={[
                { value: 'normal',    label: '一般（不強制彈窗）' },
                { value: 'important', label: '重要（首次強制彈窗）' },
              ]} />
            </Form.Item>
          </Col>
          <Col flex="1">
            <Form.Item
              label="發布日"
              name="publishedAt"
              rules={[{ required: true, message: '請選擇發布日' }]}
              style={{ marginBottom: 8 }}
            >
              <DatePicker
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="適用通路" style={{ marginBottom: 8 }}>
          <Space size={12} align="center" wrap>
            <Radio.Group value={audienceMode} onChange={e => setAudienceMode(e.target.value)}>
              <Radio value="all">全部通路</Radio>
              <Radio value="specific">指定通路</Radio>
            </Radio.Group>
            {audienceMode === 'specific' && (
              <Form.Item name="audienceChannels" noStyle>
                <Select
                  mode="multiple"
                  placeholder="請選擇通路"
                  options={channelOptions}
                  style={{ minWidth: 260 }}
                />
              </Form.Item>
            )}
          </Space>
        </Form.Item>

        <Divider style={{ margin: '8px 0 16px' }} />

        <Form.Item label="標題" name="title" rules={[{ required: true, message: '請填標題' }]}>
          <Input placeholder="30 字內" maxLength={30} showCount />
        </Form.Item>

        {/* ── Markdown 編輯器（全寬） ── */}
        <Form.Item label="內文" style={{ marginBottom: 4 }}>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
            {/* 工具列 */}
            <div style={{
              padding: '5px 10px', borderBottom: '1px solid #f0f0f0',
              background: '#fafafa', display: 'flex', gap: 4, alignItems: 'center',
            }}>
              <Text type="secondary" style={{ fontSize: 11, marginRight: 4 }}>Markdown</Text>
              {[
                { icon: <BoldOutlined />,           title: '粗體', key: 'bold' },
                { icon: <UnorderedListOutlined />,  title: '列表', key: 'list' },
                { icon: <LinkOutlined />,           title: '連結', key: 'link' },
              ].map(btn => (
                <Button key={btn.key} size="small" type="text" icon={btn.icon} title={btn.title}
                  onMouseDown={e => { e.preventDefault(); insertSyntax(textareaRef, form, btn.key, setPreview) }}
                />
              ))}
            </div>
            <Form.Item
              name="content"
              rules={[{ required: true, message: '請填內文' }]}
              style={{ margin: 0 }}
              getValueFromEvent={e => {
                setPreview(renderMarkdown(e.target.value))
                return e.target.value
              }}
            >
              <Input.TextArea
                ref={textareaRef}
                rows={14}
                style={{ border: 'none', borderRadius: 0, resize: 'none', fontFamily: 'monospace', fontSize: 12 }}
                placeholder={'## 標題\n\n**粗體文字**\n\n- 項目一\n- 項目二\n\n[連結文字](https://example.com)'}
              />
            </Form.Item>
          </div>
        </Form.Item>

        {/* ── 預覽按鈕 ── */}
        <div style={{ marginTop: 4 }}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            style={{ background: '#f0f0f0', borderColor: '#d9d9d9' }}
            onClick={() => setPreviewOpen(true)}
          >
            預覽公告
          </Button>
        </div>

        {/* ── 預覽 Modal（樣式對齊前台 AnnouncementModal） ── */}
        <Modal
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          footer={null}
          width={540}
          title={null}
          closable={false}
          centered
          styles={{ body: { padding: 0 }, container: { padding: 0, overflow: 'hidden', borderRadius: 8 } }}
        >
          {/* 標題列 */}
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}>
            <NotificationOutlined style={{ color: '#1677ff', fontSize: 15, flexShrink: 0 }} />
            <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: '#1a1a1a', lineHeight: 1.3 }}>
              {previewTitle || <span style={{ color: '#bbb', fontWeight: 400 }}>（標題未填）</span>}
            </span>
            <Button
              type="text" size="small"
              icon={<CloseOutlined />}
              style={{ color: '#aaa', flexShrink: 0 }}
              onClick={() => setPreviewOpen(false)}
            />
          </div>
          {/* 內文 */}
          <div
            style={{ overflowY: 'auto', padding: '16px 20px', fontSize: 13, color: '#333', lineHeight: 1.75, maxHeight: '60vh' }}
            dangerouslySetInnerHTML={{
              __html: preview || '<span style="color:#ccc;font-size:12px;">內文未填...</span>',
            }}
          />
          {/* 底列 */}
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0, background: '#fafafa',
          }}>
            <span style={{ fontSize: 11, color: '#bbb' }}>
              發布：{previewDate ? previewDate.format('YYYY-MM-DD HH:mm') : '—'}
            </span>
            <Button type="primary" onClick={() => setPreviewOpen(false)}>關閉</Button>
          </div>
        </Modal>
      </Form>
    </Drawer>
  )
}

// ── 主頁面：列表 ──
export default function AdminAnnouncements() {
  const [list,    setList]    = useState(() => [...initialList])
  const [editing, setEditing] = useState(null)   // null=未開、{id?, ...}=編輯/新增中

  // 同步回 fakeData，讓廠商端立即看到
  const syncFake = (next) => {
    initialList.splice(0, initialList.length, ...next)
  }

  const handleOpenAdd = () => setEditing({
    title: '', content: '', priority: 'normal',
    isVisible: true, audience: 'all',
    publishedAt: dayjs().format('YYYY-MM-DD HH:mm'),
  })

  const handleOpenEdit = (row) => setEditing({ ...row })

  const handleSave = (next) => {
    let nextList
    if (next.id) {
      nextList = list.map(a => a.id === next.id ? { ...next } : a)
    } else {
      // 新增：publishedAt 來自表單，id 自動產生
      const id = `ann-${dayjs().format('YYYYMMDDHHmmss')}`
      nextList = [{ ...next, id, readBy: [] }, ...list]
    }
    setList(nextList)
    syncFake(nextList)
    setEditing(null)
    message.success(next.id ? '公告已更新' : '公告已新增，廠商端即刻生效')
  }

  const handleDelete = (id) => {
    const nextList = list.filter(a => a.id !== id)
    setList(nextList)
    syncFake(nextList)
    message.success('已刪除')
  }

  const handleToggleVisible = (row) => {
    const nextList = list.map(a => a.id === row.id ? { ...a, isVisible: !a.isVisible } : a)
    setList(nextList)
    syncFake(nextList)
  }

  const audienceLabel = (audience) => {
    if (audience === 'all') return <Tag>全部通路</Tag>
    if (Array.isArray(audience) && audience.length > 0) {
      return (
        <Space size={4} wrap>
          {audience.map(cid => {
            const c = channels.find(x => x.id === cid)
            return <Tag key={cid} color="blue" style={{ margin: 0 }}>{c?.name ?? cid}</Tag>
          })}
        </Space>
      )
    }
    return <Tag>—</Tag>
  }

  const cols = [
    {
      title: '標題',
      dataIndex: 'title',
      onHeaderCell: () => ({ style: { minWidth: 200 } }),
      onCell:       () => ({ style: { minWidth: 200 } }),
      render: (v, r) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Text strong style={{ fontSize: 13 }}>{v}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>ID: {r.id}</Text>
        </Space>
      ),
    },
    {
      title: '重要等級',
      dataIndex: 'priority',
      width: 130,
      render: v => (
        <Tag color={PRIORITY_TAG[v]?.color} style={{ margin: 0 }}>
          {PRIORITY_TAG[v]?.label}
        </Tag>
      ),
    },
    {
      title: '適用通路',
      dataIndex: 'audience',
      width: 150,
      render: v => audienceLabel(v),
    },
    {
      title: '發布日',
      dataIndex: 'publishedAt',
      width: 110,
      render: v => v?.slice(0, 10) ?? '—',
    },
    {
      title: '顯示',
      dataIndex: 'isVisible',
      width: 90,
      align: 'center',
      render: (v, r) => (
        <Switch
          checked={v}
          size="small"
          checkedChildren="顯示中"
          unCheckedChildren="已隱藏"
          onChange={() => handleToggleVisible(r)}
        />
      ),
    },
    {
      title: '操作',
      width: 120,
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(r)}>編輯</Button>
          <Popconfirm title="確定刪除此公告？" onConfirm={() => handleDelete(r.id)} okText="刪除" cancelText="取消">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: LAYOUT.pagePadding }}>
      <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>公告管理</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            可發布多則公告，廠商會在「最新資訊」頁看到。標為重要的公告會在廠商首次進入後台時強制彈窗一次。
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
            新增公告
          </Button>
        </Col>
      </Row>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        {list.length === 0 ? (
          <div style={{ padding: 32 }}>
            <Empty description="尚未建立任何公告" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <Table
            dataSource={list}
            columns={cols}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 15, showSizeChanger: false }}
            rowClassName={r => !r.isVisible ? 'row-hidden-ann' : ''}
          />
        )}
      </Card>

      <AnnouncementEditor
        open={editing !== null}
        draft={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      <style>{`
        .row-hidden-ann td { background: #fafafa !important; color: #999; }
        .row-hidden-ann:hover td { background: #f0f0f0 !important; }
      `}</style>
    </div>
  )
}
