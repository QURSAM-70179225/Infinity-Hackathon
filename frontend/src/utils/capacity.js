// Developer capacity rules, the same as in the backend (services/workload.js).
// Green up to 32h, yellow above 32h up to 40h, red above 40h.
export const CAPACITY = 40
export const WARNING_FROM = 32

export function capacityStatus(hours) {
  if (hours > CAPACITY) return 'over'
  if (hours > WARNING_FROM) return 'high'
  return 'ok'
}

export const CAPACITY_STYLE = {
  ok: { bar: 'bg-emerald-500', text: 'text-emerald-700', label: 'Available' },
  high: { bar: 'bg-amber-400', text: 'text-amber-700', label: 'Near capacity' },
  over: { bar: 'bg-red-500', text: 'text-red-700', label: 'Overloaded' },
}
