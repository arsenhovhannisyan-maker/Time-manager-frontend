import { useRef, useCallback } from 'react'

export function useScrollReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const callbackRef = useCallback((el: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    observerRef.current = observer
  }, [])

  return callbackRef
}
