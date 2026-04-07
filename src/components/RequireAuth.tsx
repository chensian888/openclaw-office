import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSessionStore } from '@/stores/sessionStore'

type Props = {
  children: ReactNode
}

export function RequireAuth({ children }: Props) {
  const session = useSessionStore((s) => s.session)
  const loc = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return <>{children}</>
}
