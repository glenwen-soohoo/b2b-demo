import { Tag } from 'antd';
import { PRE_ORDER_STATUS, SETTLEMENT_STATUS, channelMap } from '../data/fakeData';

const ALL_STATUS = { ...PRE_ORDER_STATUS, ...SETTLEMENT_STATUS };

// 2026-10-27 翻盤：團媽一律不進結算。團媽到貨＝單筆開票的終態，
// 不能沿用企業的「到貨等待結算」字樣（會誤導成要月結）。
// 傳 order 進來時，團媽的 arrived 改讀「到貨・已開票」終態綠標。
function resolveStatus(status, order) {
  if (order && status === 'arrived') {
    const isGroupMom = (channelMap[order.channelId]?.channelType ?? 'enterprise') === 'groupmom';
    if (isGroupMom) {
      return order.invoiceNumber
        ? { label: '到貨・已開票', color: 'green' }
        : { label: '到貨完成', color: 'green' };
    }
  }
  return ALL_STATUS[status];
}

export default function StatusTag({ status, order }) {
  const s = resolveStatus(status, order);
  if (!s) return null;
  return <Tag color={s.color}>{s.label}</Tag>;
}
