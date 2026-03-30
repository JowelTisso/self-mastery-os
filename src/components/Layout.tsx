import { NavLink, Outlet } from 'react-router-dom'
import { CalendarCheck, CalendarDays, BarChart3, BookOpen, Settings } from 'lucide-react'
import Toast from './Toast'

const NAV_ITEMS = [
  { to: '/', icon: CalendarCheck, label: 'Today' },
  { to: '/monthly', icon: CalendarDays, label: 'Monthly' },
  { to: '/yearly', icon: BarChart3, label: 'Yearly' },
  { to: '/philosophy', icon: BookOpen, label: 'Plan' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  return (
    <div className="min-h-svh bg-white dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col">
      {/* Page Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-6 pb-20">
        <Outlet />
      </main>

      {/* Toast */}
      <Toast />

      {/* Bottom Tab Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 z-30">
        <div className="max-w-lg mx-auto flex">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors ${
                  isActive ? 'text-teal-400' : 'text-gray-500 hover:text-gray-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
