import { useEffect, useMemo, useRef } from 'react'
import { useOpenClawStore } from '@/stores/openclawStore'
import { todayKey } from '@/openclaw/time'

type StarOfficeState = 'idle' | 'writing' | 'researching' | 'executing' | 'syncing' | 'error'

function mapOpenClawToStarState(status: string): StarOfficeState {
  if (status === 'focus') return 'writing'
  if (status === 'meeting') return 'researching'
  if (status === 'rest') return 'idle'
  if (status === 'offwork') return 'idle'
  return 'idle'
}

export default function StarOfficePage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const status = useOpenClawStore((s) => s.currentStatus)
  const getNoteByDate = useOpenClawStore((s) => s.getNoteByDate)

  const today = useMemo(() => todayKey(), [])
  const note = getNoteByDate(today)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('star-office:officeName')
      if (!raw) localStorage.setItem('star-office:officeName', 'OpenClaw 的像素办公室')
    } catch (e) {
      void e
    }
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return

    const detail = (note?.title || note?.content || '').trim().slice(0, 80)
    iframe.contentWindow.postMessage(
      {
        type: 'SET_STATE',
        state: mapOpenClawToStarState(status),
        detail: detail || '...',
      },
      '*',
    )
  }, [note?.content, note?.title, status])

  return (
    <div className="h-full w-full">
      <iframe
        ref={iframeRef}
        src={`${import.meta.env.BASE_URL}static/index.html?demo=1`}
        title="Star-Office-UI"
        className="h-full w-full border-0"
      />
    </div>
  )
}
