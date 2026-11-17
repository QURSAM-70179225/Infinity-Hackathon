// Shows a developer's assigned hours against the 40 hour capacity.
import { CAPACITY, CAPACITY_STYLE, capacityStatus } from '../utils/capacity.js'

export default function CapacityBar({ hours, note = '' }) {
  const style = CAPACITY_STYLE[capacityStatus(hours)]
  const width = Math.min(100, Math.round((hours / CAPACITY) * 100))

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className={`font-semibold ${style.text}`}>{style.label}</span>
        <span className="font-medium text-slate-600">
          {hours}h of {CAPACITY}h
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={hours}
        aria-valuemin={0}
        aria-valuemax={CAPACITY}
        aria-label="Assigned hours against capacity"
      >
        <div className={`h-full rounded-full transition-all duration-300 ${style.bar}`} style={{ width: `${width}%` }} />
      </div>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  )
}
