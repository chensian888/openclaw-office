import '@testing-library/jest-dom/vitest'

class ResizeObserverMock {
  private cb: ResizeObserverCallback
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb
  }
  observe() {
    this.cb([], this as unknown as ResizeObserver)
  }
  unobserve() {}
  disconnect() {}
}

;(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver

const canvasGetContext = HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.getContext = function getContext(type: string) {
  if (type !== '2d') return canvasGetContext.call(this, type)
  const ctx: Partial<CanvasRenderingContext2D> = {
    setTransform: () => {},
    clearRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    fillText: () => {},
    measureText: (text: string) => ({ width: (text || '').length * 8 } as TextMetrics),
  }
  return ctx as CanvasRenderingContext2D
}
