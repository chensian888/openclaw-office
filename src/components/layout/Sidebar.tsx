import { NavLink } from 'react-router-dom'
import { Activity, Bell, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

type Item = {
  to: string
  label: string
  icon: JSX.Element
}

const items: Item[] = [
  { to: '/', label: '房间大屏', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/ops', label: '设备与告警', icon: <Bell className="h-4 w-4" /> },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-800/70 bg-slate-950/30">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-200">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100">小龙虾可视化房间</div>
          <div className="text-xs text-slate-400">房间态势 · 实时监测</div>
        </div>
      </div>
      <nav className="flex flex-col gap-2 px-3">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              cn(
                'flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition',
                isActive ? 'bg-blue-500/12 text-blue-100' : 'text-slate-200 hover:bg-slate-900/50',
              )
            }
          >
            <span className="text-slate-300">{it.icon}</span>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-4 py-4 text-xs text-slate-500">Demo 原型 · 假数据层</div>
    </aside>
  )
}
