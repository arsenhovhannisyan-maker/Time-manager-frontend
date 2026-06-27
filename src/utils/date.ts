import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'

export function formatDate(date: string): string {
  return format(parseISO(date), 'MMMM d, yyyy')
}

export function formatDateShort(date: string): string {
  return format(parseISO(date), 'MMM d')
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m)
  return format(d, 'h:mm a')
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} at ${formatTime(time)}`
}

export function dateLabel(dateStr: string): string {
  const d = parseISO(dateStr)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'EEE, MMM d')
}

export function isDatePast(dateStr: string): boolean {
  return isPast(parseISO(dateStr))
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function generateCalendarDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // leading empty days (Mon-based: 0=Mon, 6=Sun)
  const startPad = (firstDay.getDay() + 6) % 7
  for (let i = 0; i < startPad; i++) {
    const d = new Date(year, month, 1 - startPad + i)
    days.push(d)
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }

  // trailing days to complete the last week
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i))
    }
  }

  return days
}
