// Reminder bell in the top bar: tasks that are due within 7 days or already overdue,
// for the logged-in user only. The list comes from /tasks/mine, so the backend's
// access rules decide which tasks a user can be reminded about.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatDate } from '../utils/format.js'
import { DEMO_DATE, TONE_STYLE, timeLeft, todayIso } from '../utils/deadline.js'
import Icon from './Icon.jsx'

const REMIND_WITHIN_DAYS = 7

export default function Reminders({ userId, role }) {
  const [open, setOpen] = useState(false)
  const [tasks, setTasks] = useState([])

  // Load when the user changes and each time the panel is opened.
  useEffect(() => {
    api('/tasks/mine')
      .then((data) => setTasks(data.tasks))
      .catch(() => setTasks([]))
  }, [userId, open])

  const due = tasks
    .map((task) => ({ task, left: timeLeft(task.deadline) }))
    .filter(({ left }) => left.days <= REMIND_WITHIN_DAYS)
    .sort((a, b) => a.left.days - b.left.days)

  const urgent = due.filter(({ left }) => left.tone === 'red').length

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={`Deadline reminders: ${due.length}`}
        className="relative rounded-full border border-slate-300 bg-white p-2 text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-700"
      >
        <Icon name="bell" />
        {due.length > 0 && (
          <span
            className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white ${urgent > 0 ? 'bg-red-600' : 'bg-amber-500'}`}
          >
            {due.length}
          </span>
        )}
      </button>

      {open && (
        <div className="rise absolute right-0 z-20 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">Deadline reminders</p>
            <p className="text-xs text-slate-500">
              {role === 'AGENT' ? 'Your tasks' : 'Tasks in your projects'} due within {REMIND_WITHIN_DAYS} days.
              {DEMO_DATE ? ` Measured from the demo date, ${formatDate(todayIso())}.` : ''}
            </p>
          </div>

          {due.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">Nothing is due in the next {REMIND_WITHIN_DAYS} days.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {due.map(({ task, left }) => (
                <li key={task.id}>
                  <Link
                    to={`/projects/${task.projectId}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${TONE_STYLE[left.tone]}`}>{left.label}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {task.projectName} · {task.assignee.name} · due {formatDate(task.deadline)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
