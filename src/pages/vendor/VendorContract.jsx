import { useState, useEffect } from 'react'
import { Card, Button, Alert } from 'antd'
import { useVendor } from '../../context/VendorContext'
import { getCurrentContractVersion } from '../../data/contractData'
import {
  getConsentState, getLatestAgreement, subscribeContractUpdates,
} from '../../utils/contractStore'
import ContractDocument from '../../components/ContractDocument'
import ContractModal from '../../components/ContractModal'

export default function VendorContract() {
  const { channel } = useVendor()
  const [modalOpen, setModalOpen] = useState(false)
  const [tick, setTick] = useState(0)   // 同意後重新計算

  useEffect(() => subscribeContractUpdates(() => setTick(t => t + 1)), [])
  void tick

  if (!channel) return null

  const version = getCurrentContractVersion()
  const state = getConsentState(channel.id)
  const latest = getLatestAgreement(channel.id)
  const agreedCurrent = state === 'agreed_current'

  // 頂部同意狀態
  const banner = {
    agreed_current: {
      type: 'success',
      message: `已同意最新版合約（版本 ${version.version}）`,
      description: latest ? `同意時間：${latest.agreedAt}　·　來源 IP：${latest.ip}` : null,
    },
    agreed_outdated_minor: {
      type: 'info',
      message: `合約有小幅更新（版本 ${version.version}）`,
      description: '本次為小幅更新，您先前的同意仍然有效，無需重新同意。',
    },
    need_first: {
      type: 'warning',
      message: '您尚未同意通路合作合約',
      description: '請閱讀下方合約並勾選同意後，才能開始使用採購系統。',
    },
    need_reconsent: {
      type: 'warning',
      message: `合約已更新至版本 ${version.version}，需重新確認同意`,
      description: version.changeSummary,
    },
  }[state]

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* 同意狀態放在合約書卡片外的上方 */}
      {banner && (
        <Alert
          type={banner.type} showIcon style={{ marginBottom: 16 }}
          message={banner.message} description={banner.description}
          action={!agreedCurrent && (
            <Button type="primary" size="small" onClick={() => setModalOpen(true)}
              style={{ background: '#389e0d', borderColor: '#389e0d' }}>
              閱讀並同意最新版
            </Button>
          )}
        />
      )}

      <Card size="small" title={`通路合作合約書（版本 ${version.version}）`}>
        {/* 直接接合約全文（同意時間 / IP 實際帶入簽署欄位） */}
        <ContractDocument channel={channel} version={version} agreement={latest} />
      </Card>

      {/* 尚未同意最新版時，從彈窗完成勾選同意 */}
      <ContractModal
        open={modalOpen}
        channel={channel}
        version={version}
        closable
        readOnly={false}
        reconsent={state === 'need_reconsent' || state === 'agreed_outdated_minor'}
        onAgreed={() => setModalOpen(false)}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
