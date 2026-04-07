import { create } from 'zustand'
import type { Note, OpenClawStatus, PersistedOpenClawState, StatusEvent } from '@/openclaw/types'
import { loadOpenClawState, saveOpenClawState } from '@/openclaw/storage'
import { todayKey, uid } from '@/openclaw/time'

const defaultState: PersistedOpenClawState = {
  version: 1,
  currentStatus: 'focus',
  notes: [],
  statusEvents: [],
}

function hydrate(): PersistedOpenClawState {
  const loaded = typeof window === 'undefined' ? undefined : loadOpenClawState()
  return loaded ?? defaultState
}

function persist(state: PersistedOpenClawState) {
  saveOpenClawState(state)
}

type OpenClawState = {
  currentStatus: OpenClawStatus
  notes: Note[]
  statusEvents: StatusEvent[]

  setStatus: (status: OpenClawStatus, at?: Date) => void
  upsertTodayNote: (patch: { title?: string; content?: string; statusTag?: OpenClawStatus }, at?: Date) => Note
  upsertNoteByDate: (dateKey: string, patch: { title?: string; content?: string; statusTag?: OpenClawStatus }, at?: Date) => Note
  deleteNote: (noteId: string) => void
  getNoteByDate: (dateKey: string) => Note | undefined
  listNotes: () => Note[]
  listRecentNotes: (limit: number) => Note[]
  listTodayEvents: (at?: Date) => StatusEvent[]
}

export const useOpenClawStore = create<OpenClawState>((set, get) => {
  const initial = hydrate()
  if (typeof window !== 'undefined') {
    const dk = todayKey()
    const hasOpen = initial.statusEvents.some((e) => e.dateKey === dk && !e.endedAt)
    if (!hasOpen) {
      const nowIso = new Date().toISOString()
      initial.statusEvents = [{ id: uid('se'), dateKey: dk, status: initial.currentStatus, startedAt: nowIso }, ...initial.statusEvents]
      persist(initial)
    }
  }

  return {
    currentStatus: initial.currentStatus,
    notes: initial.notes,
    statusEvents: initial.statusEvents,

    setStatus: (status, at = new Date()) => {
      const dateKey = todayKey(at)
      const nowIso = at.toISOString()
      const prevStatus = get().currentStatus
      if (prevStatus === status) return

      set((s) => {
        const events = s.statusEvents.slice()
        const last = events.find((e) => e.dateKey === dateKey && !e.endedAt)
        if (last) last.endedAt = nowIso
        events.unshift({ id: uid('se'), dateKey, status, startedAt: nowIso })
        const next: PersistedOpenClawState = {
          version: 1,
          currentStatus: status,
          notes: s.notes,
          statusEvents: events,
        }
        persist(next)
        return { currentStatus: status, statusEvents: events }
      })
    },

    upsertTodayNote: (patch, at = new Date()) => {
      return get().upsertNoteByDate(todayKey(at), patch, at)
    },

    upsertNoteByDate: (dateKey, patch, at = new Date()) => {
      const nowIso = at.toISOString()
      let created: Note | undefined
      set((s) => {
        const notes = s.notes.slice()
        const idx = notes.findIndex((n) => n.dateKey === dateKey)
        if (idx >= 0) {
          const existing = notes[idx]
          notes[idx] = {
            ...existing,
            title: patch.title ?? existing.title,
            content: patch.content ?? existing.content,
            statusTag: patch.statusTag ?? existing.statusTag,
            updatedAt: nowIso,
          }
          created = notes[idx]
        } else {
          const n: Note = {
            id: uid('note'),
            dateKey,
            title: patch.title ?? '',
            content: patch.content ?? '',
            statusTag: patch.statusTag ?? get().currentStatus,
            updatedAt: nowIso,
          }
          notes.unshift(n)
          created = n
        }
        notes.sort((a, b) => b.dateKey.localeCompare(a.dateKey))
        const next: PersistedOpenClawState = { version: 1, currentStatus: s.currentStatus, notes, statusEvents: s.statusEvents }
        persist(next)
        return { notes }
      })
      return created!
    },

    deleteNote: (noteId) => {
      set((s) => {
        const notes = s.notes.filter((n) => n.id !== noteId)
        const next: PersistedOpenClawState = { version: 1, currentStatus: s.currentStatus, notes, statusEvents: s.statusEvents }
        persist(next)
        return { notes }
      })
    },

    getNoteByDate: (dateKey) => {
      return get().notes.find((n) => n.dateKey === dateKey)
    },

    listNotes: () => {
      return get().notes.slice().sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    },

    listRecentNotes: (limit) => {
      return get().listNotes().slice(0, Math.max(0, limit))
    },

    listTodayEvents: (at = new Date()) => {
      const dk = todayKey(at)
      return get().statusEvents.filter((e) => e.dateKey === dk)
    },
  }
})
