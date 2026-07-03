import { Modal, Space, Tabs } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { getNotificationContent, EmailBody } from './notificationContent';

/**
 * 通知預覽彈窗（模擬寄信，不寄真實 email）
 * 信件「內容」統一由 notificationContent.getNotificationContent 產生（與通知信預覽頁共用）。
 *
 * Props:
 *   open, onClose, onConfirm
 *   type:   見 notificationContent.jsx（order_submitted / order_confirmed / order_voided /
 *           settlement_created / settlement_reminder / vendor_payment_report / payment_confirmed /
 *           invoice_issued / invoice_failed / admin_password_reset / password_reset_email）
 *   data:   依 type 不同內容不同
 *   onlyTab: 只顯示指定 tab（不顯示 tab 列）
 */
export default function NotificationPreviewModal({ open, onClose, onConfirm, type, data, onlyTab }) {
  const content = getNotificationContent(type, data);
  if (!content) return null;

  // onlyTab：只顯示指定 tab（不顯示 tab 列）
  const singleTab = onlyTab && content.tabs?.find(t => t.key === onlyTab);

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
        <EmailBody to={singleTab.to} subject={singleTab.subject} body={singleTab.body} />
      ) : content.tabs ? (
        <Tabs
          defaultActiveKey="vendor"
          items={content.tabs.map(t => ({
            key: t.key,
            label: t.label,
            children: <EmailBody to={t.to} subject={t.subject} body={t.body} />,
          }))}
        />
      ) : (
        <EmailBody to={content.to} subject={content.subject} body={content.body} />
      )}
      <div style={{ marginTop: 12, color: '#aaa', fontSize: 12, textAlign: 'right' }}>
        ✦ 此為 Demo 模式，實際不會寄送 Email
      </div>
    </Modal>
  );
}
