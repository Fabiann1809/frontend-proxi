import { Crown, Star, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onUpgrade: (plan: string) => void
  currentPlan: string
}

const PLANS = [
  {
    id: 'PRO',
    label: 'Pro',
    price: '$9.99/mo',
    tokens: '500k tokens',
    rate: '60 req/min',
    icon: Star,
    buttonClass: 'bg-blue-600 hover:bg-blue-500',
    badgeClass: 'bg-blue-500/20 text-blue-400',
  },
  {
    id: 'ENTERPRISE',
    label: 'Enterprise',
    price: '$49.99/mo',
    tokens: 'Unlimited tokens',
    rate: 'Unlimited req/min',
    icon: Crown,
    buttonClass: 'bg-violet-600 hover:bg-violet-500',
    badgeClass: 'bg-violet-500/20 text-violet-400',
  },
]

export function UpgradeModal({ isOpen, onClose, onUpgrade, currentPlan }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  if (!isOpen) return null

  const visiblePlans = currentPlan === 'FREE' ? PLANS : PLANS.filter((p) => p.id === 'ENTERPRISE')

  const handleConfirm = () => {
    if (!selected) return
    onUpgrade(selected)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Quota Exceeded</h2>
        <p className="text-gray-400 text-sm mb-6">
          You have used all the tokens available in your current plan this month. Upgrade to
          continue generating.
        </p>

        <div className="space-y-3 mb-6">
          {visiblePlans.map((plan) => {
            const Icon = plan.icon
            const isSelected = selected === plan.id

            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-700/40 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${plan.badgeClass}`}>
                      <Icon size={14} />
                    </span>
                    <span className="text-white font-semibold">{plan.label}</span>
                  </div>
                  <span className="text-white font-bold">{plan.price}</span>
                </div>
                <p className="text-gray-400 text-xs">
                  {plan.tokens} · {plan.rate}
                </p>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected}
          className={`w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all ${
            selected
              ? visiblePlans.find((p) => p.id === selected)?.buttonClass ?? 'bg-blue-600 hover:bg-blue-500'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Simulate Payment
        </button>
      </div>
    </div>
  )
}
