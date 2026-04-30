import { Steps } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  SyncOutlined,
  CheckSquareOutlined,
  StopOutlined,
} from '@ant-design/icons';

// B2B訂單流程：待業務確認 → 已成立訂單 → 到貨等待結算 → 結算中 → 結算完畢
const STEPS = [
  { key: 'pending_sales', label: '待業務確認',   icon: <ClockCircleOutlined /> },
  { key: 'ordered',       label: '已成立訂單',   icon: <CheckCircleOutlined /> },
  { key: 'arrived',       label: '到貨等待結算', icon: <InboxOutlined /> },
  { key: 'settling',      label: '結算中',       icon: <SyncOutlined /> },
  { key: 'settled_done',  label: '結算完畢',     icon: <CheckSquareOutlined /> },
];

const STATUS_TO_STEP = {
  pending_sales: 0,
  ordered:       1,
  arrived:       2,
  settling:      3,
  settled_done:  4,
};

export default function OrderStateMachine({ status }) {
  // 作廢狀態：不顯示 Steps，改用紅色標籤取代整條進度條
  if (status === 'voided') {
    return (
      <div style={{
        background: '#fff1f0',
        border: '1px solid #ffa39e',
        borderRadius: 6,
        padding: '12px 16px',
        textAlign: 'center',
        color: '#cf1322',
        fontSize: 14,
        fontWeight: 600,
      }}>
        <StopOutlined style={{ marginRight: 8 }} />
        此訂單已作廢
      </div>
    );
  }

  const current = STATUS_TO_STEP[status] ?? 0;

  return (
    <Steps
      current={current}
      size="small"
      items={STEPS.map((s, i) => ({
        key: s.key,
        title: s.label,
        icon: s.icon,
        status:
          i < current   ? 'finish'  :
          i === current ? 'process' :
          'wait',
      }))}
    />
  );
}
