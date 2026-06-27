import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Phone, CalendarDays, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/auth.store'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phoneNumber: z.string().min(7, 'Enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { t } = useTranslation()
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await registerUser(data)
      navigate('/')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message ?? 'Registration failed'
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4 py-10 transition-colors">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/40">
              <CalendarDays size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">BookEasy</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            {t('auth.registerTitle')}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('auth.firstName')}
                placeholder="John"
                icon={<User size={16} />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label={t('auth.lastName')}
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label={t('auth.email')}
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t('auth.phone')}
              type="tel"
              placeholder="+1 234 567 890"
              icon={<Phone size={16} />}
              error={errors.phoneNumber?.message}
              {...register('phoneNumber')}
            />

            <Input
              label={t('auth.dateOfBirth')}
              type="date"
              icon={<Calendar size={16} />}
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />

            <Input
              label={t('auth.password')}
              type="password"
              placeholder="Min. 6 characters"
              icon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {serverError}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} size="lg" className="w-full mt-1">
              {isSubmitting ? t('auth.creating') : t('auth.createAccount')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('auth.alreadyAccount')}{' '}
            <Link
              to="/login"
              className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
            >
              {t('auth.signInInstead')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
