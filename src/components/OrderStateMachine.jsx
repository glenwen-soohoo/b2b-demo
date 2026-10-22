import { Steps } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  SyncOutlined,
  CheckSquareOutlined,
  StopOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

// 企業：待業務確認 → 已成立訂單 → 到貨等待結算 → 結算中 → 結算完畢
const STEPS_ENTERPRISE = [
  { key: 'pending_sales', label: '待業務確認',   icon: <ClockCircleOutlined /> },
  { key: 'ordered',       label: '已成立訂單',   icon: <CheckCircleOutlined /> },
  { key: 'arrived',       label: '到貨等待結算', icon: <InboxOutlined /> },
  { key: 'settling',      label: '結算中',       icon: <SyncOutlined /> },
  { key: 'settled_done',  label: '結算完畢',     icon: <CheckSquareOutlined /> },
];

// 團媽・不開發票：待業務確認 → 待付款（刷卡）→ 已成立訂單（終態；不進結算流程）
const STEPS_GROUPMOM = [
  { key: 'pending_sales',   label: '待業務確認',   icon: <ClockCircleOutlined /> },
  { key: 'pending_payment', label: '待付款',       icon: <CreditCardOutlined /> },
  { key: 'ordered',         label: '已成立訂單',   icon: <CheckCircleOutlined /> },
];

// 團媽・開發票：多走到貨（單筆開票）；逐筆刷卡、無月結，故無結算中/結算完畢
const STEPS_GROUPMOM_INVOICE = [
  { key: 'pending_sales',   label: '待業務確認',   icon: <ClockCircleOutlined /> },
  { key: 'pending_payment', label: '待付款',       icon: <CreditCardOutlined /> },
  { key: 'ordered',         label: '已成立訂單',   icon: <CheckCircleOutlined /> },
  { key: 'arrived',         label: '到貨・單筆開票', icon: <InboxOutlined /> },
];

export default function OrderStateMachine({ status, isGroupMom = false, noInvoice = false }) {
  // 企業用企業版；團媽依開不開發票分兩種（不開發票終態已成立、開發票多走到貨單筆開票）
  const STEPS = !isGroupMom
    ? STEPS_ENTERPRISE
    : noInvoice ? STEPS_GROUPMOM : STEPS_GROUPMOM_INVOICE;
  const STATUS_TO_STEP = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));
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
