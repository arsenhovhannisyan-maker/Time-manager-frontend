import { useEffect, useRef } from 'react'

interface Bubble {
  x: number
  y: number
  r: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  pulse: number
  pulseSpeed: number
}

const COLORS = [
  'rgba(139, 92, 246,',   // violet-500
  'rgba(99, 102, 241,',   // indigo-500
  'rgba(167, 139, 250,',  // violet-400
  'rgba(196, 181, 253,',  // violet-300
  'rgba(255, 255, 255,',  // white
]

function createBubble(w: number, h: number): Bubble {
  return {
    x: Math.random() * w,
    y: Math.random() * h * 1.5 + h * 0.5,
    r: Math.random() * 22 + 6,
    speedX: (Math.random() - 0.5) * 0.4,
    speedY: -(Math.random() * 0.6 + 0.3),
    opacity: Math.random() * 0.25 + 0.05,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.02 + 0.005,
  }
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollRef = useRef(0)
  const bubblesRef = useRef<Bubble[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0

    function resize() {
      if (!canvas) return
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w * window.devicePixelRatio
      canvas.height = h * window.devicePixelRatio
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    function init() {
      bubblesRef.current = Array.from({ length: 55 }, () => {
        const b = createBubble(w, h)
        // Spread initial positions across the full visible area
        b.y = Math.random() * h * 2 - h * 0.5
        return b
      })
    }

    function onScroll() {
      scrollRef.current = window.scrollY
    }

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)

      const scroll = scrollRef.current

      bubblesRef.current.forEach((b) => {
        b.pulse += b.pulseSpeed
        b.x += b.speedX
        b.y += b.speedY

        // Wrap horizontally
        if (b.x < -b.r) b.x = w + b.r
        if (b.x > w + b.r) b.x = -b.r

        // Respawn at bottom when off top
        if (b.y < -b.r * 4) {
          b.y = h + b.r * 2
          b.x = Math.random() * w
          b.opacity = Math.random() * 0.25 + 0.05
        }

        // Parallax: scroll shifts bubbles up relative to content
        const parallaxY = b.y - scroll * 0.35

        // Pulsing radius
        const pulsedR = b.r + Math.sin(b.pulse) * 1.5

        // Gradient fill for bokeh feel
        const grad = ctx.createRadialGradient(b.x, parallaxY, 0, b.x, parallaxY, pulsedR)
        grad.addColorStop(0, `${b.color} ${b.opacity + 0.15})`)
        grad.addColorStop(1, `${b.color} 0)`)

        ctx.beginPath()
        ctx.arc(b.x, parallaxY, pulsedR, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()

    window.addEventListener('resize', () => { resize(); init() })
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
