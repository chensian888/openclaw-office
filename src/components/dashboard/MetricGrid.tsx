import { Droplets, Gauge, Thermometer, Waves } from 'lucide-react'
import type { TelemetryLatest } from '@/domain/types'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatAgo, formatMetric, metricLabel } from '@/utils/format'

type MetricItem = {
  key: string
  icon: JSX.Element
}

const items: MetricItem[] = [
  { key: 'water_temp', icon: <Thermometer className="h-4 w-4 text-blue-200" /> },
  { key: 'do', icon: <Droplets className="h-4 w-4 text-emerald-200" /> },
  { key: 'ph', icon: <Gauge className="h-4 w-4 text-amber-200" /> },
  { key: 'nh3n', icon: <Waves className="h-4 w-4 text-purple-200" /> },
]

type Props = {
  telemetryLatest: TelemetryLatest[]
  className?: string
}

export function MetricGrid({ telemetryLatest, className }: Props) {
  const preferred = telemetryLatest[0]

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>关键实时指标</CardTitle>
        <div className="text-xs text-slate-500">更新：{formatAgo(preferred?.recordedAt)}</div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {items.map((it) => (
            <div key={it.key} className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">{metricLabel(it.key)}</div>
                {it.icon}
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-100">
                {formatMetric(it.key, preferred?.metrics[it.key])}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
