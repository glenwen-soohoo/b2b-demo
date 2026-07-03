// 通知信「內容」單一來源（給 NotificationPreviewModal 與 通知信預覽頁 共用）
// 修改任一封信的樣式 / 文案都改這裡，兩處會同步生效。
import { Descriptions, Tag, Space, Typography, Table, Divider, Button, Alert } from 'antd';

const { Text } = Typography;

// 信件品牌綠（抬頭線、行動按鈕）
const BRAND_GREEN = '#389e0d';

// 互動式 token 按鈕（模擬信件中的一次性連結）
// TODO_FRUIT_WEB: 真實實作時替換為後端產生的 14 天 one-time token URL
//   DB 欄位: EmailTokens(token, orderId/settlementId, action, expiresAt, usedAt)
export function TokenButton({ label, description }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 8 }}>請點擊下方按鈕{label}（{description}）：</div>
      <Button type="primary" style={{ background: BRAND_GREEN, borderColor: BRAND_GREEN }}>{label}</Button>
      <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>（連結 14 天內有效，僅可使用一次）</div>
    </div>
  );
}

/**
 * 依 type + data 產生一封通知信的內容。
 * 回傳 { title, to, subject, body } 或 { title, tabs: [{key,label,to,subject,body}] }；找不到回傳 null。
 * type 清單見下方 NOTIFICATION_CATALOG / 各 if 區塊。
 */
export function getNotificationContent(type, data) {
  if (!data) return null;

  // E-02 訂單成立通知（業務確認後寄出，含差異明細）
  if (type === 'order_confirmed') {
    const diffs = data.diffs ?? [];
    const hasDiff = diffs.length > 0;
    return {
      title: '訂單成立通知',
      to: data.channelEmail ?? data.channelName,
      subject: `【無毒農 B2B】您的訂單 ${data.orderId} 已成立${hasDiff ? '（數量異動）' : ''}`,
      body: (
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <div>親愛的 {data.channelName} 您好，</div>
          <div style={{ marginTop: 8 }}>
            您的B2B訂單 <Text code>{data.orderId}</Text> 已由業務確認並正式成立，後台正式訂單號：
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
          <div style={{ marginTop: 12 }}>後續依正常出貨流程處理，感謝您的採購。</div>
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

  // 訂單作廢通知
  if (type === 'order_voided') {
    return {
      title: '訂單作廢通知',
      to: data.channelEmail ?? data.channelName,
      subject: `【無毒農 B2B】您的訂單 ${data.orderId} 已作廢`,
      body: (
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <div>親愛的 {data.channelName} 您好，</div>
          <div style={{ marginTop: 8 }}>
            您的B2B訂單 <Text code>{data.orderId}</Text> 已由業務作廢處理。
          </div>
          {data.reason && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4 }}>
              <Text strong style={{ color: '#d46b08' }}>作廢原因：</Text>
              <div style={{ marginTop: 4, color: '#595959' }}>{data.reason}</div>
            </div>
          )}
          {data.recreatedOrderId && (
            <div style={{ marginTop: 8, color: '#1677ff' }}>
              ✏️ 已建立替代訂單：<Text code>{data.recreatedOrderId}</Text>
            </div>
          )}
          <div style={{ marginTop: 12, color: '#888' }}>如有疑問，請聯繫業務窗口。</div>
        </div>
      ),
    };
  }

  // E-09 發票開立完成通知（→ 廠商）
  if (type === 'invoice_issued') {
    const invoices = data.invoices ?? [];  // [{storeName, invoiceNumber, amount, buyerName, buyerTaxId}]
    const isMulti = invoices.length > 1;
    return {
      title: '發票開立完成通知',
      to: data.channelEmail ?? data.channelName,
      subject: `【無毒農 B2B】${data.settlementMonth} 發票已開立${isMulti ? `（共 ${invoices.length} 張）` : ''}`,
      body: (
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <div>親愛的 {data.channelName} 您好，</div>
          <div style={{ marginTop: 8 }}>
            您 <Text strong>{data.settlementMonth}</Text> 月份的結算發票已開立完成。
          </div>
          {invoices.length > 0 && (
            <Table
              dataSource={invoices}
              rowKey={(_, i) => i}
              size="small"
              pagination={false}
              style={{ marginTop: 8 }}
              columns={[
                ...(isMulti ? [{ title: '門市 / 抬頭', dataIndex: 'storeName', width: 130 }] : []),
                { title: '抬頭', dataIndex: 'buyerName' },
                { title: '統編', dataIndex: 'buyerTaxId', width: 100,
                  render: v => <Text code style={{ fontSize: 11 }}>{v}</Text> },
                { title: '發票號碼', dataIndex: 'invoiceNumber', width: 130,
                  render: v => <Text code style={{ fontSize: 11 }}>{v}</Text> },
                { title: '金額', dataIndex: 'amount', width: 90, align: 'right',
                  render: v => `$${v.toLocaleString()}` },
              ]}
            />
          )}
          <div style={{ marginTop: 12, color: '#888' }}>
            電子發票將由綠界系統另行寄送至您的信箱。
          </div>
        </div>
      ),
    };
  }

  // E-17 發票開立失敗通知（→ 業務）
  if (type === 'invoice_failed') {
    return {
      title: '發票開立失敗通知（內部）',
      to: data.adminEmail ?? '業務 / 財務窗口',
      subject: `【無毒農 B2B】⚠️ 發票開立失敗：${data.orderId ?? data.settlementId}（需人工處理）`,
      body: (
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <Alert
            type="error"
            showIcon
            message="發票開立失敗"
            description={
              <div>
                <div>通路：<Text strong>{data.channelName}</Text></div>
                <div>關聯單號：<Text code>{data.orderId ?? data.settlementId}</Text></div>
                <div>應開金額：${(data.amount ?? 0).toLocaleString()}</div>
              </div>
            }
            style={{ marginBottom: 12 }}
          />
          <div style={{ marginTop: 8 }}>
            <Text strong>失敗原因：</Text>
            <div style={{ marginTop: 4, padding: '6px 10px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 4, color: '#a8071a' }}>
              {data.errorMessage ?? '未知錯誤（請至 ECPay 後台查詢）'}
            </div>
          </div>
          <div style={{ marginTop: 12, color: '#595959' }}>
            B2B 系統（B2BInvoiceService）已自動重試 3 次仍失敗，本筆已進入「待人工處理」清單，請業務 / 財務確認資料後手動處理。
          </div>
        </div>
      ),
    };
  }

  // E-05 結算單產生（→ 廠商）
  if (type === 'settlement_created') {
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

  // E-07 催繳款（→ 廠商）
  if (type === 'settlement_reminder') {
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

  // E-01 廠商送出採購單（→ 業務 / 管理者）
  if (type === 'order_submitted') {
    const hasFrozen  = (data.frozenCount  ?? 0) > 0;
    const hasAmbient = (data.ambientCount ?? 0) > 0;
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

  // E-08 廠商回報匯款（→ 財務 / 業務）
  if (type === 'vendor_payment_report') {
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

  // E-11 後台重設密碼（→ 廠商）
  if (type === 'admin_password_reset') {
    return {
      title: '密碼重設通知（系統產生新密碼）',
      to: data.contactEmail ?? '通路聯絡信箱',
      subject: `【無毒農 B2B】您的密碼已被後台重設 — ${data.channelName ?? ''}`,
      body: (
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <div>親愛的 {data.contactName ?? '通路窗口'} 您好，</div>
          <div style={{ marginTop: 8 }}>
            您的 B2B 通路帳號密碼已由業務窗口重設：
          </div>
          <div style={{ marginTop: 12, padding: '12px 16px', background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6 }}>
            <div>帳號：<Text code>{data.account}</Text></div>
            <div>新密碼：<Text strong style={{ fontSize: 14, color: '#d46b08' }}>{data.newPassword}</Text></div>
          </div>
          <div style={{ marginTop: 12 }}>
            請於下次登入時使用新密碼，並於登入後至「通路資料 → 修改密碼」自行變更。
          </div>
          <div style={{ marginTop: 12, color: '#888', fontSize: 12 }}>
            如非您本人申請重設，請立即聯繫業務窗口。
          </div>
        </div>
      ),
    };
  }

  // E-12 廠商自助忘記密碼（→ 廠商）
  if (type === 'password_reset_email') {
    const token = data.resetToken ?? 'demo-token-xxx';
    const resetUrl = `https://b2b.greenbox.tw/reset-password?token=${token}`;
    // demo 點按鈕模擬「在郵件中點連結」→ 開新分頁進 reset-password 頁
    const handleClickReset = () => {
      window.open(`/reset-password?token=${token}`, '_blank', 'noopener,noreferrer');
    };
    return {
      title: '重設密碼信件',
      to: data.contactEmail ?? data.account ?? '廠商聯絡信箱',
      subject: '【無毒農 B2B】重設密碼連結',
      body: (
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <div>親愛的 {data.contactName ?? '通路窗口'} 您好，</div>
          <div style={{ marginTop: 8 }}>
            您剛剛在 B2B 前台申請重設密碼，請點擊下方連結設定新密碼：
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8 }}>請點擊下方按鈕進入重設密碼頁面：</div>
            <Button type="primary" style={{ background: BRAND_GREEN, borderColor: BRAND_GREEN }} onClick={handleClickReset}>
              重設密碼
            </Button>
            <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>（連結 30 分鐘內有效，僅可使用一次）</div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#888', wordBreak: 'break-all' }}>
            連結網址：<Text code style={{ fontSize: 11 }}>{resetUrl}</Text>
          </div>
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6 }}>
            ⚠️ 此連結 <Text strong>30 分鐘內</Text>有效，僅可使用一次。
          </div>
          <div style={{ marginTop: 12, color: '#888', fontSize: 12 }}>
            若非您本人申請，請忽略此封信，您的帳號目前安全。
          </div>
        </div>
      ),
    };
  }

  // 業務 / 財務確認收款後：通知廠商已確認收到匯款（雙收件對象 → tabs）
  if (type === 'payment_confirmed') {
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
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8 }}>請點擊下方按鈕向業務窗口回報：</div>
                <Button type="primary" style={{ background: BRAND_GREEN, borderColor: BRAND_GREEN }}>回報業務窗口</Button>
                <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>（Demo：此按鈕代表廠商確認回報）</div>
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
}

// 一封信的「收件對象 / 主旨 + 內文」呈現（Modal 與預覽頁共用）
export function EmailBody({ to, subject, body }) {
  return (
    <>
      {/* 預覽用 meta（非信件內容） */}
      <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="收件對象">{to}</Descriptions.Item>
        <Descriptions.Item label="主旨">{subject}</Descriptions.Item>
      </Descriptions>

      {/* 信件本體：白底、綠色抬頭、系統頁尾（email 預設透明白底，不加灰底） */}
      <div style={{ padding: '4px 8px', fontFamily: "'Noto Sans TC', sans-serif" }}>
        <div style={{
          color: BRAND_GREEN, fontWeight: 700, fontSize: 18,
          paddingBottom: 12, borderBottom: `2px solid ${BRAND_GREEN}`, marginBottom: 16,
        }}>
          無毒農 B2B
        </div>
        {body}
        <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid #eee', color: '#999', fontSize: 12 }}>
          此為系統自動發送的通知信，請勿直接回覆；如有疑問請聯繫您的業務窗口。
        </div>
      </div>
    </>
  );
}
