import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, User } from 'lucide-react'
import { getDataClient } from '@/data'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'

export default function LoginPage() {
  const nav = useNavigate()
  const client = useMemo(() => getDataClient(), [])
  const setSession = useSessionStore((s) => s.setSession)

  const [username, setUsername] = useState('operator')
  const [password, setPassword] = useState('operator')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(undefined)
    setLoading(true)
    try {
      const session = await client.authLogin({ username, password })
      setSession(session)
      nav('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-xl font-semibold text-slate-100">小龙虾可视化房间</div>
          <div className="mt-1 text-sm text-slate-400">房间态势 · 实时监测 · 告警处置</div>
        </div>

        <Card className="p-4">
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="ghost"
                className={cn('justify-start', username.toLowerCase().includes('admin') && 'border-blue-500/50 bg-blue-500/10')}
                onClick={() => {
                  setUsername('admin')
                  setPassword('admin')
                }}
              >
                <Shield className="h-4 w-4" />
                管理员演示
              </Button>
              <Button
                type="button"
                variant="ghost"
                className={cn('justify-start', !username.toLowerCase().includes('admin') && 'border-blue-500/50 bg-blue-500/10')}
                onClick={() => {
                  setUsername('operator')
                  setPassword('operator')
                }}
              >
                <User className="h-4 w-4" />
                值守演示
              </Button>
            </div>

            <div>
              <div className="mb-1 text-xs text-slate-400">账号</div>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入账号" autoComplete="username" />
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-400">密码</div>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-900/50"
                  aria-label={showPwd ? '隐藏密码' : '显示密码'}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '登录中…' : '登录'}
            </Button>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>原型模式：假数据层</span>
              <button type="button" className="text-slate-300 hover:text-slate-100">
                忘记密码
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
