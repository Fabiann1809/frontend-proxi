const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined

export const BASE_URL =
  rawApiUrl && rawApiUrl.trim() !== '' ? rawApiUrl.trim() : 'http://localhost:8080'

export const DEFAULT_USER_ID = 'user-demo-01'

export const PLAN_COLORS = {
  FREE: '#eab308',
  PRO: '#2563eb',
  ENTERPRISE: '#9333ea',
} as const
