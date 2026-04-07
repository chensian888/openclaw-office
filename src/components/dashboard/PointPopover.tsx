import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import type { Alarm, Device, DeviceBinding, Point, TelemetryLatest } from '@/domain/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { formatAgo, formatMetric } from '@/utils/format'

type Props = {
  point: Point
  devices: Device[]
  bindings: DeviceBinding[]
  telemetryLatest: TelemetryLatest[]
  alarms: Alarm[]
  anchor: { x: number; y: number }
  onClose: () => void
}

function tone(level: Alarm['level']) {
  if (level === 'critical') return 'critical'
  if (level === 'warn') return 'warn'
  return 'info'
}

export function PointPopover({ point, devices, bindings, telemetryLatest, alarms, anchor, onClose }: Props) {
  const boundDeviceIds = useMemo(() => bindings.filter((b) => b.pointId === point.id).map((b) => b.deviceId), [bindings, point.id])
  const boundDevices = useMemo(() => devices.filter((d) => boundDeviceIds.includes(d.id)), [boundDeviceIds, devices])
  const latest = useMemo(() => telemetryLatest.find((t) => t.pointId === point.id), [point.id, telemetryLatest])
  const pointAlarms = useMemo(
    () => alarms.filter((a) => a.pointId === point.id && a.status !== 'closed').slice(0, 4),
    [alarms, point.id],
  )

  const top = Math.max(72, Math.min(window.innerHeight - 280, anchor.y + 12))
  const left = Math.max(260, Math.min(window.innerWidth - 380, anchor.x - 160))

  return (
    <div className="fixed inset-0 z-40">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="关闭" />
      <div
        className={cn(
          'absolute w-[340px] rounded-xl border border-slate-800/70 bg-slate-950/85 p-3 shadow-xl backdrop-blur',
        )}
        style={{ top, left }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-200" />
              <div className="text-sm font-semibold text-slate-100">{point.name}</div>
            </div>
            <div className="mt-1 text-xs text-slate-400">类型：{point.pointType}</div>
          </div>
          <Link
            to={`/ops?pointId=${encodeURIComponent(point.id)}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800/70 bg-slate-950/40 px-2 py-1 text-xs text-slate-200 hover:bg-slate-900/60"
          >
            查看详情 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-2 py-2">
            <div className="text-[11px] text-slate-400">水温</div>
            <div className="mt-1 text-sm font-semibold text-slate-100">{formatMetric('water_temp', latest?.metrics.water_temp)}</div>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-2 py-2">
            <div className="text-[11px] text-slate-400">溶氧</div>
            <div className="mt-1 text-sm font-semibold text-slate-100">{formatMetric('do', latest?.metrics.do)}</div>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-2 py-2">
            <div className="text-[11px] text-slate-400">pH</div>
            <div className="mt-1 text-sm font-semibold text-slate-100">{formatMetric('ph', latest?.metrics.ph)}</div>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-2 py-2">
            <div className="text-[11px] text-slate-400">最近更新</div>
            <div className="mt-1 text-sm font-semibold text-slate-100">{formatAgo(latest?.recordedAt)}</div>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-2 text-xs font-medium text-slate-300">绑定设备</div>
          <div className="space-y-1">
            {boundDevices.length ? (
              boundDevices.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-950/30 px-2 py-2">
                  <div>
                    <div className="text-xs text-slate-100">{d.name}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{d.deviceSn}</div>
                  </div>
                  <Badge tone={d.status === 'online' ? 'info' : d.status === 'offline' ? 'muted' : 'warn'}>
                    {d.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500">暂无绑定设备</div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-2 text-xs font-medium text-slate-300">相关告警</div>
          <div className="space-y-1">
            {pointAlarms.length ? (
              pointAlarms.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-950/30 px-2 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs text-slate-100">{a.title}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{formatAgo(a.triggeredAt)}</div>
                  </div>
                  <Badge tone={tone(a.level)}>{a.level}</Badge>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500">暂无未关闭告警</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
