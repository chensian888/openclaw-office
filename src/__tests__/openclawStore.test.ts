import { describe, expect, it, beforeEach } from 'vitest'
import { useOpenClawStore } from '@/stores/openclawStore'

describe('openclawStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useOpenClawStore.setState({ currentStatus: 'focus', notes: [], statusEvents: [] })
  })

  it('setStatus appends status event', () => {
    useOpenClawStore.getState().setStatus('meeting')
    expect(useOpenClawStore.getState().currentStatus).toBe('meeting')
    expect(useOpenClawStore.getState().statusEvents[0]?.status).toBe('meeting')
  })

  it('upsertTodayNote persists note', () => {
    const n = useOpenClawStore.getState().upsertTodayNote({ title: 't', content: 'c', statusTag: 'focus' })
    expect(n.title).toBe('t')
    expect(useOpenClawStore.getState().notes.length).toBe(1)
  })
})

