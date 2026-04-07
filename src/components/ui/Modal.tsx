import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, title, description, onClose, children, footer }: Props) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        aria-label="关闭"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full max-w-lg rounded-lg border-2 border-slate-700/70 bg-slate-950/90 shadow-[0_22px_60px_rgba(0,0,0,0.55)]',
        )}
      >
        <div className="px-4 pt-4">
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          {description ? <div className="mt-1 text-xs text-slate-400">{description}</div> : null}
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2 border-t border-slate-800/70 px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  )
}
