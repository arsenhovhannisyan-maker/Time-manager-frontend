import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-8xl font-black text-slate-100 dark:text-slate-800 select-none">
          404
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white -mt-4">
          {t('common.notFound')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 max-w-sm">
          {t('common.notFoundMsg')}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t('common.back')}
          </Button>
          <Button onClick={() => navigate('/')}>{t('common.goHome')}</Button>
        </div>
      </div>
    </Layout>
  )
}
