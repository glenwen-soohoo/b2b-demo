import { useMemo } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Tag, Progress, Space } from 'antd';
import { fakeOrders, channels } from '../data/fakeData';

const { Title, Text } = Typography;

function calcProfit(items) {
  const revenue = items.reduce((s, i) => s + i.qty * i.price, 0);
  const cost    = items.reduce((s, i) => s + i.qty * (i.cost ?? 0), 0);
  return { revenue, cost, profit: revenue - cost, margin: revenue > 0 ? (revenue - cost) / revenue * 100 : 0 };
}

export default function AnalyticsPage() {
  const completedOrders = fakeOrders.filter(o => ['completed', 'paid', 'awaiting_payment', 'ordered'].includes(o.status));

  const overall = useMemo(() => {
    const revenue = completedOrders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.qty * i.price, 0), 0);
    const cost    = completedOrders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.qty * (i.cost ?? 0), 0), 0);
    return { revenue, cost, profit: revenue - cost, margin: revenue > 0 ? (revenue - cost) / revenue * 100 : 0 };
  }, []);

  // 按通路分析
  const byChannel = useMemo(() => {
    const map = {};
    completedOrders.forEach(o => {
      if (!map[o.channelId]) map[o.channelId] = { channelId: o.channelId, channelName: o.channelName, orders: 0, revenue: 0, cost: 0 };
      const { revenue, cost } = calcProfit(o.items);
      map[o.channelId].orders++;
      map[o.channelId].revenue += revenue;
      map[o.channelId].cost += cost;
    });
    return Object.values(map).map(r => ({ ...r, profit: r.revenue - r.cost, margin: r.revenue > 0 ? (r.revenue - r.cost) / r.revenue * 100 : 0 }));
  }, []);

  // 按品項分析
  const byProduct = useMemo(() => {
    const map = {};
    completedOrders.forEach(o => {
      o.items.forEach(i => {
        if (!map[i.productId]) map[i.productId] = { productId: i.productId, name: i.productName, unit: i.unit, totalQty: 0, revenue: 0, cost: 0 };
        map[i.productId].totalQty += i.qty;
        map[i.productId].revenue  += i.qty * i.price;
        map[i.productId].cost     += i.qty * (i.cost ?? 0);
      });
    });
    return Object.values(map)
      .map(r => ({ ...r, profit: r.revenue - r.cost, margin: r.revenue > 0 ? (r.revenue - r.cost) / r.revenue * 100 : 0 }))
      .sort((a, b) => b.revenue - a.revenue);
  }, []);

  const channelCols = [
    { title: '通路名稱', dataIndex: 'channelName' },
    { title: '訂單數', dataIndex: 'orders', width: 70, align: 'center' },
    { title: '銷售額', dataIndex: 'revenue', width: 100, render: v => `$${v.toLocaleString()}` },
    { title: '成本', dataIndex: 'cost', width: 90, render: v => <Text type="secondary">${v.toLocaleString()}</Text> },
    { title: '毛利', dataIndex: 'profit', width: 100, render: v => <Text style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>${v.toLocaleString()}</Text> },
    {
      title: '毛利率', dataIndex: 'margin', width: 120,
      render: v => (
        <Space size={4}>
          <Progress percent={Math.round(v)} size="small" strokeColor={v >= 40 ? '#52c41a' : v >= 20 ? '#faad14' : '#ff4d4f'} style={{ width: 60 }} showInfo={false} />
          <Text style={{ color: v >= 40 ? '#52c41a' : v >= 20 ? '#faad14' : '#ff4d4f' }}>{v.toFixed(1)}%</Text>
        </Space>
      ),
    },
  ];

  const productCols = [
    { title: '品項名稱', dataIndex: 'name', ellipsis: true },
    { title: '單位', dataIndex: 'unit', width: 55 },
    { title: '總銷量', dataIndex: 'totalQty', width: 80, align: 'right' },
    { title: '銷售額', dataIndex: 'revenue', width: 100, render: v => `$${v.toLocaleString()}` },
    { title: '成本', dataIndex: 'cost', width: 90, render: v => <Text type="secondary">${v.toLocaleString()}</Text> },
    { title: '毛利', dataIndex: 'profit', width: 100, render: v => <Text style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>${v.toLocaleString()}</Text> },
    {
      title: '毛利率', dataIndex: 'margin', width: 120,
      render: v => (
        <Space size={4}>
          <Progress percent={Math.round(v)} size="small" strokeColor={v >= 40 ? '#52c41a' : v >= 20 ? '#faad14' : '#ff4d4f'} style={{ width: 60 }} showInfo={false} />
          <Text style={{ color: v >= 40 ? '#52c41a' : v >= 20 ? '#faad14' : '#ff4d4f' }}>{v.toFixed(1)}%</Text>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 20 }}>損益分析</Title>

      {/* 整體 KPI */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { label: '總銷售額', value: overall.revenue, color: '#1677ff', prefix: '$' },
          { label: '總成本',   value: overall.cost,    color: '#888',    prefix: '$' },
          { label: '毛利',     value: overall.profit,  color: overall.profit >= 0 ? '#52c41a' : '#ff4d4f', prefix: '$' },
          { label: '整體毛利率', value: overall.margin.toFixed(1), color: overall.margin >= 30 ? '#52c41a' : '#faad14', suffix: '%' },
        ].map(s => (
          <Col span={6} key={s.label}>
            <Card size="small" bordered style={{ textAlign: 'center' }}>
              <Statistic
                title={s.label}
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                valueStyle={{ color: s.color, fontSize: 24 }}
                formatter={v => Number(v).toLocaleString()}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="各通路損益" size="small" style={{ marginBottom: 16 }}>
            <Table
              dataSource={byChannel}
              columns={channelCols}
              rowKey="channelId"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="各品項損益排行（依銷售額）"
            size="small"
            extra={<Text type="secondary" style={{ fontSize: 12 }}>僅計入已結算訂單</Text>}
          >
            <Table
              dataSource={byProduct}
              columns={productCols}
              rowKey="productId"
              size="small"
              pagination={{ pageSize: 8, size: 'small' }}
              scroll={{ y: 280 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 月份趨勢（假資料圖示） */}
      <Card title="月結趨勢（假資料示意）" size="small" style={{ marginTop: 16 }}>
        <Row gutter={8}>
          {[
            { month: '2026-01', revenue: 14900, profit: 8200 },
            { month: '2026-02', revenue: 12450, profit: 6800 },
            { month: '2026-03', revenue: 5250,  profit: 2950 },
          ].map(d => (
            <Col span={8} key={d.month}>
              <Card size="small" style={{ textAlign: 'center', background: '#fafafa' }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{d.month}</div>
                <div style={{ fontSize: 13, color: '#1677ff' }}>銷售 ${d.revenue.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: '#52c41a' }}>毛利 ${d.profit.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  毛利率 {((d.profit / d.revenue) * 100).toFixed(1)}%
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <div style={{ marginTop: 12, color: '#aaa', fontSize: 12, textAlign: 'center' }}>
          ✦ 正式版可接入真實訂單資料，產生各月折線圖表
        </div>
      </Card>
    </div>
  );
}
