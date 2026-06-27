import type { AppointmentStatus } from '../../types'

interface Props {
  status: AppointmentStatus
}

const config: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-green-50 text-green-700 border border-green-200' },
  REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-700 border border-red-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  COMPLETED: { label: 'Completed', className: 'bg-violet-50 text-violet-700 border border-violet-200' },
  NO_SHOW: { label: 'No Show', className: 'bg-orange-50 text-orange-700 border border-orange-200' },
}

export function StatusBadge({ status }: Props) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}

interface TagProps {
  children: React.ReactNode
  color?: 'violet' | 'teal' | 'slate'
}

export function Tag({ children, color = 'violet' }: TagProps) {
  const colors = {
    violet: 'bg-violet-50 text-violet-700',
    teal: 'bg-teal-50 text-teal-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}
