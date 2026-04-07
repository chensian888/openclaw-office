import { cn } from '@/lib/utils'

export type TabItem = {
  key: string
  label: string
  disabled?: boolean
}

type Props = {
  items: TabItem[]
  activeKey: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({ items, activeKey, onChange, className }: Props) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          disabled={it.disabled}
          onClick={() => onChange(it.key)}
          className={cn(
            'h-9 rounded-lg border px-3 text-sm font-medium transition disabled:opacity-40',
            it.key === activeKey
              ? 'border-blue-500/50 bg-blue-500/10 text-blue-100'
              : 'border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/50',
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}
