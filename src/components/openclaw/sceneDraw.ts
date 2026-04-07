import type { OpenClawStatus } from '@/openclaw/types'
import { clamp } from '@/openclaw/time'
import { statusColor, statusLabel } from '@/openclaw/status'
import { getImage } from '@/components/openclaw/sceneAssets'

export type SceneAreaKey = 'desk' | 'meeting' | 'rest' | 'door'

export type Area = {
  key: SceneAreaKey
  label: string
  rect: { x: number; y: number; w: number; h: number }
}

export const VIRTUAL_W = 1600
export const VIRTUAL_H = 900

export function computeViewport(size: { w: number; h: number }) {
  const scale = Math.min(size.w / VIRTUAL_W, size.h / VIRTUAL_H)
  const ox = (size.w - VIRTUAL_W * scale) / 2
  const oy = (size.h - VIRTUAL_H * scale) / 2
  return { scale, ox, oy }
}

export function createAreas(): Area[] {
  return [
    { key: 'desk', label: '工位', rect: { x: 210, y: 250, w: 520, h: 360 } },
    { key: 'meeting', label: '客厅', rect: { x: 700, y: 260, w: 480, h: 330 } },
    { key: 'rest', label: '卧室', rect: { x: 1070, y: 520, w: 420, h: 260 } },
    { key: 'door', label: '门口', rect: { x: 180, y: 500, w: 280, h: 250 } },
  ]
}

export function mapStatusToArea(status: OpenClawStatus): SceneAreaKey {
  if (status === 'focus') return 'desk'
  if (status === 'meeting') return 'meeting'
  if (status === 'rest') return 'rest'
  return 'door'
}

export function drawFrame(params: {
  ctx: CanvasRenderingContext2D
  size: { w: number; h: number }
  areas: Area[]
  hover: SceneAreaKey | null
  mousePx: { x: number; y: number }
  lobster: { x: number; y: number; vx: number; moving: boolean }
  status: OpenClawStatus
  timeSec: number
}) {
  const { ctx, size, areas, hover, mousePx, lobster, status, timeSec } = params

  const anyCtx = ctx as unknown as { beginPath?: unknown }
  if (typeof anyCtx.beginPath !== 'function') return

  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, size.w, size.h)
  const { scale, ox, oy } = computeViewport(size)
  ctx.save()
  ctx.translate(ox, oy)
  ctx.scale(scale, scale)

  const layout = drawBackground(ctx)
  drawAreaHints(ctx, areas, hover)
  drawLobster(ctx, lobster.x, lobster.y, lobster.vx, lobster.moving, timeSec, status)
  drawStatusTag(ctx, status, layout)
  drawHoverLabel(ctx, areas, hover, mousePx, ox, oy, scale)

  ctx.restore()
}

const patternCache = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasPattern>>()

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function getPattern(ctx: CanvasRenderingContext2D, key: string, build: () => HTMLCanvasElement) {
  const anyCtx = ctx as unknown as { createPattern?: (image: CanvasImageSource, repetition: string) => CanvasPattern | null }
  if (typeof anyCtx.createPattern !== 'function') return null
  let map = patternCache.get(ctx)
  if (!map) {
    map = new Map()
    patternCache.set(ctx, map)
  }
  const existing = map.get(key)
  if (existing) return existing
  const canvas = build()
  const p = anyCtx.createPattern(canvas, 'repeat')
  if (!p) return null
  map.set(key, p)
  return p
}

function makeGridPattern(size: number, line: string, bg: string) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const g = c.getContext('2d')
  if (g) {
    g.imageSmoothingEnabled = false
    g.fillStyle = bg
    g.fillRect(0, 0, size, size)
    g.fillStyle = line
    g.fillRect(0, 0, 1, size)
    g.fillRect(0, 0, size, 1)
  }
  return c
}

function makeCheckerPattern(size: number, a: string, b: string) {
  const c = document.createElement('canvas')
  c.width = size * 2
  c.height = size * 2
  const g = c.getContext('2d')
  if (g) {
    g.imageSmoothingEnabled = false
    g.fillStyle = a
    g.fillRect(0, 0, c.width, c.height)
    g.fillStyle = b
    g.fillRect(0, 0, size, size)
    g.fillRect(size, size, size, size)
  }
  return c
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const grid = getPattern(ctx, 'grid48', () => makeGridPattern(48, 'rgba(170,200,255,0.16)', '#07112a'))
  if (grid) {
    ctx.fillStyle = grid
    ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H)
  } else {
    ctx.fillStyle = '#07112a'
    ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H)
  }

  const frameX = 120
  const frameY = 110
  const frameW = 1360
  const frameH = 560

  const radius = 26

  ctx.fillStyle = 'rgba(5, 12, 30, 0.55)'
  roundedRectPath(ctx, frameX + 14, frameY + 18, frameW, frameH, radius)
  ctx.fill()

  ctx.fillStyle = '#0a1d45'
  ctx.strokeStyle = 'rgba(220, 240, 255, 0.22)'
  ctx.lineWidth = 6
  roundedRectPath(ctx, frameX, frameY, frameW, frameH, radius)
  ctx.fill()
  ctx.stroke()

  const inner = getPattern(ctx, 'frameGrid16', () => makeGridPattern(16, 'rgba(170,200,255,0.09)', '#0a1d45'))
  if (inner) {
    ctx.save()
    roundedRectPath(ctx, frameX, frameY, frameW, frameH, radius)
    ctx.clip()
    ctx.fillStyle = inner
    ctx.fillRect(frameX, frameY, frameW, frameH)
    ctx.restore()
  }

  const officeX = frameX + 24
  const officeY = frameY + 22
  const officeW = frameW - 48
  const officeH = frameH - 44
  drawOffice(ctx, officeX, officeY, officeW, officeH)
  drawFooter(ctx)

  return { frame: { x: frameX, y: frameY, w: frameW, h: frameH }, office: { x: officeX, y: officeY, w: officeW, h: officeH } }
}

function drawOffice(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const bg = getImage('/pixel-office.png')
  if (bg?.loaded) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    ctx.drawImage(bg.img, x, y, w, h)
    ctx.restore()
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'
    ctx.lineWidth = 4
    ctx.strokeRect(x, y, w, h)
    drawPlaque(ctx, x + w / 2, y + h - 24)
    return
  }

  ctx.fillStyle = '#1a1e1a'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 4
  ctx.strokeRect(x, y, w, h)

  const floor = getPattern(ctx, 'floor20', () => makeCheckerPattern(20, '#6d6a4f', '#5e5a43'))
  if (floor) {
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = floor
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }

  ctx.fillStyle = 'rgba(245, 225, 170, 0.25)'
  ctx.fillRect(x, y, w, 92)

  drawRoomDividers(ctx, x, y, w, h)
  drawDeskSet(ctx, x + 70, y + 140)
  drawLounge(ctx, x + 560, y + 170)
  drawServerCorner(ctx, x + 1000, y + 140)
  drawBed(ctx, x + 1040, y + 390)
  drawDoorMark(ctx, x + 60, y + 380)
  drawPlaque(ctx, x + w / 2, y + h - 24)
}

function drawRoomDividers(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = 'rgba(60, 42, 26, 0.85)'
  ctx.fillRect(x + w * 0.46, y, 26, h)
  ctx.fillRect(x, y + 92, w, 16)
}

function drawDeskSet(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#3a2416'
  ctx.fillRect(x + 40, y + 130, 340, 78)
  ctx.fillStyle = '#2d1b10'
  ctx.fillRect(x + 40, y + 205, 340, 16)
  ctx.fillStyle = '#d7d8da'
  ctx.fillRect(x + 168, y + 90, 96, 84)
  ctx.fillStyle = '#97a3b6'
  ctx.fillRect(x + 176, y + 98, 80, 52)
  ctx.fillStyle = '#5b3a22'
  ctx.fillRect(x + 80, y + 58, 90, 70)
  ctx.fillRect(x + 310, y + 58, 90, 70)
  ctx.fillStyle = '#334a2a'
  ctx.fillRect(x + 92, y + 74, 24, 36)
  ctx.fillRect(x + 322, y + 74, 24, 36)
}

function drawLounge(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#8b2d2f'
  ctx.fillRect(x + 60, y + 180, 300, 170)
  ctx.fillStyle = '#b0793d'
  ctx.fillRect(x + 106, y + 212, 210, 104)
  ctx.fillStyle = '#6a3f24'
  ctx.fillRect(x + 140, y + 120, 220, 56)
  ctx.fillStyle = '#d9d0be'
  ctx.fillRect(x + 290, y + 40, 170, 210)
  ctx.fillStyle = '#bba98d'
  ctx.fillRect(x + 310, y + 84, 80, 70)
}

function drawServerCorner(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#303a52'
  ctx.fillRect(x + 10, y + 20, 250, 210)
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(x + 30, y + 42, 90, 160)
  ctx.fillRect(x + 140, y + 42, 90, 160)
  ctx.fillStyle = '#3ee4ff'
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(x + 44, y + 58 + i * 18, 60, 4)
    ctx.fillRect(x + 154, y + 58 + i * 18, 60, 4)
  }
}

function drawBed(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#caa278'
  ctx.fillRect(x + 30, y + 80, 370, 190)
  ctx.fillStyle = '#ead9c5'
  ctx.fillRect(x + 60, y + 110, 310, 130)
  ctx.fillStyle = '#e7e1d7'
  ctx.fillRect(x + 80, y + 110, 90, 70)
  ctx.fillRect(x + 180, y + 110, 90, 70)
}

function drawDoorMark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#2a2f45'
  ctx.fillRect(x, y, 120, 120)
  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  ctx.fillRect(x + 22, y + 20, 76, 88)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillRect(x + 16, y + 62, 8, 8)
}

function drawPlaque(ctx: CanvasRenderingContext2D, cx: number, y: number) {
  const text = 'OpenClaw 的办公室'
  ctx.font = '700 20px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  const w = ctx.measureText(text).width
  const padX = 18
  const boxW = w + padX * 2 + 64
  const boxH = 34
  const x = cx - boxW / 2
  ctx.fillStyle = 'rgba(60, 44, 20, 0.65)'
  ctx.fillRect(x, y - boxH, boxW, boxH)
  ctx.strokeStyle = 'rgba(255, 235, 160, 0.55)'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y - boxH, boxW, boxH)
  ctx.fillStyle = 'rgba(255, 235, 160, 0.85)'
  ctx.fillText('★', x + 16, y - 10)
  ctx.fillText('★', x + boxW - 28, y - 10)
  ctx.fillText(text, x + 48, y - 10)
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  const y = 760
  ctx.fillStyle = 'rgba(0,0,0,0.32)'
  ctx.fillRect(0, y, VIRTUAL_W, 110)
  ctx.fillStyle = 'rgba(170,200,255,0.18)'
  ctx.fillRect(0, y, VIRTUAL_W, 1)

  const iconX = VIRTUAL_W / 2 - 280
  const iconY = y + 22
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  const px = 3
  const dot = (dx: number, dy: number) => ctx.fillRect(iconX + dx * px, iconY + dy * px, px, px)
  ;[
    [2, 1],
    [3, 1],
    [4, 1],
    [1, 2],
    [5, 2],
    [1, 3],
    [5, 3],
    [2, 4],
    [4, 4],
    [3, 5],
    [2, 6],
    [4, 6],
    [2, 7],
    [4, 7],
    [3, 8],
  ].forEach(([dx, dy]) => dot(dx, dy))

  ctx.fillStyle = '#E6F1FF'
  ctx.font = '700 24px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  const title = 'ringhyacinth / Star-Office-UI'
  const tw = ctx.measureText(title).width
  ctx.fillText(title, VIRTUAL_W / 2 - tw / 2 + 20, y + 44)

  ctx.fillStyle = 'rgba(255, 235, 160, 0.85)'
  ctx.font = '600 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  const sub = '@simonxxoo   @ring_hyacinth'
  const sw = ctx.measureText(sub).width
  ctx.fillText(sub, VIRTUAL_W / 2 - sw / 2 + 20, y + 76)
}

function drawAreaHints(ctx: CanvasRenderingContext2D, areas: Area[], hover: SceneAreaKey | null) {
  areas.forEach((a) => {
    if (hover !== a.key) return
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(a.rect.x, a.rect.y, a.rect.w, a.rect.h)
  })
}

function drawStatusTag(
  ctx: CanvasRenderingContext2D,
  status: OpenClawStatus,
  layout: { frame: { x: number; y: number; w: number; h: number }; office: { x: number; y: number; w: number; h: number } },
) {
  const label = statusLabel(status)
  const c = statusColor(status)
  const suffix = status === 'offwork' ? '已下班' : '工作中'
  const x = layout.office.x + 18
  const y = layout.office.y + layout.office.h - 42
  ctx.fillStyle = 'rgba(0,0,0,0.50)'
  ctx.fillRect(x, y, 250, 34)
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, 250, 34)
  ctx.fillStyle = c
  ctx.fillRect(x + 10, y + 12, 10, 10)
  ctx.fillStyle = '#E6F1FF'
  ctx.font = '700 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  ctx.fillText(`[${label}] ${suffix}`, x + 28, y + 24)
}

function drawHoverLabel(
  ctx: CanvasRenderingContext2D,
  areas: Area[],
  hover: SceneAreaKey | null,
  mousePx: { x: number; y: number },
  ox: number,
  oy: number,
  scale: number,
) {
  if (!hover) return
  const a = areas.find((x) => x.key === hover)
  if (!a) return
  const mx = (mousePx.x - ox) / scale
  const my = (mousePx.y - oy) / scale
  const text = a.label
  ctx.font = '700 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  const w = ctx.measureText(text).width
  const pad = 10
  const bx = clamp(mx + 14, 0, VIRTUAL_W - w - pad * 2)
  const by = clamp(my - 34, 0, VIRTUAL_H - 40)
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillRect(bx, by, w + pad * 2, 30)
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.strokeRect(bx, by, w + pad * 2, 30)
  ctx.fillStyle = '#E6F1FF'
  ctx.fillText(text, bx + pad, by + 20)
}

function drawLobster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vx: number,
  moving: boolean,
  time: number,
  status: OpenClawStatus,
) {
  const facing = vx < -10 ? -1 : 1
  const bob = Math.sin(time * 6) * (moving ? 2 : 3)
  const baseX = x
  const baseY = y + bob

  ctx.save()
  ctx.translate(baseX, baseY)
  ctx.scale(facing, 1)

  const c = statusColor(status)
  const dark = 'rgba(0,0,0,0.28)'
  const body = c
  const body2 = `${c}CC`

  const px = 6
  const drawPx = (rx: number, ry: number, w: number, h: number, fill: string) => {
    ctx.fillStyle = fill
    ctx.fillRect(rx * px, ry * px, w * px, h * px)
  }

  const walk = moving ? Math.sin(time * 14) : Math.sin(time * 4)
  const leg = walk > 0 ? 1 : 0

  drawPx(-11, 7, 24, 8, dark)
  drawPx(-8, -1, 16, 10, body)
  drawPx(-6, 1, 12, 6, body2)

  drawPx(-13, 1, 5, 5, body)
  drawPx(8, 1, 5, 5, body)
  drawPx(-14, 0, 3, 3, body2)
  drawPx(12, 0, 3, 3, body2)

  drawPx(-13, 8, 6, 2, body)
  drawPx(7, 8, 6, 2, body)
  drawPx(-16, 9 + leg, 3, 2, body2)
  drawPx(13, 9 + leg, 3, 2, body2)

  const tailWiggle = moving ? Math.sin(time * 10) * 1.4 : Math.sin(time * 3) * 0.7
  drawPx(-2 + Math.round(tailWiggle), 10, 4, 4, body)
  drawPx(-1 + Math.round(tailWiggle), 12, 2, 2, body2)

  drawPx(-4, 2, 2, 2, '#0b1020')
  drawPx(2, 2, 2, 2, '#0b1020')

  ctx.restore()
}
