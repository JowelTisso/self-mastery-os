import type { ScheduleBlock } from '../types'

export const DEFAULT_WAKE_TIME = '05:00'

function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function padTwo(n: number): string {
  return n.toString().padStart(2, '0')
}

export function shiftTime(time: string, offsetMinutes: number): string {
  const total = parseMinutes(time) + offsetMinutes
  const wrapped = ((total % 1440) + 1440) % 1440
  return `${padTwo(Math.floor(wrapped / 60))}:${padTwo(wrapped % 60)}`
}

function to12Hour(time24: string): { display: string; period: string } {
  const [h, m] = time24.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour12 = h % 12 || 12
  return { display: `${hour12}:${padTwo(m)}`, period }
}

export function formatTimeLabel(start24: string, end24: string): string {
  const s = to12Hour(start24)
  const e = to12Hour(end24)
  if (s.period === e.period) {
    return `${s.display} - ${e.display} ${s.period}`
  }
  return `${s.display} ${s.period} - ${e.display} ${e.period}`
}

export function getShiftedSchedule(
  baseSchedule: ScheduleBlock[],
  wakeTime: string,
): ScheduleBlock[] {
  const offset = parseMinutes(wakeTime) - parseMinutes(DEFAULT_WAKE_TIME)
  if (offset === 0) return baseSchedule

  return baseSchedule.map((block) => {
    const newStart = shiftTime(block.timeStart, offset)
    const newEnd = shiftTime(block.timeEnd, offset)
    return {
      ...block,
      timeStart: newStart,
      timeEnd: newEnd,
      timeLabel: formatTimeLabel(newStart, newEnd),
    }
  })
}
