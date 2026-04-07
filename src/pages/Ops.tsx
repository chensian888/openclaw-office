import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bell, Database, Search, Settings2 } from 'lucide-react'
import { getDataClient } from '@/data'
import type { Alarm, AlarmRule, Device } from '@/domain/types'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { useSessionStore } from '@/stores/sessionStore'
import { formatAgo, formatTs, metricLabel } from '@/utils/format'

type TabKey = 'devices' | 'alarms' | 'rules'

function tone(level: Alarm['level']) {
  if (level === 'critical') return 'critical'
  if (level === 'warn') return 'warn'
  return 'info'
}

export default function OpsPage() {
  const client = useMemo(() => getDataClient(), [])
  const session = useSessionStore((s) => s.session)
  const isAdmin = session?.role === 'admin'
  const [searchParams] = useSearchParams()
  const prePointId = searchParams.get('pointId') ?? undefined
  const preDeviceId = searchParams.get('deviceId') ?? undefined

  const [tab, setTab] = useState<TabKey>('devices')
  const [keyword, setKeyword] = useState('')

  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(preDeviceId)
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | undefined>()
  const [rules, setRules] = useState<AlarmRule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const [closeId, setCloseId] = useState<string | undefined>()
  const [closeNote, setCloseNote] = useState('')
  const [busyId, setBusyId] = useState<string | undefined>()

  const tabs = useMemo(() => {
    const base = [
      { key: 'devices', label: '设备' },
      { key: 'alarms', label: '告警' },
    ]
    if (isAdmin) base.push({ key: 'rules', label: '阈值规则' })
    return base
  }, [isAdmin])

  const refresh = useCallback(async () => {
    setError(undefined)
    setLoading(true)
    try {
      const [ds, as] = await Promise.all([
        client.listDevices({ keyword }),
        client.listAlarms({ keyword }),
      ])
      setDevices(ds)
      setAlarms(as)
      if (isAdmin) {
        const rs = await client.listAlarmRules()
        setRules(rs)
      }

      if (prePointId && !selectedAlarmId) {
        const match = as.find((a) => a.pointId === prePointId)
        if (match) {
          setTab('alarms')
          setSelectedAlarmId(match.id)
        }
      }
      if (preDeviceId) {
        setTab('devices')
        setSelectedDeviceId(preDeviceId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [client, isAdmin, keyword, preDeviceId, prePointId, selectedAlarmId])

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId)
  const selectedAlarm = alarms.find((a) => a.id === selectedAlarmId)

  const ackAlarm = async (alarm: Alarm) => {
    if (!session) return
    setBusyId(alarm.id)
    try {
      await client.ackAlarm(alarm.id, session.userId)
      await refresh()
    } finally {
      setBusyId(undefined)
    }
  }

  const closeAlarm = async () => {
    if (!session || !closeId) return
    setBusyId(closeId)
    try {
      await client.closeAlarm(closeId, session.userId, closeNote || '已处理')
      setCloseId(undefined)
      setCloseNote('')
      await refresh()
    } finally {
      setBusyId(undefined)
    }
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs items={tabs} activeKey={tab} onChange={(k) => setTab(k as TabKey)} />
          <div className="flex w-full gap-2 lg:w-[420px]">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索：设备 SN / 名称 / 告警标题" className="pl-9" />
            </div>
            <Button variant="ghost" onClick={() => refresh().catch(() => {})} disabled={loading}>
              刷新
            </Button>
          </div>
        </div>

        {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 2xl:grid-cols-[520px_1fr]">
          <Card className="min-h-0 overflow-hidden">
            <CardHeader>
              <CardTitle>
                {tab === 'devices' ? (
                  <span className="inline-flex items-center gap-2"><Database className="h-4 w-4" />设备列表</span>
                ) : tab === 'alarms' ? (
                  <span className="inline-flex items-center gap-2"><Bell className="h-4 w-4" />告警列表</span>
                ) : (
                  <span className="inline-flex items-center gap-2"><Settings2 className="h-4 w-4" />规则列表</span>
                )}
              </CardTitle>
              <Badge tone="muted">点击一条查看详情</Badge>
            </CardHeader>
            <CardContent className="min-h-0 overflow-auto">
              {tab === 'devices' ? (
                <div className="space-y-2">
                  {devices.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDeviceId(d.id)}
                      className={
                        'w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-left hover:bg-slate-900/50 ' +
                        (selectedDeviceId === d.id ? 'ring-2 ring-blue-500/40' : '')
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-100">{d.name}</div>
                          <div className="mt-1 text-xs text-slate-400">{d.deviceSn} · {d.deviceType}</div>
                        </div>
                        <Badge tone={d.status === 'online' ? 'info' : d.status === 'offline' ? 'muted' : 'warn'}>
                          {d.status}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">最近上报：{formatAgo(d.lastSeenAt)}</div>
                    </button>
                  ))}
                </div>
              ) : tab === 'alarms' ? (
                <div className="space-y-2">
                  {alarms.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedAlarmId(a.id)}
                      className={
                        'w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-left hover:bg-slate-900/50 ' +
                        (selectedAlarmId === a.id ? 'ring-2 ring-blue-500/40' : '')
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge tone={tone(a.level)}>{a.level}</Badge>
                            <div className="truncate text-sm font-medium text-slate-100">{a.title}</div>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">{formatAgo(a.triggeredAt)} · {a.status}</div>
                        </div>
                        {a.status === 'open' ? <Badge tone="warn">待处理</Badge> : a.status === 'ack' ? <Badge tone="info">已确认</Badge> : <Badge tone="muted">已关闭</Badge>}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {rules.map((r) => (
                    <div key={r.id} className="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-100">{metricLabel(r.metricKey)}</div>
                          <div className="mt-1 text-xs text-slate-400">{r.op} {JSON.stringify(r.threshold)} · sustain {r.sustainSeconds}s</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone={tone(r.level)}>{r.level}</Badge>
                          <Badge tone={r.enabled ? 'info' : 'muted'}>{r.enabled ? '启用' : '停用'}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-h-0 overflow-hidden">
            <CardHeader>
              <CardTitle>详情</CardTitle>
              <Badge tone="muted">{tab === 'devices' ? '设备详情' : tab === 'alarms' ? '告警详情' : '规则预览'}</Badge>
            </CardHeader>
            <CardContent className="min-h-0 overflow-auto">
              {tab === 'devices' ? (
                selectedDevice ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-100">{selectedDevice.name}</div>
                          <div className="mt-1 text-xs text-slate-400">{selectedDevice.deviceSn} · {selectedDevice.deviceType} · {selectedDevice.model ?? '—'}</div>
                        </div>
                        <Badge tone={selectedDevice.status === 'online' ? 'info' : selectedDevice.status === 'offline' ? 'muted' : 'warn'}>
                          {selectedDevice.status}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">最近上报：{formatTs(selectedDevice.lastSeenAt)}</div>
                    </div>

                    <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-3">
                      <div className="text-xs font-medium text-slate-300">能力</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(selectedDevice.capabilities.metrics ?? []).map((m) => (
                          <Badge key={m} tone="muted">{m}</Badge>
                        ))}
                        {(selectedDevice.capabilities.actions ?? []).map((a) => (
                          <Badge key={a} tone="muted">{a}</Badge>
                        ))}
                        {!((selectedDevice.capabilities.metrics ?? []).length || (selectedDevice.capabilities.actions ?? []).length) ? (
                          <div className="text-xs text-slate-500">暂无</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">从左侧选择一个设备</div>
                )
              ) : tab === 'alarms' ? (
                selectedAlarm ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge tone={tone(selectedAlarm.level)}>{selectedAlarm.level}</Badge>
                            <div className="truncate text-sm font-semibold text-slate-100">{selectedAlarm.title}</div>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">触发：{formatTs(selectedAlarm.triggeredAt)} · 状态 {selectedAlarm.status}</div>
                          <div className="mt-2 text-xs text-slate-400">点位：{selectedAlarm.pointId ?? '—'} · 设备：{selectedAlarm.deviceId ?? '—'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedAlarm.status === 'open' ? (
                            <Button size="sm" variant="ghost" disabled={busyId === selectedAlarm.id} onClick={() => ackAlarm(selectedAlarm).catch(() => {})}>
                              确认
                            </Button>
                          ) : null}
                          {selectedAlarm.status !== 'closed' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busyId === selectedAlarm.id}
                              onClick={() => {
                                setCloseId(selectedAlarm.id)
                                setCloseNote('')
                              }}
                            >
                              关闭
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2">
                        <div className="text-xs font-medium text-slate-300">触发快照</div>
                        <pre className="mt-2 overflow-auto text-xs text-slate-300">{JSON.stringify(selectedAlarm.detail, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">从左侧选择一条告警</div>
                )
              ) : (
                <div className="text-sm text-slate-500">规则编辑将在接入真实后端后启用（当前为预览）。</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(closeId)}
        title="关闭告警"
        description="填写处理备注，记录此次处置。"
        onClose={() => {
          setCloseId(undefined)
          setCloseNote('')
        }}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCloseId(undefined)}>
              取消
            </Button>
            <Button onClick={() => closeAlarm().catch(() => {})} disabled={busyId === closeId}>
              确认关闭
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <div className="text-xs text-slate-400">备注</div>
          <Input value={closeNote} onChange={(e) => setCloseNote(e.target.value)} placeholder="例如：已增氧并观察回落" />
        </div>
      </Modal>
    </AppShell>
  )
}
