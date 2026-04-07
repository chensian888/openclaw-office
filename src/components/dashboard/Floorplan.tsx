import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Alarm, Device, DeviceBinding, Point, Zone } from '@/domain/types'

export type PointState = 'normal' | 'offline' | 'warn' | 'critical'

type PointWithState = {
  point: Point
  state: PointState
}

type Props = {
  zones: Zone[]
  points: Point[]
  devices: Device[]
  bindings: DeviceBinding[]
  alarms: Alarm[]
  selectedPointId?: string
  onSelectPoint: (pointId: string, pos: { x: number; y: number }) => void
  className?: string
}

function stateColor(state: PointState) {
  if (state === 'critical') return { fill: 'rgba(239,68,68,0.18)', stroke: 'rgba(239,68,68,0.9)' }
  if (state === 'warn') return { fill: 'rgba(245,158,11,0.16)', stroke: 'rgba(245,158,11,0.9)' }
  if (state === 'offline') return { fill: 'rgba(148,163,184,0.10)', stroke: 'rgba(148,163,184,0.70)' }
  return { fill: 'rgba(59,130,246,0.14)', stroke: 'rgba(59,130,246,0.9)' }
}

export function Floorplan({ zones, points, devices, bindings, alarms, selectedPointId, onSelectPoint, className }: Props) {
  const pointsWithState: PointWithState[] = useMemo(() => {
    const deviceById = new Map(devices.map((d) => [d.id, d]))
    const deviceIdsByPoint = new Map<string, string[]>()
    bindings.forEach((b) => {
      const list = deviceIdsByPoint.get(b.pointId) ?? []
      list.push(b.deviceId)
      deviceIdsByPoint.set(b.pointId, list)
    })

    const alarmsByPoint = new Map<string, Alarm[]>()
    alarms.forEach((a) => {
      if (!a.pointId) return
      const list = alarmsByPoint.get(a.pointId) ?? []
      list.push(a)
      alarmsByPoint.set(a.pointId, list)
    })

    return points.map((p) => {
      const a = (alarmsByPoint.get(p.id) ?? []).filter((x) => x.status !== 'closed')
      const hasCritical = a.some((x) => x.level === 'critical' && x.status === 'open')
      const hasWarn = a.some((x) => (x.level === 'warn' || x.level === 'critical') && x.status === 'open')

      const bound = deviceIdsByPoint.get(p.id) ?? []
      const hasOffline = bound.some((id) => deviceById.get(id)?.status === 'offline')

      const state: PointState = hasCritical ? 'critical' : hasWarn ? 'warn' : hasOffline ? 'offline' : 'normal'
      return { point: p, state }
    })
  }, [alarms, bindings, devices, points])

  return (
    <div className={cn('relative h-full w-full overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950/20', className)}>
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <svg viewBox="0 0 1000 600" className="relative h-full w-full">
        <rect x="60" y="80" width="620" height="440" rx="18" fill="rgba(15,27,45,0.75)" stroke="rgba(30,42,61,0.9)" />
        <rect x="90" y="120" width="560" height="180" rx="14" fill="rgba(12,24,46,0.75)" stroke="rgba(30,42,61,0.9)" />
        <rect x="90" y="330" width="560" height="170" rx="14" fill="rgba(12,24,46,0.75)" stroke="rgba(30,42,61,0.9)" />

        <text x="110" y="148" fill="#9BB2D0" fontSize="14">{zones.find((z) => z.id === 'zone_a')?.name ?? 'A区'}</text>
        <text x="110" y="358" fill="#9BB2D0" fontSize="14">{zones.find((z) => z.id === 'zone_b')?.name ?? 'B区'}</text>

        <rect x="710" y="170" width="220" height="220" rx="14" fill="rgba(12,24,46,0.70)" stroke="rgba(30,42,61,0.9)" />
        <text x="730" y="200" fill="#9BB2D0" fontSize="14">控制区</text>

        {pointsWithState.map(({ point, state }) => {
          const c = stateColor(state)
          const selected = point.id === selectedPointId
          return (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={selected ? 16 : 14}
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth={selected ? 3 : 2}
              />
              {state === 'critical' || state === 'warn' ? (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={selected ? 26 : 22}
                  fill="transparent"
                  stroke={state === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}
                  strokeWidth="8"
                />
              ) : null}
              <circle
                cx={point.x}
                cy={point.y}
                r={5}
                fill={c.stroke}
                opacity={state === 'offline' ? 0.5 : 0.9}
              />
              <foreignObject x={point.x - 46} y={point.y + 16} width={92} height={34}>
                <button
                  type="button"
                  onClick={(e) => {
                    const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
                    onSelectPoint(point.id, { x: r.left + r.width / 2, y: r.top })
                  }}
                  className={cn(
                    'pointer-events-auto w-full rounded-md bg-slate-950/70 px-2 py-1 text-center text-xs text-slate-100 ring-1 ring-slate-800/70 hover:bg-slate-900/70',
                    selected && 'ring-2 ring-blue-500/50',
                  )}
                >
                  {point.name}
                </button>
              </foreignObject>
            </g>
          )
        })}
      </svg>

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
        <span className="text-slate-400">图例</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" />正常</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" />离线</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />预警</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />告警</span>
      </div>
    </div>
  )
}
