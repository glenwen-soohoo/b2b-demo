import { useState, useRef, useEffect } from 'react'
import { Button, Checkbox } from 'antd'
import { FileProtectOutlined, CloseOutlined } from '@ant-design/icons'
import ContractDocument from './ContractDocument'
import { CONTRACT_AGREE_LABEL } from '../data/contractData'
import { recordAgreement } from '../utils/contractStore'

// ─────────────────────────────────────────────
// 合約彈窗，三種用法：
//  1) 硬擋 gate（closable=false, readOnly=false）：不可關閉，需捲到底＋勾選才能同意
//  2) 自願同意（closable=true,  readOnly=false）：可關閉，仍需捲到底＋勾選才能同意
//  3) 唯讀檢視（readOnly=true）：只看，右下角關閉
//
// 同意時 append 一筆同意紀錄（recordAgreement，不覆蓋舊紀錄）。
// reconsent=true 時標題與更新摘要提示「合約已更新，需重新確認」。
// ─────────────────────────────────────────────
export default function ContractModal({
  open, channel, version,
  closable = false, readOnly = false, reconsent = false,
  onAgreed, onClose,
}) {
  const [reachedBottom, setReachedBottom] = useState(false)
  const [checked, setChecked] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (open) { setReachedBottom(readOnly); setChecked(false) }
  }, [open, version?.version, readOnly])

  if (!open) return null

  const onScroll = () => {
    const el = bodyRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setReachedBottom(true)
  }

  const handleAgree = () => {
    const entry = recordAgreement(channel.id)
    onAgreed?.(entry)
  }

  return (
    <div
      onClick={e => { if (closable && e.target === e.currentTarget) onClose?.() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 8, width: 760, maxWidth: 'calc(100vw - 32px)',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)', overflow: 'hidden',
      }}>
        {/* 標題列 */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <FileProtectOutlined style={{ color: '#389e0d', fontSize: 18 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>通路合作合約書</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              版本 {version?.version}
              {readOnly
                ? '　·　檢視模式'
                : reconsent
                ? '　·　合約已更新，需請您重新閱讀並確認同意後才能繼續使用'
                : '　·　請閱讀合約內容並勾選同意後開始使用'}
            </div>
          </div>
          {closable && (
            <Button type="text" size="small" icon={<CloseOutlined />} style={{ color: '#aaa' }} onClick={() => onClose?.()} />
          )}
        </div>

        {/* 更新摘要 */}
        {!readOnly && reconsent && version?.changeSummary && (
          <div style={{
            flexShrink: 0, margin: '12px 20px 0', padding: '8px 12px',
            background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4,
            fontSize: 12.5, color: '#874d00', lineHeight: 1.7,
          }}>
            本次更新重點：{version.changeSummary}
          </div>
        )}

        {/* 合約本文 */}
        <div ref={bodyRef} onScroll={onScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', minHeight: 200 }}>
          <ContractDocument channel={channel} version={version} />
        </div>

        {/* 底列 */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', background: '#fafafa', flexShrink: 0 }}>
          {readOnly ? (
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => onClose?.()}>關閉</Button>
            </div>
          ) : (
            <>
              <Checkbox checked={checked} disabled={!reachedBottom} onChange={e => setChecked(e.target.checked)}>
                <span style={{ color: reachedBottom ? '#2b2b2b' : '#bbb' }}>{CONTRACT_AGREE_LABEL}</span>
              </Checkbox>
              {!reachedBottom && (
                <span style={{ marginLeft: 8, fontSize: 12, color: '#faad14' }}>（請往下閱讀至合約最後）</span>
              )}
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                {closable && <Button onClick={() => onClose?.()}>稍後再說</Button>}
                <Button type="primary" disabled={!checked} onClick={handleAgree}
                  style={checked ? { background: '#389e0d', borderColor: '#389e0d' } : undefined}>
                  同意並開始使用
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
