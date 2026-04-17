interface Props {
  requestsThisMinute: number
  requestsLimit: number
  isLimited: boolean
  secondsRemaining: number
  plan: string
}

export function RateLimitCounter({
  requestsThisMinute,
  requestsLimit,
  isLimited,
  secondsRemaining,
  plan,
}: Props) {
  if (plan === 'ENTERPRISE') {
    return (
      <div className="rounded-xl bg-gray-700/40 px-3 py-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Rate limit</span>
          <span className="text-violet-400 font-medium">Unlimited</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-700">
          <div className="h-full bg-violet-500 w-full rounded-full" />
        </div>
      </div>
    )
  }

  const pct = requestsLimit > 0 ? Math.min((requestsThisMinute / requestsLimit) * 100, 100) : 0
  const barColor = isLimited ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-blue-500'

  if (isLimited) {
    return (
      <div className="rounded-xl bg-red-900/30 border border-red-700/40 px-3 py-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-red-400 font-medium">Rate limit active</span>
          <span className="text-red-300">Reset in {secondsRemaining}s</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
          <div className="h-full bg-red-500 w-full rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gray-700/40 px-3 py-2">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Req / min</span>
        <span className="text-gray-300">
          {requestsThisMinute} / {requestsLimit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
