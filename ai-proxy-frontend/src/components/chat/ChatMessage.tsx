import { AlertTriangle } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '../../types'

interface Props {
  message: ChatMessageType
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  if (message.error) {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[75%] bg-red-900/40 border border-red-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <span className="text-red-300 text-sm">{message.content}</span>
          </div>
          <p className="text-red-500/60 text-xs">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 rounded-tr-sm text-white'
            : 'bg-gray-700 rounded-tl-sm text-gray-100'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isUser ? 'text-blue-200/70' : 'text-gray-400'}`}>
            {formatTime(message.timestamp)}
          </span>
          {message.tokensUsed !== undefined && (
            <span className={`text-xs ${isUser ? 'text-blue-200/70' : 'text-gray-500'}`}>
              ~{message.tokensUsed} tokens
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
