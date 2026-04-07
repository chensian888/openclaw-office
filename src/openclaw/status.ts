import type { OpenClawStatus } from '@/openclaw/types'

export function statusLabel(status: OpenClawStatus) {
  if (status === 'focus') return '专注'
  if (status === 'meeting') return '会议'
  if (status === 'rest') return '休息'
  return '下班'
}

export function statusColor(status: OpenClawStatus) {
  if (status === 'focus') return '#4F8CFF'
  if (status === 'meeting') return '#B46CFF'
  if (status === 'rest') return '#35D07F'
  return '#8A93A6'
}

export function statusBg(status: OpenClawStatus) {
  const c = statusColor(status)
  return `${c}22`
}
