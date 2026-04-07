export function formatAgo(iso: string | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 0) return '刚刚'
  const m = Math.floor(diff / 60_000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const day = Math.floor(h / 24)
  return `${day} 天前`
}

export function formatTs(iso: string | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString()
}

export function formatMetric(metricKey: string, value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return '—'
  const unit = metricUnit(metricKey)
  if (metricKey === 'ph' || metricKey === 'nh3n') return `${value.toFixed(2)}${unit}`
  return `${value.toFixed(1)}${unit}`
}

export function metricLabel(metricKey: string) {
  if (metricKey === 'water_temp') return '水温'
  if (metricKey === 'do') return '溶氧'
  if (metricKey === 'ph') return 'pH'
  if (metricKey === 'nh3n') return '氨氮'
  return metricKey
}

export function metricUnit(metricKey: string) {
  if (metricKey === 'water_temp') return '℃'
  if (metricKey === 'do') return 'mg/L'
  if (metricKey === 'ph') return ''
  if (metricKey === 'nh3n') return 'mg/L'
  return ''
}
