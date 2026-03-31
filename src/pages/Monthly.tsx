import { useEffect, useState, useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isSameMonth, isToday, isFuture,
} from 'date-fns'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useLogStore } from '../store/logStore'
import { useSchedule } from '../lib/useSchedule'
import { PILLAR_LABELS, PILLAR_COLORS } from '../types'
import type { DailyLog, Pillar } from '../types'

export default function Monthly() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<DailyLog | null>(null)
  const { logs, fetchLogsForMonth } = useLogStore()
  const schedule = useSchedule()

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth() + 1

  useEffect(() => {
    fetchLogsForMonth(year, month)
  }, [year, month, fetchLogsForMonth])

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const startDayOfWeek = getDay(startOfMonth(currentMonth))

  // Month stats
  const monthLogs = useMemo(() => {
    return days
      .map((d) => logs[format(d, 'yyyy-MM-dd')])
      .filter(Boolean) as DailyLog[]
  }, [days, logs])

  const avgScore = monthLogs.length > 0
    ? monthLogs.reduce((sum, l) => sum + l.overall_score, 0) / monthLogs.length
    : 0

  // Pillar breakdown
  const pillarData = useMemo(() => {
    const counts: Partial<Record<Pillar, { total: number; completed: number }>> = {}
    for (const log of monthLogs) {
      for (const block of schedule) {
        const pillar = block.category
        if (!counts[pillar]) counts[pillar] = { total: 0, completed: 0 }
        counts[pillar]!.total++
        if (log.completed_blocks.includes(block.id)) {
          counts[pillar]!.completed++
        }
      }
    }
    return Object.entries(counts).map(([pillar, data]) => ({
      name: PILLAR_LABELS[pillar as Pillar],
      pct: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      fill: PILLAR_COLORS[pillar as Pillar],
    })).sort((a, b) => b.pct - a.pct)
  }, [monthLogs])

  // Best streak in month
  const bestStreak = useMemo(() => {
    let streak = 0, best = 0
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd')
      if (logs[key] && logs[key].completed_blocks.length > 0) {
        streak++
        best = Math.max(best, streak)
      } else {
        streak = 0
      }
    }
    return best
  }, [days, logs])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="pb-6 space-y-6">
      {/* Month Nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          disabled={isSameMonth(currentMonth, new Date())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgScore)}%</p>
          <p className="text-xs text-gray-500">Avg Score</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthLogs.length}</p>
          <p className="text-xs text-gray-500">Days Logged</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{bestStreak}</p>
          <p className="text-xs text-gray-500">Best Streak</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 dark:text-gray-600 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const log = logs[key]
            const score = log?.overall_score ?? 0
            const hasData = log && log.completed_blocks.length > 0
            const today = isToday(day)
            const future = isFuture(day)

            return (
              <button
                key={key}
                onClick={() => hasData && setSelectedDay(log)}
                disabled={!hasData}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                  today ? 'ring-2 ring-teal-500' : ''
                } ${hasData ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''}`}
              >
                <span className={`text-[11px] ${today ? 'text-teal-500 dark:text-teal-400 font-bold' : future ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 dark:text-gray-400'}`}>
                  {format(day, 'd')}
                </span>
                {hasData && (
                  <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${getScoreColor(score)}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pillar Breakdown Chart */}
      {pillarData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Pillar Breakdown</h3>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pillarData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value}%`, 'Completion']}
                />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {format(new Date(selectedDay.log_date + 'T00:00:00'), 'EEEE, MMM d')}
              </h3>
              <button onClick={() => setSelectedDay(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-2xl font-bold text-teal-500 dark:text-teal-400 mb-4">{Math.round(selectedDay.overall_score)}% completed</p>
            <div className="space-y-2">
              {schedule.map((block) => (
                <div key={block.id} className={`flex items-center gap-2 text-sm ${
                  selectedDay.completed_blocks.includes(block.id) ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'
                }`}>
                  <span>{selectedDay.completed_blocks.includes(block.id) ? '✓' : '○'}</span>
                  <span>{block.title}</span>
                </div>
              ))}
            </div>
            {selectedDay.journal_wins && (
              <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 mb-1">Wins</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDay.journal_wins}</p>
              </div>
            )}
            {selectedDay.journal_improve && (
              <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 mb-1">Improve</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDay.journal_improve}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
