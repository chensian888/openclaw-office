export type OpenClawStatus = 'focus' | 'meeting' | 'rest' | 'offwork'

export type Note = {
  id: string
  dateKey: string
  title: string
  content: string
  statusTag: OpenClawStatus
  updatedAt: string
}

export type StatusEvent = {
  id: string
  dateKey: string
  status: OpenClawStatus
  startedAt: string
  endedAt?: string
}

export type PersistedOpenClawState = {
  version: 1
  currentStatus: OpenClawStatus
  notes: Note[]
  statusEvents: StatusEvent[]
}
