const MOODS = [
  { value: 1, emoji: '😔', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '🔥', label: 'Amazing' },
]

interface MoodSelectorProps {
  value: number
  onChange: (mood: number) => void
}

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onChange(mood.value)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            value === mood.value
              ? 'bg-gray-700 scale-110'
              : 'hover:bg-gray-800'
          }`}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-[10px] text-gray-500">{mood.label}</span>
        </button>
      ))}
    </div>
  )
}
