// Agent home: only the tasks assigned to the logged-in user.
import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { useAuth } from '../utils/auth.jsx'
import { plural } from '../utils/format.js'
import TaskTable from '../components/TaskTable.jsx'
import { EmptyState, ErrorBox, PageLoader } from '../components/States.jsx'

export default function MyTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api('/tasks/mine')
      setTasks(data.tasks)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const projectCount = tasks ? new Set(tasks.map((task) => task.projectId)).size : 0
  const isAgent = user.role === 'AGENT'

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
