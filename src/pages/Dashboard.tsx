import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDataClient } from '@/data'
import type { RoomOverview } from '@/domain/types'
import { AppShell } from '@/components/layout/AppShell'
import { Floorplan } from '@/components/dashboard/Floorplan'
import { MetricGrid } from '@/components/dashboard/MetricGrid'
import { AlarmPanel } from '@/components/dashboard/AlarmPanel'
import { ControlPanel } from '@/components/dashboard/ControlPanel'
import { TrendPanel } from '@/components/dashboard/TrendPanel'
import { PointPopover } from '@/components/dashboard/PointPopover'
import { useUiStore } from '@/stores/uiStore'
import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  const client = useMemo(() => getDataClient(), [])
  const { roomId, selectedPointId, selectPoint, trendRange, setTrendRange } = useUiStore()
  const [overview, setOverview] = useState<RoomOverview | undefined>()
  const [loading, setLoading] = useState(true)
  const [anchor, setAnchor] = useState<{ x: number; y: number } | undefined>()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const ov = await client.getRoomOverview(roomId)
      setOverview(ov)
    } finally {
      setLoading(false)
    }
  }, [client, roomId])

  useEffect(() => {
    refresh().catch(() => {})
    const t = window.setInterval(() => refresh().catch(() => {}), 10_000)
    return () => window.clearInterval(t)
  }, [refresh])

  const selectedPoint = overview?.points.find((p) => p.id === selectedPointId)

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3 p-3">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 2xl:grid-cols-[1fr_420px]">
          <div className="min-h-0">
            {loading && !overview ? (
              <Card className="h-full animate-pulse" />
            ) : overview ? (
              <Floorplan
                zones={overview.zones}
                points={overview.points}
                devices={overview.devices}
                bindings={overview.bindings}
                alarms={overview.alarms}
                selectedPointId={selectedPointId}
                onSelectPoint={(id, pos) => {
                  selectPoint(id)
                  setAnchor(pos)
                }}
                className="h-full"
              />
            ) : (
              <Card className="flex h-full items-center justify-center text-sm text-slate-400">加载失败</Card>
            )}
          </div>

          <div className="min-h-0 space-y-3 overflow-auto pr-1">
            <MetricGrid telemetryLatest={overview?.telemetryLatest ?? []} />
            <AlarmPanel alarms={overview?.alarms ?? []} onChanged={() => refresh().catch(() => {})} />
            <ControlPanel devices={overview?.devices ?? []} />
          </div>
        </div>

        <div className="h-[320px]">
          <TrendPanel deviceId="d_sensor_a" range={trendRange} onChangeRange={setTrendRange} />
        </div>
      </div>

      {selectedPoint && overview && anchor ? (
        <PointPopover
          point={selectedPoint}
          devices={overview.devices}
          bindings={overview.bindings}
          telemetryLatest={overview.telemetryLatest}
          alarms={overview.alarms}
          anchor={anchor}
          onClose={() => selectPoint(undefined)}
        />
      ) : null}
    </AppShell>
  )
}
