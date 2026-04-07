import { create } from 'zustand'
import type { Role, UserSession } from '@/domain/types'

const STORAGE_KEY = 'xroom_session_v1'

type SessionState = {
  session?: UserSession
  setSession: (session: UserSession) => void
  clearSession: () => void
  hasRole: (roles: Role[]) => boolean
}

function loadSession(): UserSession | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as UserSession
  } catch {
    return undefined
  }
}

function saveSession(session?: UserSession) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: typeof window === 'undefined' ? undefined : loadSession(),
  setSession: (session) => {
    saveSession(session)
    set({ session })
  },
  clearSession: () => {
    saveSession(undefined)
    set({ session: undefined })
  },
  hasRole: (roles) => {
    const s = get().session
    if (!s) return false
    return roles.includes(s.role)
  },
}))
