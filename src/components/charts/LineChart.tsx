import { useEffect, useMemo, useRef } from 'react'
import * as echarts from 'echarts'
import { cn } from '@/lib/utils'

export type LineSeriesPoint = {
  ts: string
  value?: number
}

type Props = {
  title: string
  color: string
  points: LineSeriesPoint[]
  unit?: string
  height?: number
  className?: string
}

export function LineChart({ title, color, points, unit, height = 220, className }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  const option = useMemo(() => {
    const x = points.map((p) => new Date(p.ts).toLocaleString())
    const y = points.map((p) => (p.value === undefined ? null : p.value))

    return {
      animation: false,
      grid: { left: 36, right: 16, top: 34, bottom: 28 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: x,
        axisLabel: { color: '#9BB2D0', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(155,178,208,0.2)' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#9BB2D0', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(155,178,208,0.12)' } },
      },
      series: [
        {
          name: title,
          type: 'line',
          data: y,
          showSymbol: false,
          connectNulls: false,
          lineStyle: { color, width: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${color}55` }, { offset: 1, color: `${color}00` }] } },
        },
      ],
      title: { text: unit ? `${title}（${unit}）` : title, left: 8, top: 8, textStyle: { color: '#E6F1FF', fontSize: 12, fontWeight: 600 } },
    } as echarts.EChartsOption
  }, [color, points, title, unit])

  useEffect(() => {
    if (!elRef.current) return
    if (!chartRef.current) chartRef.current = echarts.init(elRef.current)
    chartRef.current.setOption(option, { notMerge: true })
    const onResize = () => chartRef.current?.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [option])

  useEffect(() => {
    return () => {
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  return <div ref={elRef} className={cn('w-full', className)} style={{ height }} />
}
