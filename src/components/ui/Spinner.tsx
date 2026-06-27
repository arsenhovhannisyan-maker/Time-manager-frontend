interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
}

export function Spinner({ size = 'md', className = '' }: Props) {
  return (
    <div
      className={`${sizes[size]} rounded-full border-violet-200 border-t-violet-600 animate-spin ${className}`}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <Spinner size="lg" />
    </div>
  )
}
