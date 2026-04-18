import { Crown, Star, Zap } from 'lucide-react'

interface Props {
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
}

const CONFIG = {
  FREE: {
    icon: Zap,
    label: 'FREE',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  PRO: {
    icon: Star,
    label: 'PRO',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  ENTERPRISE: {
    icon: Crown,
    label: 'ENTERPRISE',
    className: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
}

export function PlanBadge({ plan }: Props) {
  const { icon: Icon, label, className } = CONFIG[plan]

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold tracking-wide uppercase ${className}`}
    >
      <Icon size={11} />
      {label}
    </span>
  )
}
