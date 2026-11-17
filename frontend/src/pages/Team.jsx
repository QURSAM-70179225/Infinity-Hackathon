// Team directory: names, roles, specializations, skills and developer capacity.
// Read-only for everyone except the admin, who can change a member between agent and manager.
import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { useAuth } from '../utils/auth.jsx'
import { ROLE_LABEL } from '../utils/format.js'
import CapacityBar from '../components/CapacityBar.jsx'
import { Avatar, ErrorBox, PageLoader } from '../components/States.jsx'

const GROUPS = [
  { role: 'ADMIN', title: 'Administration', tone: 'slate' },
  { role: 'MANAGER', title: 'Project Managers', tone: 'indigo' },
  { role: 'AGENT', title: 'Developer Agents', tone: 'amber' },
]

const CAPACITY_NOTE = {
  ADMIN: 'Capacity bars show each developer against the 40 hour limit.',
  MANAGER: 'Capacity bars are shown for developers on your projects, counting their work across all projects.',
  AGENT: 'You can see your own capacity bar.',
}

export default function Team() {
  const { user } = useAuth()
  const isAdmin = user.role === 'ADMIN'
  const [team, setTeam] = useState(null)
  const [workload, setWorkload] = useState({})
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      const [teamData, workloadData] = await Promise.all([api('/team'), api('/workload')])
      setTeam(teamData.team)
      // The backend already limits this list to what the current role may see.
      setWorkload(Object.fromEntries(workloadData.workload.map((entry) => [entry.id, entry])))
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function changeRole(member, role) {
    setError('')
    setBusyId(member.id)
    try {
      await api(`/team/${member.id}/role`, { method: 'PATCH', body: { role } })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Team Directory</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isAdmin
            ? 'The people AI can assign work to. As administrator you can make a member a project manager or a developer agent.'
            : 'The people AI can assign work to. This list is read-only.'}{' '}
          {CAPACITY_NOTE[user.role]}
        </p>
      </header>

      {error && <ErrorBox message={error} />}
      {!team && !error && <PageLoader label="Loading team" />}

      {team &&
        GROUPS.map((group) => {
          const members = team.filter((member) => member.role === group.role)
          if (members.length === 0) return null
          return (
            <section key={group.role}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                {group.title} ({members.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {members.map((member) => {
                  const load = workload[member.id]
                  return (
                    <article
                      key={member.id}
                      className={`rise rounded-2xl border bg-white p-5 shadow-sm ${load && load.status === 'over' ? 'border-red-300' : 'border-slate-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} tone={group.tone} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">
                            {ROLE_LABEL[member.role]} · {member.specialization}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md bg-slate-900 px-2 py-1 font-mono text-[11px] font-bold text-amber-300" title="Directory reference code">
                          {member.ref}
                        </span>
                      </div>
                      {member.skills && member.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {member.skills.map((skill) => (
                            <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {load && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <CapacityBar
                            hours={load.hours}
                            note={load.hoursInYourProjects !== undefined ? `${load.hoursInYourProjects}h of this is in your projects.` : ''}
                          />
                        </div>
                      )}
                      {isAdmin && member.role !== 'ADMIN' && (
                        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                          <label htmlFor={`role-${member.id}`} className="text-xs font-medium text-slate-500">
                            Role
                          </label>
                          <select
                            id={`role-${member.id}`}
                            value={member.role}
                            disabled={busyId === member.id}
                            onChange={(event) => changeRole(member, event.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                          >
                            <option value="AGENT">Developer Agent</option>
                            <option value="MANAGER">Project Manager</option>
                          </select>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
    </div>
  )
}
