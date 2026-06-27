import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowRight, Star, Clock, MapPin, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { categoriesApi } from '../api/categories.api'
import { organizationsApi } from '../api/organizations.api'
import { PageSpinner } from '../components/ui/Spinner'
import { Layout } from '../components/layout/Layout'
import { HeroCanvas } from '../components/ui/HeroCanvas'
import { useScrollReveal } from '../hooks/useScrollReveal'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:7777'

function buildLogoUrl(logo: string): string {
  if (logo.startsWith('http')) return logo
  return `${BASE_URL}${logo}`
}

const CATEGORY_ICONS: Record<string, string> = {
  dentistry: '🦷',
  beauty: '💅',
  barbershop: '✂️',
  spa: '🧖',
  fitness: '💪',
  medical: '🏥',
  psychology: '🧠',
  massage: '💆',
}

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, emoji] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return emoji
  }
  return '🏢'
}

function StatsSection() {
  const { t } = useTranslation()
  const ref = useScrollReveal()
  return (
    <section ref={ref} className="reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
      <div className="grid grid-cols-3 gap-4 md:gap-8 py-8">
        {[
          { value: '500+', label: t('home.statsSpecialists') },
          { value: '50+', label: t('home.statsServices') },
          { value: '10k+', label: t('home.statsBookings') },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categoriesRef = useScrollReveal()
  const orgsRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  const { data: orgsData, isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations', { categoryId: selectedCategory, limit: 8 }],
    queryFn: () =>
      organizationsApi.list({ limit: 8, categoryId: selectedCategory ?? undefined }),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/organizations?search=${encodeURIComponent(search)}`)
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800">
        <HeroCanvas />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-sm font-medium mb-6">
              <Sparkles size={14} />
              {t('home.badge')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              {t('home.title')}{' '}
              <span className="text-violet-200">{t('home.titleAccent')}</span>
            </h1>
            <p className="text-lg text-violet-100 mb-10 max-w-xl mx-auto">
              {t('home.subtitle')}
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex gap-2 max-w-xl mx-auto bg-white rounded-2xl p-2 shadow-2xl shadow-violet-900/30"
            >
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('home.searchPlaceholder')}
                  className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:from-violet-700 hover:to-indigo-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                {t('home.search')}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Wave — adapts to dark mode page background */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
              className="fill-slate-50 dark:fill-slate-900"
            />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section
          ref={categoriesRef}
          className="reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('home.browseCategory')}
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                !selectedCategory
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {t('home.all')}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`
                  flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border
                  transition-all cursor-pointer text-center min-w-[90px]
                  ${
                    selectedCategory === cat.id
                      ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                  }
                `}
              >
                <span className="text-2xl">{cat.icon ?? getCategoryEmoji(cat.name)}</span>
                <span className="text-xs font-semibold leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Organizations */}
      <section
        ref={orgsRef}
        className="reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {selectedCategory ? t('home.filteredServices') : t('home.popularServices')}
          </h2>
          <button
            onClick={() => navigate('/organizations')}
            className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 cursor-pointer"
          >
            {t('home.viewAll')} <ArrowRight size={14} />
          </button>
        </div>

        {orgsLoading ? (
          <PageSpinner />
        ) : orgsData?.items.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <p className="text-lg font-medium">{t('home.noServices')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 reveal-stagger">
            {orgsData?.items.map((org) => (
              <button
                key={org.id}
                onClick={() => navigate(`/organizations/${org.id}`)}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-violet-900/20 hover:border-violet-200 dark:hover:border-violet-600 transition-all text-left cursor-pointer overflow-hidden"
              >
                <div className="h-36 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 relative overflow-hidden">
                  {org.logo ? (
                    <img
                      src={buildLogoUrl(org.logo)}
                      alt={org.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl">
                      {org.category ? getCategoryEmoji(org.category.name) : '🏢'}
                    </div>
                  )}
                  {org.bookingMode === 'auto' && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {t('home.instant')}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors text-sm leading-tight mb-1">
                    {org.name}
                  </h3>
                  {org.category && (
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-2">
                      {org.category.name}
                    </p>
                  )}
                  {org.address && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                      <MapPin size={11} />
                      <span className="truncate">{org.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      4.8
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {t('home.availableToday')}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="reveal bg-gradient-to-r from-violet-600 to-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('home.ctaTitle')}</h2>
          <p className="text-violet-200 mb-8">{t('home.ctaSubtitle')}</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-violet-700 font-semibold px-8 py-3.5 rounded-2xl hover:bg-violet-50 transition-colors shadow-lg cursor-pointer"
          >
            {t('home.ctaButton')}
          </button>
        </div>
      </section>
    </Layout>
  )
}
