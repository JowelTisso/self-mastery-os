import { useMemo } from 'react'
import { SCHEDULE } from '../data/schedule'
import { useAuthStore } from '../store/authStore'
import { getShiftedSchedule, DEFAULT_WAKE_TIME } from './scheduleUtils'

export function useSchedule() {
  const profile = useAuthStore((state) => state.profile)
  const wakeTime = profile?.wake_time ?? DEFAULT_WAKE_TIME

  return useMemo(
    () => getShiftedSchedule(SCHEDULE, wakeTime),
    [wakeTime],
  )
}
