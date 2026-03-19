import { Steps } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  DollarOutlined,
  CheckSquareOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';

// B2B訂單流程 + 結算流程合併顯示
const STEPS = [
  { key: 'pending_sales',     label: '待業務確認', icon: <ClockCircleOutlined /> },
  { key: 'pending_warehouse', label: '待倉庫確認', icon: <InboxOutlined /> },
  { key: 'ordered',           label: '已成立訂單', icon: <CheckCircleOutlined /> },
  { key: 'awaiting_payment',  label: '待匯款',     icon: <DollarOutlined /> },
  { key: 'paid',              label: '已匯款',     icon: <FileProtectOutlined /> },
  { key: 'completed',         label: '完成',       icon: <CheckSquareOutlined /> },
];

const STATUS_TO_STEP = {
  pending_sales:     0,
  pending_warehouse: 1,
  ordered:           2,
  settled:           2, // 已結算鎖定，停在已成立訂單位置
  awaiting_payment:  3,
  paid:              4,
  completed:         5,
};

export default function OrderStateMachine({ status }) {
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
          i < current ? 'finish' :
          i === current ? 'process' :
          'wait',
      }))}
    />
  );
}
