import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Monthly from './pages/Monthly'
import Yearly from './pages/Yearly'
import Philosophy from './pages/Philosophy'
import Settings from './pages/Settings'

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()

    // Restore theme preference
    const saved = localStorage.getItem('theme')
    if (saved === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/monthly" element={<Monthly />} />
          <Route path="/yearly" element={<Yearly />} />
          <Route path="/philosophy" element={<Philosophy />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
