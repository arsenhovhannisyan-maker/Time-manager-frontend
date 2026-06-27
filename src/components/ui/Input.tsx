import type { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export function Input({ label, error, icon, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`
            w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-2.5 text-sm
            text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            border-slate-200 dark:border-slate-700 outline-none
            focus:border-violet-400 dark:focus:border-violet-500 focus:ring-3 focus:ring-violet-100 dark:focus:ring-violet-900/40
            transition-all duration-200
            disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
            ${className}
          `}
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
