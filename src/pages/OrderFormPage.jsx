import { useState, useMemo } from 'react';
import {
  Card, Select, Tabs, Table, InputNumber, Button, Space, Typography,
  Divider, Tag, Alert, Descriptions, Modal, Empty,
} from 'antd';
import { ShoppingCartOutlined, FileTextOutlined, SendOutlined } from '@ant-design/icons';
import { channels, products, templates } from '../data/fakeData';

const { Title, Text } = Typography;

const CATEGORY_LABEL = {
  frozen:  '冷凍商品',
  ambient: '常溫商品',
};

function groupBySubCategory(prods) {
  const map = {};
  prods.forEach(p => {
    if (!map[p.subCategory]) map[p.subCategory] = [];
    map[p.subCategory].push(p);
  });
  return map;
}

function OrderPreviewModal({ open, onClose, items, channel }) {
  if (!channel) return null;
  const addr = channel.addresses?.[0] ?? {};
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const cols = [
    { title: '品項', dataIndex: 'name' },
    { title: '規格', dataIndex: 'spec', width: 100, render: v => v ? <Tag>{v}</Tag> : '' },
    { title: '單位', dataIndex: 'unit', width: 60 },
    { title: '採購價', dataIndex: 'price', width: 80, render: v => `$${v}` },
    { title: '數量', dataIndex: 'qty', width: 70 },
    { title: '小計', width: 90, render: (_, r) => `$${(r.qty * r.price).toLocaleString()}` },
  ];
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<Space><FileTextOutlined />採購單預覽</Space>}
      width={760}
      footer={[
        <Button key="close" onClick={onClose}>關閉</Button>,
        <Button key="submit" type="primary" icon={<SendOutlined />}>確認送出B2B訂單</Button>,
      ]}
    >
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="通路名稱">{channel.name}</Descriptions.Item>
        <Descriptions.Item label="統一編號">{channel.taxId}</Descriptions.Item>
        <Descriptions.Item label="收件人">{addr.recipient}</Descriptions.Item>
        <Descriptions.Item label="收件電話">{addr.phone}</Descriptions.Item>
        <Descriptions.Item label="收件地址" span={2}>{addr.address}</Descriptions.Item>
        <Descriptions.Item label="付款方式" span={2}>於 {channel.settlementDay} 日收到結算單後匯款</Descriptions.Item>
      </Descriptions>

      <Table dataSource={items} columns={cols} rowKey="id" size="small" pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={5} align="right"><strong>訂購總金額</strong></Table.Summary.Cell>
            <Table.Summary.Cell><strong style={{ color:'#1677ff' }}>${total.toLocaleString()}</strong></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />

      <div style={{ marginTop: 16, fontSize: 12, color: '#888', lineHeight: 1.8 }}>
        <div>1. 以上價格皆為含稅價</div>
        <div>2. 【匯款資訊】戶名：舒果農企業有限公司 / 兆豐 0170077 / 帳號：00709001170</div>
        <div>3. 合作方式：買斷　付款方式：{channel.settlementMethod}</div>
        <div>出貨方式：黑貓宅配</div>
      </div>
    </Modal>
  );
}

export default function OrderFormPage() {
  const [channelId, setChannelId] = useState('c001');
  const [qtyMap, setQtyMap] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);

  const channel = channels.find(c => c.id === channelId);
  const tpl = templates.find(t => t.id === channel?.templateId);
  const tplProducts = useMemo(() =>
    products.filter(p => tpl?.productIds.includes(p.id)),
    [tpl]
  );

  const frozenProds  = tplProducts.filter(p => p.category === 'frozen');
  const ambientProds = tplProducts.filter(p => p.category === 'ambient');

  const setQty = (id, val) => setQtyMap(prev => ({ ...prev, [id]: val ?? 0 }));

  const orderedItems = tplProducts
    .filter(p => (qtyMap[p.id] ?? 0) > 0)
    .map(p => ({ ...p, qty: qtyMap[p.id] }));

  const total = orderedItems.reduce((s, i) => s + i.qty * i.b2bPrice, 0);

  function ProductSection({ prods }) {
    const grouped = groupBySubCategory(prods);
    return (
      <>
        {Object.entries(grouped).map(([subCat, items]) => (
          <div key={subCat} style={{ marginBottom: 16 }}>
            <div style={{
              background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4,
              padding: '4px 12px', fontWeight: 600, marginBottom: 6, fontSize: 13,
            }}>
              {subCat}
            </div>
            <Table
              dataSource={items}
              rowKey="id"
              size="small"
              pagination={false}
              showHeader={false}
              columns={[
                {
                  title: '品項', render: (_, r) => (
                    <Space>
                      <span>{r.name}</span>
                      {r.spec && <Tag style={{ fontSize: 11 }}>{r.spec}</Tag>}
                      {r.stock <= 10 && <Tag color="red" style={{ fontSize: 11 }}>庫存僅剩 {r.stock}</Tag>}
                    </Space>
                  ),
                },
                { title: '單位', dataIndex: 'unit', width: 55, align: 'center' },
                { title: '採購價', dataIndex: 'b2bPrice', width: 80, align: 'right', render: v => `$${v}` },
                {
                  title: '數量', width: 130, align: 'center',
                  render: (_, r) => (
                    <InputNumber
                      min={0} max={r.stock} size="small"
                      value={qtyMap[r.id] ?? 0}
                      onChange={v => setQty(r.id, v)}
                      style={{ width: 90 }}
                    />
                  ),
                },
                {
                  title: '小計', width: 90, align: 'right',
                  render: (_, r) => {
                    const q = qtyMap[r.id] ?? 0;
                    return q > 0 ? <Text strong style={{ color: '#1677ff' }}>${(q * r.b2bPrice).toLocaleString()}</Text> : <Text type="secondary">-</Text>;
                  },
                },
              ]}
            />
          </div>
        ))}
      </>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 20 }}>廠商下單介面（採購單）</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space align="center">
          <Text strong>通路選擇：</Text>
          <Select
            value={channelId}
            onChange={v => { setChannelId(v); setQtyMap({}); }}
            style={{ width: 220 }}
            options={channels.map(c => ({ value: c.id, label: c.name }))}
          />
          {channel && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              套用模板：{tpl?.name} ｜ 月結日：每月 {channel.settlementDay} 日
            </Text>
          )}
        </Space>
      </Card>

      {channel?.pricingNote && (
        <Alert
          type="info" showIcon style={{ marginBottom: 16 }}
          message="本通路議價備註"
          description={<pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-line' }}>{channel.pricingNote}</pre>}
        />
      )}

      {tplProducts.length === 0 ? <Empty description="無可用商品" /> : (
        <Card
          bodyStyle={{ padding: '0 16px 16px' }}
          extra={
            <Space>
              <Text type="secondary">已選 {orderedItems.length} 品項</Text>
              <Text strong style={{ color: '#1677ff', fontSize: 16 }}>小計：${total.toLocaleString()}</Text>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                disabled={orderedItems.length === 0}
                onClick={() => setPreviewOpen(true)}
              >
                預覽採購單
              </Button>
            </Space>
          }
          title="商品清單"
        >
          <Tabs
            items={[
              {
                key: 'frozen',
                label: `❄️ 冷凍商品（${frozenProds.length} 項）`,
                children: <ProductSection prods={frozenProds} />,
              },
              {
                key: 'ambient',
                label: `🌿 常溫商品（${ambientProds.length} 項）`,
                children: <ProductSection prods={ambientProds} />,
              },
            ]}
          />
        </Card>
      )}

      {orderedItems.length > 0 && (
        <Card style={{ marginTop: 16 }} bodyStyle={{ padding: '12px 20px' }}>
          <Space>
            <Text strong>已選購品項：</Text>
            {orderedItems.map(i => (
              <Tag key={i.id} closable onClose={() => setQty(i.id, 0)}>
                {i.name} × {i.qty}
              </Tag>
            ))}
            <Divider type="vertical" />
            <Text strong style={{ color: '#1677ff', fontSize: 16 }}>合計 ${total.toLocaleString()}</Text>
          </Space>
        </Card>
      )}

      <OrderPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        items={orderedItems.map(i => ({ ...i, price: i.b2bPrice }))}
        channel={channel}
      />
    </div>
  );
}
