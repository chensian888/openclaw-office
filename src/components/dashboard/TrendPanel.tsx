import { useEffect, useMemo, useState } from 'react'
import { getDataClient } from '@/data'
import type { TimeRange } from '@/domain/types'
import { LineChart } from '@/components/charts/LineChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { metricUnit } from '@/utils/format'

type Props = {
  deviceId: string
  range: TimeRange
  onChangeRange: (range: TimeRange) => void
}

type SeriesState = {
  do: { ts: string; value?: number }[]
  water_temp: { ts: string; value?: number }[]
}

export function TrendPanel({ deviceId, range, onChangeRange }: Props) {
  const client = useMemo(() => getDataClient(), [])
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SeriesState>({ do: [], water_temp: [] })

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      try {
        const [doSeries, tempSeries] = await Promise.all([
          client.getDeviceTelemetry(deviceId, 'do', range),
          client.getDeviceTelemetry(deviceId, 'water_temp', range),
        ])
        if (!alive) return
        setData({
          do: doSeries.map((r) => ({ ts: r.recordedAt, value: r.metrics.do })),
          water_temp: tempSeries.map((r) => ({ ts: r.recordedAt, value: r.metrics.water_temp })),
        })
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [client, deviceId, range])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>趋势图表</CardTitle>
        <Tabs
          items={[
            { key: '24h', label: '近24小时' },
            { key: '7d', label: '近7天' },
          ]}
          activeKey={range}
          onChange={(k) => onChangeRange(k as TimeRange)}
        />
      </CardHeader>
      <CardContent>
        {loading && !data.do.length ? (
          <div className="h-[240px] animate-pulse rounded-lg bg-slate-900/30" />
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-2 py-2">
              <LineChart title="溶氧" unit={metricUnit('do')} color="#22c55e" points={data.do} height={240} />
            </div>
            <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-2 py-2">
              <LineChart title="水温" unit={metricUnit('water_temp')} color="#3b82f6" points={data.water_temp} height={240} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
