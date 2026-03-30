import { useState, useEffect } from 'react'
import { User, Moon, Sun, Download, Trash2, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useLogStore } from '../store/logStore'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import type { DailyLog } from '../types'

export default function Settings() {
  const { profile, user, logout } = useAuthStore()
  const { logs } = useLogStore()
  const [darkMode, setDarkMode] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)
  }, [])

  const toggleTheme = () => {
    const next = !darkMode
    setDarkMode(next)
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const exportCSV = () => {
    const allLogs = Object.values(logs) as DailyLog[]
    if (allLogs.length === 0) return

    const headers = ['Date', 'Completed Blocks', 'Score (%)', 'Mood', 'Wins', 'Improve']
    const rows = allLogs
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .map((log) => [
        log.log_date,
        log.completed_blocks.join('; '),
        Math.round(log.overall_score).toString(),
        log.mood?.toString() ?? '',
        `"${(log.journal_wins ?? '').replace(/"/g, '""')}"`,
        `"${(log.journal_improve ?? '').replace(/"/g, '""')}"`,
      ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `self-mastery-os-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteAccount = async () => {
    if (!user) return
    await supabase.from('daily_logs').delete().eq('user_id', user.id)
    await supabase.from('pillar_logs').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await logout()
  }

  return (
    <div className="pb-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Profile */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-semibold">{profile?.name ?? 'User'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Appearance</h3>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            <span className="text-gray-900 dark:text-white">Dark Mode</span>
          </div>
          <div className={`w-11 h-6 rounded-full flex items-center transition-colors ${darkMode ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Data */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Data</h3>
        <div className="space-y-2">
          <button
            onClick={exportCSV}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <Download className="w-5 h-5 text-green-500 dark:text-green-400" />
            <div>
              <p className="text-gray-900 dark:text-white">Export All Logs</p>
              <p className="text-xs text-gray-500">Download as CSV file</p>
            </div>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
          >
            <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
            <div>
              <p className="text-red-500 dark:text-red-400">Delete Account</p>
              <p className="text-xs text-gray-500">Permanently delete all your data</p>
            </div>
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This will permanently delete all your logs, journals, and profile data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
