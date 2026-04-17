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
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-80 shrink-0 bg-gray-800 border-r border-gray-700/50 flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-700/50">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">AI Proxy Platform</h1>
              <p className="text-xs text-gray-400">Unified AI Gateway</p>
            </div>
          </div>
          {quotaStatus && <PlanBadge plan={quotaStatus.plan} />}
        </div>

        {/* Quota info */}
        <div className="px-5 py-4 space-y-4 border-b border-gray-700/50">
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
              <div className="h-4 bg-gray-700 rounded animate-pulse" />
              <div className="h-2 bg-gray-700 rounded animate-pulse" />
              <div className="h-10 bg-gray-700 rounded-xl animate-pulse" />
            </div>
          )}
        </div>

        {/* Usage chart */}
        <div className="px-5 py-4 flex-1">
          <button
            onClick={() => setShowChart((v) => !v)}
            className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-200 transition-colors mb-3"
          >
            <span className="flex items-center gap-1.5">
              <BarChart2 size={12} />
              Usage history (7 days)
            </span>
            {showChart ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showChart && <UsageChart history={history} />}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-6 py-4 border-b border-gray-700/50 bg-gray-900 shrink-0">
          <h2 className="text-base font-semibold text-gray-100">AI Generation</h2>
          <p className="text-xs text-gray-500">Powered by the proxy chain</p>
        </header>

        {/* Chat */}
        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          isRateLimited={isLimited}
          secondsRemaining={secondsRemaining}
        />
      </main>

      {/* Upgrade modal */}
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
