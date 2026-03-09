import { useState } from 'react';
import {
  Drawer, Descriptions, Table, Timeline, Button, Space, Popconfirm, Tag,
  Divider, Alert, Statistic, Row, Col,
} from 'antd';
import {
  CheckOutlined, WarningOutlined, SendOutlined, BankOutlined, EyeOutlined,
} from '@ant-design/icons';
import StatusTag from './StatusTag';
import OrderStateMachine from './OrderStateMachine';
import EZPOSPreview from './EZPOSPreview';

const ACTIONS = {
  pending:             [{ key:'settle',        label:'手動觸發結算',     icon:<SendOutlined />, type:'primary', next:'settling' }],
  awaiting_settlement: [{ key:'settle',        label:'執行結算',         icon:<SendOutlined />, type:'primary', next:'settling' }],
  settling: [
    { key:'stock_ok',   label:'✅ 庫存確認通過', type:'primary', next:'awaiting_order' },
    { key:'stock_fail', label:'⚠️ 庫存不足',     type:'default', danger:true, next:'insufficient_stock' },
  ],
  insufficient_stock:  [{ key:'update_qty',    label:'調整出貨數量後確認', icon:<CheckOutlined />, type:'primary', next:'awaiting_order' }],
  awaiting_order:      [{ key:'create_order',  label:'後台建單（模擬）',   icon:<CheckOutlined />, type:'primary', next:'ordered' }],
  ordered:             [{ key:'send_payment',  label:'發結算匯款通知',     icon:<BankOutlined />,  type:'primary', next:'awaiting_payment' }],
  awaiting_payment:    [{ key:'mark_paid',     label:'廠商回報已匯款',     icon:<CheckOutlined />, type:'primary', next:'paid' }],
  paid:                [{ key:'finance_ok',    label:'財務確認完成',       icon:<CheckOutlined />, type:'primary', next:'completed' }],
  completed: [],
};

function calcProfit(items) {
  const revenue = items.reduce((s, i) => s + i.qty * i.price, 0);
  const cost    = items.reduce((s, i) => s + i.qty * (i.cost ?? 0), 0);
  const profit  = revenue - cost;
  const margin  = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
  return { revenue, cost, profit, margin };
}

export default function OrderDetail({ order, open, onClose, onStatusChange }) {
  const [ezposOpen, setEzposOpen] = useState(false);
  if (!order) return null;

  const actions = ACTIONS[order.status] ?? [];
  const { revenue, cost, profit, margin } = calcProfit(order.items);

  const handleAction = (next, label) => {
    onStatusChange(order.id, next, {
      time: new Date().toLocaleString('zh-TW', { hour12: false }).replace(',', ''),
      action: `[手動操作] ${label}`,
    });
  };

  const itemCols = [
    { title: '品項', dataIndex: 'productName' },
    { title: '單位', dataIndex: 'unit', width: 55 },
    { title: '數量', dataIndex: 'qty', width: 65 },
    { title: '採購價', dataIndex: 'price', width: 80, render: v => `$${v}` },
    { title: '成本', dataIndex: 'cost', width: 70, render: v => v ? <span style={{color:'#999'}}>${v}</span> : '-' },
    { title: '小計', width: 90, render: (_, r) => `$${(r.qty * r.price).toLocaleString()}` },
    {
      title: '毛利', width: 90,
      render: (_, r) => {
        const g = r.qty * (r.price - (r.cost ?? 0));
        return <span style={{ color: g >= 0 ? '#52c41a' : '#ff4d4f' }}>${g.toLocaleString()}</span>;
      },
    },
  ];

  return (
    <>
      <Drawer
        title={<Space><span style={{ fontWeight: 700 }}>{order.id}</span><StatusTag status={order.status} /></Space>}
        open={open}
        onClose={onClose}
        width={820}
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

        {order.status === 'insufficient_stock' && (
          <Alert type="error" showIcon icon={<WarningOutlined />}
            message="庫存不足" description="部分品項庫存不足，請與通路協調出貨數量後再確認。"
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
        </Descriptions>

        <Divider orientation="left" plain>訂購品項（含損益）</Divider>
        <Table
          dataSource={order.items}
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
                <Popconfirm key={a.key} title={`確認執行「${a.label}」？`}
                  onConfirm={() => handleAction(a.next, a.label)}
                  okText="確認" cancelText="取消"
                >
                  <Button type={a.type} danger={a.danger} icon={a.icon}>{a.label}</Button>
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
