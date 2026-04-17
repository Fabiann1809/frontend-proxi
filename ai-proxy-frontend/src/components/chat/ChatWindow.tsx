import { Bot } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType } from '../../types'
import { ChatMessage } from './ChatMessage'

interface Props {
  messages: ChatMessageType[]
  isLoading: boolean
}

function LoadingDots() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-sm mr-1">Generating</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mb-4">
        <Bot size={32} className="text-white" />
      </div>
      <h2 className="text-xl font-semibold text-gray-100 mb-2">AI Generation Platform</h2>
      <p className="text-gray-400 text-sm max-w-xs">
        Write your prompt in the input below to start generating text with AI.
      </p>
    </div>
  )
}

export function ChatWindow({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
      {messages.length === 0 && !isLoading ? (
        <WelcomeScreen />
      ) : (
        <>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <LoadingDots />}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
