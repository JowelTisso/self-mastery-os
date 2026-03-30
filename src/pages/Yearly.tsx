import { useEffect, useState, useMemo } from 'react'
import { format, startOfYear, eachDayOfInterval, endOfYear, getDay, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Flame, Target, Calendar, TrendingUp, Trophy } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { useLogStore } from '../store/logStore'
import { SCHEDULE } from '../data/schedule'
import { PILLAR_LABELS, PILLAR_COLORS } from '../types'
import type { DailyLog, Pillar } from '../types'

export default function Yearly() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { logs, fetchLogsForYear, getStreaks } = useLogStore()
  const [hoveredDay, setHoveredDay] = useState<{ date: string; score: number; x: number; y: number } | null>(null)

  useEffect(() => {
    fetchLogsForYear(year)
  }, [year, fetchLogsForYear])

  const allDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfYear(new Date(year, 0, 1)),
      end: endOfYear(new Date(year, 0, 1)),
    })
  }, [year])

  const yearLogs = useMemo(() => {
    return allDays
      .map((d) => ({ date: format(d, 'yyyy-MM-dd'), log: logs[format(d, 'yyyy-MM-dd')] }))
      .filter((d) => d.log) as { date: string; log: DailyLog }[]
  }, [allDays, logs])

  const streaks = getStreaks()
  const avgScore = yearLogs.length > 0
    ? yearLogs.reduce((sum, d) => sum + d.log.overall_score, 0) / yearLogs.length
    : 0

  // Best month
  const bestMonth = useMemo(() => {
    const monthScores: Record<string, { total: number; count: number }> = {}
    for (const { log } of yearLogs) {
      const m = log.log_date.substring(0, 7)
      if (!monthScores[m]) monthScores[m] = { total: 0, count: 0 }
      monthScores[m].total += log.overall_score
      monthScores[m].count++
    }
    let best = ''
    let bestAvg = 0
    for (const [m, data] of Object.entries(monthScores)) {
      const avg = data.total / data.count
      if (avg > bestAvg) { bestAvg = avg; best = m }
    }
    return best ? format(parseISO(best + '-01'), 'MMM') : '—'
  }, [yearLogs])

  // Pillar radar data
  const radarData = useMemo(() => {
    const counts: Partial<Record<Pillar, { total: number; completed: number }>> = {}
    for (const { log } of yearLogs) {
      for (const block of SCHEDULE) {
        const p = block.category
        if (!counts[p]) counts[p] = { total: 0, completed: 0 }
        counts[p]!.total++
        if (log.completed_blocks.includes(block.id)) counts[p]!.completed++
      }
    }
    return Object.entries(counts).map(([pillar, data]) => ({
      subject: PILLAR_LABELS[pillar as Pillar],
      value: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      fill: PILLAR_COLORS[pillar as Pillar],
    }))
  }, [yearLogs])

  // Build heatmap grid (weeks as columns, days as rows)
  const heatmapWeeks = useMemo(() => {
    const weeks: { date: string; score: number; hasData: boolean }[][] = []
    let currentWeek: typeof weeks[0] = []

    // Pad start
    const firstDayOfWeek = getDay(allDays[0])
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: '', score: 0, hasData: false })
    }

    for (const day of allDays) {
      const key = format(day, 'yyyy-MM-dd')
      const log = logs[key]
      currentWeek.push({
        date: key,
        score: log?.overall_score ?? 0,
        hasData: !!log && log.completed_blocks.length > 0,
      })
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', score: 0, hasData: false })
      }
      weeks.push(currentWeek)
    }
    return weeks
  }, [allDays, logs])

  const getHeatColor = (score: number, hasData: boolean) => {
    if (!hasData) return 'bg-gray-100 dark:bg-gray-800/50'
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-green-400 dark:bg-green-600/70'
    if (score >= 40) return 'bg-green-300 dark:bg-green-700/50'
    if (score >= 20) return 'bg-green-200 dark:bg-green-800/40'
    return 'bg-green-100 dark:bg-green-900/30'
  }

  return (
    <div className="pb-6 space-y-6">
      {/* Year Nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setYear(year - 1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{year}</h2>
        <button
          onClick={() => setYear(year + 1)}
          disabled={year >= new Date().getFullYear()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{streaks.current}</p>
            <p className="text-xs text-gray-500">Current Streak</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{streaks.longest}</p>
            <p className="text-xs text-gray-500">Longest Streak</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{yearLogs.length}</p>
            <p className="text-xs text-gray-500">Days Logged</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgScore)}%</p>
            <p className="text-xs text-gray-500">Avg Score</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-center gap-3 col-span-2">
          <Target className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{bestMonth}</p>
            <p className="text-xs text-gray-500">Best Month</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Contribution Heatmap</h3>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 overflow-x-auto relative">
          <div className="flex gap-[3px] min-w-max">
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`w-3 h-3 rounded-sm ${day.date ? getHeatColor(day.score, day.hasData) : 'bg-transparent'} ${day.date ? 'cursor-pointer' : ''}`}
                    onMouseEnter={(e) => {
                      if (day.date && day.hasData) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setHoveredDay({ date: day.date, score: day.score, x: rect.left, y: rect.top })
                      }
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                ))}
              </div>
            ))}
          </div>
          {hoveredDay && (
            <div
              className="fixed z-50 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white shadow-lg pointer-events-none"
              style={{ left: hoveredDay.x, top: hoveredDay.y - 30 }}
            >
              {format(parseISO(hoveredDay.date), 'MMM d')} — {Math.round(hoveredDay.score)}%
            </div>
          )}
          {/* Month labels */}
          <div className="flex mt-2 text-[10px] text-gray-400 dark:text-gray-600">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <span key={m} className="flex-1">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Pillar Overview</h3>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Radar
                  dataKey="value"
                  stroke="#14B8A6"
                  fill="#14B8A6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
