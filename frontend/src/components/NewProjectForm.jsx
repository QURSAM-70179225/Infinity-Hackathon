// Admin creates a project by hand and assigns it to a project manager.
import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import Icon from './Icon.jsx'
import { Spinner } from './States.jsx'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

export default function NewProjectForm({ onCreated }) {
  const [open, setOpen] = useState(false)
  const [managers, setManagers] = useState([])
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [description, setDescription] = useState('')
  const [managerId, setManagerId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Load the managers only when the form is opened.
  useEffect(() => {
    if (!open) return
    api('/team')
      .then((data) => setManagers(data.team.filter((member) => member.role === 'MANAGER')))
      .catch((err) => setError(err.message))
  }, [open])

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return
    setError('')
    setSaving(true)
    try {
      await api('/projects', {
        method: 'POST',
        body: { name, clientName, description, managerId: Number(managerId), deadline },
      })
      setName('')
      setClientName('')
      setDescription('')
      setManagerId('')
      setDeadline('')
      setOpen(false)
      onCreated()
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
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-700"
      >
        <Icon name="folder" size={15} />
        New project without a transcript
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rise rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">New project</h2>
      <p className="text-sm text-slate-500">Create a project by hand and give it to a project manager. The manager then adds and assigns the tasks.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="project-name" className="mb-1 block text-sm font-medium text-slate-700">Project name</label>
          <input id="project-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="For example: FreshMart Website" className={inputClass} />
        </div>
        <div>
          <label htmlFor="project-client" className="mb-1 block text-sm font-medium text-slate-700">Client</label>
          <input id="project-client" required value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Client company name" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="project-description" className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea id="project-description" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Agreed scope" className={inputClass} />
        </div>
        <div>
          <label htmlFor="project-manager" className="mb-1 block text-sm font-medium text-slate-700">Project manager</label>
          <select id="project-manager" required value={managerId} onChange={(event) => setManagerId(event.target.value)} className={inputClass}>
            <option value="" disabled>Choose a manager</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name} ({manager.specialization})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="project-deadline" className="mb-1 block text-sm font-medium text-slate-700">Deadline</label>
          <input id="project-deadline" type="date" required value={deadline} onChange={(event) => setDeadline(event.target.value)} className={inputClass} />
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
          {saving ? 'Saving...' : 'Create project'}
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={saving} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  )
}
