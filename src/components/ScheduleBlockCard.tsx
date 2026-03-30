import { useState } from 'react'
import { Check } from 'lucide-react'
import type { ScheduleBlock } from '../types'
import { PILLAR_COLORS, PILLAR_LABELS } from '../types'

interface ScheduleBlockCardProps {
  block: ScheduleBlock
  completed: boolean
  onToggle: () => void
}

export default function ScheduleBlockCard({ block, completed, onToggle }: ScheduleBlockCardProps) {
  const [animating, setAnimating] = useState(false)
  const color = PILLAR_COLORS[block.category]
  const label = PILLAR_LABELS[block.category]

  const handleToggle = () => {
    if (!completed) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
    }
    onToggle()
  }

  return (
    <button
      onClick={handleToggle}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
        completed
          ? 'bg-gray-800/50 border-gray-800 opacity-60'
          : 'bg-gray-900 border-gray-800 hover:border-gray-700'
      } ${animating ? 'animate-check-pulse' : ''}`}
    >
      {/* Checkbox */}
      <div
        className="shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors"
        style={{
          borderColor: completed ? color : 'rgb(75 85 99)',
          backgroundColor: completed ? color : 'transparent',
        }}
      >
        {completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs text-gray-500 font-mono">{block.timeLabel}</span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {label}
          </span>
        </div>
        <p className={`text-sm font-medium ${completed ? 'line-through text-gray-500' : 'text-white'}`}>
          {block.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{block.description}</p>
      </div>
    </button>
  )
}
