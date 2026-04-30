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
import { productMap, channelMap, systemSettings } from '../data/fakeData';

const { Text } = Typography;

const INVOICE_MODE_LABEL = {
  per_order:         '訂單單筆開票',
  monthly_per_store: '門市分開月結',
  monthly_combined:  '整合月結',
};

function getSettlementMonthOptions(settlementDay, currentValue) {
  const now = dayjs()
  const months = [now, now.add(1, 'month'), now.add(2, 'month')]
  const options = months.map(m => ({
    value: m.format('YYYY-MM'),
    label: `${m.format('YYYY-MM')}（${m.month() + 1}月${settlementDay}日）`,
  }))
  if (currentValue && !options.some(o => o.value === currentValue)) {
    const m = dayjs(currentValue + '-01')
    options.unshift({
      value: currentValue,
      label: `${currentValue}（${m.month() + 1}月${settlementDay}日）`,
    })
  }
  return options
}

function calcAutoSettlementMonth(settlementDay) {
  const now = dayjs()
  return now.date() > (settlementDay ?? 25)
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
      setShippingNote(order.shipping_note ?? order.vendorNote ?? '');
      setWarehouseNote(order.warehouse_note ?? '');
      const defaultCsNote = channelMap[order.channelId]?.cs_note_default ?? '';
      setCsNote(order.cs_note ?? defaultCsNote);
      setB2bNote(order.b2b_note ?? '');
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

  const netRevenue = revenue - (order.status === 'pending_sales' ? discountAmount : (order.discount_amount ?? 0));

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
    setShippingNote(order.shipping_note ?? order.vendorNote ?? '');
    setWarehouseNote(order.warehouse_note ?? '');
    setCsNote(order.cs_note ?? channelMap[order.channelId]?.cs_note_default ?? '');
    setB2bNote(order.b2b_note ?? '');
    setDiscountAmount(order.discount_amount ?? 0);
    setDiscountNote(order.discount_note ?? '');
    setEditMode(false);
    setEditItems([]);
  };

  const handleSaveEdit = () => {
    // TODO_FRUIT_WEB: 「建單後修改」的連動規則
    //   - adjustedItems（品項明細）：**不**同步到正式訂單的 OrderDetail，
    //     避免覆蓋已出貨的倉庫數量紀錄。
    //   - 訂單總金額（adjustedItems 加總 - discount_amount）：
    //     需呼叫 PUT /GoX/Orders/UpdatePrice/{backendOrderId} 同步更新 Orders.TotalPrice。
    //   - 備註欄位（shipping_note / warehouse_note / cs_note）：
    //     需呼叫對應 API 同步寫回 fruit_web Orders 備註欄位。
    //   串接時以此為優先，細項不動、金額與備註要更新。
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
            { label: '銷售金額', value: revenue, prefix: '$', color: '#1677ff' },
            { label: '折扣', value: displayDiscount, prefix: '-$', color: displayDiscount > 0 ? '#fa8c16' : '#bbb' },
            { label: '實收金額', value: netRevenue, prefix: '$', color: '#13c2c2' },
            { label: '毛利率', value: margin, suffix: '%', color: profit >= 0 ? '#52c41a' : '#ff4d4f' },
          ].map(s => (
            <Col span={6} key={s.label}>
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
          {order.b2b_order_no && (
            <Descriptions.Item label="B2B訂單號" span={2}>
              <Tag color="blue">{order.b2b_order_no}</Tag>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="後台正式訂單號" span={2}>
            {order.backendOrderId
              ? <Tag color="cyan">{order.backendOrderId}</Tag>
              : <Text type="secondary">—</Text>
            }
          </Descriptions.Item>
          <Descriptions.Item label="發票模式" span={2}>
            <Tag>{INVOICE_MODE_LABEL[order.invoice_mode_snapshot] ?? order.invoice_mode_snapshot ?? '—'}</Tag>
          </Descriptions.Item>
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
                const totalRevenue = order.items.reduce((s, i) => s + (adjQtyMap[i.productId] ?? i.qty) * (adjPriceMap[i.productId] ?? i.price), 0);
                const totalProfit  = order.items.reduce((s, i) => s + (adjQtyMap[i.productId] ?? i.qty) * ((adjPriceMap[i.productId] ?? i.price) - (i.cost ?? 0)), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={6} align="right"><strong>合計</strong></Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <strong style={{ color: '#1677ff' }}>${totalRevenue.toLocaleString()}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <strong style={{ color: totalProfit >= 0 ? '#52c41a' : '#ff4d4f' }}>${totalProfit.toLocaleString()}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                  折扣備註{discountAmount > 0 && <span style={{ color: '#ff4d4f' }}> *必填</span>}
                </div>
                <Input.TextArea
                  rows={2} value={discountNote}
                  onChange={e => setDiscountNote(e.target.value)}
                  placeholder="折扣原因說明"
                />
              </div>
              <div style={{ width: 180 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>折扣金額</div>
                <InputNumber
                  min={0} prefix="-$" style={{ width: '100%' }}
                  value={discountAmount}
                  onChange={v => setDiscountAmount(v ?? 0)}
                />
                {discountAmount > 0 && (
                  <div style={{ marginTop: 4, fontSize: 12, color: '#13c2c2', fontWeight: 600 }}>
                    實收：${(revenue - discountAmount).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
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
                const editTotal  = editItems.reduce((s, i) => s + i.qty * i.price, 0);
                const editProfit = editItems.reduce((s, i) => s + i.qty * (i.price - (i.cost ?? 0)), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={5} align="right"><strong>合計</strong></Table.Summary.Cell>
                    <Table.Summary.Cell align="right"><strong style={{ color: '#1677ff' }}>${editTotal.toLocaleString()}</strong></Table.Summary.Cell>
                    <Table.Summary.Cell align="right"><strong style={{ color: editProfit >= 0 ? '#52c41a' : '#ff4d4f' }}>${editProfit.toLocaleString()}</strong></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                  折扣備註{discountAmount > 0 && <span style={{ color: '#ff4d4f' }}> *必填</span>}
                </div>
                <Input.TextArea
                  rows={2} value={discountNote}
                  onChange={e => setDiscountNote(e.target.value)}
                  placeholder="折扣原因說明"
                />
              </div>
              <div style={{ width: 180 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>折扣金額</div>
                <InputNumber
                  min={0} prefix="-$" style={{ width: '100%' }}
                  value={discountAmount}
                  onChange={v => setDiscountAmount(v ?? 0)}
                />
              </div>
            </div>
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
              summary={() => (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={5} align="right"><strong>合計</strong></Table.Summary.Cell>
                    <Table.Summary.Cell align="right"><strong style={{ color: '#1677ff' }}>${revenue.toLocaleString()}</strong></Table.Summary.Cell>
                    <Table.Summary.Cell align="right"><strong style={{ color: profit >= 0 ? '#52c41a' : '#ff4d4f' }}>${profit.toLocaleString()}</strong></Table.Summary.Cell>
                  </Table.Summary.Row>
                  {(order.discount_amount > 0) && (
                    <>
                      <Table.Summary.Row>
                        <Table.Summary.Cell colSpan={5}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
                            <div>
                              <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>折扣備註</div>
                              <div style={{ fontSize: 13, color: '#595959', whiteSpace: 'pre-line' }}>
                                {order.discount_note || <Text type="secondary">—</Text>}
                              </div>
                            </div>
                            <span style={{ color: '#fa8c16', whiteSpace: 'nowrap' }}>折扣</span>
                          </div>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="right" style={{ color: '#fa8c16' }}>-${order.discount_amount.toLocaleString()}</Table.Summary.Cell>
                        <Table.Summary.Cell />
                      </Table.Summary.Row>
                      <Table.Summary.Row>
                        <Table.Summary.Cell colSpan={5} align="right" style={{ fontWeight: 700, color: '#13c2c2' }}>實收</Table.Summary.Cell>
                        <Table.Summary.Cell align="right" style={{ fontWeight: 700, color: '#13c2c2' }}>${(revenue - order.discount_amount).toLocaleString()}</Table.Summary.Cell>
                        <Table.Summary.Cell />
                      </Table.Summary.Row>
                    </>
                  )}
                </>
              )}
              style={{ marginBottom: 16 }}
            />
          </>
        )}

        <Divider orientation="left" plain>備註</Divider>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'stretch' }}>
          {/* 左：B2B備註（通路可見，性質特殊獨立） */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <NoteField
              label="B2B備註（後台填寫，僅通路可見，不會帶入正式後台）"
              value={b2bNote} onChange={setB2bNote} locked={noteLocked}
              placeholder="回覆通路的備註" fillHeight
            />
          </div>
          {/* 右：出貨、倉庫、客服三個後台備註直排 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <NoteField
              label="出貨備註（通路填寫，通路、正式後台、倉庫、物流可見）"
              value={shippingNote} onChange={setShippingNote} locked={noteLocked}
              placeholder="出貨相關備註（通路下單時填寫，後續可修改）"
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
                      建單後，未來「建單後修改」調整細項<strong>不會</strong>連動正式訂單<br />
                      僅 <strong>訂單總金額</strong> 與 <strong>備註文字</strong> 會連動調整。
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
