import type { DataClient } from '@/data/client'
import { createMockClient } from '@/data/mockClient'

let singleton: DataClient | undefined

export function getDataClient(): DataClient {
  if (!singleton) singleton = createMockClient()
  return singleton
}
