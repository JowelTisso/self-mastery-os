import { useLogStore } from '../store/logStore'

export default function Toast() {
  const { toast } = useLogStore()

  if (!toast) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-toast">
      <div className="px-4 py-3 rounded-xl bg-teal-500 text-white font-medium text-sm shadow-lg">
        {toast}
      </div>
    </div>
  )
}
