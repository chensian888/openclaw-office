import { useMemo } from 'react'
import type { Note, OpenClawStatus } from '@/openclaw/types'
import { statusColor, statusLabel } from '@/openclaw/status'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'

type Filter = 'all' | OpenClawStatus

type Props = {
  notes: Note[]
  selectedDateKey?: string
  filter: Filter
  onChangeFilter: (filter: Filter) => void
  onSelectDateKey: (dateKey: string) => void
}

export function NotesList({ notes, selectedDateKey, filter, onChangeFilter, onSelectDateKey }: Props) {
  const filtered = useMemo(() => {
    if (filter === 'all') return notes
    return notes.filter((n) => n.statusTag === filter)
  }, [filter, notes])

  return (
    <Card className="min-h-0 overflow-hidden">
      <CardHeader>
        <CardTitle>小记</CardTitle>
        <div className="w-44">
          <Select value={filter} onChange={(e) => onChangeFilter(e.target.value as Filter)}>
            <option value="all">全部</option>
            <option value="focus">专注</option>
            <option value="meeting">会议</option>
            <option value="rest">休息</option>
            <option value="offwork">下班</option>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 overflow-auto">
        <div className="space-y-2">
          {filtered.length ? (
            filtered.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onSelectDateKey(n.dateKey)}
                className={cn(
                  'w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-left hover:bg-slate-900/50',
                  selectedDateKey === n.dateKey && 'ring-2 ring-blue-500/40',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-100">{n.dateKey}</div>
                    <div className="mt-1 truncate text-xs text-slate-400">{n.title || n.content.trim().slice(0, 40) || '（空）'}</div>
                  </div>
                  <Badge tone="muted" className="gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: statusColor(n.statusTag) }} />
                    {statusLabel(n.statusTag)}
                  </Badge>
                </div>
              </button>
            ))
          ) : (
            <div className="text-sm text-slate-500">暂无记录</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

