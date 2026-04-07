import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-lg border-2 border-slate-700/70 bg-slate-950/55 shadow-[0_18px_40px_rgba(0,0,0,0.35)]',
        className,
      )}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('flex items-start justify-between gap-3 px-4 pt-4', className)} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('text-sm font-semibold tracking-wide text-slate-100', className)} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('px-4 pb-4', className)} />
}
