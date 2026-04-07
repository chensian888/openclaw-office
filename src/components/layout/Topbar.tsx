import { useEffect, useMemo, useState } from 'react'
import { LogOut, Shield, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getDataClient } from '@/data'
import type { Room } from '@/domain/types'
import { useSessionStore } from '@/stores/sessionStore'
import { useUiStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'

export function Topbar() {
  const nav = useNavigate()
  const client = useMemo(() => getDataClient(), [])
  const { session, clearSession } = useSessionStore()
  const { roomId, setRoomId } = useUiStore()
  const [rooms, setRooms] = useState<Room[]>([])
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    client.listRooms().then(setRooms).catch(() => setRooms([]))
  }, [client])

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const onLogout = async () => {
    try {
      await client.authLogout()
    } finally {
      clearSession()
      nav('/login', { replace: true })
    }
  }

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-800/70 bg-slate-950/30 px-4">
      <div className="flex items-center gap-3">
        <div className="w-56">
          <Select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="hidden text-xs text-slate-400 lg:block">{now.toLocaleString()}</div>
      </div>

      <div className="flex items-center gap-2">
        <Badge tone="muted" className="hidden lg:inline-flex">
          {session?.role === 'admin' ? (
            <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" />管理员</span>
          ) : (
            <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />值守</span>
          )}
        </Badge>
        <div className="hidden text-sm text-slate-200 lg:block">{session?.displayName ?? '未登录'}</div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          退出
        </Button>
      </div>
    </header>
  )
}
