const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:7777'

interface Props {
  src?: string | null
  initials?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

function buildAvatarUrl(src: string): string {
  if (src.startsWith('http')) return src
  return `${BASE_URL}${src}`
}

export function Avatar({ src, initials = '?', size = 'md', className = '' }: Props) {
  if (src) {
    return (
      <img
        src={buildAvatarUrl(src)}
        alt="avatar"
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white ${className}`}
      />
    )
  }

  return (
    <div
      className={`
        ${sizes[size]} rounded-full
        bg-gradient-to-br from-violet-500 to-indigo-600
        text-white font-semibold flex items-center justify-center
        ring-2 ring-white flex-shrink-0
        ${className}
      `}
    >
      {initials}
    </div>
  )
}
