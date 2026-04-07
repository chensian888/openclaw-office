import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: Props) {
  return (
    <input
      {...props}
      className={cn(
        'h-10 w-full rounded-md border-2 border-slate-700/70 bg-slate-950/40 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/25',
        className,
      )}
    />
  )
}
