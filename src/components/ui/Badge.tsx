import type { AppointmentStatus } from '../../types'

interface Props {
  status: AppointmentStatus
}

const config: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800',
  },
  NO_SHOW: {
    label: 'No Show',
    className: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
  },
}

export function StatusBadge({ status }: Props) {
  const { label, className } = config[status]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
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
    violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
    teal: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
    slate: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  )
}
