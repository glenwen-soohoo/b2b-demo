import { useEffect, useState } from 'react'
import { Card, Table, Tag, Space, Descriptions, Typography } from 'antd'
import { FileProtectOutlined } from '@ant-design/icons'
import { channels } from '../../data/fakeData'
import { getCurrentContractVersion, contractVersions } from '../../data/contractData'
import {
  getConsentState, getChannelAgreements, getLatestAgreement,
  subscribeContractUpdates,
} from '../../utils/contractStore'

const { Text } = Typography

const STATE_TAG = {
  agreed_current:        { color: 'green',  label: '已同意最新版' },
  agreed_outdated_minor: { color: 'blue',   label: '已同意（小幅更新免重簽）' },
  need_reconsent:        { color: 'orange', label: '待重新同意' },
  need_first:            { color: 'red',    label: '未同意' },
}

export default function AdminContracts() {
  const [tick, setTick] = useState(0)
  useEffect(() => subscribeContractUpdates(() => setTick(t => t + 1)), [])

  const version = getCurrentContractVersion()

  const rows = channels.map(ch => {
    const state = getConsentState(ch.id)
    const latest = getLatestAgreement(ch.id)
    return {
      key: ch.id,
      channelId: ch.id,
      name: ch.name,
      taxId: ch.taxId,
      state,
      latestVersion: latest?.version ?? null,
      latestAt: latest?.agreedAt ?? null,
      agreements: getChannelAgreements(ch.id),
    }
  })

  return (
    <div style={{ padding: 20 }}>
      <Card
        size="small"
        title={<Space><FileProtectOutlined style={{ color: '#389e0d' }} />現行合約版本</Space>}
        style={{ marginBottom: 16 }}
      >
        <Descriptions size="small" column={2}>
          <Descriptions.Item label="版本">
            <Tag color="green">{version.version}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="生效日">{version.effectiveDate}</Descriptions.Item>
          <Descriptions.Item label="更新時需重新同意">
            {version.requireReconsent
              ? <Tag color="orange">是（強制重簽）</Tag>
              : <Tag>否（小幅更新免重簽）</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="歷史版本數">{contractVersions.length}</Descriptions.Item>
          <Descriptions.Item label="更新重點" span={2}>
            <Text type="secondary">{version.changeSummary}</Text>
          </Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
          合約版本與內容由工程師於程式碼維護；此頁僅供查詢各通路的同意狀態與歷次同意紀錄。
        </div>
      </Card>

      <Card size="small" title="各通路同意狀態">
        <Table
          dataSource={rows}
          size="small"
          pagination={false}
          columns={[
            { title: '通路', dataIndex: 'name',
              render: (v, r) => <Space direction="vertical" size={0}>
                <span>{v}</span>
                <Text type="secondary" style={{ fontSize: 11 }}>統編 {r.taxId}</Text>
              </Space> },
            { title: '目前狀態', dataIndex: 'state', width: 200,
              render: s => <Tag color={STATE_TAG[s].color}>{STATE_TAG[s].label}</Tag> },
            { title: '最新同意版本', dataIndex: 'latestVersion', width: 130, align: 'center',
              render: v => v ? <Tag color="green">{v}</Tag> : <Text type="secondary">—</Text> },
            { title: '最新同意時間', dataIndex: 'latestAt', width: 190,
              render: v => v ?? <Text type="secondary">—</Text> },
          ]}
          expandable={{
            expandedRowRender: r => (
              r.agreements.length === 0
                ? <Text type="secondary">尚無同意紀錄</Text>
                : <Table
                    dataSource={r.agreements}
                    rowKey={(_, i) => i}
                    size="small"
                    pagination={false}
                    columns={[
                      { title: '合約版本', dataIndex: 'version', width: 130,
                        render: v => <Tag color="green">{v}</Tag> },
                      { title: '同意時間', dataIndex: 'agreedAt', width: 190 },
                      { title: '來源 IP', dataIndex: 'ip', render: v => <Text type="secondary">{v}</Text> },
                    ]}
                  />
            ),
            rowExpandable: r => r.agreements.length > 0,
          }}
        />
      </Card>
    </div>
  )
}
