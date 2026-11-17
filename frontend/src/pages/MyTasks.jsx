// Agent home: only the tasks assigned to the logged-in user, with their personal capacity meter.
import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { useAuth } from '../utils/auth.jsx'
import { plural } from '../utils/format.js'
import { CAPACITY } from '../utils/capacity.js'
import TaskTable from '../components/TaskTable.jsx'
import CapacityBar from '../components/CapacityBar.jsx'
import { EmptyState, ErrorBox, PageLoader } from '../components/States.jsx'

export default function MyTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState(null)
  const [capacity, setCapacity] = useState(null)
  const [error, setError] = useState('')

  const isAgent = user.role === 'AGENT'

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api('/tasks/mine')
      setTasks(data.tasks)
      if (isAgent) {
        // For an agent the backend returns only their own workload entry.
        const workload = await api('/workload')
        setCapacity(workload.workload[0] || null)
      }
    } catch (err) {
      setError(err.message)
    }
  }, [isAgent])

  useEffect(() => {
    load()
  }, [load])

  const projectCount = tasks ? new Set(tasks.map((task) => task.projectId)).size : 0

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-indigo-600">Welcome, {user.name}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{isAgent ? 'My Tasks' : 'Tasks'}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {tasks && tasks.length > 0
            ? `${plural(tasks.length, 'task')} across ${plural(projectCount, 'project')}, ordered by deadline.`
            : isAgent
              ? 'Work assigned to you, ordered by deadline.'
              : 'Tasks in the projects you can see.'}
        </p>
      </header>

      {isAgent && capacity && (
        <section className="rise rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">My capacity</h2>
          <CapacityBar
            hours={capacity.hours}
            note={
              capacity.status === 'over'
                ? `You are ${capacity.hours - CAPACITY}h above the ${CAPACITY} hour capacity. Ask your project manager to reassign a task.`
                : `You have ${CAPACITY - capacity.hours}h of free capacity.`
            }
          />
        </section>
      )}

      {error && <ErrorBox message={error} onRetry={load} />}
      {!tasks && !error && <PageLoader label="Loading tasks" />}
      {tasks && tasks.length > 0 && <TaskTable tasks={tasks} showProject />}
      {tasks && tasks.length === 0 && !error && (
        <EmptyState
          icon="tasks"
          title="No tasks assigned yet"
          text="Tasks appear here as soon as the administrator creates projects from a meeting transcript."
        />
      )}
    </div>
  )
}
