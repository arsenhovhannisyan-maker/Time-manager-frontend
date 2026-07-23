import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, User, MessageSquare, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { contactApi } from '../api/contact.api'
import { Layout } from '../components/layout/Layout'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  subject: z.string().optional(),
  message: z.string().min(1, 'Required'),
})

type FormData = z.infer<typeof schema>

export function ContactPage() {
  const { t } = useTranslation()
  const [serverError, setServerError] = useState('')
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await contactApi.send(data)
      setSent(true)
      reset()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message ?? t('contact.errorFallback')
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {t('contact.title')}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">{t('contact.subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8">
          {sent ? (
            <div className="flex flex-col items-center text-center py-6 gap-3">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('contact.successTitle')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                {t('contact.successMsg')}
              </p>
              <Button variant="secondary" className="mt-2" onClick={() => setSent(false)}>
                {t('contact.sendAnother')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label={t('contact.name')}
                placeholder="John Doe"
                icon={<User size={16} />}
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label={t('contact.email')}
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={t('contact.subjectOptional')}
                placeholder=""
                error={errors.subject?.message}
                {...register('subject')}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('contact.message')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-400 dark:text-slate-500">
                    <MessageSquare size={16} />
                  </div>
                  <textarea
                    rows={5}
                    placeholder={t('contact.messagePlaceholder')}
                    className={`w-full rounded-xl border bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-200 dark:border-slate-700 outline-none focus:border-violet-400 dark:focus:border-violet-500 focus:ring-3 focus:ring-violet-100 dark:focus:ring-violet-900/40 transition-all duration-200 resize-none ${errors.message ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                    {...register('message')}
                  />
                </div>
                {errors.message && (
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.message.message}</p>
                )}
              </div>

              {serverError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {serverError}
                </div>
              )}

              <Button type="submit" loading={isSubmitting} size="lg" className="w-full mt-1">
                {isSubmitting ? t('contact.sending') : t('contact.send')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}
