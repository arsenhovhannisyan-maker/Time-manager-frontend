import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Clock, MapPin, AlertCircle, ChevronDown, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { appointmentsApi } from '../api/appointments.api'
import { Layout } from '../components/layout/Layout'
import { PageSpinner } from '../components/ui/Spinner'
import { StatusBadge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Avatar } from '../components/ui/Avatar'
import { formatDate, formatTime } from '../utils/date'
import { fullName, initials, formatPrice, formatDuration } from '../utils/format'
import type { AppointmentStatus } from '../types'

export function AppointmentsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<AppointmentStatus | 'ALL'>('ALL')
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [page, setPage] = useState(1)

  const STATUS_TABS: { label: string; value: AppointmentStatus | 'ALL' }[] = [
    { label: t('appointments.all'), value: 'ALL' },
    { label: t('appointments.upcoming'), value: 'CONFIRMED' },
    { label: t('appointments.pending'), value: 'PENDING' },
    { label: t('appointments.completed'), value: 'COMPLETED' },
    { label: t('appointments.cancelled'), value: 'CANCELLED' },
  ]

  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointments', page],
    queryFn: () => appointmentsApi.list({ page, limit: 20 }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id, cancelReason || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setCancelId(null)
      setCancelReason('')
    },
  })

  const filtered =
    activeTab === 'ALL'
      ? data?.items ?? []
      : (data?.items ?? []).filter((a) => a.status === activeTab)

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('appointments.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('appointments.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.value
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <EmptyState
            icon={<AlertTriangle size={32} />}
            title={t('common.error')}
            description={t('appointments.noAppointmentsHint')}
            action={
              <Button variant="secondary" onClick={() => window.location.reload()}>
                {t('common.loading')}
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={32} />}
            title={t('appointments.noAppointments')}
            description={t('appointments.noAppointmentsHint')}
            action={
              <Button onClick={() => navigate('/organizations')}>
                {t('appointments.findServices')}
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((appt) => (
              <div
                key={appt.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
              >
                {/* Status bar */}
                <div
                  className={`h-1 ${
                    appt.status === 'CONFIRMED'
                      ? 'bg-green-500'
                      : appt.status === 'PENDING'
                        ? 'bg-amber-400'
                        : appt.status === 'COMPLETED'
                          ? 'bg-violet-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {appt.employee && (
                        <Avatar
                          src={appt.employee.user.avatarUrl}
                          initials={initials(appt.employee.user)}
                          size="md"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                            {appt.employee ? fullName(appt.employee.user) : 'Specialist'}
                          </h3>
                          <StatusBadge status={appt.status} />
                        </div>
                        {appt.service && (
                          <p className="text-xs text-violet-600 dark:text-violet-400 font-medium mt-0.5">
                            {appt.service.name}
                          </p>
                        )}
                        {appt.organization && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            <MapPin size={10} />
                            {appt.organization.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <CalendarDays size={12} className="text-violet-500" />
                        {formatDate(appt.date)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5 justify-end">
                        <Clock size={11} />
                        {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                      </div>
                    </div>
                  </div>

                  {appt.service && (
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDuration(appt.service.durationMinutes)}
                      </span>
                      <span className="font-semibold text-violet-600 dark:text-violet-400">
                        {formatPrice(appt.service.price)}
                      </span>
                    </div>
                  )}

                  {appt.cancelReason && (
                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                      <span className="font-medium">Reason:</span> {appt.cancelReason}
                    </div>
                  )}

                  {appt.notes && (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium">Notes:</span> {appt.notes}
                    </div>
                  )}

                  {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                    <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700 flex justify-end">
                      <button
                        onClick={() => setCancelId(appt.id)}
                        className="text-xs font-medium text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {t('appointments.cancel')}
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {data && Math.ceil(data.total / 20) > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {t('orgs.previousPage')}
                </button>
                <button
                  disabled={page >= Math.ceil(data.total / 20)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {t('orgs.nextPage')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={!!cancelId}
        onClose={() => {
          setCancelId(null)
          setCancelReason('')
        }}
        title={t('appointments.cancelTitle')}
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">
              Are you sure you want to cancel this appointment?
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              {t('appointments.cancelReason')}
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={t('appointments.cancelReasonPlaceholder')}
              rows={3}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:border-red-400 focus:ring-3 focus:ring-red-100 dark:focus:ring-red-900/30 resize-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setCancelId(null)
                setCancelReason('')
              }}
              className="flex-1"
            >
              {t('appointments.keepButton')}
            </Button>
            <Button
              variant="danger"
              loading={cancelMutation.isPending}
              onClick={() => cancelId && cancelMutation.mutate(cancelId)}
              className="flex-1"
            >
              {t('appointments.cancelButton')}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
