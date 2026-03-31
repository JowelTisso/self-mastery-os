import { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Flame, Save } from 'lucide-react'
import { useLogStore } from '../store/logStore'
import { useAuthStore } from '../store/authStore'
import { useSchedule } from '../lib/useSchedule'
import { TIME_GROUP_LABELS } from '../types'
import type { TimeGroup, ScheduleBlock } from '../types'
import CompletionRing from '../components/CompletionRing'
import MoodSelector from '../components/MoodSelector'
import ScheduleBlockCard from '../components/ScheduleBlockCard'
import Confetti from '../components/Confetti'

export default function Dashboard() {
  const {
    todayLog, loading, saving, fetchTodayLog,
    toggleBlock, setMood, setJournalWins, setJournalImprove,
    saveLog, getStreaks, getDayNumber,
  } = useLogStore()
  const { profile } = useAuthStore()
  const schedule = useSchedule()

  const [showConfetti, setShowConfetti] = useState(false)
  const [prevCompleted, setPrevCompleted] = useState(0)

  useEffect(() => {
    fetchTodayLog()
  }, [fetchTodayLog])

  const completedBlocks = todayLog?.completed_blocks ?? []
  const percentage = todayLog?.overall_score ?? 0
  const streaks = getStreaks()
  const dayNumber = getDayNumber(profile?.journey_start_date)

  // Confetti when hitting 100%
  useEffect(() => {
    if (completedBlocks.length === schedule.length && prevCompleted < schedule.length) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 100)
    }
    setPrevCompleted(completedBlocks.length)
  }, [completedBlocks.length, prevCompleted, schedule.length])

  // Group schedule blocks
  const grouped = useMemo(() => {
    const groups: Record<TimeGroup, ScheduleBlock[]> = {
      morning: [], deep_work: [], midday: [], afternoon: [], evening: [], night: [],
    }
    for (const block of schedule) {
      groups[block.group].push(block)
    }
    return groups
  }, [schedule])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-6 space-y-6">
      <Confetti show={showConfetti} />

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
          Day {dayNumber} of 365. Keep showing up.
          {streaks.current >= 7 && <Flame className="w-4 h-4 text-orange-500" />}
        </p>
        {streaks.current > 0 && (
          <p className="text-sm text-teal-500 dark:text-teal-400">
            {streaks.current} day streak{streaks.current >= 7 ? ' 🔥' : ''}
          </p>
        )}
      </div>

      {/* Completion Ring + Mood */}
      <div className="flex flex-col items-center gap-4">
        <CompletionRing percentage={percentage} />
        <MoodSelector value={todayLog?.mood ?? 0} onChange={setMood} />
      </div>

      {/* Schedule Blocks by Group */}
      <div className="space-y-6">
        {(Object.entries(grouped) as [TimeGroup, ScheduleBlock[]][]).map(([group, blocks]) => {
          if (blocks.length === 0) return null
          return (
            <div key={group}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                {TIME_GROUP_LABELS[group]}
              </h3>
              <div className="space-y-2">
                {blocks.map((block) => (
                  <ScheduleBlockCard
                    key={block.id}
                    block={block}
                    completed={completedBlocks.includes(block.id)}
                    onToggle={() => toggleBlock(block.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Journal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Journal</h3>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">3 wins today...</label>
          <textarea
            value={todayLog?.journal_wins ?? ''}
            onChange={(e) => setJournalWins(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="What went well today?"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">1 thing to improve...</label>
          <textarea
            value={todayLog?.journal_improve ?? ''}
            onChange={(e) => setJournalImprove(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="What could be better tomorrow?"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveLog}
        disabled={saving}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Saving...' : todayLog?.id ? "Update Today's Log" : "Save Today's Log"}
      </button>
    </div>
  )
}
