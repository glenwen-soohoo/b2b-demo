import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Button, Typography, Space, Tag } from 'antd'
import { ShopOutlined, SettingOutlined, ArrowRightOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

export default function HomePage() {
  const nav = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', padding: 40,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🌱</div>
        <Title level={2} style={{ marginBottom: 4 }}>粥寶寶 B2B 通路系統</Title>
        <Text type="secondary">請選擇您的身份進入系統</Text>
      </div>

      <Row gutter={32} style={{ maxWidth: 720, width: '100%' }}>
        {/* 廠商入口 */}
        <Col span={12}>
          <Card
            hoverable
            style={{ textAlign: 'center', borderRadius: 16, border: '2px solid #52c41a' }}
            styles={{ body: { padding: 40 } }}
            onClick={() => nav('/vendor')}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>🏪</div>
            <Title level={3} style={{ marginBottom: 8, color: '#389e0d' }}>廠商入口</Title>
            <Paragraph type="secondary" style={{ marginBottom: 24, minHeight: 48 }}>
              合作通路登入後可查看授權商品、提交預訂，以及查看歷史預訂紀錄。
            </Paragraph>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Tag color="green">採購單下單</Tag>
              <Tag color="green">預訂紀錄查看</Tag>
              <Tag color="green">通路資料管理</Tag>
            </Space>
            <Button
              type="primary"
              size="large"
              block
              style={{ marginTop: 28, background: '#52c41a', borderColor: '#52c41a' }}
              icon={<ArrowRightOutlined />}
            >
              進入廠商前台
            </Button>
          </Card>
        </Col>

        {/* 管理後台 */}
        <Col span={12}>
          <Card
            hoverable
            style={{ textAlign: 'center', borderRadius: 16, border: '2px solid #1677ff' }}
            styles={{ body: { padding: 40 } }}
            onClick={() => nav('/admin')}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>⚙️</div>
            <Title level={3} style={{ marginBottom: 8, color: '#1677ff' }}>管理後台</Title>
            <Paragraph type="secondary" style={{ marginBottom: 24, minHeight: 48 }}>
              內部管理人員使用，管理商品、通路名單、結算處理與損益分析。
            </Paragraph>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Tag color="blue">商品 & 通路管理</Tag>
              <Tag color="blue">預訂 & 結算處理</Tag>
              <Tag color="blue">損益數據分析</Tag>
            </Space>
            <Button
              type="primary"
              size="large"
              block
              style={{ marginTop: 28 }}
              icon={<ArrowRightOutlined />}
            >
              進入管理後台
            </Button>
          </Card>
        </Col>
      </Row>

      <Text type="secondary" style={{ marginTop: 48, fontSize: 12 }}>
        Demo 版本 — 假資料展示用
      </Text>
    </div>
  )
}
