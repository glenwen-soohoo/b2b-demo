import { useRef, useState } from 'react'
import {
  Card, Form, Input, Select, Radio, Switch, Button,
  Divider, Typography, Row, Col, Space, message,
} from 'antd'
import {
  BoldOutlined, UnorderedListOutlined, LinkOutlined,
  EyeOutlined, SaveOutlined,
} from '@ant-design/icons'
import { announcement as initialAnn } from '../../data/fakeData'
import { channels } from '../../data/fakeData'
import { renderMarkdown } from '../../utils/announcementUtils'
import { LAYOUT } from '../../styles/tokens'

const { Title, Text } = Typography

// ── Markdown 工具列：在游標位置插入語法 ──────
let _setPreview = () => {}

function insertSyntax(textareaRef, form, syntax) {
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
  _setPreview(renderMarkdown(next))

  requestAnimationFrame(() => {
    el.selectionStart = s + insert.length
    el.selectionEnd   = s + insert.length
  })
}

// ── 主頁面 ──────────────────────────────────
export default function AdminAnnouncements() {
  const [form]         = Form.useForm()
  const [ann,  setAnn] = useState(initialAnn ?? {
    id: `ann-v${Date.now()}`, title: '', content: '',
    priority: 'normal', isVisible: false, audience: 'all',
  })
  const [audienceMode, setAudienceMode] = useState(
    ann?.audience === 'all' ? 'all' : 'specific'
  )
  const [preview, setPreview] = useState(() => renderMarkdown(ann?.content ?? ''))
  const [saving,  setSaving]  = useState(false)
  const textareaRef = useRef(null)
  _setPreview = setPreview

  const channelOptions = channels.map(c => ({ value: c.id, label: c.name }))

  const handleSave = () => {
    form.validateFields().then(values => {
      setSaving(true)
      const { audienceChannels, ...rest } = values
      const updated = {
        ...rest,
        id:       `ann-v${Date.now()}`,   // 更新 id → 廠商端已讀狀態重置
        audience: audienceMode === 'all' ? 'all' : (audienceChannels ?? []),
      }
      setAnn(updated)
      Object.assign(initialAnn, updated)  // 同步回 fakeData singleton
      setTimeout(() => setSaving(false), 300)
      message.success('公告已儲存，廠商端將立即生效')
    })
  }

  return (
    <div style={{ padding: LAYOUT.pagePadding, maxWidth: LAYOUT.shippingMaxWidth, margin: '0 auto' }}>

      {/* ── 頁首 ── */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>公告白板</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          改完儲存即刻生效；每次儲存後廠商端已讀狀態重置，重要公告會再次彈窗
        </Text>
      </div>

      {/* ── 主卡片 ── */}
      <Card size="small" title="公告內容">
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 4 }}
          initialValues={{
            ...ann,
            audienceChannels: Array.isArray(ann.audience) ? ann.audience : [],
          }}
        >
          {/* ── 控制列 ── */}
          <Row gutter={24} align="bottom" style={{ marginBottom: 4 }}>
            <Col flex="0 0 auto">
              <Form.Item label="顯示給廠商" name="isVisible" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch checkedChildren="顯示中" unCheckedChildren="已隱藏" />
              </Form.Item>
            </Col>
            <Col flex="0 0 200px">
              <Form.Item label="重要等級" name="priority" style={{ marginBottom: 0 }}>
                <Select options={[
                  { value: 'normal',    label: '一般（不強制彈窗）' },
                  { value: 'important', label: '重要（強制彈窗一次）' },
                ]} />
              </Form.Item>
            </Col>
            <Col flex="auto">
              <Form.Item label="適用通路" style={{ marginBottom: 0 }}>
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
                        style={{ minWidth: 200 }}
                      />
                    </Form.Item>
                  )}
                </Space>
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }} />

          {/* ── 標題 ── */}
          <Form.Item label="標題" name="title" rules={[{ required: true, message: '請填標題' }]}>
            <Input placeholder="30 字內" maxLength={30} showCount style={{ maxWidth: 440 }} />
          </Form.Item>

          {/* ── Markdown 編輯器（左輸入 / 右預覽） ── */}
          <div style={{
            border: '1px solid #d9d9d9', borderRadius: 6,
            overflow: 'hidden', display: 'flex',
            marginTop: 4,
          }}>
            {/* 左：工具列 + textarea */}
            <div style={{ flex: 1, borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '5px 10px', borderBottom: '1px solid #f0f0f0',
                background: '#fafafa', display: 'flex', gap: 4, alignItems: 'center',
              }}>
                <Text type="secondary" style={{ fontSize: 11, marginRight: 4 }}>Markdown</Text>
                {[
                  { icon: <BoldOutlined />,         title: '粗體', key: 'bold' },
                  { icon: <UnorderedListOutlined />, title: '列表', key: 'list' },
                  { icon: <LinkOutlined />,          title: '連結', key: 'link' },
                ].map(btn => (
                  <Button key={btn.key} size="small" type="text" icon={btn.icon} title={btn.title}
                    onMouseDown={e => { e.preventDefault(); insertSyntax(textareaRef, form, btn.key) }}
                  />
                ))}
              </div>
              <Form.Item
                name="content"
                rules={[{ required: true, message: '請填內文' }]}
                style={{ margin: 0, flex: 1 }}
                getValueFromEvent={e => {
                  setPreview(renderMarkdown(e.target.value))
                  return e.target.value
                }}
              >
                <Input.TextArea
                  ref={textareaRef}
                  rows={16}
                  style={{ border: 'none', borderRadius: 0, resize: 'none', fontFamily: 'monospace', fontSize: 12 }}
                  placeholder={'## 標題\n\n**粗體文字**\n\n- 項目一\n- 項目二\n\n[連結文字](https://example.com)'}
                />
              </Form.Item>
            </div>

            {/* 右：預覽 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f7f7f7' }}>
              <div style={{
                padding: '5px 10px', borderBottom: '1px solid #ebebeb',
                background: '#f0f0f0',
              }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  <EyeOutlined style={{ marginRight: 4 }} />預覽
                </Text>
              </div>
              <div
                style={{ flex: 1, padding: '12px 16px', fontSize: 13, color: '#333', overflowY: 'auto' }}
                dangerouslySetInnerHTML={{
                  __html: preview || '<span style="color:#ccc;font-size:12px;">左側輸入後即時顯示...</span>',
                }}
              />
            </div>
          </div>

          {/* ── 儲存按鈕 ── */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              儲存公告
            </Button>
          </div>

        </Form>
      </Card>
    </div>
  )
}
