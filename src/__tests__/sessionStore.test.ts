import { describe, expect, it, beforeEach } from 'vitest'
import { useSessionStore } from '@/stores/sessionStore'

describe('sessionStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useSessionStore.setState({ session: undefined })
  })

  it('setSession persists and hasRole works', () => {
    useSessionStore.getState().setSession({ userId: 'u1', displayName: 'A', role: 'admin' })
    expect(useSessionStore.getState().session?.userId).toBe('u1')
    expect(useSessionStore.getState().hasRole(['admin'])).toBe(true)
    expect(JSON.parse(localStorage.getItem('xroom_session_v1') ?? '{}').userId).toBe('u1')
  })

  it('clearSession removes persisted session', () => {
    useSessionStore.getState().setSession({ userId: 'u1', displayName: 'A', role: 'operator' })
    useSessionStore.getState().clearSession()
    expect(useSessionStore.getState().session).toBeUndefined()
    expect(localStorage.getItem('xroom_session_v1')).toBeNull()
  })
})

