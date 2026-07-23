import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t, i18n } = useTranslation()
  const year = new Date().getFullYear()

  const setLang = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <CalendarDays size={15} className="text-white" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">ReminderMe</span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          {/* For users */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              {t('footer.usersTitle')}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/organizations" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.findServices')}
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.myAppointments')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              {t('footer.companyTitle')}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Language */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              {t('footer.language')}
            </h3>
            <div className="flex gap-1.5">
              {[
                { code: 'en', flag: '🇬🇧' },
                { code: 'ru', flag: '🇷🇺' },
              ].map((lng) => (
                <button
                  key={lng.code}
                  onClick={() => setLang(lng.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    i18n.language === lng.code
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lng.flag} {lng.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            © {year} ReminderMe. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
