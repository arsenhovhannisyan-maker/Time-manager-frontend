import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <CalendarDays size={15} className="text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-white">BookEasy</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link
              to="/organizations"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t('nav.findServices')}
            </Link>
            <Link
              to="/appointments"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t('nav.myAppointments')}
            </Link>
          </div>

          <p className="text-sm text-slate-400 dark:text-slate-500">
            © 2026 BookEasy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
