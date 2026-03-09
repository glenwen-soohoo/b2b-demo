import { Steps } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';

const STEPS = [
  { key: 'pending',              label: '預訂中',    icon: <ClockCircleOutlined /> },
  { key: 'awaiting_settlement',  label: '待結算',    icon: <FileTextOutlined /> },
  { key: 'settling',             label: '結算中',    icon: <SyncOutlined spin /> },
  { key: 'awaiting_order',       label: '待建單',    icon: <ShoppingCartOutlined /> },
  { key: 'ordered',              label: '已建單',    icon: <CheckCircleOutlined /> },
  { key: 'awaiting_payment',     label: '待匯款',    icon: <DollarOutlined /> },
  { key: 'paid',                 label: '已匯款',    icon: <CheckCircleOutlined /> },
  { key: 'completed',            label: '完成',      icon: <CheckSquareOutlined /> },
];

const STATUS_TO_STEP = {
  pending: 0,
  awaiting_settlement: 1,
  settling: 2,
  insufficient_stock: 2,   // 停在第 2 步但顯示 error
  awaiting_order: 3,
  ordered: 4,
  awaiting_payment: 5,
  paid: 6,
  completed: 7,
};

export default function OrderStateMachine({ status }) {
  const current = STATUS_TO_STEP[status] ?? 0;
  const isError = status === 'insufficient_stock';

  return (
    <Steps
      current={current}
      status={isError ? 'error' : undefined}
      size="small"
      items={STEPS.map((s, i) => ({
        key: s.key,
        title: s.label,
        icon: s.icon,
        status:
          isError && i === current
            ? 'error'
            : i < current
            ? 'finish'
            : i === current
            ? 'process'
            : 'wait',
      }))}
    />
  );
}
