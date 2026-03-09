import { Tag } from 'antd';
import { ORDER_STATUS } from '../data/fakeData';

export default function StatusTag({ status }) {
  const s = ORDER_STATUS[status];
  if (!s) return null;
  return <Tag color={s.color}>{s.label}</Tag>;
}
