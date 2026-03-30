import { useEffect, useState } from 'react'

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EC4899', '#A855F7', '#F97316', '#14B8A6']

interface Particle {
  id: number
  left: number
  color: string
  delay: number
  size: number
}

export default function Confetti({ show }: { show: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        size: Math.random() * 6 + 4,
      }))
      setParticles(newParticles)
      const timer = setTimeout(() => setParticles([]), 2500)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
