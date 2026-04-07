export type Role = 'operator' | 'admin'

export type UserSession = {
  userId: string
  displayName: string
  role: Role
}

export type DeviceStatus = 'online' | 'offline' | 'fault'
export type AlarmLevel = 'info' | 'warn' | 'critical'
export type AlarmStatus = 'open' | 'ack' | 'closed'

export type Room = {
  id: string
  name: string
  code?: string
}

export type Zone = {
  id: string
  roomId: string
  name: string
  sortOrder: number
}

export type PointType = 'pond' | 'sensor_mount' | 'control_cabinet'

export type Point = {
  id: string
  roomId: string
  zoneId?: string
  name: string
  pointType: PointType
  x: number
  y: number
  meta: Record<string, unknown>
}

export type DeviceType = 'sensor' | 'camera' | 'actuator'

export type Device = {
  id: string
  deviceSn: string
  name: string
  deviceType: DeviceType
  model?: string
  status: DeviceStatus
  lastSeenAt?: string
  capabilities: {
    metrics?: string[]
    actions?: string[]
  }
}

export type DeviceBinding = {
  id: string
  deviceId: string
  pointId: string
  boundAt: string
  unboundAt?: string
}

export type TelemetryLatest = {
  deviceId: string
  pointId?: string
  metrics: Record<string, number>
  recordedAt: string
}

export type TelemetryRecord = {
  deviceId: string
  pointId?: string
  metrics: Record<string, number>
  recordedAt: string
}

export type Alarm = {
  id: string
  ruleId?: string
  roomId?: string
  pointId?: string
  deviceId?: string
  level: AlarmLevel
  status: AlarmStatus
  title: string
  detail: Record<string, unknown>
  triggeredAt: string
  ackBy?: string
  ackAt?: string
  closeBy?: string
  closeAt?: string
  closeNote?: string
}

export type AlarmRule = {
  id: string
  roomId?: string
  pointId?: string
  metricKey: string
  level: AlarmLevel
  op: '>' | '>=' | '<' | '<=' | 'between'
  threshold: Record<string, number>
  sustainSeconds: number
  enabled: boolean
}

export type ControlCommand = {
  id: string
  deviceId: string
  issuedBy: string
  action: string
  params: Record<string, unknown>
  status: 'sent' | 'success' | 'failed'
  resultMessage?: string
  issuedAt: string
}

export type RoomOverview = {
  room: Room
  zones: Zone[]
  points: Point[]
  devices: Device[]
  bindings: DeviceBinding[]
  telemetryLatest: TelemetryLatest[]
  alarms: Alarm[]
}

export type TimeRange = '24h' | '7d'
