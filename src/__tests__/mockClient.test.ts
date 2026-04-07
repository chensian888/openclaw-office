import { describe, expect, it, beforeEach } from 'vitest'
import { createMockClient } from '@/data/mockClient'

describe('mockClient', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('authLogin rejects empty credentials', async () => {
    const client = createMockClient()
    await expect(client.authLogin({ username: '', password: '' })).rejects.toThrow()
  })

  it('authLogin sets admin role when username includes admin', async () => {
    const client = createMockClient()
    const session = await client.authLogin({ username: 'admin', password: 'x' })
    expect(session.role).toBe('admin')
  })

  it('ack and close alarm updates state', async () => {
    const client = createMockClient()
    const alarms = await client.listAlarms({})
    const open = alarms.find((a) => a.status === 'open')
    expect(open).toBeTruthy()
    if (!open) return

    const acked = await client.ackAlarm(open.id, 'u_test')
    expect(acked.status).toBe('ack')

    const closed = await client.closeAlarm(open.id, 'u_test', 'done')
    expect(closed.status).toBe('closed')
  })
})

