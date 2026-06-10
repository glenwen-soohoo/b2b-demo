import { useState } from 'react'
import { Table, Button, Typography, Divider, Modal, Checkbox, Space, message } from 'antd'
import { SearchOutlined, PrinterOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getInvoiceMode } from '../utils/invoiceMode'

const { Text } = Typography
const ECPAY_SEARCH_URL = 'https://einvoice.ecpay.com.tw/SearchInvoice/Invoice'

// 取訂單的「實際出貨品項」
const itemsOf = (o) => o.adjustedItems ?? o.salesAdjustedItems ?? o.items ?? []
// 相同品項 & 相同價錢合併（這就是要帶進綠界發票的明細）
function mergeItems(orders) {
  const map = new Map()
  orders.forEach(o => itemsOf(o).forEach(it => {
    const key = `${it.productId ?? it.productName}@@${it.price}`
    if (!map.has(key)) map.set(key, { productName: it.productName, unit: it.unit ?? '', price: it.price, qty: 0 })
    map.get(key).qty += it.qty
  }))
  return [...map.values()]
}
const sumAmt = (orders) => orders.reduce((s, o) => s + itemsOf(o).reduce((ss, i) => ss + i.qty * i.price, 0), 0)

/**
 * 財務視角的「電子發票」區段：把訂單預先轉成「要開的發票」格式。
 *  - 整合月結（monthly）：channel = 1 張、per_store = 每門市 1 張（合併當月該門市訂單）
 *  - 單筆開票（per_order）：一訂單一張
 *  發票號碼依「開立時機」規則決定有無（整合月結：結算日 +3 天後；單筆開票：到貨 +3 天後）；
 *  尚未開立的可透過右下角「提前列印發票」勾選提前開立。
 *  variant: 'vendor'（查詢綠界發票）/ 'admin'（綠界 ECPay 平台，無放大鏡 icon）
 */
export default function InvoiceSection({ relatedOrders = [], channel, settlement, variant = 'vendor' }) {
  const [detailRow, setDetailRow] = useState(null)
  const [issued, setIssued]       = useState({})      // 提前開立 {key: invoiceNumber}
  const [printOpen, setPrintOpen] = useState(false)
  const [printSel, setPrintSel]   = useState([])
  const { period, taxScope } = getInvoiceMode(channel)
  const today = dayjs()

  let rows = []
  if (relatedOrders.length > 0 && period === 'per_order') {
    // 逐筆開票：一訂單一張，到貨 +3 天後才有發票號
    rows = relatedOrders.map(o => {
      const addr = taxScope === 'per_store' ? channel?.addresses?.find(a => a.storeId === o.storeId) : null
      const opened = o.arrivedAt && today.diff(dayjs(o.arrivedAt), 'day') >= 3
      return {
        key: o.id, orders: [o],
        autoNo: opened ? (o.invoiceNumber || `IV-${dayjs(o.arrivedAt).format('YYYYMM')}-${String(o.id).slice(-4)}`) : null,
        amount: sumAmt([o]),
        store: taxScope === 'per_store' ? (o.store_label ?? '—') : '不分門市',
        buyerName: taxScope === 'per_store' ? (addr?.buyerName ?? channel?.title ?? '—') : (channel?.title ?? '—'),
        buyerTaxId: taxScope === 'per_store' ? (addr?.buyerTaxId ?? channel?.taxId ?? '—') : (channel?.taxId ?? '—'),
        orderCount: 1,
      }
    })
  } else if (relatedOrders.length > 0) {
    // 整合月結：結算日 +3 天後才開（尚未結算 / 未滿 3 天 → 尚未開立）
    const opened = settlement && !settlement.isPending && settlement.createdAt && settlement.createdAt !== '—'
      && today.diff(dayjs(settlement.createdAt), 'day') >= 3
    if (taxScope === 'per_store') {
      const groups = new Map()
      relatedOrders.forEach(o => {
        const k = o.storeId ?? o.store_label ?? '—'
        if (!groups.has(k)) {
          const addr = channel?.addresses?.find(a => a.storeId === o.storeId)
          groups.set(k, {
            key: k, orders: [],
            store: o.store_label ?? addr?.label ?? '—',
            buyerName: addr?.buyerName ?? channel?.title ?? '—',
            buyerTaxId: addr?.buyerTaxId ?? channel?.taxId ?? '—',
          })
        }
        groups.get(k).orders.push(o)
      })
      rows = [...groups.values()].map((g, i) => ({
        ...g, amount: sumAmt(g.orders), orderCount: g.orders.length,
        autoNo: opened ? `IV-${dayjs(settlement.createdAt).format('YYYYMM')}-${String(settlement.id).slice(-3)}${i + 1}` : null,
      }))
    } else {
      rows = [{
        key: 'channel', orders: relatedOrders, store: '不分門市',
        buyerName: channel?.title ?? '—', buyerTaxId: channel?.taxId ?? '—',
        amount: sumAmt(relatedOrders), orderCount: relatedOrders.length,
        autoNo: opened ? `IV-${dayjs(settlement.createdAt).format('YYYYMM')}-${String(settlement.id).slice(-4)}` : null,
      }]
    }
  }

  // 套用「提前開立」結果：發票號 = 已提前開立 ?? 規則自動產生
  rows = rows.map(r => ({ ...r, invoiceNumber: issued[r.key] ?? r.autoNo }))
  const pendingRows = rows.filter(r => !r.invoiceNumber)

  const genNo = (r) =>
    `IV-${today.format('YYYYMM')}-${(String(r.key).replace(/\W/g, '').slice(-4) || '0').padStart(2, '0')}`

  const confirmPrint = () => {
    const add = {}
    printSel.forEach(k => { const r = rows.find(x => x.key === k); if (r) add[k] = genNo(r) })
    setIssued(prev => ({ ...prev, ...add }))
    setPrintOpen(false)
    setPrintSel([])
    message.success(`已開立 ${Object.keys(add).length} 張電子發票`)
  }

  const queryBtn = variant === 'admin'
    ? <Button size="small" href={ECPAY_SEARCH_URL} target="_blank">綠界 ECPay 平台</Button>
    : <Button size="small" icon={<SearchOutlined />} href={ECPAY_SEARCH_URL} target="_blank">查詢綠界發票</Button>

  return (
    <>
      <Divider orientation="left" plain>電子發票</Divider>

      {rows.length === 0 ? (
        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>無可開立發票的訂單</Text>
      ) : (
        <>
          {/* 查詢按鈕：分隔線下方、表格上方靠右 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            {queryBtn}
          </div>

          <Table
            dataSource={rows} rowKey="key" size="small" pagination={false} style={{ marginBottom: 12 }}
            columns={[
              { title: '發票號碼', dataIndex: 'invoiceNumber', width: 130,
                render: v => v
                  ? <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{v}</span>
                  : <Text type="secondary">尚未開立</Text> },
              { title: '金額', dataIndex: 'amount', width: 95, align: 'right',
                render: v => <Text strong style={{ whiteSpace: 'nowrap' }}>${v.toLocaleString()}</Text> },
              { title: '明細', width: 70, align: 'center',
                render: (_, r) => <Button size="small" onClick={() => setDetailRow(r)}>明細</Button> },
              { title: '門市', dataIndex: 'store', ellipsis: true,
                render: v => <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span> },
              { title: '抬頭 / 統編', dataIndex: 'buyerName', ellipsis: true,
                render: (_, r) => (
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ fontSize: 13 }}>{r.buyerName}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', whiteSpace: 'nowrap' }}>{r.buyerTaxId}</div>
                  </div>
                ) },
              { title: '訂單數', dataIndex: 'orderCount', width: 70, align: 'center',
                render: v => <span style={{ whiteSpace: 'nowrap' }}>{v} 筆</span> },
            ]}
          />

          {/* 段落右下角：提前列印（開立）發票 — 僅後台可操作、且全部已開立則不顯示 */}
          {variant === 'admin' && pendingRows.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <Button icon={<PrinterOutlined />} onClick={() => { setPrintSel(pendingRows.map(r => r.key)); setPrintOpen(true) }}>
                提前列印發票
              </Button>
            </div>
          )}
        </>
      )}

      {/* 明細彈窗：相同品項、相同單價已合併；欄序＝數量、單價、金額 */}
      <Modal
        open={!!detailRow} onCancel={() => setDetailRow(null)} footer={null}
        title="發票明細（相同品項、相同單價已合併）" width={540}
      >
        {detailRow && (
          <>
            <Table
              dataSource={mergeItems(detailRow.orders)} rowKey={(_, i) => i}
              size="small" pagination={false}
              columns={[
                { title: '品項', dataIndex: 'productName' },
                { title: '數量', width: 90, align: 'center', render: (_, r) => `${r.qty} ${r.unit}` },
                { title: '單價', dataIndex: 'price', width: 90, align: 'right', render: v => `$${v.toLocaleString()}` },
                { title: '金額', width: 100, align: 'right', render: (_, r) => `$${(r.qty * r.price).toLocaleString()}` },
              ]}
              summary={(data) => {
                const tot = data.reduce((s, r) => s + r.qty * r.price, 0)
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3} align="right"><strong>合計</strong></Table.Summary.Cell>
                    <Table.Summary.Cell><strong style={{ color: '#1677ff' }}>${tot.toLocaleString()}</strong></Table.Summary.Cell>
                  </Table.Summary.Row>
                )
              }}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c' }}>
              ※ 上列為含稅金額；綠界系統會自動換算未稅金額帶入發票，我們僅需提供稅後價格。
            </div>
          </>
        )}
      </Modal>

      {/* 提前列印（開立）發票：勾選後才開立 */}
      <Modal
        open={printOpen} onCancel={() => { setPrintOpen(false); setPrintSel([]) }}
        onOk={confirmPrint} okText="開立所選發票"
        okButtonProps={{ disabled: printSel.length === 0, type: 'primary' }}
        cancelText="取消" title="提前列印發票" width={460}
      >
        {pendingRows.length === 0 ? (
          <Text type="secondary">目前涵蓋的訂單皆已開立發票，無需提前開立。</Text>
        ) : (
          <>
            <Text type="secondary">勾選要提前開立的發票，按「開立所選發票」後才會送出綠界開立並取得發票號碼：</Text>
            <Checkbox.Group style={{ display: 'block', marginTop: 12 }} value={printSel} onChange={setPrintSel}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {pendingRows.map(r => (
                  <Checkbox key={r.key} value={r.key}>
                    {r.store}　${r.amount.toLocaleString()}（{r.orderCount} 筆）
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </>
        )}
      </Modal>
    </>
  )
}
