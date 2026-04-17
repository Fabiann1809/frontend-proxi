import { useCallback, useEffect, useState } from 'react'
import {
  getQuotaHistory,
  getQuotaStatus,
  upgradePlan as requestPlanUpgrade,
} from '../api/aiProxyApi'
import { DEFAULT_USER_ID } from '../constants'
import type { DailyUsage, QuotaStatus } from '../types'

async function fetchQuotaData(): Promise<{ status: QuotaStatus; history: DailyUsage[] }> {
  const [status, history] = await Promise.all([
    getQuotaStatus(DEFAULT_USER_ID),
    getQuotaHistory(DEFAULT_USER_ID),
  ])
  return { status, history }
}

export function useQuota() {
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [history, setHistory] = useState<DailyUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshQuota = useCallback(async () => {
    try {
      setError(null)
      const { status, history: hist } = await fetchQuotaData()
      setQuotaStatus(status)
      setHistory(hist)
    } catch (e) {
      console.error('useQuota: refresh failed', e)
      setError('Failed to refresh quota')
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { status, history: hist } = await fetchQuotaData()
        if (!cancelled) {
          setQuotaStatus(status)
          setHistory(hist)
        }
      } catch (e) {
        console.error('useQuota: initial load failed', e)
        if (!cancelled) {
          setError('Failed to load quota data')
          setQuotaStatus(null)
          setHistory([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const upgradePlan = useCallback(
    async (plan: string) => {
      try {
        setError(null)
        await requestPlanUpgrade(DEFAULT_USER_ID, plan)
        await refreshQuota()
      } catch (e) {
        console.error('useQuota: upgrade failed', e)
        setError('Failed to upgrade plan')
      }
    },
    [refreshQuota],
  )

  return {
    quotaStatus,
    history,
    loading,
    error,
    refreshQuota,
    upgradePlan,
  }
}
