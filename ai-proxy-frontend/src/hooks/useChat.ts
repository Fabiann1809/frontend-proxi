import { useCallback, useRef, useState } from 'react'
import { generateText } from '../api/aiProxyApi'
import { DEFAULT_USER_ID } from '../constants'
import type { ChatMessage } from '../types'

/** User-facing copy (Spanish). */
const UI_RATE_LIMIT_MESSAGE =
  'Demasiadas solicitudes. Espera un momento antes de volver a intentar.'
const UI_QUOTA_EXCEEDED_MESSAGE =
  'Has agotado tu cuota de tokens para este plan.'
const UI_GENERIC_ERROR_MESSAGE =
  'No se pudo completar la solicitud. Inténtalo de nuevo.'

export type UseChatParams = {
  refreshQuota: () => void | Promise<void>
  triggerLimit: (retryAfterSeconds: number) => void
  onQuotaExceeded: () => void
}

function createMessageId(): string {
  return crypto.randomUUID()
}

function buildUserMessage(content: string): ChatMessage {
  return {
    id: createMessageId(),
    role: 'user',
    content,
    timestamp: new Date(),
  }
}

function buildAssistantMessage(
  content: string,
  tokensUsed?: number,
): ChatMessage {
  return {
    id: createMessageId(),
    role: 'assistant',
    content,
    tokensUsed,
    timestamp: new Date(),
  }
}

function buildErrorAssistantMessage(content: string): ChatMessage {
  return {
    id: createMessageId(),
    role: 'assistant',
    content,
    error: true,
    timestamp: new Date(),
  }
}

function getThrownErrorType(e: unknown): 'RATE_LIMIT' | 'QUOTA_EXCEEDED' | 'ERROR' | null {
  if (typeof e !== 'object' || e === null || !('type' in e)) return null
  const t = (e as { type: unknown }).type
  if (t === 'RATE_LIMIT' || t === 'QUOTA_EXCEEDED' || t === 'ERROR') return t
  return null
}

function getRateLimitRetryAfter(e: unknown): number {
  if (typeof e === 'object' && e !== null && 'retryAfter' in e) {
    const n = Number((e as { retryAfter: unknown }).retryAfter)
    if (!Number.isNaN(n) && n >= 0) return n
  }
  return 60
}

function getThrownErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message: unknown }).message
    if (typeof m === 'string' && m.trim() !== '') return m
  }
  return ''
}

export function useChat({
  refreshQuota,
  triggerLimit,
  onQuotaExceeded,
}: UseChatParams) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const isLoadingRef = useRef(false)

  const sendMessage = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim()
      if (trimmed === '' || isLoadingRef.current) return

      isLoadingRef.current = true
      setIsLoading(true)

      const userMessage = buildUserMessage(trimmed)
      setMessages((prev) => [...prev, userMessage])

      try {
        const response = await generateText(DEFAULT_USER_ID, trimmed)
        setMessages((prev) => [
          ...prev,
          buildAssistantMessage(response.generatedText, response.tokensUsed),
        ])
        await Promise.resolve(refreshQuota())
      } catch (e) {
        const errType = getThrownErrorType(e)

        if (errType === 'RATE_LIMIT') {
          const retryAfter = getRateLimitRetryAfter(e)
          triggerLimit(retryAfter)
          setMessages((prev) => [
            ...prev,
            buildErrorAssistantMessage(UI_RATE_LIMIT_MESSAGE),
          ])
        } else if (errType === 'QUOTA_EXCEEDED') {
          onQuotaExceeded()
          setMessages((prev) => [
            ...prev,
            buildErrorAssistantMessage(UI_QUOTA_EXCEEDED_MESSAGE),
          ])
        } else if (errType === 'ERROR') {
          const detail = getThrownErrorMessage(e)
          const text = detail
            ? `Ocurrió un error: ${detail}`
            : UI_GENERIC_ERROR_MESSAGE
          setMessages((prev) => [...prev, buildErrorAssistantMessage(text)])
        } else {
          setMessages((prev) => [
            ...prev,
            buildErrorAssistantMessage(UI_GENERIC_ERROR_MESSAGE),
          ])
        }
      } finally {
        isLoadingRef.current = false
        setIsLoading(false)
      }
    },
    [onQuotaExceeded, refreshQuota, triggerLimit],
  )

  return { messages, isLoading, sendMessage }
}
