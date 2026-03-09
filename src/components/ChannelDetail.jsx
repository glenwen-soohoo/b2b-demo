import { Drawer, Descriptions, Tabs, Tag, Table, Typography, Space, Divider } from 'antd';
import { EnvironmentOutlined, MailOutlined, PhoneOutlined, FileTextOutlined } from '@ant-design/icons';
import { templates } from '../data/fakeData';

const { Text } = Typography;

export default function ChannelDetail({ channel, open, onClose }) {
  if (!channel) return null;

  const tpl = templates.find(t => t.id === channel.templateId);

  const addressCols = [
    { title: '門市/倉別', dataIndex: 'label', width: 100 },
    { title: '收件人', dataIndex: 'recipient', width: 150 },
    { title: '電話', dataIndex: 'phone', width: 120 },
    { title: '地址', dataIndex: 'address' },
    { title: '營業時間', dataIndex: 'hours', width: 200 },
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
      width={760}
    >
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
        <Descriptions.Item label="公司抬頭">{channel.title}</Descriptions.Item>
        <Descriptions.Item label="統一編號">{channel.taxId}</Descriptions.Item>
        <Descriptions.Item label={<Space><MailOutlined />聯繫信箱</Space>}>{channel.email}</Descriptions.Item>
        <Descriptions.Item label={<Space><PhoneOutlined />聯繫窗口</Space>}>
          {channel.contact} &nbsp;{channel.contactPhone}
        </Descriptions.Item>
        <Descriptions.Item label="結算日">每月 {channel.settlementDay} 日</Descriptions.Item>
        <Descriptions.Item label="月結方式">{channel.settlementMethod}</Descriptions.Item>
        <Descriptions.Item label="套用模板" span={2}>
          <Tag color="geekblue"><FileTextOutlined /> {tpl?.name ?? channel.templateId}</Tag>
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
                <Descriptions.Item label="付款方式">{channel.settlementMethod}，次月 {channel.settlementDay} 號前付款</Descriptions.Item>
              </Descriptions>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
