import { useState } from 'react'
import { Card, Typography, Row, Col, InputNumber, Button, Space, message } from 'antd'
import { SaveOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons'
import { shippingSettings as initialSettings } from '../../data/fakeData'

const { Title } = Typography

const TEMP_META = {
  frozen:  { icon: '❄️', label: '冷凍', color: '#366092' },
  ambient: { icon: '🌿', label: '常溫', color: '#76933C' },
}

function ShippingCard({ tempKey, settings, onSave }) {
  const meta = TEMP_META[tempKey]
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(settings)

  const startEdit = () => { setDraft(settings); setEditing(true) }
  const cancel    = () => { setDraft(settings); setEditing(false) }
  const save = () => {
    if (draft.freeShippingThreshold < 0 || draft.shippingFee < 0) {
      message.error('數值不可為負數'); return
    }
    onSave(tempKey, draft)
    setEditing(false)
    message.success(`${meta.label}運費設定已更新`)
  }

  return (
    <Card
      size="small"
      style={{ borderTop: `4px solid ${meta.color}`, height: '100%' }}
      title={
        <Space>
          <span style={{ fontSize: 18 }}>{meta.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{meta.label}</span>
        </Space>
      }
      extra={
        editing ? (
          <Space size={4}>
            <Button size="small" icon={<CloseOutlined />} onClick={cancel}>取消</Button>
            <Button size="small" type="primary" icon={<SaveOutlined />} onClick={save}>儲存</Button>
          </Space>
        ) : (
          <Button size="small" icon={<EditOutlined />} onClick={startEdit}>編輯</Button>
        )
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>免運門檻</div>
          {editing ? (
            <InputNumber
              prefix="$" min={0} style={{ width: '100%' }}
              value={draft.freeShippingThreshold}
              onChange={v => setDraft(d => ({ ...d, freeShippingThreshold: v ?? 0 }))}
            />
          ) : (
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              ${settings.freeShippingThreshold.toLocaleString()}
            </div>
          )}
        </Col>
        <Col span={12}>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>運費</div>
          {editing ? (
            <InputNumber
              prefix="$" min={0} style={{ width: '100%' }}
              value={draft.shippingFee}
              onChange={v => setDraft(d => ({ ...d, shippingFee: v ?? 0 }))}
            />
          ) : (
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              ${settings.shippingFee.toLocaleString()}
            </div>
          )}
        </Col>
      </Row>
    </Card>
  )
}

export default function AdminShipping() {
  const [settings, setSettings] = useState(initialSettings)

  const handleSave = (tempKey, newVal) => {
    setSettings(prev => ({ ...prev, [tempKey]: newVal }))
    initialSettings[tempKey] = newVal
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <Title level={4} style={{ marginBottom: 20 }}>運費設定</Title>
      <Row gutter={16}>
        <Col span={12}>
          <ShippingCard tempKey="frozen" settings={settings.frozen} onSave={handleSave} />
        </Col>
        <Col span={12}>
          <ShippingCard tempKey="ambient" settings={settings.ambient} onSave={handleSave} />
        </Col>
      </Row>
    </div>
  )
}
