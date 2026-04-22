import { Drawer, Descriptions, Tabs, Tag, Table, Typography, Space, Divider } from 'antd';
import { EnvironmentOutlined, FileTextOutlined, BankOutlined } from '@ant-design/icons';
import { templates } from '../data/fakeData';

const { Text } = Typography;

const INVOICE_MODE_LABEL = {
  per_order:         '訂單單筆開票',
  monthly_per_store: '門市分開月結',
  monthly_combined:  '整合月結',
};

const INVOICE_MODE_COLOR = {
  per_order:         'default',
  monthly_per_store: 'geekblue',
  monthly_combined:  'purple',
};

export default function ChannelDetail({ channel, open, onClose }) {
  if (!channel) return null;

  const tpl = templates.find(t => t.id === channel.templateId);

  const addressCols = [
    { title: '門市/倉別', dataIndex: 'label', width: 100 },
    { title: '收件人', dataIndex: 'recipient', width: 150 },
    { title: '電話', dataIndex: 'phone', width: 120 },
    { title: '地址', dataIndex: 'address' },
  ];

  return (
    <Drawer
      title={
        <Space>
          <span style={{ fontWeight: 700 }}>{channel.name}</span>
          <Tag color="blue">{channel.taxId}</Tag>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={780}
    >
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
        <Descriptions.Item label="通路名稱">{channel.name}</Descriptions.Item>
        <Descriptions.Item label="聯絡信箱">{channel.email}</Descriptions.Item>
        <Descriptions.Item label="聯繫窗口">{channel.contact}</Descriptions.Item>
        <Descriptions.Item label="聯繫電話">{channel.contactPhone}</Descriptions.Item>
        <Descriptions.Item label="公司抬頭">{channel.title}</Descriptions.Item>
        <Descriptions.Item label="統一編號">{channel.taxId}</Descriptions.Item>
        <Descriptions.Item label="結算日">每月 {channel.settlementDay} 日</Descriptions.Item>
        <Descriptions.Item label="發票模式">
          <Tag color={INVOICE_MODE_COLOR[channel.invoice_mode] ?? 'default'}>
            {INVOICE_MODE_LABEL[channel.invoice_mode] ?? '—'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="套用模板" span={2}>
          <Tag color="geekblue"><FileTextOutlined /> {tpl?.name ?? channel.templateId}</Tag>
        </Descriptions.Item>
        {channel.default_bank_last5 && (
          <Descriptions.Item label="常用匯款末五碼" span={2}>
            <Text code>{channel.default_bank_last5}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Tabs
        items={[
          {
            key: 'addresses',
            label: <Space><EnvironmentOutlined />收件地址</Space>,
            children: (
              <Table
                dataSource={channel.addresses}
                columns={addressCols}
                rowKey="label"
                size="small"
                pagination={false}
              />
            ),
          },
          {
            key: 'pricing',
            label: '議價說明',
            children: (
              <div style={{ padding: '8px 0' }}>
                <Divider orientation="left" plain>個別品項議價</Divider>
                <Text style={{ whiteSpace: 'pre-line' }}>{channel.pricingNote || '無'}</Text>
                <Divider orientation="left" plain>量折優惠</Divider>
                <Text style={{ whiteSpace: 'pre-line' }}>{channel.volumeDiscount || '無'}</Text>
                {channel.discount_note && (
                  <>
                    <Divider orientation="left" plain>折扣備註（後台）</Divider>
                    <Text style={{ whiteSpace: 'pre-line', color: '#fa8c16' }}>{channel.discount_note}</Text>
                  </>
                )}
              </div>
            ),
          },
          {
            key: 'notes',
            label: '內部備註',
            children: (
              <div style={{ padding: '8px 0' }}>
                <Divider orientation="left" plain>客服備註（僅後台）</Divider>
                <Text style={{ whiteSpace: 'pre-line', color: '#595959' }}>{channel.internal_note || '無'}</Text>
              </div>
            ),
          },
          {
            key: 'payment',
            label: '匯款資訊',
            children: (
              <Descriptions bordered size="small" column={1} style={{ marginTop: 8 }}>
                <Descriptions.Item label="戶名">舒果農企業有限公司</Descriptions.Item>
                <Descriptions.Item label="金融機構代碼">兆豐 0170077</Descriptions.Item>
                <Descriptions.Item label="帳號">00709001170</Descriptions.Item>
                <Descriptions.Item label="合作方式">買斷</Descriptions.Item>
                <Descriptions.Item label="付款方式">次月 {channel.settlementDay} 號前付款</Descriptions.Item>
                {channel.default_bank_last5 && (
                  <Descriptions.Item label="廠商常用匯款末五碼">
                    <Text code>{channel.default_bank_last5}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
