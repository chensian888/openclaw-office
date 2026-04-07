import { useEffect, useMemo, useRef, useState } from 'react'
import type { OpenClawStatus } from '@/openclaw/types'
import { computeViewport, createAreas, drawFrame, mapStatusToArea, type SceneAreaKey, VIRTUAL_H, VIRTUAL_W } from '@/components/openclaw/sceneDraw'

type Props = {
  status: OpenClawStatus
}

export function PixelOfficeCanvas({ status }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(0)

  const posRef = useRef({ x: 820, y: 520 })
  const targetRef = useRef({ x: 820, y: 520 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const movingRef = useRef(false)
  const hoverRef = useRef<SceneAreaKey | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  const [size, setSize] = useState({ w: 0, h: 0 })

  const areas = useMemo(() => createAreas(), [])

  const target = useMemo(() => {
    const key = mapStatusToArea(status)
    const a = areas.find((x) => x.key === key)!
    const tx = a.rect.x + a.rect.w * 0.5
    const ty = a.rect.y + a.rect.h * 0.68
    return { x: tx, y: ty }
  }, [areas, status])

  useEffect(() => {
    targetRef.current = target
  }, [target])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      const w = Math.max(320, Math.floor(r.width))
      const h = Math.max(180, Math.floor(r.height))
      setSize({ w, h })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    canvas.width = Math.floor(size.w * dpr)
    canvas.height = Math.floor(size.h * dpr)
    canvas.style.width = `${size.w}px`
    canvas.style.height = `${size.h}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }, [size.h, size.w])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      mouseRef.current = { x, y }

      const vp = computeViewport({ w: r.width, h: r.height })
      const wx = (x - vp.ox) / vp.scale
      const wy = (y - vp.oy) / vp.scale

      if (wx < 0 || wy < 0 || wx > VIRTUAL_W || wy > VIRTUAL_H) {
        hoverRef.current = null
        return
      }

      const hit = areas.find((a) => {
        const { x: ax, y: ay, w, h } = a.rect
        return wx >= ax && wx <= ax + w && wy >= ay && wy <= ay + h
      })
      hoverRef.current = hit?.key ?? null
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', () => {
      hoverRef.current = null
    })

    return () => {
      canvas.removeEventListener('mousemove', onMove)
    }
  }, [areas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = size.w
    const h = size.h

    const draw = (t: number) => {
      if (!lastRef.current) lastRef.current = t
      const dt = Math.min(0.06, (t - lastRef.current) / 1000)
      lastRef.current = t

      const cur = posRef.current
      const tgt = targetRef.current
      const dx = tgt.x - cur.x
      const dy = tgt.y - cur.y
      const dist = Math.hypot(dx, dy)
      const speed = status === 'offwork' ? 560 : status === 'rest' ? 380 : 420

      movingRef.current = dist > 2
      if (dist > 2) {
        const vx = (dx / dist) * speed
        const vy = (dy / dist) * speed
        velocityRef.current = { x: vx, y: vy }
        const step = Math.min(dist, speed * dt)
        cur.x += (dx / dist) * step
        cur.y += (dy / dist) * step
      } else {
        velocityRef.current = { x: 0, y: 0 }
        cur.x = tgt.x
        cur.y = tgt.y
      }

      drawFrame({
        ctx,
        size: { w, h },
        areas,
        hover: hoverRef.current,
        mousePx: mouseRef.current,
        lobster: { x: cur.x, y: cur.y, vx: velocityRef.current.x, moving: movingRef.current },
        status,
        timeSec: t / 1000,
      })

      rafRef.current = window.requestAnimationFrame(draw)
    }

    rafRef.current = window.requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [areas, size.h, size.w, status])

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-slate-700/70 bg-slate-950/20 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
    >
      <canvas ref={canvasRef} className="canvas-pixelated h-full w-full" />
    </div>
  )
}
