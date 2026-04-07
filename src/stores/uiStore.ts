import { create } from 'zustand'
import type { TimeRange } from '@/domain/types'

type UiState = {
  roomId: string
  selectedPointId?: string
  selectedDeviceId?: string
  trendRange: TimeRange
  setRoomId: (roomId: string) => void
  selectPoint: (pointId?: string) => void
  selectDevice: (deviceId?: string) => void
  setTrendRange: (range: TimeRange) => void
}

export const useUiStore = create<UiState>((set) => ({
  roomId: 'room_main',
  selectedPointId: undefined,
  selectedDeviceId: undefined,
  trendRange: '24h',
  setRoomId: (roomId) => set({ roomId }),
  selectPoint: (selectedPointId) => set({ selectedPointId }),
  selectDevice: (selectedDeviceId) => set({ selectedDeviceId }),
  setTrendRange: (trendRange) => set({ trendRange }),
}))
