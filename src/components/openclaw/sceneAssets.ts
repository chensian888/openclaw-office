type LoadedImage = {
  img: HTMLImageElement
  loaded: boolean
  failed: boolean
}

const cache: Record<string, LoadedImage | undefined> = {}

export function getImage(url: string): LoadedImage | null {
  if (typeof window === 'undefined') return null
  if (typeof Image === 'undefined') return null

  const existing = cache[url]
  if (existing) return existing

  const img = new Image()
  img.decoding = 'async'
  img.loading = 'eager'
  img.src = url

  const entry: LoadedImage = { img, loaded: false, failed: false }
  cache[url] = entry

  const done = () => {
    entry.loaded = img.naturalWidth > 0
    entry.failed = !entry.loaded
  }

  img.addEventListener('load', done, { once: true })
  img.addEventListener('error', () => {
    entry.loaded = false
    entry.failed = true
  }, { once: true })

  if (img.complete) done()

  return entry
}

