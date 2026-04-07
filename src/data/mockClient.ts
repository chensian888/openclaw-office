import type { DataClient, AlarmQuery, DeviceQuery, LoginInput } from '@/data/client'
import type { Alarm, AlarmRule, ControlCommand, Device, DeviceBinding, Point, Room, RoomOverview, TelemetryLatest, TelemetryRecord, TimeRange, UserSession, Zone } from '@/domain/types'

function nowIso() {
  return new Date().toISOString()
}

function minutesAgoIso(min: number) {
  return new Date(Date.now() - min * 60_000).toISOString()
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function rand(seed: number) {
  const x = Math.sin(seed) * 10_000
  return x - Math.floor(x)
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

const STORAGE_KEY = 'xroom_mock_state_v1'

type PersistedState = {
  alarms: Alarm[]
  rules: AlarmRule[]
  commands: ControlCommand[]
}

function loadState(): PersistedState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as PersistedState
  } catch {
    return undefined
  }
}

function saveState(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const roomsSeed: Room[] = [
  { id: 'room_main', name: '小龙虾一号房', code: 'R-001' },
]

const zonesSeed: Zone[] = [
  { id: 'zone_a', roomId: 'room_main', name: 'A区', sortOrder: 1 },
  { id: 'zone_b', roomId: 'room_main', name: 'B区', sortOrder: 2 },
]

const pointsSeed: Point[] = [
  { id: 'p_a1', roomId: 'room_main', zoneId: 'zone_a', name: '池位 A1', pointType: 'pond', x: 210, y: 170, meta: { pondNo: 'A1' } },
  { id: 'p_a2', roomId: 'room_main', zoneId: 'zone_a', name: '池位 A2', pointType: 'pond', x: 360, y: 170, meta: { pondNo: 'A2' } },
  { id: 'p_a3', roomId: 'room_main', zoneId: 'zone_a', name: '池位 A3', pointType: 'pond', x: 510, y: 170, meta: { pondNo: 'A3' } },
  { id: 'p_b1', roomId: 'room_main', zoneId: 'zone_b', name: '池位 B1', pointType: 'pond', x: 260, y: 360, meta: { pondNo: 'B1' } },
  { id: 'p_b2', roomId: 'room_main', zoneId: 'zone_b', name: '池位 B2', pointType: 'pond', x: 430, y: 360, meta: { pondNo: 'B2' } },
  { id: 'p_ctrl', roomId: 'room_main', name: '控制柜', pointType: 'control_cabinet', x: 760, y: 260, meta: {} },
]

const devicesSeed: Device[] = [
  {
    id: 'd_sensor_a',
    deviceSn: 'SEN-DO-PH-001',
    name: '水质传感器 A',
    deviceType: 'sensor',
    model: 'XW-200',
    status: 'online',
    lastSeenAt: minutesAgoIso(1),
    capabilities: { metrics: ['water_temp', 'do', 'ph', 'nh3n'] },
  },
  {
    id: 'd_sensor_b',
    deviceSn: 'SEN-DO-PH-002',
    name: '水质传感器 B',
    deviceType: 'sensor',
    model: 'XW-200',
    status: 'online',
    lastSeenAt: minutesAgoIso(1),
    capabilities: { metrics: ['water_temp', 'do', 'ph'] },
  },
  {
    id: 'd_aerator_1',
    deviceSn: 'ACT-AER-001',
    name: '增氧机 1',
    deviceType: 'actuator',
    model: 'AO-8',
    status: 'online',
    lastSeenAt: minutesAgoIso(2),
    capabilities: { actions: ['aerator_on', 'aerator_off'] },
  },
  {
    id: 'd_feeder_1',
    deviceSn: 'ACT-FEED-001',
    name: '投喂器 1',
    deviceType: 'actuator',
    model: 'FD-1',
    status: 'offline',
    lastSeenAt: minutesAgoIso(18),
    capabilities: { actions: ['feed_once'] },
  },
]

const bindingsSeed: DeviceBinding[] = [
  { id: 'b1', deviceId: 'd_sensor_a', pointId: 'p_a2', boundAt: minutesAgoIso(500) },
  { id: 'b2', deviceId: 'd_sensor_b', pointId: 'p_b2', boundAt: minutesAgoIso(500) },
  { id: 'b3', deviceId: 'd_aerator_1', pointId: 'p_ctrl', boundAt: minutesAgoIso(500) },
  { id: 'b4', deviceId: 'd_feeder_1', pointId: 'p_ctrl', boundAt: minutesAgoIso(500) },
]

function computeTelemetryLatest(): TelemetryLatest[] {
  const t = Date.now()
  const tempBase = 24.2 + Math.sin(t / 3_600_000) * 0.7
  const doBase = 6.2 + Math.sin(t / 2_700_000) * 0.9
  const phBase = 7.4 + Math.sin(t / 4_200_000) * 0.1
  const nh3Base = 0.15 + Math.sin(t / 3_000_000) * 0.03

  return [
    {
      deviceId: 'd_sensor_a',
      pointId: 'p_a2',
      metrics: {
        water_temp: Number((tempBase + 0.2).toFixed(1)),
        do: Number(clamp(doBase - 0.8, 4.5, 9.0).toFixed(1)),
        ph: Number(clamp(phBase + 0.05, 6.8, 8.2).toFixed(2)),
        nh3n: Number(clamp(nh3Base + 0.03, 0.05, 0.35).toFixed(2)),
      },
      recordedAt: minutesAgoIso(1),
    },
    {
      deviceId: 'd_sensor_b',
      pointId: 'p_b2',
      metrics: {
        water_temp: Number((tempBase - 0.1).toFixed(1)),
        do: Number(clamp(doBase + 0.4, 4.5, 9.0).toFixed(1)),
        ph: Number(clamp(phBase - 0.02, 6.8, 8.2).toFixed(2)),
      },
      recordedAt: minutesAgoIso(1),
    },
  ]
}

function defaultRules(): AlarmRule[] {
  return [
    {
      id: 'rule_do_low',
      roomId: 'room_main',
      metricKey: 'do',
      level: 'critical',
      op: '<',
      threshold: { min: 5.5 },
      sustainSeconds: 60,
      enabled: true,
    },
    {
      id: 'rule_temp_high',
      roomId: 'room_main',
      metricKey: 'water_temp',
      level: 'warn',
      op: '>',
      threshold: { max: 28.0 },
      sustainSeconds: 120,
      enabled: true,
    },
  ]
}

function defaultAlarms(): Alarm[] {
  return [
    {
      id: 'a1',
      roomId: 'room_main',
      pointId: 'p_a2',
      deviceId: 'd_sensor_a',
      ruleId: 'rule_do_low',
      level: 'critical',
      status: 'open',
      title: '溶氧偏低',
      detail: { metric: 'do', value: 5.1, threshold: { min: 5.5 } },
      triggeredAt: minutesAgoIso(12),
    },
    {
      id: 'a2',
      roomId: 'room_main',
      pointId: 'p_ctrl',
      deviceId: 'd_feeder_1',
      level: 'warn',
      status: 'ack',
      title: '投喂器离线',
      detail: { metric: 'device_status', value: 'offline' },
      triggeredAt: minutesAgoIso(30),
      ackBy: 'sys',
      ackAt: minutesAgoIso(25),
    },
  ]
}

function initPersisted(): PersistedState {
  const existing = loadState()
  if (existing) return existing
  const state: PersistedState = { alarms: defaultAlarms(), rules: defaultRules(), commands: [] }
  saveState(state)
  return state
}

function matchesKeyword(value: string | undefined, kw: string | undefined) {
  if (!kw) return true
  const k = kw.trim().toLowerCase()
  if (!k) return true
  return (value ?? '').toLowerCase().includes(k)
}

function buildSeries(deviceId: string, metricKey: string, range: TimeRange): TelemetryRecord[] {
  const count = range === '24h' ? 48 : 56
  const stepMin = range === '24h' ? 30 : 180
  const start = Date.now() - count * stepMin * 60_000
  const baseSeed = deviceId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + metricKey.length * 97

  const gen = (i: number) => {
    const s = baseSeed + i * 13
    const r = rand(s)
    const wave = Math.sin((i / count) * Math.PI * 2)

    if (metricKey === 'water_temp') return clamp(24.0 + wave * 0.8 + (r - 0.5) * 0.25, 22.0, 30.0)
    if (metricKey === 'do') return clamp(6.4 + wave * 1.2 + (r - 0.5) * 0.4, 4.5, 9.2)
    if (metricKey === 'ph') return clamp(7.35 + wave * 0.12 + (r - 0.5) * 0.05, 6.8, 8.2)
    if (metricKey === 'nh3n') return clamp(0.14 + wave * 0.04 + (r - 0.5) * 0.02, 0.05, 0.4)
    return clamp(10 + wave + (r - 0.5) * 0.5, 0, 100)
  }

  return Array.from({ length: count }, (_, i) => ({
    deviceId,
    recordedAt: new Date(start + i * stepMin * 60_000).toISOString(),
    metrics: { [metricKey]: Number(gen(i).toFixed(metricKey === 'ph' ? 2 : 1)) },
  }))
}

export function createMockClient(): DataClient {
  const state = initPersisted()

  const delay = async (minMs = 120, maxMs = 360) => {
    const t = Math.floor(minMs + Math.random() * (maxMs - minMs))
    await new Promise((r) => setTimeout(r, t))
  }

  const getAlarmById = (alarmId: string) => state.alarms.find((a) => a.id === alarmId)

  const client: DataClient = {
    async authLogin(input: LoginInput): Promise<UserSession> {
      await delay(180, 500)
      const username = input.username.trim()
      const password = input.password

      if (!username || !password) {
        throw new Error('请输入账号与密码')
      }

      const role = username.toLowerCase().includes('admin') ? 'admin' : 'operator'
      return {
        userId: `u_${username.toLowerCase()}`,
        displayName: role === 'admin' ? '管理员' : '值守人员',
        role,
      }
    },

    async authLogout(): Promise<void> {
      await delay(100, 220)
    },

    async listRooms(): Promise<Room[]> {
      await delay(80, 160)
      return roomsSeed
    },

    async getRoomOverview(roomId: string): Promise<RoomOverview> {
      await delay(120, 260)
      const room = roomsSeed.find((r) => r.id === roomId) ?? roomsSeed[0]
      const zones = zonesSeed.filter((z) => z.roomId === room.id).sort((a, b) => a.sortOrder - b.sortOrder)
      const points = pointsSeed.filter((p) => p.roomId === room.id)
      const telemetryLatest = computeTelemetryLatest()
      const alarms = state.alarms
        .filter((a) => !a.roomId || a.roomId === room.id)
        .slice()
        .sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt))

      return {
        room,
        zones,
        points,
        devices: devicesSeed,
        bindings: bindingsSeed,
        telemetryLatest,
        alarms,
      }
    },

    async listDevices(query: DeviceQuery): Promise<Device[]> {
      await delay(110, 220)
      return devicesSeed
        .filter((d) => (query.deviceType ? d.deviceType === query.deviceType : true))
        .filter((d) => (query.status ? d.status === query.status : true))
        .filter((d) => (query.keyword ? (matchesKeyword(d.name, query.keyword) || matchesKeyword(d.deviceSn, query.keyword)) : true))
    },

    async getDevice(deviceId: string): Promise<Device | undefined> {
      await delay(80, 160)
      return devicesSeed.find((d) => d.id === deviceId)
    },

    async getDeviceTelemetry(deviceId: string, metricKey: string, range: TimeRange): Promise<TelemetryRecord[]> {
      await delay(120, 260)
      return buildSeries(deviceId, metricKey, range)
    },

    async listAlarms(query: AlarmQuery): Promise<Alarm[]> {
      await delay(120, 260)
      return state.alarms
        .filter((a) => (query.roomId ? a.roomId === query.roomId : true))
        .filter((a) => (query.status ? a.status === query.status : true))
        .filter((a) => (query.level ? a.level === query.level : true))
        .filter((a) => (query.keyword ? (matchesKeyword(a.title, query.keyword)) : true))
        .slice()
        .sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt))
    },

    async ackAlarm(alarmId: string, userId: string): Promise<Alarm> {
      await delay(180, 420)
      const alarm = getAlarmById(alarmId)
      if (!alarm) throw new Error('告警不存在')
      if (alarm.status === 'closed') return alarm
      alarm.status = 'ack'
      alarm.ackBy = userId
      alarm.ackAt = nowIso()
      saveState(state)
      return alarm
    },

    async closeAlarm(alarmId: string, userId: string, note: string): Promise<Alarm> {
      await delay(180, 420)
      const alarm = getAlarmById(alarmId)
      if (!alarm) throw new Error('告警不存在')
      alarm.status = 'closed'
      alarm.closeBy = userId
      alarm.closeAt = nowIso()
      alarm.closeNote = note.trim()
      saveState(state)
      return alarm
    },

    async listAlarmRules(roomId?: string): Promise<AlarmRule[]> {
      await delay(120, 220)
      return state.rules.filter((r) => (roomId ? r.roomId === roomId : true)).slice()
    },

    async upsertAlarmRule(rule: AlarmRule): Promise<AlarmRule> {
      await delay(220, 520)
      const idx = state.rules.findIndex((r) => r.id === rule.id)
      if (idx >= 0) {
        state.rules[idx] = { ...rule }
      } else {
        state.rules.unshift({ ...rule, id: rule.id || uid('rule') })
      }
      saveState(state)
      return rule
    },

    async sendControlCommand(deviceId: string, userId: string, action: string, params?: Record<string, unknown>): Promise<ControlCommand> {
      await delay(260, 720)
      const device = devicesSeed.find((d) => d.id === deviceId)
      if (!device) throw new Error('设备不存在')
      if (device.status !== 'online') throw new Error('设备离线，无法执行控制')

      const cmd: ControlCommand = {
        id: uid('cmd'),
        deviceId,
        issuedBy: userId,
        action,
        params: params ?? {},
        status: 'success',
        resultMessage: '已下发并执行成功',
        issuedAt: nowIso(),
      }
      state.commands.unshift(cmd)
      state.commands = state.commands.slice(0, 100)
      saveState(state)
      return cmd
    },

    async listControlCommands(deviceId?: string): Promise<ControlCommand[]> {
      await delay(120, 220)
      return state.commands.filter((c) => (deviceId ? c.deviceId === deviceId : true)).slice()
    },
  }

  return client
}
