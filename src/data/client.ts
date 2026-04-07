import type { Alarm, AlarmRule, ControlCommand, Device, Room, RoomOverview, TelemetryRecord, TimeRange, UserSession } from '@/domain/types'

export type LoginInput = {
  username: string
  password: string
}

export type DeviceQuery = {
  roomId?: string
  deviceType?: Device['deviceType']
  status?: Device['status']
  keyword?: string
}

export type AlarmQuery = {
  roomId?: string
  status?: Alarm['status']
  level?: Alarm['level']
  keyword?: string
}

export type DataClient = {
  authLogin(input: LoginInput): Promise<UserSession>
  authLogout(): Promise<void>
  listRooms(): Promise<Room[]>
  getRoomOverview(roomId: string): Promise<RoomOverview>

  listDevices(query: DeviceQuery): Promise<Device[]>
  getDevice(deviceId: string): Promise<Device | undefined>
  getDeviceTelemetry(deviceId: string, metricKey: string, range: TimeRange): Promise<TelemetryRecord[]>

  listAlarms(query: AlarmQuery): Promise<Alarm[]>
  ackAlarm(alarmId: string, userId: string): Promise<Alarm>
  closeAlarm(alarmId: string, userId: string, note: string): Promise<Alarm>

  listAlarmRules(roomId?: string): Promise<AlarmRule[]>
  upsertAlarmRule(rule: AlarmRule): Promise<AlarmRule>

  sendControlCommand(deviceId: string, userId: string, action: string, params?: Record<string, unknown>): Promise<ControlCommand>
  listControlCommands(deviceId?: string): Promise<ControlCommand[]>
}
