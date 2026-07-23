import { Search, CalendarClock, CheckCircle2, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'

export function AboutPage() {
  const { t } = useTranslation()

  const steps = [
    { icon: Search, title: t('about.step1Title'), text: t('about.step1Text') },
    { icon: CalendarClock, title: t('about.step2Title'), text: t('about.step2Text') },
    { icon: CheckCircle2, title: t('about.step3Title'), text: t('about.step3Text') },
  ]

  const whyItems = [t('about.why1'), t('about.why2'), t('about.why3'), t('about.why4')]

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Sparkles size={14} />
            ReminderMe
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{t('about.title')}</h1>
          <p className="mt-4 text-violet-100 max-w-2xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
        {/* Mission */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {t('about.missionTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('about.missionText')}
          </p>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5 text-center">
            {t('about.howItWorksTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                  <step.icon size={22} className="text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why us */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
            {t('about.whyTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
