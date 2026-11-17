import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../utils/auth.jsx'
import { formatDate, plural } from '../utils/format.js'
import TaskTable from '../components/TaskTable.jsx'
import AddTaskForm from '../components/AddTaskForm.jsx'
import Icon from '../components/Icon.jsx'
import { Avatar, EmptyState, ErrorBox, PageLoader } from '../components/States.jsx'

function Fact({ icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon name={icon} />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{children}</p>
      </div>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  // The admin and the project's manager can add and reassign tasks. The backend checks this too.
  const canManage = user.role !== 'AGENT'

  const [project, setProject] = useState(null)
  const [agents, setAgents] = useState([])
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await api(`/projects/${id}`)
      setProject(data.project)
    } catch (err) {
      setError(err)
    }
  }, [id])

  useEffect(() => {
    setProject(null)
    setError(null)
    load()
  }, [load])

  useEffect(() => {
    if (!canManage) return
    api('/team')
      .then((data) => setAgents(data.team.filter((member) => member.role === 'AGENT')))
      .catch(() => setAgents([]))
  }, [canManage])

  async function reassign(task, assigneeId) {
    setActionError('')
    setBusyId(task.id)
    try {
      await api(`/tasks/${task.id}`, { method: 'PATCH', body: { assigneeId } })
      await load()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const backLink = (
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-700">
      <Icon name="back" size={16} />
      Back to projects
    </Link>
  )

  if (error) {
    return (
      <div className="space-y-5">
        {backLink}
        {error.status === 403 ? (
          <EmptyState
            icon="lock"
            title="You do not have access to this project"
            text="This project belongs to another manager or team. You can only open projects and tasks assigned to you."
          />
        ) : (
          <ErrorBox message={error.message} />
        )}
      </div>
    )
  }

  if (!project) return <PageLoader label="Loading project" />

  return (
    <div className="space-y-6">
      {backLink}

      <header className="rise overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-amber-400" />
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Client: {project.clientName}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{project.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{project.description}</p>

          <div className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <Avatar name={project.manager.name} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Project manager</p>
                <p className="text-sm font-semibold text-slate-900">{project.manager.name}</p>
              </div>
            </div>
            <Fact icon="calendar" label="Deadline">
              {formatDate(project.deadline)}
            </Fact>
            <Fact icon="tasks" label={user.role === 'AGENT' ? 'Your tasks' : 'Tasks'}>
              {plural(project.taskCount, 'task')}
            </Fact>
            <Fact icon="clock" label="Estimated effort">
              {project.totalHours} hours
            </Fact>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Tasks</h2>
          {user.role === 'AGENT' && (
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <Icon name="lock" size={14} />
              You see only the tasks assigned to you.
            </p>
          )}
          {canManage && <AddTaskForm project={project} agents={agents} onAdded={load} />}
        </div>

        {actionError && <ErrorBox message={actionError} />}

        {project.tasks.length > 0 ? (
          <TaskTable
            tasks={project.tasks}
            agents={canManage && agents.length > 0 ? agents : null}
            onReassign={canManage ? reassign : null}
            busyId={busyId}
          />
        ) : (
          <EmptyState
            icon="tasks"
            title="No tasks yet"
            text="Add the first task and assign it to a developer agent."
          />
        )}
      </section>
    </div>
  )
}
