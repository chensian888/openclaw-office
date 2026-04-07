import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'info' | 'warn' | 'critical' | 'muted'
}

export function Badge({ className, tone = 'default', ...props }: Props) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center rounded-md border-2 px-2 py-0.5 text-xs font-medium tracking-wide',
        tone === 'default' && 'border-slate-700/70 bg-slate-900/40 text-slate-100',
        tone === 'muted' && 'border-slate-700/60 bg-slate-950/35 text-slate-200',
        tone === 'info' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
        tone === 'warn' && 'border-amber-500/30 bg-amber-500/10 text-amber-200',
        tone === 'critical' && 'border-red-500/30 bg-red-500/10 text-red-200',
        className,
      )}
    />
  )
}
