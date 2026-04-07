import { Link } from 'react-router-dom'
import { CalendarDays, NotebookText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PixelOfficeCanvas } from '@/components/openclaw/PixelOfficeCanvas'
import { StatusPanel } from '@/components/openclaw/StatusPanel'
import { TodayNoteCard } from '@/components/openclaw/TodayNoteCard'
import { RecentNotesCard } from '@/components/openclaw/RecentNotesCard'
import { useOpenClawStore } from '@/stores/openclawStore'
import { todayKey } from '@/openclaw/time'

export default function BoardPage() {
  const status = useOpenClawStore((s) => s.currentStatus)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 items-center justify-between gap-3 border-b-2 border-slate-700/70 bg-slate-950/35 px-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold tracking-wider text-slate-100">OpenClaw 像素办公室</div>
          <div className="hidden items-center gap-2 text-xs text-slate-400 lg:flex">
            <CalendarDays className="h-4 w-4" />
            {todayKey(now)}
            <span className="text-slate-600">·</span>
            {now.toLocaleTimeString()}
          </div>
        </div>
        <Link
          to="/notes"
          className="inline-flex h-9 items-center gap-2 rounded-md border-2 border-slate-700/70 bg-slate-950/35 px-3 text-sm font-medium text-slate-100 shadow-[0_3px_0_rgba(12,27,70,0.85)] hover:bg-slate-900/40 active:translate-y-0.5"
        >
          <NotebookText className="h-4 w-4" />
          小记历史
        </Link>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 xl:grid-cols-[240px_1fr_360px]">
        <div className="min-h-0">
          <StatusPanel />
        </div>

        <div className="min-h-0">
          <div className="flex h-full min-h-[360px] items-center justify-center">
            <div className="w-full max-w-[980px]">
              <div className="aspect-video">
                <PixelOfficeCanvas status={status} />
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 space-y-3 overflow-auto pr-1">
          <TodayNoteCard />
          <RecentNotesCard />
        </div>
      </div>
    </div>
  )
}
