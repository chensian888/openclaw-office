import { useMemo, useState } from 'react'
import { Power, UtensilsCrossed, Wind } from 'lucide-react'
import { getDataClient } from '@/data'
import type { ControlCommand, Device } from '@/domain/types'
import { useSessionStore } from '@/stores/sessionStore'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

type Props = {
  devices: Device[]
  className?: string
}

const actionMeta: Record<string, { label: string; icon: JSX.Element }> = {
  aerator_on: { label: '增氧开启', icon: <Wind className="h-4 w-4" /> },
  aerator_off: { label: '增氧关闭', icon: <Power className="h-4 w-4" /> },
  feed_once: { label: '投喂一次', icon: <UtensilsCrossed className="h-4 w-4" /> },
}

export function ControlPanel({ devices, className }: Props) {
  const client = useMemo(() => getDataClient(), [])
  const session = useSessionStore((s) => s.session)
  const actuators = useMemo(() => devices.filter((d) => d.deviceType === 'actuator'), [devices])
  const [deviceId, setDeviceId] = useState(actuators[0]?.id ?? '')
  const [action, setAction] = useState('aerator_on')
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [last, setLast] = useState<ControlCommand | undefined>()
  const [error, setError] = useState<string | undefined>()

  const device = actuators.find((d) => d.id === deviceId)
  const availableActions = device?.capabilities.actions ?? []

  const send = async () => {
    if (!session) return
    if (!deviceId) return
    setError(undefined)
    setBusy(true)
    try {
      const cmd = await client.sendControlCommand(deviceId, session.userId, action)
      setLast(cmd)
    } catch (err) {
      setError(err instanceof Error ? err.message : '下发失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>快捷控制</CardTitle>
          <Badge tone="muted">按权限显示 · Demo 全部开放</Badge>
        </CardHeader>
        <CardContent>
          {actuators.length ? (
            <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-xs text-slate-400">目标设备</div>
                <Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                  {actuators.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-400">动作</div>
                <Select value={action} onChange={(e) => setAction(e.target.value)}>
                  {(availableActions.length ? availableActions : Object.keys(actionMeta)).map((a) => (
                    <option key={a} value={a}>
                      {actionMeta[a]?.label ?? a}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-xs text-slate-300">
              执行前需要二次确认；执行结果会写入“指令记录”。
            </div>

            <Button onClick={() => setConfirmOpen(true)} disabled={busy || !deviceId || !action} className="w-full">
              {actionMeta[action]?.icon}
              {busy ? '下发中…' : '发起控制'}
            </Button>

            {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div> : null}
            {last ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                {actionMeta[last.action]?.label ?? last.action}：{last.status}（{last.resultMessage ?? ''}）
              </div>
            ) : null}
            </div>
          ) : (
            <div className="text-xs text-slate-500">暂无可控设备</div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={confirmOpen}
        title="二次确认"
        description="确认后将向设备下发控制指令。"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button
              onClick={async () => {
                setConfirmOpen(false)
                await send()
              }}
              disabled={busy || !deviceId || !action}
            >
              确认下发
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="text-slate-200">设备：{device?.name ?? '—'}</div>
          <div className="text-slate-200">动作：{actionMeta[action]?.label ?? action}</div>
          <div className="text-xs text-slate-500">若设备离线会下发失败。</div>
        </div>
      </Modal>
    </>
  )
}
