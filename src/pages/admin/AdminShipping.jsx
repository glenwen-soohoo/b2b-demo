import { useState } from 'react'
import { Card, Typography, Row, Col, InputNumber, Button, Space, Statistic, message } from 'antd'
import { SaveOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons'
import { shippingSettings as initialSettings } from '../../data/fakeData'
import { TEMP, LAYOUT } from '../../styles/tokens'

const { Title } = Typography

const TEMP_LABEL = { frozen: '冷凍', ambient: '常溫' }

function ShippingCard({ tempKey, settings, onSave }) {
  const t     = TEMP[tempKey]
  const label = TEMP_LABEL[tempKey]
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
    message.success(`${label}運費設定已更新`)
  }

  return (
    <Card
      size="small"
      style={{ borderTop: `3px solid ${t.text}`, height: '100%' }}
      title={<Space size={6}>{t.icon}<span>{label}</span></Space>}
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
      <Row gutter={24}>
        <Col span={12}>
          {editing ? (
            <>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>免運門檻</div>
              <InputNumber
                prefix="$" min={0} style={{ width: '100%' }}
                value={draft.freeShippingThreshold}
                onChange={v => setDraft(d => ({ ...d, freeShippingThreshold: v ?? 0 }))}
              />
            </>
          ) : (
            <Statistic
              title="免運門檻"
              value={settings.freeShippingThreshold}
              prefix="$"
              valueStyle={{ fontSize: 20, color: t.text }}
              formatter={v => Number(v).toLocaleString()}
            />
          )}
        </Col>
        <Col span={12}>
          {editing ? (
            <>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>運費</div>
              <InputNumber
                prefix="$" min={0} style={{ width: '100%' }}
                value={draft.shippingFee}
                onChange={v => setDraft(d => ({ ...d, shippingFee: v ?? 0 }))}
              />
            </>
          ) : (
            <Statistic
              title="運費"
              value={settings.shippingFee}
              prefix="$"
              valueStyle={{ fontSize: 20, color: t.text }}
              formatter={v => Number(v).toLocaleString()}
            />
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
    // ⚠️ 連動說明：直接 mutate fakeData 匯出的 shippingSettings 物件。
    // 由於 ES module 在同一 runtime 共用同一 object reference，
    // 以下幾個地方會即時讀到新值，不需要額外傳參：
    //   - exportBlankOrder.js  → buildSheet() 的免運/運費公式與說明文字
    //   - VendorOrderForm.jsx  → 前台採購單頁面的免運門檻警示
    // 若未來改為真實 API，請將這三處的資料來源統一改成 API 回傳值。
    initialSettings[tempKey] = newVal
  }

  return (
    <div style={{ padding: LAYOUT.pagePadding, maxWidth: LAYOUT.shippingMaxWidth, margin: '0 auto' }}>
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
