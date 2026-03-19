import { useState, useEffect } from 'react';
import {
  Drawer, Descriptions, Table, Timeline, Button, Space, Popconfirm, Tag,
  Divider, Alert, Statistic, Row, Col, InputNumber, Input,
} from 'antd';
import {
  SendOutlined, EyeOutlined, LockOutlined,
} from '@ant-design/icons';
import StatusTag from './StatusTag';
import OrderStateMachine from './OrderStateMachine';
import EZPOSPreview from './EZPOSPreview';

// admin 端B2B訂單操作（pending_warehouse 唯讀，倉庫介面負責）
const ACTIONS = {
  pending_sales:     [{ key: 'sales_confirm', label: '業務確認完成，送倉庫確認', icon: <SendOutlined />, type: 'primary', next: 'pending_warehouse' }],
  pending_warehouse: [],
  ordered:           [],
  settled:           [],
  completed:         [],
};

function calcProfitFromMap(items, adjQtyMap) {
  const revenue = items.reduce((s, i) => s + (adjQtyMap[i.productId] ?? i.qty) * i.price, 0);
  const cost    = items.reduce((s, i) => s + (adjQtyMap[i.productId] ?? i.qty) * (i.cost ?? 0), 0);
  const profit  = revenue - cost;
  const margin  = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
  return { revenue, cost, profit, margin };
}

function calcProfit(items) {
  return calcProfitFromMap(items, Object.fromEntries(items.map(i => [i.productId, i.qty])));
}

export default function OrderDetail({ order, open, onClose, onStatusChange }) {
  const [ezposOpen, setEzposOpen] = useState(false);
  const [adjQtyMap, setAdjQtyMap] = useState({});
  const [salesNote, setSalesNote] = useState('');

  useEffect(() => {
    if (order) {
      const source = order.salesAdjustedItems ?? order.items;
      setAdjQtyMap(Object.fromEntries(source.map(i => [i.productId, i.qty])));
      setSalesNote(order.salesNote ?? '');
    }
  }, [order?.id]);

  if (!order) return null;

  const actions = ACTIONS[order.status] ?? [];
  const displayItems = order.adjustedItems ?? order.salesAdjustedItems ?? order.items;

  // pending_sales 用 adjQtyMap 算損益，其他用 displayItems 算
  const { revenue, cost, profit, margin } = order.status === 'pending_sales'
    ? calcProfitFromMap(order.items, adjQtyMap)
    : calcProfit(displayItems);

  const handleSalesConfirm = () => {
    const adjustedItems = order.items.map(i => ({
      ...i, qty: adjQtyMap[i.productId] ?? i.qty,
    }));
    const changes = order.items
      .filter(i => (adjQtyMap[i.productId] ?? i.qty) !== i.qty)
      .map(i => `${i.productName}: ${i.qty}→${adjQtyMap[i.productId]}`);
    const logMsg = changes.length > 0
      ? `[手動操作] 業務確認完成，送倉庫確認（${changes.join('、')}）`
      : '[手動操作] 業務確認完成，送倉庫確認（數量無變動）';

    onStatusChange(order.id, 'pending_warehouse', {
      time: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
      action: logMsg,
    }, {
      salesAdjustedItems: adjustedItems,
      salesNote: salesNote || null,
    });
  };

  // ── pending_sales 合併表格（確認數量 + 損益）──
  const salesConfirmCols = [
    { title: '品項', dataIndex: 'productName' },
    { title: '廠商下訂', dataIndex: 'qty', width: 80, align: 'center' },
    {
      title: '業務確認數量', width: 150, align: 'center',
      render: (_, r) => (
        <InputNumber
          min={0} size="small"
          value={adjQtyMap[r.productId] ?? r.qty}
          onChange={v => setAdjQtyMap(prev => ({ ...prev, [r.productId]: v ?? 0 }))}
          style={{ width: 90 }}
        />
      ),
    },
    {
      title: '差異', width: 65, align: 'center',
      render: (_, r) => {
        const diff = (adjQtyMap[r.productId] ?? r.qty) - r.qty;
        if (diff === 0) return <Tag>—</Tag>;
        return <Tag color={diff < 0 ? 'red' : 'green'}>{diff > 0 ? '+' : ''}{diff}</Tag>;
      },
    },
    { title: '採購價', dataIndex: 'price', width: 75, align: 'right', render: v => `$${v}` },
    { title: '成本', dataIndex: 'cost', width: 65, align: 'right',
      render: v => v ? <span style={{ color: '#999' }}>${v}</span> : '-' },
    {
      title: '小計', width: 90, align: 'right',
      render: (_, r) => {
        const q = adjQtyMap[r.productId] ?? r.qty;
        return `$${(q * r.price).toLocaleString()}`;
      },
    },
    {
      title: '毛利', width: 85, align: 'right',
      render: (_, r) => {
        const q = adjQtyMap[r.productId] ?? r.qty;
        const g = q * (r.price - (r.cost ?? 0));
        return <span style={{ color: g >= 0 ? '#52c41a' : '#ff4d4f' }}>${g.toLocaleString()}</span>;
      },
    },
  ];

  // ── 其他狀態的品項表格 ──
  const itemCols = [
    { title: '品項', dataIndex: 'productName' },
    { title: '單位', dataIndex: 'unit', width: 55 },
    { title: '數量', dataIndex: 'qty', width: 65 },
    { title: '採購價', dataIndex: 'price', width: 75, render: v => `$${v}` },
    { title: '成本', dataIndex: 'cost', width: 65,
      render: v => v ? <span style={{ color: '#999' }}>${v}</span> : '-' },
    { title: '小計', width: 90, render: (_, r) => `$${(r.qty * r.price).toLocaleString()}` },
    {
      title: '毛利', width: 85,
      render: (_, r) => {
        const g = r.qty * (r.price - (r.cost ?? 0));
        return <span style={{ color: g >= 0 ? '#52c41a' : '#ff4d4f' }}>${g.toLocaleString()}</span>;
      },
    },
  ];

  return (
    <>
      <Drawer
        title={
          <Space>
            <span style={{ fontWeight: 700 }}>{order.id}</span>
            <StatusTag status={order.status} />
            {order.status === 'settled' && <LockOutlined style={{ color: '#722ed1' }} />}
          </Space>
        }
        open={open}
        onClose={onClose}
        width={860}
        extra={
          <Button icon={<EyeOutlined />} onClick={() => setEzposOpen(true)}>
            EZPOS 匯入格式
          </Button>
        }
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, color: '#555' }}>訂單進度</div>
          <OrderStateMachine status={order.status} />
        </div>

        {/* ── pending_warehouse：唯讀 ── */}
        {order.status === 'pending_warehouse' && (
          <>
            <Alert type="warning" showIcon
              message="等待倉庫確認中"
              description="業務已確認完畢，目前等待倉庫操作。請至倉庫出貨管理介面進行確認。"
              style={{ marginBottom: 16 }}
            />
            {order.salesNote && (
              <Alert type="info" showIcon
                message={`業務備註：${order.salesNote}`}
                style={{ marginBottom: 12 }}
              />
            )}
          </>
        )}

        {/* ── ordered：出貨通知 ── */}
        {order.status === 'ordered' && (
          <Alert type="success" showIcon
            message="訂單已成立"
            description={
              <span>
                訂單已轉換為無毒農格式送入後台，後續由倉庫依正常出貨流程處理。
                {order.backendOrderId && <> 後台訂單號：<Tag color="cyan">{order.backendOrderId}</Tag></>}
              </span>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        {/* ── settled：已鎖定 ── */}
        {order.status === 'settled' && (
          <Alert type="warning" showIcon icon={<LockOutlined />}
            message="此B2B訂單已結算鎖定，不可再異動"
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 損益摘要 */}
        <Row gutter={12} style={{ marginBottom: 20 }}>
          {[
            { label: '銷售金額', value: revenue, prefix: '$', color: '#1677ff' },
            { label: '成本合計', value: cost,    prefix: '$', color: '#888' },
            { label: '毛利',     value: profit,  prefix: '$', color: profit >= 0 ? '#52c41a' : '#ff4d4f' },
            { label: '毛利率',   value: margin,  suffix: '%', color: profit >= 0 ? '#52c41a' : '#ff4d4f' },
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
          <Descriptions.Item label="結算月份">{order.settlementMonth}</Descriptions.Item>
          <Descriptions.Item label="建立日期">{order.createdAt}</Descriptions.Item>
          <Descriptions.Item label="出貨地址" span={1}>{order.shippingAddress}</Descriptions.Item>
          {order.vendorNote && (
            <Descriptions.Item label="廠商備註" span={2}>
              <span style={{ color: '#595959', whiteSpace: 'pre-line' }}>{order.vendorNote}</span>
            </Descriptions.Item>
          )}
          {order.backendOrderId && (
            <Descriptions.Item label="後台訂單號" span={2}>
              <Tag color="cyan">{order.backendOrderId}</Tag>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* ── pending_sales：合併確認數量 + 損益 ── */}
        {order.status === 'pending_sales' && (
          <>
            <Alert type="info" showIcon
              message="業務確認階段"
              description="請確認廠商訂購數量，如需調整請修改後再確認送出。"
              style={{ marginBottom: 12 }}
            />
            <Table
              dataSource={order.items}
              rowKey="productId"
              size="small"
              pagination={false}
              columns={salesConfirmCols}
              summary={() => {
                const totalRevenue = order.items.reduce((s, i) => s + (adjQtyMap[i.productId] ?? i.qty) * i.price, 0);
                const totalProfit  = order.items.reduce((s, i) => s + (adjQtyMap[i.productId] ?? i.qty) * (i.price - (i.cost ?? 0)), 0);
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
              style={{ marginBottom: 12 }}
            />
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>業務備註（選填）</div>
              <Input.TextArea
                rows={2} placeholder="調整原因或備註..."
                value={salesNote}
                onChange={e => setSalesNote(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}

        {/* ── 其他狀態的品項表格 ── */}
        {order.status !== 'pending_sales' && (
          <>
            <Divider orientation="left" plain>
              {order.adjustedItems
                ? '最終出貨品項（倉庫確認後）'
                : order.salesAdjustedItems
                ? '業務確認數量（待倉庫確認）'
                : '訂購品項'}
              （含損益）
            </Divider>
            <Table
              dataSource={displayItems}
              columns={itemCols}
              rowKey="productId"
              size="small"
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={5} align="right"><strong>合計</strong></Table.Summary.Cell>
                  <Table.Summary.Cell><strong style={{ color: '#1677ff' }}>${revenue.toLocaleString()}</strong></Table.Summary.Cell>
                  <Table.Summary.Cell><strong style={{ color: profit >= 0 ? '#52c41a' : '#ff4d4f' }}>${profit.toLocaleString()}</strong></Table.Summary.Cell>
                </Table.Summary.Row>
              )}
              style={{ marginBottom: 20 }}
            />
          </>
        )}

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

        {actions.length > 0 && (
          <>
            <Divider orientation="left" plain>可執行操作</Divider>
            <Space wrap>
              {actions.map(a => (
                <Popconfirm key={a.key}
                  title={`確認執行「${a.label}」？`}
                  onConfirm={handleSalesConfirm}
                  okText="確認" cancelText="取消"
                >
                  <Button type={a.type} icon={a.icon}>{a.label}</Button>
                </Popconfirm>
              ))}
            </Space>
          </>
        )}
      </Drawer>

      <EZPOSPreview order={order} open={ezposOpen} onClose={() => setEzposOpen(false)} />
    </>
  );
}
