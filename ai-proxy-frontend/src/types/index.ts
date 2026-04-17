export interface GenerationRequest {
  userId: string
  prompt: string
}

export interface GenerationResponse {
  userId: string
  generatedText: string
  tokensUsed: number
  processingTimeMs: number
  timestamp: string
}

export interface QuotaStatus {
  userId: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  tokensUsed: number
  tokensRemaining: number
  totalTokens: number
  requestsThisMinute: number
  requestsLimit: number
  resetDate: string
  minuteResetAt: string
}

export interface DailyUsage {
  date: string
  tokensUsed: number
  requestCount: number
}

export interface ErrorResponse {
  status: number
  error: string
  message: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  tokensUsed?: number
  timestamp: Date
  error?: boolean
}
