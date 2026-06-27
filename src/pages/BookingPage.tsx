import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ArrowLeft, Clock, DollarSign, Calendar, CheckCircle, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react'
import { format, isBefore, startOfDay, addMonths, subMonths } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { employeesApi } from '../api/employees.api'
import { schedulesApi } from '../api/schedules.api'
import { appointmentsApi } from '../api/appointments.api'
import { Layout } from '../components/layout/Layout'
import { PageSpinner } from '../components/ui/Spinner'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { formatPrice, formatDuration, fullName, initials } from '../utils/format'
import { formatTime, toISODate, generateCalendarDays } from '../utils/date'
import { useAuth } from '../store/auth.store'
import type { Service } from '../types'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function BookingPage() {
  const { t } = useTranslation()
  const { orgId, employeeId } = useParams<{ orgId: string; employeeId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())

  const { data: employee, isLoading: empLoading } = useQuery({
    queryKey: ['employee', orgId, employeeId],
    queryFn: () => employeesApi.get(orgId!, employeeId!),
    enabled: !!orgId && !!employeeId,
  })

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['employee-services', orgId, employeeId],
    queryFn: () => employeesApi.services(orgId!, employeeId!),
    enabled: !!orgId && !!employeeId,
  })

  const dateStr = selectedDate ? toISODate(selectedDate) : ''

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', orgId, employeeId, dateStr, selectedService?.id],
    queryFn: () => schedulesApi.slots(orgId!, employeeId!, dateStr, selectedService!.id),
    enabled: !!selectedDate && !!selectedService,
  })

  const bookMutation = useMutation({
    mutationFn: () =>
      appointmentsApi.create({
        organizationId: orgId!,
        employeeId: employeeId!,
        serviceId: selectedService!.id,
        date: dateStr,
        startTime: selectedSlot!,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      setConfirmOpen(false)
      setSuccessOpen(true)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ??
        'Booking failed. Please try again.'
      setBookingError(Array.isArray(msg) ? msg.join(', ') : msg)
    },
  })

  const calendarDays = useMemo(
    () => generateCalendarDays(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth],
  )

  const today = startOfDay(new Date())

  const handleDateClick = (day: Date) => {
    if (isBefore(day, today)) return
    if (day.getMonth() !== calendarMonth.getMonth()) return
    setSelectedDate(day)
    setSelectedSlot(null)
  }

  const handleConfirmBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }
    setBookingError('')
    setConfirmOpen(true)
  }

  if (empLoading || servicesLoading) return <Layout><PageSpinner /></Layout>
  if (!employee)
    return (
      <Layout>
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          Employee not found
        </div>
      </Layout>
    )

  const step = !selectedService ? 1 : !selectedDate ? 2 : !selectedSlot ? 3 : 4

  const stepLabels = [
    t('booking.step1'),
    t('booking.step2'),
    t('booking.step3'),
    t('booking.step4'),
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(`/organizations/${orgId}`)}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          {t('booking.back')}
        </button>

        {/* Employee header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <Avatar src={employee.user.avatarUrl} initials={initials(employee.user)} size="xl" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {fullName(employee.user)}
              </h1>
              {employee.experienceYears && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  {t('booking.yearsExperience', { n: employee.experienceYears })}
                </p>
              )}
              {employee.bio && (
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-lg leading-relaxed">
                  {employee.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1 last:flex-initial">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > i + 1
                      ? 'bg-green-500 text-white'
                      : step === i + 1
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    step === i + 1
                      ? 'text-violet-700 dark:text-violet-400'
                      : step > i + 1
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < 3 && (
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Steps */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Step 1: Service selection */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                {t('booking.selectService')}
              </h2>
              {!services || services.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  No services assigned to this specialist.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {services.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => {
                        setSelectedService(svc)
                        setSelectedDate(null)
                        setSelectedSlot(null)
                      }}
                      className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedService?.id === svc.id
                          ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 shadow-sm shadow-violet-100 dark:shadow-none'
                          : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                          {svc.name}
                        </div>
                        {svc.description && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {svc.description}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                            <Clock size={11} />
                            {formatDuration(svc.durationMinutes)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-violet-700 dark:text-violet-400 flex-shrink-0 ml-4">
                        <DollarSign size={14} />
                        {formatPrice(svc.price)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Calendar */}
            {selectedService && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  {t('booking.chooseDate')}
                </h2>

                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCalendarMonth((m) => subMonths(m, 1))}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
                  </button>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {format(calendarMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-2">
                  {WEEKDAYS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    const isCurrentMonth = day.getMonth() === calendarMonth.getMonth()
                    const isPast = isBefore(day, today)
                    const isSelected =
                      selectedDate && toISODate(selectedDate) === toISODate(day)
                    const isToday = toISODate(day) === toISODate(today)

                    return (
                      <button
                        key={i}
                        onClick={() => handleDateClick(day)}
                        disabled={isPast || !isCurrentMonth}
                        className={`
                          h-9 w-full rounded-lg text-sm font-medium transition-all cursor-pointer
                          ${!isCurrentMonth ? 'text-slate-200 dark:text-slate-700' : ''}
                          ${isPast && isCurrentMonth ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : ''}
                          ${isSelected ? 'bg-violet-600 text-white shadow-sm' : ''}
                          ${!isSelected && !isPast && isCurrentMonth ? 'hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 text-slate-700 dark:text-slate-300' : ''}
                          ${isToday && !isSelected ? 'ring-2 ring-violet-300 dark:ring-violet-600 text-violet-700 dark:text-violet-400' : ''}
                        `}
                      >
                        {day.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Time slots */}
            {selectedDate && selectedService && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  {t('booking.pickTime')}
                  <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">
                    — {format(selectedDate, 'EEEE, MMMM d')}
                  </span>
                </h2>

                {slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
                  </div>
                ) : !slots || slots.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar size={32} className="text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      {t('booking.noSlots')}
                    </p>
                    <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                      {t('booking.noSlotsHint')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.startTime}
                        onClick={() => setSelectedSlot(slot.startTime)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium text-center transition-all cursor-pointer ${
                          selectedSlot === slot.startTime
                            ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400 border border-slate-100 dark:border-slate-600'
                        }`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 sticky top-24">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                {t('booking.confirm')}
              </h3>

              {selectedService ? (
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 dark:text-slate-400">{t('booking.service')}</span>
                    <span className="font-medium text-slate-900 dark:text-white text-right">
                      {selectedService.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 dark:text-slate-400">{t('booking.duration2')}</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatDuration(selectedService.durationMinutes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 dark:text-slate-400">{t('booking.price')}</span>
                    <span className="font-semibold text-violet-700 dark:text-violet-400">
                      {formatPrice(selectedService.price)}
                    </span>
                  </div>

                  {selectedDate && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 dark:text-slate-400">{t('booking.date')}</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {format(selectedDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}

                  {selectedSlot && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 dark:text-slate-400">{t('booking.time')}</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatTime(selectedSlot)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-700 pt-3 mt-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                      {t('booking.notesPlaceholder')}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests..."
                      rows={3}
                      className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 outline-none focus:border-violet-400 dark:focus:border-violet-500 focus:ring-3 focus:ring-violet-100 dark:focus:ring-violet-900/40 resize-none transition-all"
                    />
                  </div>

                  <Button
                    onClick={handleConfirmBooking}
                    disabled={!selectedSlot}
                    size="lg"
                    className="w-full mt-2"
                  >
                    {isAuthenticated ? t('booking.confirmButton') : t('nav.signIn')}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                      You need to sign in to book an appointment
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar size={32} className="text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Select a service to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title={t('booking.confirm')}>
        <div className="flex flex-col gap-4">
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('booking.bookingFor')}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {employee && fullName(employee.user)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('booking.service')}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {selectedService?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('booking.date')}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('booking.time')}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {selectedSlot ? formatTime(selectedSlot) : ''}
              </span>
            </div>
            <div className="flex justify-between border-t border-violet-100 dark:border-violet-800 pt-2 mt-1">
              <span className="text-slate-500 dark:text-slate-400">{t('booking.price')}</span>
              <span className="font-bold text-violet-700 dark:text-violet-400">
                {selectedService ? formatPrice(selectedService.price) : ''}
              </span>
            </div>
          </div>

          {bookingError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{bookingError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              className="flex-1"
            >
              {t('appointments.cancel')}
            </Button>
            <Button
              onClick={() => bookMutation.mutate()}
              loading={bookMutation.isPending}
              className="flex-1"
            >
              {t('booking.confirmButton')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false)
          navigate('/appointments')
        }}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {t('booking.successTitle')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t('booking.successMsg')}</p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setSuccessOpen(false)
                navigate(`/organizations/${orgId}`)
              }}
              className="flex-1"
            >
              {t('orgDetail.back')}
            </Button>
            <Button
              onClick={() => {
                setSuccessOpen(false)
                navigate('/appointments')
              }}
              className="flex-1"
            >
              {t('booking.viewAppointments')}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
