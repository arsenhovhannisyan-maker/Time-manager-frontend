import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '../ui/EmptyState'
import { MapPin } from 'lucide-react'

declare global {
  interface Window {
    ymaps?: {
      ready: (cb: () => void) => void
      Map: new (el: HTMLElement, state: Record<string, unknown>) => YandexMapInstance
      Placemark: new (
        coords: [number, number],
        properties: Record<string, unknown>,
        options?: Record<string, unknown>,
      ) => unknown
    }
  }
}

interface YandexMapInstance {
  geoObjects: { add: (placemark: unknown) => void; removeAll: () => void }
  destroy: () => void
  setBounds: (bounds: [[number, number], [number, number]], opts?: Record<string, unknown>) => void
}

const API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined

let scriptLoadingPromise: Promise<void> | null = null

function loadYandexMapsScript(apiKey: string): Promise<void> {
  if (window.ymaps) return Promise.resolve()
  if (scriptLoadingPromise) return scriptLoadingPromise

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=en_US`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Yandex Maps script'))
    document.head.appendChild(script)
  })

  return scriptLoadingPromise
}

export interface MapOrganization {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
}

interface Props {
  organizations: MapOrganization[]
  onSelectOrg?: (id: string) => void
  className?: string
}

export function YandexMap({ organizations, onSelectOrg, className = '' }: Props) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<YandexMapInstance | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'no-key'>('loading')

  const plottable = organizations.filter(
    (o): o is MapOrganization & { latitude: number; longitude: number } =>
      o.latitude != null && o.longitude != null,
  )

  useEffect(() => {
    if (!API_KEY) {
      setStatus('no-key')
      return
    }

    let cancelled = false

    loadYandexMapsScript(API_KEY)
      .then(() => {
        if (cancelled) return
        window.ymaps!.ready(() => {
          if (cancelled || !containerRef.current) return
          const map = new window.ymaps!.Map(containerRef.current, {
            center: [40.1792, 44.4991],
            zoom: 12,
            controls: ['zoomControl'],
          })
          mapRef.current = map
          setStatus('ready')
        })
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      mapRef.current?.destroy()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready') return

    map.geoObjects.removeAll()

    plottable.forEach((org) => {
      const placemark = new window.ymaps!.Placemark(
        [org.latitude, org.longitude],
        {
          balloonContentHeader: org.name,
          balloonContentBody: org.address ?? '',
        },
        { preset: 'islands#violetDotIcon' },
      )
      if (onSelectOrg) {
        ;(placemark as { events: { add: (evt: string, cb: () => void) => void } }).events.add(
          'click',
          () => onSelectOrg(org.id),
        )
      }
      map.geoObjects.add(placemark)
    })

    if (plottable.length > 0) {
      const lats = plottable.map((o) => o.latitude)
      const lngs = plottable.map((o) => o.longitude)
      map.setBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { checkZoomRange: true, zoomMargin: 40 },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, organizations])

  if (status === 'no-key') {
    return (
      <div className={className}>
        <EmptyState
          icon={<MapPin size={32} />}
          title={t('orgs.mapUnavailable')}
          description={t('orgs.mapUnavailableHint')}
        />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={className}>
        <EmptyState
          icon={<MapPin size={32} />}
          title={t('orgs.mapError')}
          description=""
        />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <div className="w-6 h-6 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />
    </div>
  )
}
