import { useCallback, useEffect, useRef, useState } from 'react'

export function useRateLimit() {
  const [isLimited, setIsLimited] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  const triggerLimit = useCallback(
    (retryAfterSeconds: number) => {
      clearTimer()

      const seconds = Math.max(0, Math.floor(retryAfterSeconds))
      if (seconds === 0) {
        setIsLimited(false)
        setSecondsRemaining(0)
        return
      }

      setIsLimited(true)
      setSecondsRemaining(seconds)

      let remaining = seconds
      intervalRef.current = setInterval(() => {
        remaining -= 1
        setSecondsRemaining(remaining)
        if (remaining <= 0) {
          clearTimer()
          setIsLimited(false)
          setSecondsRemaining(0)
        }
      }, 1000)
    },
    [clearTimer],
  )

  return { isLimited, secondsRemaining, triggerLimit }
}
