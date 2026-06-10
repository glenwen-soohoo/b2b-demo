import { Drawer, Descriptions, Tabs, Tag, Table, Typography, Space, Divider } from 'antd';
import { EnvironmentOutlined, FileTextOutlined, BankOutlined, UserOutlined } from '@ant-design/icons';
import { templates } from '../data/fakeData';
import { invoiceModeLabel, invoiceModeColor } from '../utils/invoiceMode';

const { Text } = Typography;

export default function ChannelDetail({ channel, open, onClose }) {
  if (!channel) return null;

  const tpl = templates.find(t => t.id === channel.templateId);
  // 依門市分別統編（per_store）時，每個收件地址各自帶抬頭 / 統編
  const isPerStore = channel.invoiceTaxScope === 'per_store';

  const addressCols = [
    { title: '門市/倉別', dataIndex: 'label', width: 100 },
    { title: '收件人', dataIndex: 'recipient', width: 120 },
    { title: '電話', dataIndex: 'phone', width: 110 },
    { title: '地址', dataIndex: 'address' },
    ...(isPerStore ? [{
      title: '抬頭 / 統編', width: 170,
      render: (_, r) => (
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontSize: 13 }}>{r.buyerName ?? channel.title ?? '—'}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', whiteSpace: 'nowrap' }}>{r.buyerTaxId ?? channel.taxId ?? '—'}</div>
        </div>
      ),
    }] : []),
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
      width={840}
    >
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
        <Descriptions.Item label="無毒農後台帳號" span={2}>
          {channel.memberAccount
            ? <span><UserOutlined style={{ marginRight: 6 }} />{channel.memberAccount}</span>
            : <Text type="secondary">—</Text>
          }
        </Descriptions.Item>
        <Descriptions.Item label="通路名稱">{channel.name}</Descriptions.Item>
        <Descriptions.Item label="聯絡信箱">{channel.contactEmail}</Descriptions.Item>
        <Descriptions.Item label="聯繫窗口">{channel.contactName}</Descriptions.Item>
        <Descriptions.Item label="聯繫電話">{channel.contactPhone}</Descriptions.Item>
        <Descriptions.Item label="公司抬頭">{channel.title}</Descriptions.Item>
        <Descriptions.Item label="統一編號">{channel.taxId}</Descriptions.Item>
        <Descriptions.Item label="結算日">每月 {channel.settlementDay} 日</Descriptions.Item>
        <Descriptions.Item label="發票模式">
          {channel.invoicePeriod && channel.invoiceTaxScope ? (
            <Tag color={invoiceModeColor(channel.invoicePeriod, channel.invoiceTaxScope)}>
              {invoiceModeLabel(channel.invoicePeriod, channel.invoiceTaxScope)}
            </Tag>
          ) : <Text type="secondary">—</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="發票類型">
          {channel.invoiceMode === 'three_copy'
            ? <Tag color="cyan">三聯式</Tag>
            : channel.invoiceMode === 'two_copy'
            ? <Tag>二聯式</Tag>
            : <Text type="secondary">—</Text>
          }
        </Descriptions.Item>
        <Descriptions.Item label="套用模板" span={2}>
          <Tag color="geekblue"><FileTextOutlined /> {tpl?.name ?? channel.templateId}</Tag>
        </Descriptions.Item>
        {channel.default_bank_last5 && (
          <Descriptions.Item label="常用匯款末五碼" span={2}>
            {channel.default_bank_last5}
          </Descriptions.Item>
        )}
        <Descriptions.Item
          label={
            <span>
              預設下單備註
              <div style={{ fontSize: 11, color: '#999', fontWeight: 'normal', marginTop: 2 }}>
                （通路端亦可填寫）
              </div>
            </span>
          }
          span={2}
        >
          {channel.default_vendor_note
            ? <Text style={{ whiteSpace: 'pre-line' }}>{channel.default_vendor_note}</Text>
            : <Text type="secondary">—</Text>
          }
        </Descriptions.Item>
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
                    {channel.default_bank_last5}
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
