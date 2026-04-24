import { useState, useEffect } from 'react';
import {
  Drawer, Descriptions, Table, Timeline, Button, Space, Popconfirm, Tag,
  Divider, Alert, Row, Col, InputNumber, Input, Typography, Tooltip, Select, message,
} from 'antd';
import { SendOutlined, LockOutlined, SaveOutlined, EditOutlined, FilePdfOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { exportOrderPdf } from '../utils/exportOrderPdf';
import { generateB2bOrderNo, getConfirmedItems } from '../services/orderService';
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

function NoteField({ label, value, onChange, locked, placeholder, rows = 2 }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
      {locked
        ? <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '6px 10px', minHeight: 54, fontSize: 13, color: '#595959', whiteSpace: 'pre-line' }}>
            {value || <Text type="secondary">—</Text>}
          </div>
        : <Input.TextArea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  );
}

export default function OrderDetail({ order, open, onClose, onStatusChange }) {
  const [adjQtyMap,      setAdjQtyMap]      = useState({});
  const [adjPriceMap,    setAdjPriceMap]    = useState({});
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountNote,   setDiscountNote]   = useState('');
  const [shippingNote,   setShippingNote]   = useState('');
  const [csNote,         setCsNote]         = useState('');
  const [b2bNote,        setB2bNote]        = useState('');
  const [editMode,       setEditMode]       = useState(false);
  const [editItems,      setEditItems]      = useState([]);
  const [localSettlementMonth, setLocalSettlementMonth] = useState('');

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
  const canEditAfter = (order.status === 'ordered' || order.status === 'arrived') && !isSettled;
  const noteLocked   = isSettled || (canEditAfter && !editMode);

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
      shipping_note:   shippingNote  || null,
      cs_note:         csNote        || null,
      b2b_note:        b2bNote       || null,
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
    setCsNote(order.cs_note ?? channelMap[order.channelId]?.cs_note_default ?? '');
    setB2bNote(order.b2b_note ?? '');
    setDiscountAmount(order.discount_amount ?? 0);
    setDiscountNote(order.discount_note ?? '');
    setEditMode(false);
    setEditItems([]);
  };

  const handleSaveEdit = () => {
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
      shipping_note:   shippingNote  || null,
      cs_note:         csNote        || null,
      b2b_note:        b2bNote       || null,
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
            {!isSettled
              ? <Select
                  size="small"
                  value={localSettlementMonth || order.settlementMonth}
                  onChange={handleSettlementMonthChange}
                  options={getSettlementMonthOptions(channelMap[order.channelId]?.settlementDay ?? 25, localSettlementMonth || order.settlementMonth)}
                  style={{ width: 180 }}
                />
              : order.settlementMonth
            }
          </Descriptions.Item>
          <Descriptions.Item label="建立日期">{order.createdAt}</Descriptions.Item>
          <Descriptions.Item label="出貨地址">{order.shippingAddress}</Descriptions.Item>
          {order.b2b_order_no && (
            <Descriptions.Item label="B2B訂單號" span={2}>
              <Tag color="blue">{order.b2b_order_no}</Tag>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="後台訂單號" span={2}>
            {order.backendOrderId
              ? <Tag color="cyan">{order.backendOrderId}</Tag>
              : <Text type="secondary">—</Text>
            }
          </Descriptions.Item>
          {order.fruitOrderNumber && (
            <Descriptions.Item label="無毒農正式單號" span={2}>
              <Tag color="green">{order.fruitOrderNumber}</Tag>
            </Descriptions.Item>
          )}
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
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <NoteField
              label="出貨備註（通路填寫，通路、正式後台、倉庫、物流可見）"
              value={shippingNote} onChange={setShippingNote} locked={noteLocked}
              placeholder="出貨相關備註（通路下單時填寫，後續可修改）"
            />
          </div>
          <div style={{ flex: 1 }}>
            <NoteField
              label="客服備註（後台填寫，僅正式後台、自配單可見）"
              value={csNote} onChange={setCsNote} locked={noteLocked}
              placeholder="內部客服用備註"
            />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <NoteField
            label="B2B備註（後台填寫，僅通路可見，不會帶入正式後台）"
            value={b2bNote} onChange={setB2bNote} locked={noteLocked}
            placeholder="回覆通路的備註" rows={2}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <div>
            {(order.status === 'pending_sales' || order.status === 'ordered' || order.status === 'arrived' || isSettled) && (
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
          </div>
          <Space>
            {order.status === 'pending_sales' && (
              <Popconfirm
                title="確認執行「業務確認完成，建立正式訂單」？"
                description="確認後，採購單價與折扣將鎖定，不可再修改。"
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
            )}
            {canEditAfter && !editMode && (
              <Button icon={<EditOutlined />} onClick={handleStartEdit}>建單後修改</Button>
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
