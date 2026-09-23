import { useEffect, useState } from 'react'
import { Card, Table, Tag, Space, Descriptions, Typography, Button, Input, Select, Drawer } from 'antd'
import { FileProtectOutlined, FileTextOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons'
import { channels } from '../../data/fakeData'
import { getCurrentContractVersion, contractVersions } from '../../data/contractData'
import {
  getConsentState, getChannelAgreements, getLatestAgreement,
  subscribeContractUpdates,
} from '../../utils/contractStore'
import ContractModal from '../../components/ContractModal'

const { Text } = Typography

const STATE_TAG = {
  agreed_current:        { color: 'green',  label: '已同意最新版' },
  agreed_outdated_minor: { color: 'blue',   label: '已同意（小幅更新免重簽）' },
  need_reconsent:        { color: 'orange', label: '待重新同意' },
  need_first:            { color: 'red',    label: '未同意' },
}

export default function AdminContracts() {
  const [tick, setTick] = useState(0)
  const [contractOpen, setContractOpen] = useState(false)   // 檢視合約內容彈窗
  const [historyOf, setHistoryOf] = useState(null)          // 歷史紀錄側窗對象（row）
  const [nameKw, setNameKw] = useState('')                  // 通路名稱篩選
  const [statusFilter, setStatusFilter] = useState('all')   // 同意狀態篩選

  useEffect(() => subscribeContractUpdates(() => setTick(t => t + 1)), [])
  void tick

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
      agreedCurrent: state === 'agreed_current',
      latestVersion: latest?.version ?? null,
      latestAt: latest?.agreedAt ?? null,
      agreements: getChannelAgreements(ch.id),
    }
  })

  const filtered = rows.filter(r => {
    if (nameKw && !r.name.includes(nameKw.trim())) return false
    if (statusFilter === 'agreed' && !r.agreedCurrent) return false
    if (statusFilter === 'not_agreed' && r.agreedCurrent) return false
    return true
  })

  return (
    <div style={{ padding: 20 }}>
      <Card
        size="small"
        title={<Space><FileProtectOutlined style={{ color: '#389e0d' }} />現行合約版本</Space>}
        extra={
          <Button icon={<FileTextOutlined />} onClick={() => setContractOpen(true)}>
            檢視合約內容
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions size="small" column={2}>
          <Descriptions.Item label="版本"><Tag color="green">{version.version}</Tag></Descriptions.Item>
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
        {/* 篩選列 */}
        <Space style={{ marginBottom: 12 }} wrap>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            placeholder="搜尋通路名稱"
            value={nameKw}
            onChange={e => setNameKw(e.target.value)}
            style={{ width: 220 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={[
              { value: 'all', label: '全部狀態' },
              { value: 'agreed', label: '已同意最新版' },
              { value: 'not_agreed', label: '未同意最新版' },
            ]}
          />
        </Space>

        <Table
          dataSource={filtered}
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
            { title: '歷次紀錄', width: 110, align: 'center',
              render: (_, r) => (
                <Button size="small" type="link" icon={<HistoryOutlined />}
                  disabled={r.agreements.length === 0}
                  onClick={() => setHistoryOf(r)}>
                  {r.agreements.length} 筆
                </Button>
              ) },
          ]}
        />
      </Card>

      {/* 檢視合約內容（唯讀彈窗） */}
      <ContractModal
        open={contractOpen}
        channel={null}
        version={version}
        readOnly
        closable
        onClose={() => setContractOpen(false)}
      />

      {/* 歷次同意紀錄（側窗） */}
      <Drawer
        title={historyOf ? `${historyOf.name}　歷次同意紀錄` : '歷次同意紀錄'}
        placement="right"
        width={480}
        open={!!historyOf}
        onClose={() => setHistoryOf(null)}
      >
        {historyOf && (
          <Table
            dataSource={historyOf.agreements}
            rowKey={(_, i) => i}
            size="small"
            pagination={false}
            columns={[
              { title: '合約版本', dataIndex: 'version', width: 120,
                render: v => <Space size={4}>
                  <Tag color="green">{v}</Tag>
                  {v === version.version && <Tag color="blue">現行版</Tag>}
                </Space> },
              { title: '同意時間', dataIndex: 'agreedAt', width: 170 },
              { title: '來源 IP', dataIndex: 'ip', render: v => <Text type="secondary">{v}</Text> },
            ]}
          />
        )}
      </Drawer>
    </div>
  )
}
