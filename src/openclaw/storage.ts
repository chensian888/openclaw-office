import type { PersistedOpenClawState } from '@/openclaw/types'

const KEY = 'openclaw_pixel_office_v1'

export function loadOpenClawState(): PersistedOpenClawState | undefined {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as PersistedOpenClawState
    if (!parsed || parsed.version !== 1) return undefined
    return parsed
  } catch {
    return undefined
  }
}

export function saveOpenClawState(state: PersistedOpenClawState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function clearOpenClawState() {
  localStorage.removeItem(KEY)
}
