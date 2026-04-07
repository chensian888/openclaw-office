import { useMemo } from 'react'
import type { OpenClawStatus } from '@/openclaw/types'
import { statusBg, statusColor, statusLabel } from '@/openclaw/status'
import { formatHm, todayKey } from '@/openclaw/time'
import { useOpenClawStore } from '@/stores/openclawStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const statuses: OpenClawStatus[] = ['focus', 'meeting', 'rest', 'offwork']

export function StatusPanel() {
  const currentStatus = useOpenClawStore((s) => s.currentStatus)
  const setStatus = useOpenClawStore((s) => s.setStatus)
  const events = useOpenClawStore((s) => s.statusEvents)

  const todayEvents = useMemo(() => {
    const dk = todayKey()
    return events.filter((e) => e.dateKey === dk)
  }, [events])

  const currentEvent = useMemo(() => {
    const dk = todayKey()
    return events.find((e) => e.dateKey === dk && !e.endedAt)
  }, [events])

  return (
    <Card>
      <CardHeader>
        <CardTitle>状态面板</CardTitle>
        <Badge tone="muted">今日切换 {todayEvents.length}</Badge>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-100">当前：{statusLabel(currentStatus)}</div>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: statusColor(currentStatus) }}
              aria-label={statusLabel(currentStatus)}
            />
          </div>
          <div className="mt-1 text-xs text-slate-400">开始时间：{formatHm(currentEvent?.startedAt)}</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {statuses.map((s) => (
            <Button
              key={s}
              variant="ghost"
              className={
                'justify-start border-slate-800/70 ' +
                (currentStatus === s ? 'ring-2 ring-blue-500/35' : '')
              }
              style={{ background: currentStatus === s ? statusBg(s) : undefined }}
              onClick={() => setStatus(s)}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: statusColor(s) }} />
              {statusLabel(s)}
            </Button>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-xs text-slate-400">
          点击状态后，龙虾会移动到对应区域并播放待机动画。
        </div>
      </CardContent>
    </Card>
  )
}
