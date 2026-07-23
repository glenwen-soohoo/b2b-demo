import { useState, useEffect } from 'react';
import {
  Drawer, Descriptions, Table, Timeline, Button, Space, Popconfirm, Tag,
  Divider, Alert, Row, Col, InputNumber, Input, Typography, Tooltip, Select, Dropdown, message,
} from 'antd';
import { SendOutlined, LockOutlined, SaveOutlined, EditOutlined, FilePdfOutlined, CloseOutlined, StopOutlined, DownOutlined, RedoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { exportOrderPdf } from '../utils/exportOrderPdf';
import { generateB2bOrderNo, getConfirmedItems, buildVoidPatch, buildRecreatedOrder } from '../services/orderService';
import { useOrderDetailColumns } from '../hooks/useOrderDetailColumns';
import StatusTag from './StatusTag';
import OrderStateMachine from './OrderStateMachine';
import ShippingCell from './ShippingCell';
import { productMap, channelMap, systemSettings, shippingSettings } from '../data/fakeData';
import { settlementCutoffDay } from '../utils/invoiceMode';

const { Text } = Typography;

// 依溫層分別判斷運費：某溫層有品項且該溫層小計未達免運門檻，就加收該溫層運費（冷凍/常溫各算一次）
function calcShipping(items, qtyOf, priceOf) {
  let shipping = 0;
  for (const zone of ['frozen', 'ambient']) {
    const zoneItems = items.filter(i => productMap[i.productId]?.category === zone);
    if (zoneItems.length === 0) continue;
    const sub = zoneItems.reduce((s, i) => s + qtyOf(i) * priceOf(i), 0);
    const cfg = shippingSettings[zone];
    if (cfg && sub < cfg.freeShippingThreshold) shipping += cfg.shippingFee;
  }
  return shipping;
}

// 結算列：直接做成「表格內的 Summary 列」，運費/折扣/應付金額的數值放進真正的「小計」儲存格，
// 標籤放在「合計」欄位置（靠右），這樣跟上面合計列同欄、同樣靠右對齊，任何環境都不會歪。
// 折扣備註用 rowSpan 橫跨那幾列（放在最左）。
// costIdx = 「成本」欄的 0-based 索引（成本後面固定接 小計/毛利/毛利率 四欄）。
// 規則：沒有運費(=0)不顯示運費列；唯讀且沒有折扣不顯示折扣列與備註。應付 = 小計 − 折扣 + 運費。
function TotalsSummary({ costIdx, cost, revenue, profit, margin, shipping,
                         editable = false, discountAmount = 0, setDiscountAmount,
                         discountNote = '', setDiscountNote, orderDiscount = 0, orderDiscountNote = '' }) {
  const d = editable ? discountAmount : orderDiscount;
  const payable = revenue - d + shipping;
  const showShipping = editable || shipping > 0;
  const showDiscount = editable || d > 0;
  const showNote = editable || d > 0;
  const mc = profit >= 0 ? '#52c41a' : '#ff4d4f';

  const money = [];
  if (showShipping) money.push({ k: 'ship', label: '運費',
    value: <span style={{ color: shipping > 0 ? '#fa8c16' : '#8c8c8c' }}>${shipping.toLocaleString()}</span> });
  if (showDiscount) money.push({ k: 'disc', label: '折扣',
    value: editable
      ? <InputNumber min={0} prefix="-$" size="small" value={discountAmount} onChange={v => setDiscountAmount(v ?? 0)} style={{ width: 76 }} />
      : <span style={{ color: '#fa8c16' }}>-${d.toLocaleString()}</span> });
  money.push({ k: 'pay', label: '應付金額', bold: true,
    value: <strong style={{ color: '#1677ff', fontSize: 15 }}>${payable.toLocaleString()}</strong> });

  const N = money.length;
  // 折扣備註盡量加寬：佔到「合計」欄前一欄為止（例：吃掉數量差異欄），標籤只留最後 1 欄（採購單價，仍靠齊合計）
  const labelSpan = 1;
  const noteSpan = Math.max(1, costIdx - labelSpan);

  return (
    <>
      <Table.Summary.Row>
        <Table.Summary.Cell index={0} colSpan={costIdx} align="right"><strong>合計</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={costIdx} align="right"><strong style={{ color: '#999' }}>${cost.toLocaleString()}</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={costIdx + 1} align="right"><strong style={{ color: '#1677ff' }}>${revenue.toLocaleString()}</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={costIdx + 2} align="right"><strong style={{ color: mc }}>${profit.toLocaleString()}</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={costIdx + 3} align="right"><strong style={{ color: mc }}>{margin}%</strong></Table.Summary.Cell>
      </Table.Summary.Row>
      {money.map((m, i) => (
        <Table.Summary.Row key={m.k}>
          {showNote && i === 0 && (
            <Table.Summary.Cell index={0} colSpan={noteSpan} rowSpan={N}>
              <div style={{ paddingRight: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                  折扣備註{editable && d > 0 && <span style={{ color: '#ff4d4f' }}> *必填</span>}
                </div>
                {editable
                  ? <Input.TextArea value={discountNote} onChange={e => setDiscountNote(e.target.value)}
                      placeholder="折扣原因說明" autoSize={{ minRows: 2 }} />
                  : <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '6px 10px', fontSize: 13, color: '#595959', whiteSpace: 'pre-line' }}>
                      {orderDiscountNote || <Text type="secondary">—</Text>}
                    </div>}
              </div>
            </Table.Summary.Cell>
          )}
          <Table.Summary.Cell index={showNote ? noteSpan : 0} colSpan={showNote ? labelSpan : costIdx} align="right">
            {m.bold ? <strong>{m.label}</strong> : <span style={{ color: '#8c8c8c' }}>{m.label}</span>}
          </Table.Summary.Cell>
          <Table.Summary.Cell index={costIdx} />
          <Table.Summary.Cell index={costIdx + 1} align="right">{m.value}</Table.Summary.Cell>
          <Table.Summary.Cell index={costIdx + 2} colSpan={2} />
        </Table.Summary.Row>
      ))}
    </>
  );
}

function getSettlementMonthOptions(settlementDay, currentValue) {
  const now = dayjs()
  const months = [now, now.add(1, 'month'), now.add(2, 'month')]
  const options = months.map(m => ({
    value: m.format('YYYY-MM'),
    label: `${m.format('YYYY-MM')}（${m.month() + 1}月${settlementDay === 'last' ? '底' : settlementDay + '日'}）`,
  }))
  if (currentValue && !options.some(o => o.value === currentValue)) {
    const m = dayjs(currentValue + '-01')
    options.unshift({
      value: currentValue,
      label: `${currentValue}（${m.month() + 1}月${settlementDay === 'last' ? '底' : settlementDay + '日'}）`,
    })
  }
  return options
}

function calcAutoSettlementMonth(settlementDay) {
  const now = dayjs()
  return now.date() > settlementCutoffDay(settlementDay)
    ? now.add(1, 'month').format('YYYY-MM')
    : now.format('YYYY-MM')
}

function temperatureZoneTag(items) {
  const zones = new Set(items.map(i => productMap[i.productId]?.category).filter(Boolean));
  return (
    <Space size={4}>
      {zones.has('frozen')  && <Tag color="blue"  style={{ margin: 0 }}>❄️ 冷凍</Tag>}
      {zones.has('ambient') && <Tag color="green" style={{ margin: 0 }}>🌿 常溫</Tag>}
    </Space>
  );
}

function calcProfitFromMaps(items, adjQtyMap, adjPriceMap) {
  const revenue = items.reduce((s, i) => s + (adjQtyMap[i.productId] ?? i.qty) * (adjPriceMap[i.productId] ?? i.price), 0);
  const cost    = items.reduce((s, i) => s + (adjQtyMap[i.productId] ?? i.qty) * (i.cost ?? 0), 0);
  const profit  = revenue - cost;
  const margin  = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
  return { revenue, cost, profit, margin };
}

function calcProfit(items) {
  return calcProfitFromMaps(
    items,
    Object.fromEntries(items.map(i => [i.productId, i.qty])),
    Object.fromEntries(items.map(i => [i.productId, i.price])),
  );
}

function NoteField({ label, value, onChange, locked, placeholder, rows = 2, fillHeight = false }) {
  return (
    <div style={fillHeight ? { display: 'flex', flexDirection: 'column', flex: 1 } : {}}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
      {locked
        ? <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '6px 10px', fontSize: 13, color: '#595959', whiteSpace: 'pre-line', ...(fillHeight ? { flex: 1 } : { minHeight: 54 }) }}>
            {value || <Text type="secondary">—</Text>}
          </div>
        : <Input.TextArea
            rows={fillHeight ? undefined : rows}
            style={fillHeight ? { flex: 1, resize: 'none' } : {}}
            value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          />
      }
    </div>
  );
}

export default function OrderDetail({ order, open, onClose, onStatusChange, onRecreate }) {
  const [adjQtyMap,      setAdjQtyMap]      = useState({});
  const [adjPriceMap,    setAdjPriceMap]    = useState({});
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountNote,   setDiscountNote]   = useState('');
  const [shippingNote,   setShippingNote]   = useState('');
  const [warehouseNote,  setWarehouseNote]  = useState('');
  const [csNote,         setCsNote]         = useState('');
  const [b2bNote,        setB2bNote]        = useState('');
  const [editMode,       setEditMode]       = useState(false);
  const [editItems,      setEditItems]      = useState([]);
  const [localSettlementMonth, setLocalSettlementMonth] = useState('');
  const [voidConfirm,    setVoidConfirm]    = useState({ open: false, mode: null }); // mode: 'void' | 'recreate'

  const { salesConfirmCols, editCols, itemCols } = useOrderDetailColumns({
    adjQtyMap, setAdjQtyMap,
    adjPriceMap, setAdjPriceMap,
    editItems, setEditItems,
  });

  useEffect(() => {
    if (order) {
      const source = order.salesAdjustedItems ?? order.items;
      setAdjQtyMap(Object.fromEntries(source.map(i => [i.productId, i.qty])));
      setAdjPriceMap(Object.fromEntries(order.items.map(i => [i.productId, i.price])));
      setDiscountAmount(order.discount_amount ?? 0);
      setDiscountNote(order.discount_note ?? '');
      setShippingNote(order.shipping_note ?? '');
      setWarehouseNote(order.warehouse_note ?? '');
      const defaultCsNote = channelMap[order.channelId]?.cs_note_default ?? '';
      setCsNote(order.cs_note ?? defaultCsNote);
      setB2bNote(order.b2b_note ?? order.vendorNote ?? '');
      const settlementDay = channelMap[order.channelId]?.settlementDay ?? 25;
      setLocalSettlementMonth(order.settlementMonth || calcAutoSettlementMonth(settlementDay));
      setEditMode(false);
      setEditItems([]);
    }
  }, [order?.id]);

  if (!order) return null;

  const displayItems = getConfirmedItems(order);

  const { revenue, cost, profit, margin } = order.status === 'pending_sales'
    ? calcProfitFromMaps(order.items, adjQtyMap, adjPriceMap)
    : calcProfit(displayItems);

  const discountForCalc = order.status === 'pending_sales' ? discountAmount : (order.discount_amount ?? 0);

  // 運費：pending_sales 依當前確認的數量/單價即時計算；其餘狀態用已確認品項
  const shipping = order.status === 'pending_sales'
    ? calcShipping(order.items, i => adjQtyMap[i.productId] ?? i.qty, i => adjPriceMap[i.productId] ?? i.price)
    : calcShipping(displayItems, i => i.qty, i => i.price);
  // 應付金額 = 商品小計 − 折扣 + 運費（廠商實際要付的金額）
  const payable = revenue - discountForCalc + shipping;

  const isSettled    = order.status === 'settling' || order.status === 'settled_done';
  const isVoided     = order.status === 'voided';
  const canEditAfter = (order.status === 'ordered' || order.status === 'arrived') && !isSettled && !isVoided;
  const noteLocked   = isSettled || isVoided || (canEditAfter && !editMode);

  const handleSaveDraft = () => {
    const adjustedItems = order.items.map(i => ({
      ...i,
      qty:   adjQtyMap[i.productId]   ?? i.qty,
      price: adjPriceMap[i.productId] ?? i.price,
    }));
    onStatusChange(order.id, 'pending_sales', null, {
      salesAdjustedItems: adjustedItems,
      shipping_note:   shippingNote   || null,
      warehouse_note:  warehouseNote  || null,
      cs_note:         csNote         || null,
      b2b_note:        b2bNote        || null,
      discount_amount: discountAmount,
      discount_note:   discountNote   || null,
      settlementMonth: localSettlementMonth || order.settlementMonth,
    });
    message.success('修改已儲存');
  };

  const handleSalesConfirm = () => {
    const adjustedItems = order.items.map(i => ({
      ...i,
      qty:   adjQtyMap[i.productId]   ?? i.qty,
      price: adjPriceMap[i.productId] ?? i.price,
    }));
    const qtyChanges   = order.items.filter(i => (adjQtyMap[i.productId] ?? i.qty) !== i.qty).map(i => `${i.productName}: ${i.qty}→${adjQtyMap[i.productId]}`);
    const priceChanges = order.items.filter(i => (adjPriceMap[i.productId] ?? i.price) !== i.price).map(i => `${i.productName}: 單價$${i.price}→$${adjPriceMap[i.productId]}`);
    const allChanges   = [...qtyChanges, ...priceChanges];
    const logMsg       = allChanges.length > 0
      ? `[手動操作] 業務確認完成，建立正式訂單（${allChanges.join('、')}）`
      : '[手動操作] 業務確認完成，建立正式訂單（數量與單價無變動）';

    const b2bOrderNo = order.b2b_order_no || generateB2bOrderNo();

    onStatusChange(order.id, 'ordered', {
      time: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
      action: logMsg,
    }, {
      salesAdjustedItems: adjustedItems,
      shipping_note:   shippingNote   || null,
      warehouse_note:  warehouseNote  || null,
      cs_note:         csNote         || null,
      b2b_note:        b2bNote        || null,
      b2b_order_no:    b2bOrderNo,
      discount_amount: discountAmount,
      discount_note:   discountNote  || null,
      settlementMonth: localSettlementMonth || order.settlementMonth,
    });
  };

  const handleStartEdit = () => {
    setEditItems(displayItems.map(i => ({ ...i })));
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setShippingNote(order.shipping_note ?? '');
    setWarehouseNote(order.warehouse_note ?? '');
    setCsNote(order.cs_note ?? channelMap[order.channelId]?.cs_note_default ?? '');
    setB2bNote(order.b2b_note ?? order.vendorNote ?? '');
    setDiscountAmount(order.discount_amount ?? 0);
    setDiscountNote(order.discount_note ?? '');
    setEditMode(false);
    setEditItems([]);
  };

  const handleSaveEdit = () => {
    // TODO_FRUIT_WEB: 「建單後修改」的連動規則（建單走既有「企業訂單匯入」邏輯，主站訂單金額帶 0）
    //   - 品項明細：**不**同步到正式訂單的 OrderDetail（避免覆蓋已出貨紀錄）。
    //   - 訂單總金額：**不連動**——主站 Orders.TotalPrice 一律 0（B2B 發票走 B2B 平台、不靠主站金額），
    //     真實金額存 B2B 端 B2BSettlement / B2BPreOrder。
    //   - 備註文字連動：出貨備註(shipping_note) / 倉庫備註(warehouse_note) / 客服備註(cs_note)
    //     需呼叫 sync-notes API 同步寫回主站（Orders.Remarks / CustomerServiceRemark 等）。
    //     ⚠️ B2B備註(b2b_note) **僅通路與後台可見、不寫回主站**（不帶入正式後台），不在同步範圍。
    //   串接時以此為優先：細項不動、金額不動（恆 0）、出貨/倉庫/客服備註連動、**B2B備註不連動**。
    const changes = [];
    displayItems.forEach(orig => {
      const edited = editItems.find(i => i.productId === orig.productId);
      if (!edited) return;
      if (orig.qty !== edited.qty) changes.push(`${edited.productName}: 數量 ${orig.qty}→${edited.qty}`);
      if (orig.price !== edited.price) changes.push(`${edited.productName}: 單價 $${orig.price}→$${edited.price}`);
    });
    const logMsg = changes.length > 0
      ? `[手動操作] 建單後修改（${changes.join('、')}）`
      : '[手動操作] 建單後修改（無變動）';

    onStatusChange(order.id, order.status, {
      time: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
      action: logMsg,
    }, {
      adjustedItems:   editItems,
      shipping_note:   shippingNote   || null,
      warehouse_note:  warehouseNote  || null,
      cs_note:         csNote         || null,
      b2b_note:        b2bNote        || null,
      discount_amount: discountAmount,
      discount_note:   discountNote  || null,
    });

    setEditMode(false);
    setEditItems([]);
  };

  const handleSettlementMonthChange = (m) => {
    setLocalSettlementMonth(m);
    onStatusChange(order.id, order.status, null, { settlementMonth: m });
  };

  // 純作廢：呼叫 fruit_web 刪單 API、狀態改 voided
  const handleVoid = async () => {
    try {
      message.loading({ content: '作廢中…', key: 'void', duration: 0 });
      const patch = await buildVoidPatch(order);
      onStatusChange(order.id, patch.status, patch.logs[patch.logs.length - 1], {
        voided_at: patch.voided_at,
        voided_reason: patch.voided_reason,
      });
      message.success({ content: '訂單已作廢', key: 'void' });
    } catch (err) {
      console.error(err);
      message.error({ content: err.message || '作廢失敗', key: 'void' });
    }
  };

  // 作廢 + 重新建單：先作廢舊單，再 push 一筆新訂單
  const handleVoidAndRecreate = async () => {
    try {
      message.loading({ content: '作廢並重新建單…', key: 'void', duration: 0 });
      const patch = await buildVoidPatch(order, '作廢重新建單');
      onStatusChange(order.id, patch.status, patch.logs[patch.logs.length - 1], {
        voided_at: patch.voided_at,
        voided_reason: patch.voided_reason,
      });
      const newOrder = buildRecreatedOrder(order);
      onRecreate?.(newOrder);
      message.success({ content: `已作廢，並建立新訂單 ${newOrder.id}`, key: 'void' });
      onClose();
    } catch (err) {
      console.error(err);
      message.error({ content: err.message || '作廢失敗', key: 'void' });
    }
  };

  // 重新建單（僅作廢狀態下使用）：複製舊單建立新一筆 pending_sales
  const handleRecreate = () => {
    const newOrder = buildRecreatedOrder(order);
    onRecreate?.(newOrder);
    message.success(`已建立新訂單 ${newOrder.id}`);
    onClose();
  };

  const itemTableLabel = order.adjustedItems
    ? '建單後修改品項'
    : order.salesAdjustedItems
    ? '業務確認品項'
    : '訂購品項';

  const displayDiscount = (order.status === 'pending_sales') ? discountAmount : (order.discount_amount ?? 0);

  return (
    <>
      <Drawer
        title={
          <Space>
            <span style={{ fontWeight: 700 }}>{order.id}</span>
            <StatusTag status={order.status} />
            {temperatureZoneTag(order.items)}
            {isSettled && <LockOutlined style={{ color: '#722ed1' }} />}
            {isVoided && <StopOutlined style={{ color: '#cf1322' }} />}
          </Space>
        }
        open={open}
        onClose={() => { handleCancelEdit(); onClose(); }}
        width={900}
        extra={<Space />}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, color: '#555' }}>訂單進度</div>
          <OrderStateMachine status={order.status} />
        </div>

        {isSettled && (
          <Alert type="warning" showIcon icon={<LockOutlined />}
            message="此B2B訂單已結算鎖定，不可再異動"
            style={{ marginBottom: 16 }}
          />
        )}

        {isVoided && (
          <Alert type="error" showIcon icon={<StopOutlined />}
            message="此訂單已作廢"
            description={
              <Space direction="vertical" size={2} style={{ fontSize: 12 }}>
                {order.backendOrderId && <span>後台正式訂單號 <Text code>{order.backendOrderId}</Text> 已同步刪除</span>}
                {order.voided_at && <span>作廢時間：{order.voided_at}</span>}
                {order.voided_reason && <span>作廢原因：{order.voided_reason}</span>}
              </Space>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={12} style={{ marginBottom: 20 }}>
          {[
            { label: '品項總計', value: revenue, prefix: '$', color: '#1677ff' },
            { label: '運費', value: shipping, prefix: '$', color: shipping > 0 ? '#fa8c16' : '#bbb' },
            { label: '折扣', value: displayDiscount, prefix: '-$', color: displayDiscount > 0 ? '#fa8c16' : '#bbb' },
            { label: '應收金額', value: payable, prefix: '$', color: '#13c2c2' },
            { label: '整單毛利率', value: margin, suffix: '%', color: profit >= 0 ? '#52c41a' : '#ff4d4f' },
          ].map(s => (
            <Col flex="1" key={s.label}>
              <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>
                  {s.prefix}{Number(s.value).toLocaleString()}{s.suffix}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
          <Descriptions.Item label="B2B訂單號" span={2}>
            {order.b2b_order_no
              ? <Tag color="blue">{order.b2b_order_no}</Tag>
              : <Text type="secondary">—</Text>
            }
          </Descriptions.Item>
          <Descriptions.Item label="通路名稱">{order.channelName}</Descriptions.Item>
          <Descriptions.Item label="結算月份">
            {!isSettled && !isVoided
              ? <Select
                  size="small"
                  value={localSettlementMonth || order.settlementMonth}
                  onChange={handleSettlementMonthChange}
                  options={getSettlementMonthOptions(channelMap[order.channelId]?.settlementDay ?? 25, localSettlementMonth || order.settlementMonth)}
                  style={{ width: 180 }}
                />
              : (order.settlementMonth || <Text type="secondary">—</Text>)
            }
          </Descriptions.Item>
          <Descriptions.Item label="建立日期">{order.createdAt}</Descriptions.Item>
          <Descriptions.Item label="出貨地址">{order.shippingAddress}</Descriptions.Item>
          <Descriptions.Item label="後台正式訂單號">
            {order.backendOrderId || <Text type="secondary">—</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="物流單號">
            <ShippingCell blackCatNum={order.blackCatNum} />
          </Descriptions.Item>
          {/* 訂單級開票模式：顯示寫入主站 Orders.CompanyName / TaxId 的快照值 */}
          {order.buyerNameSnapshot && (
            <Descriptions.Item label="發票買受人" span={2}>
              <Space size={6} wrap>
                <span>{order.buyerNameSnapshot}</span>
                <Text code style={{ fontSize: 11 }}>{order.buyerTaxIdSnapshot}</Text>
                {order.invoiceTypeSnapshot && (
                  <Tag style={{ fontSize: 10 }}>{order.invoiceTypeSnapshot}</Tag>
                )}
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* pending_sales：確認數量與單價 */}
        {order.status === 'pending_sales' && (
          <>
            <Table
              dataSource={order.items}
              rowKey="productId"
              size="small"
              pagination={false}
              columns={salesConfirmCols}
              summary={() => {
                const q = i => adjQtyMap[i.productId] ?? i.qty;
                const p = i => adjPriceMap[i.productId] ?? i.price;
                const totalCost    = order.items.reduce((s, i) => s + q(i) * (i.cost ?? 0), 0);
                const totalRevenue = order.items.reduce((s, i) => s + q(i) * p(i), 0);
                const totalProfit  = totalRevenue - totalCost;
                const totalMargin  = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : '0.0';
                return (
                  <TotalsSummary
                    costIdx={5} cost={totalCost} revenue={totalRevenue} profit={totalProfit} margin={totalMargin}
                    shipping={shipping} editable
                    discountAmount={discountAmount} setDiscountAmount={setDiscountAmount}
                    discountNote={discountNote} setDiscountNote={setDiscountNote}
                  />
                );
              }}
              style={{ marginBottom: 16 }}
            />
          </>
        )}

        {/* 建單後修改（editMode） */}
        {editMode && (
          <>
            <Divider orientation="left" plain>建單後修改（編輯中）</Divider>
            <Table
              dataSource={editItems}
              columns={editCols}
              rowKey="productId"
              size="small"
              pagination={false}
              style={{ marginBottom: 12 }}
              summary={() => {
                const editCost     = editItems.reduce((s, i) => s + i.qty * (i.cost ?? 0), 0);
                const editTotal    = editItems.reduce((s, i) => s + i.qty * i.price, 0);
                const editProfit   = editTotal - editCost;
                const editMargin   = editTotal > 0 ? (editProfit / editTotal * 100).toFixed(1) : '0.0';
                return (
                  <TotalsSummary
                    costIdx={4} cost={editCost} revenue={editTotal} profit={editProfit} margin={editMargin}
                    shipping={calcShipping(editItems, i => i.qty, i => i.price)} editable
                    discountAmount={discountAmount} setDiscountAmount={setDiscountAmount}
                    discountNote={discountNote} setDiscountNote={setDiscountNote}
                  />
                );
              }}
            />
          </>
        )}

        {/* 其他狀態品項表格（唯讀） */}
        {order.status !== 'pending_sales' && !editMode && (
          <>
            <Divider orientation="left" plain>{itemTableLabel}（含損益）</Divider>
            <Table
              dataSource={displayItems}
              columns={itemCols}
              rowKey="productId"
              size="small"
              pagination={false}
              summary={() => {
                const totalMargin = revenue > 0 ? (profit / revenue * 100).toFixed(1) : '0.0';
                return (
                  <TotalsSummary
                    costIdx={4} cost={cost} revenue={revenue} profit={profit} margin={totalMargin}
                    shipping={shipping}
                    orderDiscount={order.discount_amount ?? 0} orderDiscountNote={order.discount_note ?? ''}
                  />
                );
              }}
              style={{ marginBottom: 16 }}
            />
          </>
        )}

        <Divider orientation="left" plain>備註</Divider>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'stretch' }}>
          {/* 左：B2B備註（通路可見，性質特殊獨立） */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <NoteField
              label="B2B備註（通路/後台填寫，僅通路可見，不會帶入正式後台）"
              value={b2bNote} onChange={setB2bNote} locked={noteLocked}
              placeholder="與通路往來的備註（通路前台亦可填寫）" fillHeight
            />
          </div>
          {/* 右：出貨、倉庫、客服三個後台備註直排 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <NoteField
              label="出貨備註（後台填寫，通路、正式後台、倉庫、物流可見）"
              value={shippingNote} onChange={setShippingNote} locked={noteLocked}
              placeholder="出貨相關備註（僅後台填寫）"
            />
            <NoteField
              label="倉庫備註（後台填寫，僅正式後台、倉庫、物流可見）"
              value={warehouseNote} onChange={setWarehouseNote} locked={noteLocked}
              placeholder="提醒倉庫的注意事項"
            />
            <NoteField
              label="客服備註（後台填寫，僅正式後台、自配單可見）"
              value={csNote} onChange={setCsNote} locked={noteLocked}
              placeholder="內部客服用備註"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Space>
            {(order.status === 'pending_sales' || order.status === 'ordered' || order.status === 'arrived' || isSettled || isVoided) && (
              <Button
                icon={<FilePdfOutlined />}
                onClick={async () => {
                  try {
                    message.loading({ content: 'PDF 產生中…', key: 'pdf', duration: 0 })
                    await exportOrderPdf({ order, channel: channelMap[order.channelId], systemSettings })
                    message.success({ content: '採購確認單已下載', key: 'pdf' })
                  } catch (err) {
                    console.error(err)
                    message.error({ content: err.message || '匯出失敗', key: 'pdf' })
                  }
                }}
              >
                匯出 PDF
              </Button>
            )}
            {/* 「作廢」下拉按鈕：僅在「已成立訂單」狀態下出現 */}
            {order.status === 'ordered' && (
              <Popconfirm
                open={voidConfirm.open}
                title={voidConfirm.mode === 'recreate'
                  ? '確認執行「作廢並重新建單」？'
                  : '確認執行「作廢訂單」？'}
                description={
                  voidConfirm.mode === 'recreate' ? (
                    <span>
                      舊訂單後台正式訂單號 <Text code>{order.backendOrderId ?? '—'}</Text> 將<strong>同步刪除</strong>，<br />
                      並建立一筆新的「待業務確認」訂單，<br />
                      給予新的 B2B 編號，原始品項會帶入。
                    </span>
                  ) : (
                    <span>
                      後台正式訂單號 <Text code>{order.backendOrderId ?? '—'}</Text> 將<strong>同步刪除</strong>，<br />
                      作廢後此訂單<strong>無法</strong>再做任何修改。
                    </span>
                  )
                }
                onConfirm={() => {
                  if (voidConfirm.mode === 'recreate') handleVoidAndRecreate();
                  else handleVoid();
                  setVoidConfirm({ open: false, mode: null });
                }}
                onCancel={() => setVoidConfirm({ open: false, mode: null })}
                okText="確認" cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'void_only',
                        label: '純作廢',
                        icon: <StopOutlined />,
                        onClick: () => setVoidConfirm({ open: true, mode: 'void' }),
                      },
                      {
                        key: 'void_and_recreate',
                        label: '作廢重新建單',
                        icon: <RedoOutlined />,
                        onClick: () => setVoidConfirm({ open: true, mode: 'recreate' }),
                      },
                    ],
                  }}
                  trigger={['click']}
                >
                  <Button danger icon={<StopOutlined />}>
                    作廢 <DownOutlined />
                  </Button>
                </Dropdown>
              </Popconfirm>
            )}
          </Space>
          <Space>
            {order.status === 'pending_sales' && (
              <>
                <Button icon={<SaveOutlined />} onClick={handleSaveDraft}>儲存</Button>
                <Popconfirm
                  title="確認執行「業務確認完成，建立正式訂單」？"
                  description={
                    <span>
                      建單會於無毒農後台建立 <strong>0 元訂單</strong>。<br />
                      建單後，未來「建單後修改」調整細項<strong>不會</strong>連動正式訂單<br />
                      僅 <strong>備註文字</strong> 會連動調整。
                    </span>
                  }
                  onConfirm={handleSalesConfirm}
                  okText="確認" cancelText="取消"
                  disabled={discountAmount > 0 && !discountNote.trim()}
                >
                  <Tooltip title={discountAmount > 0 && !discountNote.trim() ? '折扣金額大於0時，折扣備註為必填' : ''}>
                    <Button type="primary" icon={<SendOutlined />}
                      disabled={discountAmount > 0 && !discountNote.trim()}>
                      業務確認完成，建立正式訂單
                    </Button>
                  </Tooltip>
                </Popconfirm>
              </>
            )}
            {canEditAfter && !editMode && (
              <Button icon={<EditOutlined />} onClick={handleStartEdit}>建單後修改</Button>
            )}
            {/* 作廢狀態：「建單後修改」位置改為「重新建單」 */}
            {isVoided && (
              <Popconfirm
                title="確認重新建單？"
                description={<span>將以原始品項建立一筆新的「待業務確認」B2B 訂單，並產生新的 B2B 編號。</span>}
                onConfirm={handleRecreate}
                okText="確認" cancelText="取消"
              >
                <Button type="primary" icon={<RedoOutlined />}>重新建單</Button>
              </Popconfirm>
            )}
            {editMode && (
              <>
                <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>取消</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveEdit}>儲存修改</Button>
              </>
            )}
          </Space>
        </div>

        <Divider orientation="left" plain>操作紀錄</Divider>
        <Timeline
          style={{ marginBottom: 24 }}
          items={order.logs.map(l => ({
            children: (
              <div>
                <Tag color="default" style={{ fontSize: 11 }}>{l.time}</Tag>
                <span style={{ marginLeft: 8 }}>{l.action}</span>
              </div>
            ),
          }))}
        />
      </Drawer>
    </>
  );
}
