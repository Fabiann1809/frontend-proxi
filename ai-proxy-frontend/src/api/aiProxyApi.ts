import axios, { isAxiosError, type AxiosInstance } from 'axios'
import { BASE_URL } from '../constants'
import type {
  DailyUsage,
  ErrorResponse,
  GenerationRequest,
  GenerationResponse,
  QuotaStatus,
} from '../types'

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
})

function getRetryAfterSeconds(headers: Record<string, unknown> | undefined): number {
  if (!headers) return 60
  const raw =
    (headers['retry-after'] as string | undefined) ??
    (headers['Retry-After'] as string | undefined)
  if (raw == null || raw === '') return 60

  const asInt = parseInt(String(raw).trim(), 10)
  if (!Number.isNaN(asInt) && String(asInt) === String(raw).trim()) {
    return asInt
  }

  const asDate = Date.parse(String(raw))
  if (!Number.isNaN(asDate)) {
    return Math.max(0, Math.ceil((asDate - Date.now()) / 1000))
  }

  return 60
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const msg = (data as ErrorResponse).message
    if (typeof msg === 'string' && msg.trim() !== '') return msg
  }
  return fallback
}

function handleAxiosError(error: unknown): never {
  if (isAxiosError(error) && error.response) {
    const { status, data, headers } = error.response

    if (status === 429) {
      const retryAfter = getRetryAfterSeconds(headers as Record<string, unknown>)
      throw { type: 'RATE_LIMIT', retryAfter }
    }

    if (status === 402) {
      throw { type: 'QUOTA_EXCEEDED' }
    }

    const message = getErrorMessage(
      data,
      typeof error.message === 'string' ? error.message : 'Request failed',
    )
    throw { type: 'ERROR', message }
  }

  if (isAxiosError(error)) {
    const message =
      typeof error.message === 'string' ? error.message : 'Request failed'
    throw { type: 'ERROR', message }
  }

  throw {
    type: 'ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
  }
}

export async function generateText(
  userId: string,
  prompt: string,
): Promise<GenerationResponse> {
  try {
    const body: GenerationRequest = { userId, prompt }
    const { data } = await client.post<GenerationResponse>(
      '/api/ai/generate',
      body,
    )
    return data
  } catch (e) {
    handleAxiosError(e)
  }
}

export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  try {
    const { data } = await client.get<QuotaStatus>('/api/quota/status', {
      params: { userId },
    })
    return data
  } catch (e) {
    handleAxiosError(e)
  }
}

export async function getQuotaHistory(userId: string): Promise<DailyUsage[]> {
  try {
    const { data } = await client.get<DailyUsage[]>('/api/quota/history', {
      params: { userId },
    })
    return data
  } catch (e) {
    handleAxiosError(e)
  }
}

export async function upgradePlan(
  userId: string,
  plan: string,
): Promise<QuotaStatus> {
  try {
    const { data } = await client.post<QuotaStatus>('/api/quota/upgrade', undefined, {
      params: { userId, plan },
    })
    return data
  } catch (e) {
    handleAxiosError(e)
  }
}
