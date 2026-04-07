import { useEffect, useMemo, useRef, useState } from 'react'
import { todayKey } from '@/openclaw/time'
import { statusLabel } from '@/openclaw/status'
import { useOpenClawStore } from '@/stores/openclawStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

type SaveState = 'idle' | 'saving' | 'saved'

export function TodayNoteCard() {
  const currentStatus = useOpenClawStore((s) => s.currentStatus)
  const getNoteByDate = useOpenClawStore((s) => s.getNoteByDate)
  const upsertTodayNote = useOpenClawStore((s) => s.upsertTodayNote)

  const dateKey = todayKey()
  const note = getNoteByDate(dateKey)
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const lastSavedAt = useRef<string | undefined>(note?.updatedAt)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    lastSavedAt.current = note?.updatedAt
    setSaveState('idle')
  }, [note?.content, note?.title, note?.updatedAt])

  const scheduleSave = (next: { title: string; content: string }) => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setSaveState('saving')
    timerRef.current = window.setTimeout(() => {
      const saved = upsertTodayNote({ title: next.title, content: next.content, statusTag: currentStatus })
      lastSavedAt.current = saved.updatedAt
      setSaveState('saved')
      timerRef.current = null
    }, 450)
  }

  const statusText = useMemo(() => {
    if (saveState === 'saving') return '保存中…'
    if (saveState === 'saved') return '已保存'
    if (lastSavedAt.current) return `已保存 · ${new Date(lastSavedAt.current).toLocaleTimeString()}`
    return '未保存'
  }, [saveState])

  return (
    <Card>
      <CardHeader>
        <CardTitle>今日工作小记</CardTitle>
        <Badge tone="muted">{statusText}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-xs text-slate-400">状态标签：{statusLabel(currentStatus)}</div>
          <div>
            <div className="mb-1 text-xs text-slate-400">标题（可选）</div>
            <Input
              value={title}
              onChange={(e) => {
                const v = e.target.value
                setTitle(v)
                scheduleSave({ title: v, content })
              }}
              placeholder="例如：修复登录流程 / 优化渲染"
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-400">正文（必填）</div>
            <textarea
              value={content}
              onChange={(e) => {
                const v = e.target.value
                setContent(v)
                scheduleSave({ title, content: v })
              }}
              placeholder="今天做了什么？遇到了什么问题？下一步是什么？"
                className="min-h-28 w-full resize-none rounded-md border-2 border-slate-700/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/25"
            />
          </div>
          <div className="text-xs text-slate-500">自动保存到本地（localStorage）。</div>
        </div>
      </CardContent>
    </Card>
  )
}
