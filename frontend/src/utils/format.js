const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "2026-10-20" -> "20 Oct 2026". Built from the text itself, so time zones cannot shift the day.
export function formatDate(iso) {
  const [year, month, day] = String(iso || '').split('-')
  if (!year || !month || !day) return 'No date'
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`
}

export function initials(name) {
  return String(name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export const ROLE_LABEL = { ADMIN: 'Administrator', MANAGER: 'Project Manager', AGENT: 'Developer Agent' }

export function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}
