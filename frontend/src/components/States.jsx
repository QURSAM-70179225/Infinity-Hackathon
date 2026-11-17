// Shared loading, error and empty states so every page behaves the same way.
import Icon from './Icon.jsx'

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner className="h-8 w-8 text-indigo-600" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="rise flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
      <Icon name="alert" className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-sm font-semibold underline underline-offset-2 hover:text-red-950">
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon = 'folder', title, text, children }) {
  return (
    <div className="rise rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Icon name={icon} size={22} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{text}</p>
      {children}
    </div>
  )
}

export function Avatar({ name, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-100 text-indigo-700',
    amber: 'bg-amber-100 text-amber-800',
    slate: 'bg-slate-200 text-slate-700',
  }
  const letters = String(name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${tones[tone]}`}>
      {letters}
    </span>
  )
}
