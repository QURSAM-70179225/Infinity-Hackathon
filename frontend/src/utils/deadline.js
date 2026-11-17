// Time left until a deadline, used for the badges and the reminder bell.
// "Today" is the real date, unless VITE_DEMO_DATE is set in frontend/.env.
// The challenge scenario takes place on 7 Oct 2026, so the demo measures from that date
// and says so on screen.
export const DEMO_DATE = import.meta.env.VITE_DEMO_DATE || ''

const DAY = 24 * 60 * 60 * 1000
const toUtc = (iso) => {
  const [year, month, day] = String(iso).split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export function todayIso() {
  if (/^\d{4}-\d{2}-\d{2}$/.test(DEMO_DATE)) return DEMO_DATE
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Whole days from today to the deadline. Negative means the deadline has passed.
export function daysLeft(iso) {
  return Math.round((toUtc(iso) - toUtc(todayIso())) / DAY)
}

export function timeLeft(iso) {
  const days = daysLeft(iso)
  if (Number.isNaN(days)) return { days, label: 'No deadline', tone: 'slate' }
  if (days < 0) return { days, label: `Overdue by ${-days} day${days === -1 ? '' : 's'}`, tone: 'red' }
  if (days === 0) return { days, label: 'Due today', tone: 'red' }
  if (days === 1) return { days, label: 'Due tomorrow', tone: 'amber' }
  if (days <= 3) return { days, label: `${days} days left`, tone: 'amber' }
  return { days, label: `${days} days left`, tone: 'green' }
}

export const TONE_STYLE = {
  red: 'bg-red-100 text-red-800',
  amber: 'bg-amber-100 text-amber-900',
  green: 'bg-emerald-100 text-emerald-800',
  slate: 'bg-slate-100 text-slate-600',
}
