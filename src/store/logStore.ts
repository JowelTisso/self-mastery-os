import { create } from 'zustand'
import { format, startOfDay, differenceInCalendarDays, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { DailyLog } from '../types'
import { TOTAL_BLOCKS } from '../data/schedule'

interface LogState {
  todayLog: DailyLog | null
  logs: Record<string, DailyLog>
  loading: boolean
  saving: boolean
  error: string | null
  toast: string | null

  fetchTodayLog: () => Promise<void>
  fetchLogsForMonth: (year: number, month: number) => Promise<void>
  fetchLogsForYear: (year: number) => Promise<void>
  toggleBlock: (blockId: string) => void
  setMood: (mood: number) => void
  setJournalWins: (text: string) => void
  setJournalImprove: (text: string) => void
  saveLog: () => Promise<void>
  getStreaks: () => { current: number; longest: number }
  getDayNumber: (journeyStartDate?: string | null) => number
  showToast: (message: string) => void
  clearToast: () => void
}

const getToday = () => format(startOfDay(new Date()), 'yyyy-MM-dd')

export const useLogStore = create<LogState>((set, get) => ({
  todayLog: null,
  logs: {},
  loading: false,
  saving: false,
  error: null,
  toast: null,

  fetchTodayLog: async () => {
    set({ loading: true })
    const today = getToday()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ loading: false }); return }

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      set({ error: error.message, loading: false })
      return
    }

    const log: DailyLog = data ?? {
      id: '',
      user_id: user.id,
      log_date: today,
      completed_blocks: [],
      journal_wins: '',
      journal_improve: '',
      mood: 0,
      overall_score: 0,
      created_at: new Date().toISOString(),
    }

    set({
      todayLog: log,
      logs: { ...get().logs, [today]: log },
      loading: false,
    })
  },

  fetchLogsForMonth: async (year, month) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', startDate)
      .lt('log_date', endDate)

    if (data) {
      const newLogs = { ...get().logs }
      for (const log of data) {
        newLogs[log.log_date] = log as DailyLog
      }
      set({ logs: newLogs })
    }
  },

  fetchLogsForYear: async (year) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', `${year}-01-01`)
      .lte('log_date', `${year}-12-31`)

    if (data) {
      const newLogs = { ...get().logs }
      for (const log of data) {
        newLogs[log.log_date] = log as DailyLog
      }
      set({ logs: newLogs })
    }
  },

  toggleBlock: (blockId) => {
    const { todayLog } = get()
    if (!todayLog) return

    const blocks = [...todayLog.completed_blocks]
    const idx = blocks.indexOf(blockId)
    if (idx >= 0) {
      blocks.splice(idx, 1)
    } else {
      blocks.push(blockId)
    }

    const score = (blocks.length / TOTAL_BLOCKS) * 100
    const updated = { ...todayLog, completed_blocks: blocks, overall_score: score }
    set({
      todayLog: updated,
      logs: { ...get().logs, [todayLog.log_date]: updated },
    })
  },

  setMood: (mood) => {
    const { todayLog } = get()
    if (!todayLog) return
    const updated = { ...todayLog, mood }
    set({ todayLog: updated, logs: { ...get().logs, [todayLog.log_date]: updated } })
  },

  setJournalWins: (text) => {
    const { todayLog } = get()
    if (!todayLog) return
    const updated = { ...todayLog, journal_wins: text }
    set({ todayLog: updated, logs: { ...get().logs, [todayLog.log_date]: updated } })
  },

  setJournalImprove: (text) => {
    const { todayLog } = get()
    if (!todayLog) return
    const updated = { ...todayLog, journal_improve: text }
    set({ todayLog: updated, logs: { ...get().logs, [todayLog.log_date]: updated } })
  },

  saveLog: async () => {
    const { todayLog } = get()
    if (!todayLog) return

    set({ saving: true, error: null })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ saving: false }); return }

    const payload = {
      user_id: user.id,
      log_date: todayLog.log_date,
      completed_blocks: todayLog.completed_blocks,
      journal_wins: todayLog.journal_wins,
      journal_improve: todayLog.journal_improve,
      mood: todayLog.mood || null,
    }

    const { error } = todayLog.id
      ? await supabase.from('daily_logs').update(payload).eq('id', todayLog.id)
      : await supabase.from('daily_logs').upsert(payload, { onConflict: 'user_id,log_date' })

    if (error) {
      set({ error: error.message, saving: false })
    } else {
      set({ saving: false })
      get().showToast('Day logged! Keep the streak alive.')
      await get().fetchTodayLog()
    }
  },

  getStreaks: () => {
    const logs = Object.values(get().logs)
      .filter(l => l.completed_blocks.length > 0)
      .sort((a, b) => b.log_date.localeCompare(a.log_date))

    if (logs.length === 0) return { current: 0, longest: 0 }

    let current = 0
    let longest = 0
    let streak = 0
    let prevDate: Date | null = null

    const sortedAsc = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date))

    for (const log of sortedAsc) {
      const logDate = parseISO(log.log_date)
      if (prevDate && differenceInCalendarDays(logDate, prevDate) === 1) {
        streak++
      } else if (prevDate && differenceInCalendarDays(logDate, prevDate) > 1) {
        streak = 1
      } else {
        streak = 1
      }
      longest = Math.max(longest, streak)
      prevDate = logDate
    }

    // Current streak: count backwards from today
    const today = getToday()
    let checkDate = parseISO(today)
    current = 0
    const logDates = new Set(logs.map(l => l.log_date))

    while (logDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      current++
      checkDate = new Date(checkDate.getTime() - 86400000)
    }

    return { current, longest }
  },

  getDayNumber: (journeyStartDate?: string | null) => {
    const today = startOfDay(new Date())

    if (journeyStartDate) {
      const startDate = parseISO(journeyStartDate)
      return Math.max(1, differenceInCalendarDays(today, startDate) + 1)
    }

    const logs = Object.values(get().logs)
      .filter(l => l.completed_blocks.length > 0)
      .sort((a, b) => a.log_date.localeCompare(b.log_date))

    if (logs.length === 0) return 1

    const firstDay = parseISO(logs[0].log_date)
    return differenceInCalendarDays(today, firstDay) + 1
  },

  showToast: (message) => {
    set({ toast: message })
    setTimeout(() => set({ toast: null }), 3000)
  },

  clearToast: () => set({ toast: null }),
}))
