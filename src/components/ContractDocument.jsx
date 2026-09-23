import { CONTRACT_DOC, CONTRACT_PARTY_A, CONTRACT_AGREE_LABEL } from '../data/contractData'

// ─────────────────────────────────────────────
// 合約全文呈現（乙方欄位由通路資料代入；簽署表格帶入同意時間/版本/IP）
// 供「廠商合約頁」與「同意彈窗」共用。純呈現，不含互動。
// ─────────────────────────────────────────────
const GREEN = '#389e0d'

export default function ContractDocument({ channel, version, agreement }) {
  const partyB = channel?.name ?? '〔系統代入〕'
  // 發票抬頭 / 統編顯示規則（以「有無統編」為準，不看發票聯式）：
  //   1) 有統編（含二聯式但仍有統編者）→ 顯示「發票抬頭／統編」
  //   2) 沒統編（二聯式且無統編）        → 顯示「發票抬頭（二聯式發票，無須統一編號）」
  //   3) 無通路（後台範本檢視）          → 顯示〔系統代入…〕說明字
  const invoiceTitle = channel ? (channel.title ?? channel.name) : null
  const invoiceCell = !channel
    ? '〔系統代入，若為二聯式發票且無統編則顯示「二聯式發票，無須統一編號」〕'
    : channel.taxId
    ? `${invoiceTitle}／${channel.taxId}`
    : `${invoiceTitle}（二聯式發票，無須統一編號）`
  const signRows = [
    ['通路名稱', partyB],
    ['發票抬頭 / 統一編號', invoiceCell],
    ['同意時間', agreement?.agreedAt ?? '〔勾選同意後由系統記錄〕'],
    ['合約版本', version?.version ?? '—'],
    ['IP／裝置識別', agreement?.ip ?? '〔勾選同意後由系統記錄〕'],
  ]

  return (
    <div style={{ fontFamily: "'Noto Sans TC', sans-serif", color: '#2b2b2b', fontSize: 13, lineHeight: 1.9 }}>
      {/* 標題 */}
      <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
        {CONTRACT_DOC.title}
      </div>

      {/* 契約當事人（乙方代入通路名稱） */}
      <div style={{ marginBottom: 4 }}>{CONTRACT_DOC.intro[0]}</div>
      <div style={{ marginBottom: 4 }}>{CONTRACT_DOC.intro[1]}</div>
      <div style={{ marginBottom: 4 }}>
        乙方（通路方）：
        <strong style={{ color: GREEN }}>{partyB}</strong>
        {channel?.taxId && <span style={{ color: '#888' }}>（統一編號 {channel.taxId}）</span>}
        ，以下簡稱「乙方」
      </div>
      <div style={{ marginBottom: 16 }}>{CONTRACT_DOC.intro[3]}</div>

      {/* 條款 */}
      {CONTRACT_DOC.clauses.map(c => (
        <div key={c.no} style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: GREEN, marginBottom: 4 }}>
            {c.no}　{c.title}
          </div>
          {c.paras.map((p, i) => (
            <div key={i} style={{ marginBottom: 3, textAlign: 'justify' }}>{p}</div>
          ))}
        </div>
      ))}

      {/* 乙方閱讀同意（第二十條勾選項的文字呈現） */}
      <div style={{ margin: '4px 0 16px', padding: '10px 14px', background: '#f6ffed', border: `1px solid #d9f7be`, borderRadius: 4 }}>
        ☑ {CONTRACT_AGREE_LABEL}
      </div>

      {/* 簽署 / 系統記錄欄位 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
        <tbody>
          {signRows.map(([k, v]) => (
            <tr key={k}>
              <td style={{ width: 150, border: '1px solid #ddd', background: '#fafafa', padding: '7px 10px', fontWeight: 600 }}>{k}</td>
              <td style={{ border: '1px solid #ddd', padding: '7px 10px' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 甲方法定資訊 */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: 12, color: '#595959', fontSize: 12.5, lineHeight: 1.8 }}>
        <div>甲方：{CONTRACT_PARTY_A.name}　統一編號：{CONTRACT_PARTY_A.taxId}</div>
        <div>客服信箱：{CONTRACT_PARTY_A.csEmail}　客服電話：{CONTRACT_PARTY_A.csPhone}</div>
        <div>地址：{CONTRACT_PARTY_A.address}</div>
      </div>
    </div>
  )
}
