import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border-2 font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-blue-400/60 disabled:pointer-events-none disabled:opacity-50 active:translate-y-0.5',
        size === 'md' ? 'h-10 px-4 text-sm' : 'h-9 px-3 text-sm',
        variant === 'primary' &&
          'border-blue-300/20 bg-blue-500 text-white shadow-[0_4px_0_rgba(12,27,70,0.9)] hover:brightness-110',
        variant === 'ghost' &&
          'border-slate-700/70 bg-slate-950/30 text-slate-100 shadow-[0_4px_0_rgba(12,27,70,0.85)] hover:bg-slate-900/40',
        variant === 'danger' &&
          'border-red-300/20 bg-red-500 text-white shadow-[0_4px_0_rgba(12,27,70,0.9)] hover:brightness-110',
        className,
      )}
    />
  )
}
