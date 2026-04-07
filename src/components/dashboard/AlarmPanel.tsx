import { useMemo, useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { getDataClient } from '@/data'
import type { Alarm } from '@/domain/types'
import { useSessionStore } from '@/stores/sessionStore'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { formatAgo } from '@/utils/format'

type Props = {
  alarms: Alarm[]
  onChanged: () => void
  className?: string
}

function tone(level: Alarm['level']) {
  if (level === 'critical') return 'critical'
  if (level === 'warn') return 'warn'
  return 'info'
}

export function AlarmPanel({ alarms, onChanged, className }: Props) {
  const client = useMemo(() => getDataClient(), [])
  const session = useSessionStore((s) => s.session)

  const counts = useMemo(() => {
    const active = alarms.filter((a) => a.status !== 'closed')
    return {
      info: active.filter((a) => a.level === 'info' && a.status === 'open').length,
      warn: active.filter((a) => a.level === 'warn' && a.status === 'open').length,
      critical: active.filter((a) => a.level === 'critical' && a.status === 'open').length,
    }
  }, [alarms])

  const list = useMemo(() => alarms.slice(0, 8), [alarms])
  const [busyId, setBusyId] = useState<string | undefined>()
  const [closeId, setCloseId] = useState<string | undefined>()
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | undefined>()

  const onAck = async (alarm: Alarm) => {
    if (!session) return
    setError(undefined)
    setBusyId(alarm.id)
    try {
      await client.ackAlarm(alarm.id, session.userId)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setBusyId(undefined)
    }
  }

  const confirmClose = async () => {
    if (!session || !closeId) return
    setError(undefined)
    setBusyId(closeId)
    try {
      await client.closeAlarm(closeId, session.userId, note || '已处理')
      setCloseId(undefined)
      setNote('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setBusyId(undefined)
    }
  }

  return (
    <>
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2"><Bell className="h-4 w-4" />告警总览</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge tone="info">info {counts.info}</Badge>
            <Badge tone="warn">warn {counts.warn}</Badge>
            <Badge tone="critical">critical {counts.critical}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {error ? <div className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div> : null}
          <div className="space-y-2">
            {list.length ? (
              list.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone={tone(a.level)}>{a.level}</Badge>
                      <div className="truncate text-sm text-slate-100">{a.title}</div>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{formatAgo(a.triggeredAt)} · 状态 {a.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.status === 'open' ? (
                      <Button size="sm" variant="ghost" disabled={busyId === a.id} onClick={() => onAck(a)}>
                        <Check className="h-4 w-4" />
                        确认
                      </Button>
                    ) : null}
                    {a.status !== 'closed' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === a.id}
                        onClick={() => {
                          setCloseId(a.id)
                          setNote('')
                        }}
                      >
                        <X className="h-4 w-4" />
                        关闭
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500">暂无告警</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal
        open={Boolean(closeId)}
        title="关闭告警"
        description="填写处理备注，记录此次处置。"
        onClose={() => {
          setCloseId(undefined)
          setNote('')
        }}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCloseId(undefined)}>
              取消
            </Button>
            <Button onClick={confirmClose} disabled={busyId === closeId}>
              确认关闭
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <div className="text-xs text-slate-400">备注</div>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：已增氧并观察回落" />
        </div>
      </Modal>
    </>
  )
}
