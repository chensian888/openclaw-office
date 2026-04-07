import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { OpenClawStatus } from '@/openclaw/types'
import { statusColor, statusLabel } from '@/openclaw/status'
import { todayKey } from '@/openclaw/time'
import { useOpenClawStore } from '@/stores/openclawStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

type Props = {
  dateKey?: string
}

export function NoteEditor({ dateKey }: Props) {
  const upsertNoteByDate = useOpenClawStore((s) => s.upsertNoteByDate)
  const deleteNote = useOpenClawStore((s) => s.deleteNote)
  const getNoteByDate = useOpenClawStore((s) => s.getNoteByDate)
  const currentStatus = useOpenClawStore((s) => s.currentStatus)

  const dk = dateKey ?? todayKey()
  const note = getNoteByDate(dk)
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [statusTag, setStatusTag] = useState<OpenClawStatus>(note?.statusTag ?? currentStatus)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setStatusTag(note?.statusTag ?? currentStatus)
    setDirty(false)
  }, [currentStatus, note?.content, note?.statusTag, note?.title, dk])

  const save = useCallback(() => {
    upsertNoteByDate(dk, { title, content, statusTag })
    setDirty(false)
  }, [content, dk, statusTag, title, upsertNoteByDate])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac')
      const mod = isMac ? e.metaKey : e.ctrlKey
      if (!mod) return
      if (e.key.toLowerCase() !== 's') return
      e.preventDefault()
      save()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [save])

  const meta = useMemo(() => {
    if (!note) return { updatedAt: undefined }
    return { updatedAt: note.updatedAt }
  }, [note])

  return (
    <>
      <Card className="min-h-0 overflow-hidden">
        <CardHeader>
          <CardTitle>详情</CardTitle>
          <Badge tone="muted">
            {dk}
            {meta.updatedAt ? ` · 更新 ${new Date(meta.updatedAt).toLocaleTimeString()}` : ''}
          </Badge>
        </CardHeader>
        <CardContent className="min-h-0 overflow-auto">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-xs text-slate-400">状态标签</div>
                <Select
                  value={statusTag}
                  onChange={(e) => {
                    setStatusTag(e.target.value as OpenClawStatus)
                    setDirty(true)
                  }}
                >
                  <option value="focus">专注</option>
                  <option value="meeting">会议</option>
                  <option value="rest">休息</option>
                  <option value="offwork">下班</option>
                </Select>
              </div>
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                <div className="text-xs text-slate-400">当前标签</div>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColor(statusTag) }} />
                  {statusLabel(statusTag)}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs text-slate-400">标题（可选）</div>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setDirty(true)
                }}
                placeholder="标题"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-400">正文</div>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  setDirty(true)
                }}
                placeholder="写下今天的进展与想法…"
                className="min-h-60 w-full resize-none rounded-md border-2 border-slate-700/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/25"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={save} disabled={!dirty}>
                保存
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setTitle(note?.title ?? '')
                  setContent(note?.content ?? '')
                  setStatusTag(note?.statusTag ?? currentStatus)
                  setDirty(false)
                }}
              >
                重置
              </Button>
              {note ? (
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" />
                  删除
                </Button>
              ) : null}
              <div className="ml-auto text-xs text-slate-500">快捷键：Ctrl/Cmd + S 保存</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={confirmDelete}
        title="删除小记"
        description="删除后无法恢复（仅影响本地数据）。"
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (note) deleteNote(note.id)
                setConfirmDelete(false)
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <div className="text-sm text-slate-200">日期：{dk}</div>
      </Modal>
    </>
  )
}
