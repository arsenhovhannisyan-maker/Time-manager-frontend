import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  User, Mail, Phone, Calendar, Lock, CheckCircle, Camera,
  Shield, CalendarDays, Edit3, AlertCircle, Eye, EyeOff,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/auth.store'
import { usersApi } from '../api/users.api'
import { appointmentsApi } from '../api/appointments.api'
import { Layout } from '../components/layout/Layout'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { fullName, initials } from '../utils/format'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:7777'

function buildAvatarUrl(src: string) {
  return src.startsWith('http') ? src : `${BASE_URL}${src}`
}

const profileSchema = z.object({
  firstName: z.string().min(2, 'Required'),
  lastName: z.string().min(2, 'Required'),
  email: z.string().email('Invalid email'),
  phoneNumber: z.string().min(7, 'Required'),
  dateOfBirth: z.string().min(1, 'Required'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match",
  })

type ProfileData = z.infer<typeof profileSchema>
type PasswordData = z.infer<typeof passwordSchema>

function passwordStrength(pwd: string): { level: number; label: string; color: string } {
  if (!pwd) return { level: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const map = [
    { level: 1, label: 'Weak', color: 'bg-red-400' },
    { level: 2, label: 'Fair', color: 'bg-orange-400' },
    { level: 3, label: 'Good', color: 'bg-yellow-400' },
    { level: 4, label: 'Strong', color: 'bg-green-500' },
  ]
  return map[Math.min(score, 4) - 1] ?? { level: 0, label: '', color: '' }
}

type Tab = 'info' | 'security'

export function ProfilePage() {
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [newPwdValue, setNewPwdValue] = useState('')

  const { data: apptData } = useQuery({
    queryKey: ['appointments-count'],
    queryFn: () => appointmentsApi.list({ limit: 1 }),
    enabled: !!user,
  })

  const {
    register: regP,
    handleSubmit: handleP,
    formState: { errors: errP, isDirty: profileDirty },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      dateOfBirth: user?.dateOfBirth?.slice(0, 10) ?? '',
    },
  })

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: errPwd },
  } = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) })

  const avatarMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: async () => { await refreshUser() },
  })

  const profileMutation = useMutation({
    mutationFn: (data: ProfileData) => usersApi.updateMe(data),
    onSuccess: async () => {
      await refreshUser()
      setProfileSuccess(true)
      setProfileError('')
      setTimeout(() => setProfileSuccess(false), 4000)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Update failed'
      setProfileError(typeof msg === 'string' ? msg : 'Update failed')
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordData) =>
      usersApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setPasswordSuccess(true)
      setPasswordError('')
      resetPwd()
      setNewPwdValue('')
      setTimeout(() => setPasswordSuccess(false), 4000)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed'
      setPasswordError(typeof msg === 'string' ? msg : 'Failed')
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    avatarMutation.mutate(file)
  }

  if (!user) return null

  const memberSince = user.createdAt ? format(parseISO(user.createdAt), 'MMMM yyyy') : ''
  const avatarSrc = avatarPreview ?? (user.avatarUrl ? buildAvatarUrl(user.avatarUrl) : null)
  const strength = passwordStrength(newPwdValue)

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-violet-700 via-indigo-700 to-violet-900 pb-24">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ring-4 ring-white/30 overflow-hidden shadow-2xl">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
                    {initials(user)}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarMutation.isPending}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-violet-700 flex items-center justify-center shadow-lg hover:bg-violet-50 transition-colors cursor-pointer border-2 border-violet-100"
              >
                {avatarMutation.isPending ? (
                  <div className="w-3.5 h-3.5 border-2 border-violet-300 border-t-violet-700 rounded-full animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name / meta */}
            <div className="text-center sm:text-left pb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{fullName(user)}</h1>
              <p className="text-violet-200 text-sm mt-0.5">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="px-2.5 py-0.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold rounded-full capitalize border border-white/20"
                  >
                    {t(`profile.roles.${role}` as Parameters<typeof t>[0]) || role.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="sm:ml-auto flex gap-6 sm:gap-8 pb-1">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{apptData?.total ?? '—'}</div>
                <div className="text-xs text-violet-300 mt-0.5">{t('appointments.title')}</div>
              </div>
              {memberSince && (
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{memberSince}</div>
                  <div className="text-xs text-violet-300 mt-0.5">{t('profile.memberSince')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-16">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/70 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b-2 border-slate-100 dark:border-slate-700 px-6 pt-2">
            {([
              { id: 'info', label: t('profile.personalInfo'), icon: User },
              { id: 'security', label: t('profile.security'), icon: Shield },
            ] as { id: Tab; label: string; icon: typeof User }[]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold -mb-0.5 border-b-2 transition-all cursor-pointer mr-1 ${
                  activeTab === id
                    ? 'border-violet-600 text-violet-700 dark:text-violet-400'
                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Personal Info */}
          {activeTab === 'info' && (
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('profile.personalInformation')}
                  </h2>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">
                    Update your name, email, and contact details
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                  <Edit3 size={12} />
                  Editable
                </div>
              </div>

              <form onSubmit={handleP((data) => profileMutation.mutate(data))} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label={t('profile.firstName')}
                    placeholder="John"
                    icon={<User size={15} />}
                    error={errP.firstName?.message}
                    {...regP('firstName')}
                  />
                  <Input
                    label={t('profile.lastName')}
                    placeholder="Doe"
                    error={errP.lastName?.message}
                    {...regP('lastName')}
                  />
                </div>

                <Input
                  label={t('profile.email')}
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail size={15} />}
                  error={errP.email?.message}
                  {...regP('email')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label={t('profile.phone')}
                    type="tel"
                    placeholder="+1 234 567 890"
                    icon={<Phone size={15} />}
                    error={errP.phoneNumber?.message}
                    {...regP('phoneNumber')}
                  />
                  <Input
                    label={t('profile.dateOfBirth')}
                    type="date"
                    icon={<Calendar size={15} />}
                    error={errP.dateOfBirth?.message}
                    {...regP('dateOfBirth')}
                  />
                </div>

                {profileError && (
                  <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{profileError}</p>
                  </div>
                )}
                {profileSuccess && (
                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      Profile updated successfully!
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    Last updated:{' '}
                    {user.updatedAt ? format(parseISO(user.updatedAt), 'MMM d, yyyy') : '—'}
                  </p>
                  <Button
                    type="submit"
                    loading={profileMutation.isPending}
                    disabled={!profileDirty}
                    size="md"
                  >
                    {profileMutation.isPending ? t('profile.saving') : t('profile.saveChanges')}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Security */}
          {activeTab === 'security' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t('profile.changePassword')}
                </h2>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">
                  Choose a strong password to keep your account safe
                </p>
              </div>

              <div className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl px-4 py-3 mb-6">
                <Shield size={16} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  {t('profile.securityTip')}
                </p>
              </div>

              <form
                onSubmit={handlePwd((data) => passwordMutation.mutate(data))}
                className="space-y-5 max-w-md"
              >
                {/* Current password */}
                <div className="relative">
                  <Input
                    label={t('profile.currentPassword')}
                    type={showCurrentPwd ? 'text' : 'password'}
                    placeholder="Your current password"
                    icon={<Lock size={15} />}
                    error={errPwd.currentPassword?.message}
                    {...regPwd('currentPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd((v) => !v)}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* New password */}
                <div>
                  <div className="relative">
                    <Input
                      label={t('profile.newPassword')}
                      type={showNewPwd ? 'text' : 'password'}
                      placeholder="Choose a new password"
                      icon={<Lock size={15} />}
                      error={errPwd.newPassword?.message}
                      {...regPwd('newPassword', {
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewPwdValue(e.target.value),
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd((v) => !v)}
                      className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {newPwdValue && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              n <= strength.level ? strength.color : 'bg-slate-100 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p
                          className={`text-xs font-medium ${
                            strength.level <= 1
                              ? 'text-red-500'
                              : strength.level === 2
                                ? 'text-orange-500'
                                : strength.level === 3
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                          }`}
                        >
                          {strength.label} password
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <Input
                  label={t('profile.confirmPassword')}
                  type="password"
                  placeholder="Repeat your new password"
                  icon={<Lock size={15} />}
                  error={errPwd.confirmPassword?.message}
                  {...regPwd('confirmPassword')}
                />

                {passwordError && (
                  <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{passwordError}</p>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      Password changed successfully!
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <Button type="submit" loading={passwordMutation.isPending}>
                    {passwordMutation.isPending ? t('profile.updating') : t('profile.updatePassword')}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
