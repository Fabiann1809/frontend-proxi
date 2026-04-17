import { Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  onSend: (prompt: string) => void
  isLoading: boolean
  isRateLimited: boolean
  secondsRemaining: number
}

const MAX_ROWS = 4
const LINE_HEIGHT = 24

export function ChatInput({ onSend, isLoading, isRateLimited, secondsRemaining }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const estimatedTokens = Math.ceil(value.length / 4)
  const isDisabled = isLoading || isRateLimited || value.trim() === ''

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = LINE_HEIGHT * MAX_ROWS + 24
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }, [])

  useEffect(() => {
    autoResize()
  }, [value, autoResize])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isDisabled) return
    onSend(trimmed)
    setValue('')
  }, [value, isDisabled, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-700/50 bg-gray-900 px-4 py-3">
      <div className="flex items-end gap-3 bg-gray-800 rounded-2xl border border-gray-700 px-4 py-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your prompt... (Enter to send, Shift+Enter for new line)"
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm resize-none outline-none min-h-[24px] leading-6"
          style={{ maxHeight: `${LINE_HEIGHT * MAX_ROWS + 24}px` }}
        />
        <button
          onClick={handleSend}
          disabled={isDisabled}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
            isRateLimited
              ? 'bg-red-600/80 text-red-100 cursor-not-allowed'
              : isDisabled
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isRateLimited ? (
            <span>Wait {secondsRemaining}s</span>
          ) : (
            <>
              <Send size={14} />
              <span>Send</span>
            </>
          )}
        </button>
      </div>
      {value.length > 0 && (
        <p className="text-xs text-gray-500 mt-1.5 px-1">~{estimatedTokens} estimated tokens</p>
      )}
    </div>
  )
}
