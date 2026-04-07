import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, ...props }: Props) {
  return (
    <select
      {...props}
      className={cn(
        'h-10 w-full rounded-md border-2 border-slate-700/70 bg-slate-950/40 px-3 text-sm text-slate-100 outline-none focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/25',
        className,
      )}
    />
  )
}
