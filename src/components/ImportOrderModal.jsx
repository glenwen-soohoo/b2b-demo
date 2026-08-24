import { useState } from 'react'
import { Modal, Upload, Button, Table, Alert, Typography, Space, Tag, message } from 'antd'
import { InboxOutlined, FileExcelOutlined, CheckCircleOutlined } from '@ant-design/icons'
import ExcelJS from 'exceljs'

const { Text } = Typography
const { Dragger } = Upload

// 品項唯一鍵：名稱 + 規格（對應空白採購單 B 欄的 richText「名稱\n規格」）
const keyOf = (name, spec) => `${(name ?? '').trim()}|${(spec ?? '').trim()}`

// 解析「填好數量的空白採購單」：讀每個工作表的 B 欄(品項名)、D 欄(數量)，比對本通路品項表
async function parseOrderWorkbook(file, products) {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(await file.arrayBuffer())

  const byKey = new Map(products.map(p => [keyOf(p.name, p.spec), p]))
  const byName = new Map(products.map(p => [(p.name ?? '').trim(), p]))   // 後備：只用名稱比對

  const matched = []          // { product, qty, note }
  const issues  = []          // { name, reason }
  const seen    = new Set()

  wb.eachSheet(ws => {
    ws.eachRow(row => {
      const bText = (row.getCell(2).text || '').trim()      // B：品項（名稱\n規格）
      const rawQty = row.getCell(4).value                    // D：數量
      const qty = typeof rawQty === 'object' && rawQty ? Number(rawQty.result) : Number(rawQty)
      if (!bText || !Number.isFinite(qty) || qty <= 0) return

      const [name, spec] = bText.split('\n')
      const product = byKey.get(keyOf(name, spec)) || byName.get((name ?? '').trim())
      if (!product) { issues.push({ name: bText.replace('\n', ' '), reason: '不在本通路品項表，未帶入' }); return }
      if (seen.has(product.id)) return
      seen.add(product.id)

      if (product.isListed === false) { issues.push({ name: product.name, reason: '商品已下架，未帶入' }); return }
      if (product.stockMode === 'out_of_stock') { issues.push({ name: product.name, reason: '商品目前缺貨，未帶入' }); return }

      let finalQty = qty, note = null
      if (product.stockMode === 'limited' && qty > product.stockLimit) {
        finalQty = product.stockLimit
        note = `超過庫存上限 ${product.stockLimit}，已調整`
      }
      matched.push({ product, qty: finalQty, note })
    })
  })

  return { matched, issues }
}

export default function ImportOrderModal({ open, onClose, products, onConfirm }) {
  const [parsing, setParsing] = useState(false)
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState(null)   // { matched, issues }

  const handleFile = async (file) => {
    setParsing(true)
    setFileName(file.name)
    try {
      const r = await parseOrderWorkbook(file, products)
      setResult(r)
      if (r.matched.length === 0) {
        message.warning('檔案中沒有可帶入的品項（請確認是本通路的採購單且已填數量）')
      }
    } catch (err) {
      console.error(err)
      message.error('採購單解析失敗，請確認上傳的是正確的 Excel 採購單')
      setResult(null)
    } finally {
      setParsing(false)
    }
    return false   // 阻止 antd 自動上傳
  }

  const handleConfirm = () => {
    const qtyMap = {}
    result.matched.forEach(m => { qtyMap[m.product.id] = m.qty })
    onConfirm(qtyMap)   // 由父層負責關閉本彈窗並開啟下單彈窗；狀態於 afterOpenChange 關閉後清空
  }

  const canContinue = result && result.matched.length > 0

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<Space><FileExcelOutlined style={{ color: '#389e0d' }} />匯入採購單</Space>}
      width={620}
      afterOpenChange={vis => {
        // 彈窗完全關閉後才清空狀態，避免打斷關閉動畫（antd 慣用做法）
        if (!vis) { setParsing(false); setFileName(''); setResult(null) }
      }}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button
          key="ok" type="primary" icon={<CheckCircleOutlined />}
          disabled={!canContinue}
          style={canContinue ? { background: '#52c41a', borderColor: '#52c41a' } : undefined}
          onClick={handleConfirm}
        >
          確認並前往下單{canContinue ? `（${result.matched.length} 項）` : ''}
        </Button>,
      ]}
    >
      <Dragger
        accept=".xlsx"
        multiple={false}
        showUploadList={false}
        beforeUpload={handleFile}
        disabled={parsing}
        style={{ marginBottom: result ? 16 : 0 }}
      >
        <p style={{ margin: 0 }}><InboxOutlined style={{ fontSize: 40, color: '#52c41a' }} /></p>
        <p style={{ margin: '8px 0 4px', fontSize: 15 }}>點擊或拖曳「填好數量的採購單」到這裡</p>
        <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
          請先用「下載空白採購單」取得檔案，填完數量後上傳（.xlsx）
        </p>
        {fileName && (
          <p style={{ margin: '10px 0 0', fontSize: 13, color: '#389e0d' }}>
            <FileExcelOutlined /> {fileName}
          </p>
        )}
      </Dragger>

      {result && (
        <>
          {result.matched.length > 0 ? (
            <>
              <Alert
                type="success" showIcon style={{ marginBottom: 12 }}
                message={`已辨識 ${result.matched.length} 項商品，確認後將帶入下單流程`}
              />
              <Table
                dataSource={result.matched}
                rowKey={m => m.product.id}
                size="small"
                pagination={false}
                scroll={{ y: 240 }}
                columns={[
                  { title: '品項', render: (_, m) => (
                    <Space direction="vertical" size={0}>
                      {m.product.spec && <Tag style={{ fontSize: 11 }}>{m.product.spec}</Tag>}
                      <span>{m.product.name}</span>
                    </Space>
                  ) },
                  { title: '數量', dataIndex: 'qty', width: 90, align: 'center',
                    render: (q, m) => (
                      <>
                        <Text strong>{q}</Text>
                        {m.note && <div style={{ fontSize: 11, color: '#fa8c16' }}>{m.note}</div>}
                      </>
                    ) },
                ]}
              />
            </>
          ) : (
            <Alert type="warning" showIcon message="沒有可帶入的品項" />
          )}

          {result.issues.length > 0 && (
            <Alert
              type="warning" showIcon style={{ marginTop: 12 }}
              message={`${result.issues.length} 項未帶入`}
              description={
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {result.issues.map((it, i) => (
                    <li key={i} style={{ fontSize: 12 }}>
                      <Text strong>{it.name}</Text>
                      <Text type="secondary"> — {it.reason}</Text>
                    </li>
                  ))}
                </ul>
              }
            />
          )}
        </>
      )}
    </Modal>
  )
}
