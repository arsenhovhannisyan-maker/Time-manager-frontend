import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin, Phone, Mail, Clock, Star, ArrowLeft, User, Briefcase, ChevronRight, AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { organizationsApi } from '../api/organizations.api'
import { employeesApi } from '../api/employees.api'
import { Layout } from '../components/layout/Layout'
import { PageSpinner } from '../components/ui/Spinner'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Tag } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { fullName, initials } from '../utils/format'
import { useScrollReveal } from '../hooks/useScrollReveal'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:7777'

function buildLogoUrl(logo: string): string {
  if (logo.startsWith('http')) return logo
  return `${BASE_URL}${logo}`
}

export function OrganizationDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const gridRef = useScrollReveal()

  const {
    data: org,
    isLoading: orgLoading,
    isError: orgError,
    refetch: refetchOrg,
  } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationsApi.get(id!),
    enabled: !!id,
  })

  const {
    data: employees,
    isLoading: empLoading,
    isError: empError,
    refetch: refetchEmployees,
  } = useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeesApi.list(id!),
    enabled: !!id,
  })

  if (orgLoading) return <Layout><PageSpinner /></Layout>

  if (orgError)
    return (
      <Layout>
        <EmptyState
          icon={<AlertCircle size={32} />}
          title={t('orgDetail.loadError')}
          description={t('orgDetail.loadErrorHint')}
          action={
            <Button variant="secondary" onClick={() => refetchOrg()}>
              {t('common.retry')}
            </Button>
          }
        />
      </Layout>
    )

  if (!org)
    return (
      <Layout>
        <EmptyState
          icon={<AlertCircle size={32} />}
          title={t('orgDetail.notFound')}
          description={t('orgDetail.notFoundHint')}
          action={
            <Button variant="secondary" onClick={() => navigate('/organizations')}>
              {t('common.goHome')}
            </Button>
          }
        />
      </Layout>
    )

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative h-20 md:h-24 bg-gradient-to-br from-violet-600 to-indigo-700 overflow-hidden">
        {org.logo && (
          <img
            src={buildLogoUrl(org.logo)}
            alt={org.name}
            className="w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-16">
        {/* Org Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex-shrink-0 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
              {org.logo ? (
                <img src={buildLogoUrl(org.logo)} alt={org.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🏢</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {org.name}
                </h1>
                {org.category && <Tag color="violet">{org.category.name}</Tag>}
                {org.bookingMode === 'auto' ? (
                  <Tag color="teal">{t('orgDetail.instantBook')}</Tag>
                ) : (
                  <Tag color="slate">{t('orgDetail.approvalRequired')}</Tag>
                )}
              </div>

              {org.description && (
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 max-w-2xl">
                  {org.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                {org.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-violet-500" />
                    {org.address}
                  </span>
                )}
                {org.phone && (
                  <a
                    href={`tel:${org.phone}`}
                    className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    <Phone size={15} className="text-violet-500" />
                    {org.phone}
                  </a>
                )}
                {org.email && (
                  <a
                    href={`mailto:${org.email}`}
                    className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    <Mail size={15} className="text-violet-500" />
                    {org.email}
                  </a>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 text-center hidden md:block">
              <div className="flex items-center gap-1 justify-center">
                <Star size={20} className="text-amber-400 fill-amber-400" />
                <span className="text-2xl font-bold text-slate-900 dark:text-white">4.8</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('orgDetail.basedOnReviews')}</p>
            </div>
          </div>
        </div>

        {/* Employees */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
            {t('orgDetail.ourSpecialists')}
          </h2>

          {empLoading ? (
            <PageSpinner />
          ) : empError ? (
            <EmptyState
              icon={<AlertCircle size={32} />}
              title={t('orgDetail.loadError')}
              description={t('orgDetail.loadErrorHint')}
              action={
                <Button variant="secondary" onClick={() => refetchEmployees()}>
                  {t('common.retry')}
                </Button>
              }
            />
          ) : !employees || employees.length === 0 ? (
            <EmptyState
              icon={<User size={32} />}
              title={t('orgDetail.noEmployees')}
              description=""
            />
          ) : (
            <div
              ref={gridRef}
              className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 reveal-stagger"
            >
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => navigate(`/organizations/${id}/employees/${emp.id}`)}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-violet-900/20 hover:border-violet-200 dark:hover:border-violet-600 transition-all text-left cursor-pointer p-5"
                >
                  <div className="flex items-start gap-4">
                    <Avatar src={emp.user.avatarUrl} initials={initials(emp.user)} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
                        {fullName(emp.user)}
                      </h3>
                      {emp.experienceYears && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <Briefcase size={11} />
                          {t('orgDetail.yearsExp', { n: emp.experienceYears })}
                        </div>
                      )}
                      {emp.bio && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {emp.bio}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-300 dark:text-slate-600 group-hover:text-violet-500 transition-colors flex-shrink-0 mt-1"
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                      <Clock size={11} />
                      {t('orgDetail.availableToday')}
                    </div>
                    <span className="text-slate-200 dark:text-slate-700">•</span>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Star size={11} className="fill-amber-400" />
                      4.9
                    </div>
                    <div className="ml-auto text-xs font-semibold text-violet-600 dark:text-violet-400">
                      {t('orgDetail.bookWith')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
