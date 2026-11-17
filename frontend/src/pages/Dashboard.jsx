// Home for admins and managers (agents can open it too): the projects this user may see.
import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { useAuth } from '../utils/auth.jsx'
import { plural } from '../utils/format.js'
import ProjectCard from '../components/ProjectCard.jsx'
import TranscriptPanel from '../components/TranscriptPanel.jsx'
import NewProjectForm from '../components/NewProjectForm.jsx'
import Icon from '../components/Icon.jsx'
import { EmptyState, ErrorBox, PageLoader, Spinner } from '../components/States.jsx'

const COPY = {
  ADMIN: { title: 'All Projects', text: 'Every client project in the company, created from meetings.' },
  MANAGER: { title: 'My Projects', text: 'Projects you manage, with every task and owner.' },
  AGENT: { title: 'My Projects', text: 'Projects that contain tasks assigned to you.' },
}

const EMPTY = {
  ADMIN: 'Paste a meeting transcript above and click Create from Transcript. The projects will appear here.',
  MANAGER: 'No project is assigned to you yet. They appear here once the administrator creates them from a meeting.',
  AGENT: 'No task is assigned to you yet, so there are no related projects to show.',
}

function Stat({ icon, label, value }) {
  return (
    <div className="rise flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon name={icon} size={20} />
      </span>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user.role === 'ADMIN'
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api('/projects')
      setProjects(data.projects)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function resetDemoData() {
    setResetting(true)
    try {
      await api('/projects', { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setResetting(false)
      setConfirmReset(false)
    }
  }

  const taskCount = projects ? projects.reduce((sum, p) => sum + p.taskCount, 0) : 0
  const hours = projects ? projects.reduce((sum, p) => sum + p.totalHours, 0) : 0

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">Welcome, {user.name}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{COPY[user.role].title}</h1>
          <p className="mt-1 text-sm text-slate-500">{COPY[user.role].text}</p>
        </div>

        {isAdmin && projects && projects.length > 0 && (
          <div className="flex items-center gap-2">
            {confirmReset ? (
              <>
                <span className="text-sm text-slate-600">Delete all projects and tasks?</span>
                <button
                  onClick={resetDemoData}
                  disabled={resetting}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {resetting && <Spinner className="h-4 w-4" />}
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  disabled={resetting}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-300 hover:text-red-700"
                title="Removes generated projects and tasks. Demo users are kept."
              >
                <Icon name="refresh" size={15} />
                Reset demo data
              </button>
            )}
          </div>
        )}
      </header>

      {isAdmin && <TranscriptPanel onCreated={load} />}
      {isAdmin && <NewProjectForm onCreated={load} />}

      {error && <ErrorBox message={error} onRetry={load} />}

      {!projects && !error && <PageLoader label="Loading projects" />}

      {projects && projects.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat icon="folder" label={projects.length === 1 ? 'Project' : 'Projects'} value={projects.length} />
            <Stat icon="tasks" label={isAdmin || user.role === 'MANAGER' ? 'Tasks' : 'Your tasks'} value={taskCount} />
            <Stat icon="clock" label="Estimated hours" value={hours} />
          </div>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {plural(projects.length, 'project')}
            </h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </section>
        </>
      )}

      {projects && projects.length === 0 && !error && (
        <EmptyState title="No projects yet" text={EMPTY[user.role]} />
      )}
    </div>
  )
}
