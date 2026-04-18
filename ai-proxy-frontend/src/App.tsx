import { BarChart2, Bot, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { ChatInput } from './components/chat/ChatInput'
import { ChatWindow } from './components/chat/ChatWindow'
import { UpgradeModal } from './components/modals/UpgradeModal'
import { PlanBadge } from './components/quota/PlanBadge'
import { QuotaBar } from './components/quota/QuotaBar'
import { RateLimitCounter } from './components/quota/RateLimitCounter'
import { UsageChart } from './components/quota/UsageChart'
import { useChat } from './hooks/useChat'
import { useQuota } from './hooks/useQuota'
import { useRateLimit } from './hooks/useRateLimit'

function App() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showChart, setShowChart] = useState(true)

  const { quotaStatus, history, refreshQuota, upgradePlan } = useQuota()
  const { isLimited, secondsRemaining, triggerLimit } = useRateLimit()
  const { messages, isLoading, sendMessage } = useChat({
    refreshQuota,
    triggerLimit,
    onQuotaExceeded: () => setShowUpgradeModal(true),
  })

  const handleUpgrade = async (plan: string) => {
    await upgradePlan(plan)
    setShowUpgradeModal(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-gray-700/50 bg-gray-800">
        <div className="border-b border-gray-700/50 px-5 py-5">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-white">AI Proxy Platform</h1>
              <p className="text-xs text-gray-400">Unified AI Gateway</p>
            </div>
          </div>
          {quotaStatus ? <PlanBadge plan={quotaStatus.plan} /> : null}
        </div>

        <div className="space-y-4 border-b border-gray-700/50 px-5 py-4">
          {quotaStatus ? (
            <>
              <QuotaBar
                tokensUsed={quotaStatus.tokensUsed}
                totalTokens={quotaStatus.totalTokens}
                tokensRemaining={quotaStatus.tokensRemaining}
                plan={quotaStatus.plan}
              />
              <RateLimitCounter
                requestsThisMinute={quotaStatus.requestsThisMinute}
                requestsLimit={quotaStatus.requestsLimit}
                isLimited={isLimited}
                secondsRemaining={secondsRemaining}
                plan={quotaStatus.plan}
              />
            </>
          ) : (
            <div className="space-y-2">
              <div className="h-4 animate-pulse rounded bg-gray-700" />
              <div className="h-2 animate-pulse rounded bg-gray-700" />
              <div className="h-10 animate-pulse rounded-xl bg-gray-700" />
            </div>
          )}
        </div>

        <div className="flex-1 px-5 py-4">
          <button
            type="button"
            onClick={() => setShowChart((v) => !v)}
            className="mb-3 flex w-full items-center justify-between text-xs text-gray-400 transition-colors hover:text-gray-200"
          >
            <span className="flex items-center gap-1.5">
              <BarChart2 size={12} />
              Usage history (7 days)
            </span>
            {showChart ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showChart ? <UsageChart history={history} /> : null}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-gray-700/50 bg-gray-900 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-100">AI Generation</h2>
          <p className="text-xs text-gray-500">Powered by the proxy chain</p>
        </header>

        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput
          onSend={(prompt) => void sendMessage(prompt)}
          isLoading={isLoading}
          isRateLimited={isLimited}
          secondsRemaining={secondsRemaining}
        />
      </main>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        currentPlan={quotaStatus?.plan ?? 'FREE'}
      />
    </div>
  )
}

export default App
