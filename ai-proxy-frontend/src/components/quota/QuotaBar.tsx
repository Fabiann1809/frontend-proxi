interface Props {
  tokensUsed: number
  totalTokens: number
  tokensRemaining: number
  plan: string
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

export function QuotaBar({ tokensUsed, totalTokens, tokensRemaining, plan }: Props) {
  if (plan === 'ENTERPRISE') {
    return (
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Monthly tokens</span>
          <span className="text-violet-400 font-medium">Unlimited</span>
        </div>
        <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 w-full" />
        </div>
      </div>
    )
  }

  const pct = totalTokens > 0 ? Math.min((tokensUsed / totalTokens) * 100, 100) : 0
  const barColor =
    pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
        <span>Monthly tokens</span>
        <span className="text-gray-300">
          {formatNumber(tokensUsed)} / {formatNumber(totalTokens)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{formatNumber(tokensRemaining)} remaining</p>
    </div>
  )
}
