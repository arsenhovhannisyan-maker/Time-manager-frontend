import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Clock, Star, Filter, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { categoriesApi } from '../api/categories.api'
import { organizationsApi } from '../api/organizations.api'
import { useDebounce } from '../hooks/useDebounce'
import { Layout } from '../components/layout/Layout'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useScrollReveal } from '../hooks/useScrollReveal'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:7777'

function buildLogoUrl(logo: string): string {
  if (logo.startsWith('http')) return logo
  return `${BASE_URL}${logo}`
}

const CATEGORY_ICONS: Record<string, string> = {
  dentistry: '🦷', beauty: '💅', barbershop: '✂️', spa: '🧖',
  fitness: '💪', medical: '🏥', psychology: '🧠', massage: '💆',
}

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, emoji] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return emoji
  }
  return '🏢'
}

export function OrganizationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 400)

  const gridRef = useScrollReveal()

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedCategory])

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['organizations', { search: debouncedSearch, categoryId: selectedCategory, page }],
    queryFn: () =>
      organizationsApi.list({
        search: debouncedSearch || undefined,
        categoryId: selectedCategory ?? undefined,
        page,
        limit: 12,
      }),
  })

  const totalPages = data ? Math.ceil(data.total / 12) : 1

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {t('orgs.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{t('orgs.subtitle')}</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('orgs.searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-violet-400 dark:focus:border-violet-500 focus:ring-3 focus:ring-violet-100 dark:focus:ring-violet-900/40 transition-all text-sm shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {categories && categories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 mr-1">
                <Filter size={13} />
                {t('orgs.filterLabel')}
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  !selectedCategory
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300'
                }`}
              >
                {t('orgs.all')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-600'
                  }`}
                >
                  <span>{cat.icon ?? getCategoryEmoji(cat.name)}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {data && (
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
            {data.total} {t('orgs.results')}
          </p>
        )}

        {isLoading ? (
          <PageSpinner />
        ) : data?.items.length === 0 ? (
          <EmptyState
            icon={<Search size={32} />}
            title={t('orgs.noResults')}
            description={t('orgs.noResultsHint')}
          />
        ) : (
          <>
            <div
              ref={gridRef}
              className={`reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 reveal-stagger transition-opacity ${
                isFetching ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {data?.items.map((org) => (
                <button
                  key={org.id}
                  onClick={() => navigate(`/organizations/${org.id}`)}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg dark:hover:shadow-violet-900/20 hover:border-violet-200 dark:hover:border-violet-600 transition-all text-left cursor-pointer overflow-hidden"
                >
                  <div className="h-44 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 relative overflow-hidden">
                    {org.logo ? (
                      <img
                        src={buildLogoUrl(org.logo)}
                        alt={org.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-6xl">
                        {org.category ? getCategoryEmoji(org.category.name) : '🏢'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {org.bookingMode === 'auto' && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                        {t('orgs.instant')}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors mb-1">
                      {org.name}
                    </h3>
                    {org.category && (
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                        {org.category.name}
                      </span>
                    )}
                    {org.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {org.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500">
                      {org.address && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={11} className="flex-shrink-0" />
                          <span className="truncate">{org.address}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        4.8
                      </span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Clock size={11} />
                        Open
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {t('orgs.previousPage')}
                </button>
                <span className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                  {t('orgs.pageOf', { page, total: totalPages })}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {t('orgs.nextPage')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
