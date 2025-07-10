import { Check, X, AlertCircle, Info } from "lucide-react"
import { useEffect } from "react"

interface ToastProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="w-5 h-5 text-green-400" />
      case "error":
        return <X className="w-5 h-5 text-red-400" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-900/80 border-green-400/30 text-green-100"
      case "error":
        return "bg-red-900/80 border-red-400/30 text-red-100"
      case "warning":
        return "bg-yellow-900/80 border-yellow-400/30 text-yellow-100"
      case "info":
        return "bg-blue-900/80 border-blue-400/30 text-blue-100"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={`p-4 rounded-lg border backdrop-blur-sm ${getColors()} max-w-sm shadow-lg`}>
        <div className="flex items-center gap-3">
          {getIcon()}
          <p className="flex-1 text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
