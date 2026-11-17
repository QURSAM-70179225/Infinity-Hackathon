// Admin or the project's manager adds a task and assigns it to a developer agent.
import { useState } from 'react'
import { api } from '../services/api.js'
import Icon from './Icon.jsx'
import { Spinner } from './States.jsx'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

export default function AddTaskForm({ project, agents, onAdded }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [hours, setHours] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return
    setError('')
    setSaving(true)
    try {
      await api(`/projects/${project.id}/tasks`, {
        method: 'POST',
        body: { title, description, assigneeId: Number(assigneeId), deadline, estimatedHours: Number(hours) },
      })
      setTitle('')
      setDescription('')
      setAssigneeId('')
      setDeadline('')
      setHours('')
      setOpen(false)
      onAdded()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        <Icon name="tasks" size={15} />
        Add task
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rise w-full rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">New task</h3>
      <p className="text-sm text-slate-500">Assign it to a developer agent. The deadline cannot be after the project deadline.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-slate-700">Title</label>
          <input id="task-title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example: Checkout page UI" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="task-description" className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea id="task-description" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is included in this task" className={inputClass} />
        </div>
        <div>
          <label htmlFor="task-assignee" className="mb-1 block text-sm font-medium text-slate-700">Assign to</label>
          <select id="task-assignee" required value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className={inputClass}>
            <option value="" disabled>Choose an agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.specialization})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-deadline" className="mb-1 block text-sm font-medium text-slate-700">Deadline</label>
            <input id="task-deadline" type="date" required max={project.deadline} value={deadline} onChange={(event) => setDeadline(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="task-hours" className="mb-1 block text-sm font-medium text-slate-700">Est. hours</label>
            <input id="task-hours" type="number" required min="0.5" step="0.5" value={hours} onChange={(event) => setHours(event.target.value)} placeholder="8" className={inputClass} />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          <Icon name="alert" size={16} />
          {error}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60">
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save task'}
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={saving} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  )
}
