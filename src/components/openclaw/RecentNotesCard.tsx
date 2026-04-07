import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { useOpenClawStore } from '@/stores/openclawStore'
import { statusColor, statusLabel } from '@/openclaw/status'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function RecentNotesCard() {
  const listRecentNotes = useOpenClawStore((s) => s.listRecentNotes)
  const notes = listRecentNotes(10)

  const items = useMemo(() => {
    return notes.map((n) => ({
      ...n,
      preview: n.content.trim().slice(0, 60),
    }))
  }, [notes])

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近小记</CardTitle>
        <Link
          to="/notes"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-800/70 bg-slate-950/40 px-2 py-1 text-xs text-slate-200 hover:bg-slate-900/60"
        >
          查看全部 <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.length ? (
            items.map((n) => (
              <Link
                key={n.id}
                to={`/notes?date=${encodeURIComponent(n.dateKey)}`}
                className="block rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 hover:bg-slate-900/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-medium text-slate-100">{n.dateKey}</div>
                  <Badge tone="muted" className="gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: statusColor(n.statusTag) }} />
                    {statusLabel(n.statusTag)}
                  </Badge>
                </div>
                <div className="mt-1 truncate text-xs text-slate-400">{n.preview || '（空）'}</div>
              </Link>
            ))
          ) : (
            <div className="text-sm text-slate-500">还没有小记</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
