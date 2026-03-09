import { Modal, Table, Typography, Tag, Alert, Space } from 'antd';
import { channelMap } from '../data/fakeData';

const { Text } = Typography;

function buildEZPOSRows(order) {
  const ch = channelMap[order.channelId] ?? {};
  const addr = ch.addresses?.[0] ?? {};
  const rows = [];
  order.items.forEach((item, idx) => {
    rows.push({
      key: idx,
      訂購人手機號碼: '0900000000',
      主單: idx === 0 ? 'Y' : '',
      組別: '',
      總金額: idx === 0 ? order.items.reduce((s, i) => s + i.qty * i.price, 0) : '',
      付款方式: '月結匯款',
      收件姓名: addr.recipient ?? ch.name,
      收件電話: addr.phone ?? '',
      收件地址: addr.address ?? order.shippingAddress,
      寄件人姓名: '舒果農',
      配送時間: '不指定',
      產品ID: '',
      規格ID: item.productId,
      數量: item.qty,
      公司統編: ch.taxId ?? '',
      公司抬頭: ch.title ?? ch.name,
      Email: ch.email ?? '',
      產品: item.productName,
    });
  });
  return rows;
}

const cols = [
  { title: '主單', dataIndex: '主單', width: 50, render: v => v ? <Tag color="blue">Y</Tag> : '' },
  { title: '產品', dataIndex: '產品', ellipsis: true },
  { title: '規格ID', dataIndex: '規格ID', width: 80 },
  { title: '數量', dataIndex: '數量', width: 60 },
  { title: '總金額', dataIndex: '總金額', width: 90, render: v => v ? `$${v.toLocaleString()}` : '' },
  { title: '收件人', dataIndex: '收件姓名', width: 140 },
  { title: '收件地址', dataIndex: '收件地址', ellipsis: true },
  { title: '公司抬頭', dataIndex: '公司抬頭', width: 140 },
  { title: '統編', dataIndex: '公司統編', width: 90 },
];

export default function EZPOSPreview({ order, open, onClose }) {
  if (!order) return null;
  const rows = buildEZPOSRows(order);

  return (
    <Modal
      title={
        <Space>
          <Text strong>EZPOS 後台匯入格式預覽</Text>
          <Tag>{order.id}</Tag>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={960}
      footer={null}
    >
      <Alert
        type="info"
        showIcon
        message="以下為系統自動產生的 EZPOS 匯入格式，實際建單時直接透過 API 寫入，不需手動匯入 Excel。"
        style={{ marginBottom: 16 }}
      />
      <Table
        dataSource={rows}
        columns={cols}
        size="small"
        pagination={false}
        scroll={{ x: 900 }}
      />
      <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
        完整欄位：訂購人手機號碼 / 主單 / 組別 / 總金額 / 付款方式 / 收件姓名 / 收件電話 /
        收件地址 / 配送時間 / 產品ID / 規格ID / 開始出貨時間 / 最後出貨時間 / 數量 /
        內部備註 / 公司統編 / 公司抬頭 / Email …等共 28 欄
      </div>
    </Modal>
  );
}
