// Kanban board: To Do, In Progress, Done.
// A card can be dragged to another column, or moved with its status dropdown
// (the dropdown always works, including on touch screens and with a keyboard).
// The card moves at once; if the server refuses the change, it moves back and an error is shown.
import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { formatDate } from '../utils/format.js'
import { daysLeft } from '../utils/deadline.js'
import Icon from './Icon.jsx'
import { Avatar } from './States.jsx'

const COLUMNS = [
  { status: 'todo', title: 'To Do', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700' },
  { status: 'in_progress', title: 'In Progress', dot: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-800' },
  { status: 'done', title: 'Done', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
]

export default function KanbanBoard({ tasks, onChanged }) {
  const [items, setItems] = useState(tasks)
  const [error, setError] = useState('')
  const [dragId, setDragId] = useState(null)
  const [overColumn, setOverColumn] = useState(null)
  const [savingId, setSavingId] = useState(null)

  // Follow the parent when it loads fresh data.
  useEffect(() => setItems(tasks), [tasks])

  async function move(taskId, status) {
    const task = items.find((item) => item.id === taskId)
    if (!task || task.status === status || savingId) return
    const previous = items

    setError('')
    setSavingId(taskId)
    setItems(items.map((item) => (item.id === taskId ? { ...item, status } : item))) // optimistic
    try {
      await api(`/tasks/${taskId}/status`, { method: 'PATCH', body: { status } })
      if (onChanged) onChanged()
    } catch (err) {
      setItems(previous) // move the card back
      setError(`"${task.title}" was not moved: ${err.message}`)
    } finally {
      setSavingId(null)
    }
  }

  function handleDrop(event, status) {
    event.preventDefault()
    setOverColumn(null)
    if (dragId !== null) move(dragId, status)
    setDragId(null)
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rise flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800" role="alert">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const cards = items.filter((item) => item.status === column.status)
          return (
            <section
              key={column.status}
              onDragOver={(event) => {
                event.preventDefault()
                setOverColumn(column.status)
              }}
              onDragLeave={() => setOverColumn((current) => (current === column.status ? null : current))}
              onDrop={(event) => handleDrop(event, column.status)}
              aria-label={`${column.title}, ${cards.length} tasks`}
              className={`rounded-2xl border p-3 transition-colors ${
                overColumn === column.status ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-100/70'
              }`}
            >
              <header className="mb-3 flex items-center justify-between px-1">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
                  {column.title}
                </h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm">{cards.length}</span>
              </header>

              <div className="space-y-3">
                {cards.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-400">No tasks here</p>
                )}

                {cards.map((task) => {
                  const overdue = task.status !== 'done' && daysLeft(task.deadline) < 0
                  return (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move'
                        event.dataTransfer.setData('text/plain', String(task.id))
                        setDragId(task.id)
                      }}
                      onDragEnd={() => {
                        setDragId(null)
                        setOverColumn(null)
                      }}
                      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all active:cursor-grabbing ${
                        dragId === task.id ? 'opacity-40' : 'hover:border-indigo-300 hover:shadow-md'
                      } ${savingId === task.id ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${column.badge}`}>{column.title}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{task.projectName}</p>

                      <div className="mt-3 flex items-center gap-2">
                        <Avatar name={task.assignee.name} tone="slate" />
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{task.assignee.name}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className={`flex items-center gap-1 font-medium ${overdue ? 'text-red-600' : 'text-slate-600'}`}>
                          <Icon name="calendar" size={13} />
                          {formatDate(task.deadline)}
                          {overdue ? ' (overdue)' : ''}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Icon name="clock" size={13} />
                          {task.estimatedHours}h
                        </span>
                      </div>

                      <label className="mt-3 block">
                        <span className="sr-only">Status of {task.title}</span>
                        <select
                          value={task.status}
                          disabled={savingId !== null}
                          onChange={(event) => move(task.id, event.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                        >
                          {COLUMNS.map((option) => (
                            <option key={option.status} value={option.status}>
                              Move to: {option.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
