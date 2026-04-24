import { Modal, Descriptions, Tag, Space, Typography, Table, Divider, Tabs, Button, Alert } from 'antd';
import { MailOutlined, LinkOutlined } from '@ant-design/icons';
import { TEMP } from '../styles/tokens';

const { Text } = Typography;

// 互動式 token 按鈕區塊（模擬信件中的一次性連結）
// TODO_FRUIT_WEB: 真實實作時替換為後端產生的 14 天 one-time token URL
//   DB 欄位: EmailTokens(token, orderId/settlementId, action, expiresAt, usedAt)
function TokenButton({ label, description }) {
  return (
    <div style={{ marginTop: 16, padding: '12px 16px', background: TEMP.frozen.bg, borderRadius: 6, border: `1px solid ${TEMP.frozen.border}` }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>
        <LinkOutlined style={{ marginRight: 6 }} />點擊下方按鈕{description}
      </div>
      <Button type="primary" size="small" icon={<LinkOutlined />}>{label}</Button>
      <Text type="secondary" style={{ marginLeft: 8, fontSize: 11 }}>（Token 連結 14 天有效，僅可使用一次）</Text>
    </div>
  );
}

/**
 * 通知預覽彈窗（模擬寄信，不寄真實 email）
 *
 * Props:
 *   open: bool
 *   onClose: fn
 *   type: 'order_submitted' | 'sales_to_warehouse' | 'warehouse_confirmed' |
 *         'settlement_created' | 'settlement_reminder' |
 *         'vendor_payment_report' | 'payment_received'
 *   data: object（依 type 不同內容不同）
 */
export default function NotificationPreviewModal({ open, onClose, onConfirm, type, data, onlyTab }) {
  if (!data) return null;

  const renderContent = () => {
    if (type === 'sales_to_warehouse') {
      // 業務送倉庫確認時，通知廠商
      return {
        title: '業務確認完成通知',
        to: data.channelEmail ?? data.channelName,
        subject: `【無毒農】您的B2B訂單 ${data.orderId} 已進入倉庫確認流程`,
        body: (
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div>親愛的 {data.channelName} 您好，</div>
            <div style={{ marginTop: 8 }}>
              您的B2B訂單 <Text code>{data.orderId}</Text> 已由業務確認完畢，目前進入倉庫確認流程。
            </div>
            {data.hasAdjustment && (
              <div style={{ marginTop: 8, color: '#fa8c16' }}>
                ⚠️ 業務針對部分品項數量做了調整，最終出貨數量以倉庫確認後的結果為準。
              </div>
            )}
            <div style={{ marginTop: 8 }}>倉庫確認後，我們將再次通知您訂單成立結果。</div>
            <div style={{ marginTop: 12, color: '#888' }}>如有疑問，請聯繫業務窗口。</div>
          </div>
        ),
      };
    }

    if (type === 'warehouse_confirmed') {
      // 倉庫建立訂單時，通知廠商（含差異明細）
      const diffs = data.diffs ?? [];
      const hasDiff = diffs.length > 0;
      return {
        title: '訂單成立通知',
        to: data.channelEmail ?? data.channelName,
        subject: `【無毒農】您的B2B訂單 ${data.orderId} 已成立${hasDiff ? '（數量異動）' : ''}`,
        body: (
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div>親愛的 {data.channelName} 您好，</div>
            <div style={{ marginTop: 8 }}>
              您的B2B訂單 <Text code>{data.orderId}</Text> 已正式成立，後台訂單號：
              <Text strong> {data.backendOrderId}</Text>
            </div>
            {hasDiff ? (
              <>
                <div style={{ marginTop: 8, color: '#fa8c16' }}>
                  ⚠️ 以下品項出貨數量與您原始下訂有異動：
                </div>
                <Table
                  dataSource={diffs}
                  rowKey="productId"
                  size="small"
                  pagination={false}
                  style={{ marginTop: 8 }}
                  columns={[
                    { title: '品項', dataIndex: 'productName' },
                    { title: '原始下訂', dataIndex: 'originalQty', width: 90, align: 'center' },
                    { title: '實際出貨', dataIndex: 'adjustedQty', width: 90, align: 'center',
                      render: v => <Text style={{ color: '#fa8c16' }} strong>{v}</Text> },
                    { title: '差異', width: 70, align: 'center',
                      render: (_, r) => {
                        const d = r.adjustedQty - r.originalQty;
                        return <Tag color={d < 0 ? 'red' : 'green'}>{d > 0 ? '+' : ''}{d}</Tag>;
                      }},
                  ]}
                />
              </>
            ) : (
              <div style={{ marginTop: 8, color: '#52c41a' }}>✅ 出貨數量與您的下訂完全一致。</div>
            )}
            <div style={{ marginTop: 12 }}>後續由倉庫依正常出貨流程處理，感謝您的採購。</div>
            <TokenButton
              label="確認訂單內容"
              description="確認此筆B2B訂單（到貨後可回報收貨狀況）"
            />
            <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
              若按鈕已失效，請聯繫業務窗口。
            </div>
          </div>
        ),
      };
    }

    if (type === 'settlement_created') {
      // 結算單生成時，通知廠商
      return {
        title: '結算匯款通知',
        to: data.channelEmail ?? data.channelName,
        subject: `【無毒農】${data.settlementMonth} 結算單已生成，請於期限內完成匯款`,
        body: (
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div>親愛的 {data.channelName} 您好，</div>
            <div style={{ marginTop: 8 }}>
              <Text strong>{data.settlementMonth}</Text> 月份結算單已生成，結算金額如下：
            </div>
            <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: '#1677ff' }}>
              結算金額：${(data.totalAmount ?? 0).toLocaleString()}
            </div>
            {data.discount && (
              <div style={{ color: '#52c41a', marginTop: 4 }}>✅ 本月已達優惠門檻，折扣已計入</div>
            )}
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>匯款資訊</div>
            <div>戶名：舒果農企業有限公司</div>
            <div>銀行：兆豐 0170077</div>
            <div>帳號：00709001170</div>
            {data.preOrderIds && data.preOrderIds.length > 0 && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ fontWeight: 600, marginBottom: 4 }}>涵蓋B2B訂單</div>
                <Space wrap size={4}>
                  {data.preOrderIds.map(id => (
                    <Tag key={id} color="purple" style={{ fontSize: 11 }}>{id}</Tag>
                  ))}
                </Space>
              </>
            )}
            <TokenButton
              label="回報已完成匯款"
              description="通知無毒農財務人員確認收款"
            />
            <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
              完成匯款後，請點擊上方按鈕回報，以利財務核帳。
            </div>
          </div>
        ),
      };
    }

    if (type === 'settlement_reminder') {
      // #6: 超過 7 天未匯款提醒（使用與 #4 同一組 token）
      return {
        title: '結算匯款提醒',
        to: data.channelEmail ?? data.channelName,
        subject: `【無毒農提醒】${data.settlementMonth} 結算單尚未收到匯款，請確認`,
        body: (
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div>親愛的 {data.channelName} 您好，</div>
            <div style={{ marginTop: 8 }}>
              我們發現您 <Text strong>{data.settlementMonth}</Text> 月份的結算單自發送後已超過{' '}
              <Text strong style={{ color: '#fa8c16' }}>7 天</Text>，
              目前尚未收到匯款確認。
            </div>
            <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: '#fa8c16' }}>
              待匯金額：${(data.totalAmount ?? 0).toLocaleString()}
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>匯款資訊</div>
            <div>戶名：舒果農企業有限公司</div>
            <div>銀行：兆豐 0170077</div>
            <div>帳號：00709001170</div>
            <TokenButton
              label="回報已完成匯款"
              description="通知無毒農財務人員確認收款"
            />
            <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
              若已匯款，請忽略此封信或聯繫業務窗口，謝謝。
            </div>
          </div>
        ),
      };
    }

    if (type === 'order_submitted') {
      // 廠商送出B2B訂單時，通知業務/管理者
      const hasFrozen  = (data.frozenCount  ?? 0) > 0
      const hasAmbient = (data.ambientCount ?? 0) > 0
      return {
        title: '新B2B訂單通知',
        to: '業務人員 / 管理者',
        subject: `【無毒農】${data.channelName} 送出新B2B訂單`,
        body: (
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div>業務您好，</div>
            <div style={{ marginTop: 8 }}>
              通路 <Text strong>{data.channelName}</Text> 已送出新的B2B訂單，詳情如下：
            </div>
            <div style={{ marginTop: 8, padding: '10px 14px', background: '#f5f5f5', borderRadius: 6 }}>
              <div>結算月份：<Text strong>{data.settlementMonth}</Text></div>
              {hasFrozen && (
                <div>❄️ 冷凍品項：<Text strong>{data.frozenCount}</Text> 項，金額 <Text strong style={{ color: '#1677ff' }}>${(data.frozenTotal ?? 0).toLocaleString()}</Text></div>
              )}
              {hasAmbient && (
                <div>🌿 常溫品項：<Text strong>{data.ambientCount}</Text> 項，金額 <Text strong style={{ color: '#1677ff' }}>${(data.ambientTotal ?? 0).toLocaleString()}</Text></div>
              )}
              <div>訂購總金額：<Text strong style={{ color: '#1677ff' }}>${(data.total ?? 0).toLocaleString()}</Text></div>
              {data.vendorNote && (
                <div>廠商備註：<Text style={{ color: '#595959' }}>{data.vendorNote}</Text></div>
              )}
              <div>
                出貨門市：<Text strong>{data.addrCount}</Text> 個　將產生{' '}
                <Text strong>{data.orderCount ?? data.addrCount}</Text> 筆B2B訂單
                {hasFrozen && hasAmbient && '（冷凍、常溫各自獨立）'}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>請盡快至後台【B2B訂單管理】確認此筆B2B訂單。</div>
            <div style={{ marginTop: 4, color: '#888' }}>送出時間：{data.submittedAt}</div>
          </div>
        ),
      };
    }

    if (type === 'vendor_payment_report') {
      // 廠商回報已匯款，通知無毒農財務/業務
      return {
        title: '廠商回報匯款通知',
        to: '無毒農財務人員 / 業務人員',
        subject: `【廠商回報】${data.channelName} 已完成 ${data.settlementMonth} 結算匯款`,
        body: (
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div>財務您好，</div>
            <div style={{ marginTop: 8 }}>
              通路 <Text strong>{data.channelName}</Text> 回報已完成{' '}
              <Text strong>{data.settlementMonth}</Text> 月份結算匯款，詳情如下：
            </div>
            <div style={{ marginTop: 8, padding: '10px 14px', background: '#f5f5f5', borderRadius: 6 }}>
              <div>結算單號：<Text code style={{ fontSize: 12 }}>{data.settlementId}</Text></div>
              <div>結算金額：<Text strong style={{ color: '#1677ff' }}>${(data.totalAmount ?? 0).toLocaleString()}</Text></div>
              {data.bank_last5 && (
                <div>匯款帳號末五碼：<Text code>{data.bank_last5}</Text></div>
              )}
              <div>回報時間：<Text>{data.reportedAt}</Text></div>
            </div>
            <div style={{ marginTop: 8 }}>請財務人員確認帳戶入帳後，至後台將此結算單標記為「已匯款」。</div>
            <div style={{ marginTop: 4, color: '#888', fontSize: 12 }}>此通知由廠商前台系統自動發送</div>
          </div>
        ),
      };
    }

    if (type === 'payment_received') {
      return {
        title: '廠商已匯款通知',
        tabs: [
          {
            key: 'vendor',
            label: '廠商通知',
            to: data.channelEmail ?? data.channelName,
            subject: `【無毒農】您的 ${data.settlementMonth} 結算款項已確認收到`,
            body: (
              <div style={{ fontSize: 13, lineHeight: 2 }}>
                <div>親愛的 {data.channelName} 您好，</div>
                <div style={{ marginTop: 8 }}>
                  我們已確認收到您 <Text strong>{data.settlementMonth}</Text> 月份的結算匯款，
                  金額為 <Text strong style={{ color: '#1677ff' }}>${(data.totalAmount ?? 0).toLocaleString()}</Text>。
                </div>
                <div style={{ marginTop: 8 }}>感謝您準時完成匯款！</div>
                <div style={{ marginTop: 16, padding: '12px 16px', background: TEMP.frozen.bg, borderRadius: 6, border: `1px solid ${TEMP.frozen.border}` }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>📋 請點擊下方按鈕向業務窗口回報</div>
                  <Button type="primary" size="small">回報業務窗口</Button>
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>（Demo：此按鈕代表廠商確認回報）</Text>
                </div>
                <div style={{ marginTop: 8, color: '#888' }}>如有任何疑問，請聯繫業務窗口。</div>
              </div>
            ),
          },
          {
            key: 'business',
            label: '業務 / 財務通知',
            to: '業務人員、財務人員',
            subject: `【內部通知】${data.channelName} ${data.settlementMonth} 結算款項已入帳`,
            body: (
              <div style={{ fontSize: 13, lineHeight: 2 }}>
                <div>通路 <Text strong>{data.channelName}</Text> 已完成 <Text strong>{data.settlementMonth}</Text> 月份結算匯款。</div>
                <div style={{ marginTop: 8 }}>
                  結算金額：<Text strong style={{ color: '#1677ff' }}>${(data.totalAmount ?? 0).toLocaleString()}</Text>
                </div>
                <div style={{ marginTop: 8 }}>請財務人員確認帳戶入帳後，將結算單標記為「財務確認完成」。</div>
              </div>
            ),
          },
        ],
      };
    }

    return null;
  };

  const content = renderContent();
  if (!content) return null;

  const renderSingleNotif = (to, subject, body) => (
    <>
      <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="收件對象">{to}</Descriptions.Item>
        <Descriptions.Item label="主旨">{subject}</Descriptions.Item>
      </Descriptions>
      <div style={{
        background: '#fafafa', border: '1px solid #f0f0f0',
        borderRadius: 6, padding: '12px 16px',
      }}>
        {body}
      </div>
    </>
  );

  // onlyTab：只顯示指定 tab（不顯示 tab 列）
  const singleTab = onlyTab && content.tabs?.find(t => t.key === onlyTab)

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => { (onConfirm ?? onClose)(); }}
      okText="確認送出"
      cancelText="取消"
      title={<Space><MailOutlined /><span>通知預覽 — {content.title}</span></Space>}
      width={620}
    >
      {singleTab ? (
        renderSingleNotif(singleTab.to, singleTab.subject, singleTab.body)
      ) : content.tabs ? (
        <Tabs
          defaultActiveKey="vendor"
          items={content.tabs.map(t => ({
            key: t.key,
            label: t.label,
            children: renderSingleNotif(t.to, t.subject, t.body),
          }))}
        />
      ) : (
        renderSingleNotif(content.to, content.subject, content.body)
      )}
      <div style={{ marginTop: 12, color: '#aaa', fontSize: 12, textAlign: 'right' }}>
        ✦ 此為 Demo 模式，實際不會寄送 Email
      </div>
    </Modal>
  );
}
