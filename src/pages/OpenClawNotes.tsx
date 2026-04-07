import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Note, OpenClawStatus } from '@/openclaw/types'
import { todayKey } from '@/openclaw/time'
import { useOpenClawStore } from '@/stores/openclawStore'
import { NotesList } from '@/components/openclaw/NotesList'
import { NoteEditor } from '@/components/openclaw/NoteEditor'

type Filter = 'all' | OpenClawStatus

export default function NotesPage() {
  const [sp, setSp] = useSearchParams()
  const listNotes = useOpenClawStore((s) => s.listNotes)
  const currentStatus = useOpenClawStore((s) => s.currentStatus)

  const notes = listNotes()
  const [filter, setFilter] = useState<Filter>('all')
  const dateFromQuery = sp.get('date') ?? undefined

  const availableDateKeys = useMemo(() => {
    const keys = new Set(notes.map((n) => n.dateKey))
    keys.add(todayKey())
    return Array.from(keys).sort((a, b) => b.localeCompare(a))
  }, [notes])

  const [selectedDateKey, setSelectedDateKey] = useState<string>(dateFromQuery ?? availableDateKeys[0] ?? todayKey())

  useEffect(() => {
    if (!dateFromQuery) return
    setSelectedDateKey(dateFromQuery)
  }, [dateFromQuery])

  useEffect(() => {
    if (!selectedDateKey) return
    setSp((prev) => {
      const next = new URLSearchParams(prev)
      next.set('date', selectedDateKey)
      return next
    })
  }, [selectedDateKey, setSp])

  const orderedNotes: Note[] = useMemo(() => {
    const byDate = new Map(notes.map((n) => [n.dateKey, n]))
    return availableDateKeys.slice(0, 60).map((k) => {
      const existing = byDate.get(k)
      if (existing) return existing
      return {
        id: `virtual_${k}`,
        dateKey: k,
        title: '',
        content: '',
        statusTag: currentStatus,
        updatedAt: '',
      }
    })
  }, [availableDateKeys, currentStatus, notes])

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 items-center justify-between gap-3 border-b-2 border-slate-700/70 bg-slate-950/35 px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex h-9 items-center gap-2 rounded-md border-2 border-slate-700/70 bg-slate-950/35 px-3 text-sm font-medium text-slate-100 shadow-[0_3px_0_rgba(12,27,70,0.85)] hover:bg-slate-900/40 active:translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            返回看板
          </Link>
          <div className="text-sm font-semibold tracking-wider text-slate-100">小记历史</div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-slate-400 lg:flex">
          <CalendarDays className="h-4 w-4" />
          {todayKey()}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 2xl:grid-cols-[320px_1fr]">
        <NotesList
          notes={orderedNotes}
          selectedDateKey={selectedDateKey}
          filter={filter}
          onChangeFilter={setFilter}
          onSelectDateKey={setSelectedDateKey}
        />
        <NoteEditor dateKey={selectedDateKey} />
      </div>
    </div>
  )
}
