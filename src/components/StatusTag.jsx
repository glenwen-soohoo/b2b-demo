import { Tag } from 'antd';
import { PRE_ORDER_STATUS, SETTLEMENT_STATUS } from '../data/fakeData';

const ALL_STATUS = { ...PRE_ORDER_STATUS, ...SETTLEMENT_STATUS };

export default function StatusTag({ status }) {
  const s = ALL_STATUS[status];
  if (!s) return null;
  return <Tag color={s.color}>{s.label}</Tag>;
}
