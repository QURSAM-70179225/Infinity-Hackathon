// Review step shown BEFORE saving when the transcript would give a developer more than 40 hours.
// The admin can move tasks to developers with free capacity; the totals recalculate live.
import { useMemo, useState } from 'react'
import { CAPACITY, capacityStatus } from '../utils/capacity.js'
import CapacityBar from './CapacityBar.jsx'
import Icon from './Icon.jsx'

// Adds the draft's task hours to each developer's existing hours.
function projectHours(agents, draft) {
  const hours = Object.fromEntries(agents.map((agent) => [agent.ref, agent.hours]))
  for (const project of draft.projects) {
    for (const task of project.tasks) {
      hours[task.assigneeId] = (hours[task.assigneeId] || 0) + Number(task.estimatedHours)
    }
  }
  return hours
}

export default function OverloadReview({ data, onSave }) {
  const { agents } = data
  const [draft, setDraft] = useState(data.draft)

  // The developers who were overloaded when the review opened. Their tasks stay listed while the admin works.
  const [watched] = useState(() => {
    const initial = projectHours(agents, data.draft)
    return agents.filter((agent) => initial[agent.ref] > CAPACITY).map((agent) => agent.ref)
  })
  const [taskKeys] = useState(() =>
    data.draft.projects.flatMap((project, p) =>
      project.tasks.map((task, t) => (watched.includes(task.assigneeId) ? `${p}-${t}` : null)).filter(Boolean),
    ),
  )

  const hours = useMemo(() => projectHours(agents, draft), [agents, draft])
  const overloaded = agents.filter((agent) => hours[agent.ref] > CAPACITY)
  const byRef = Object.fromEntries(agents.map((agent) => [agent.ref, agent]))

  function reassign(p, t, ref) {
    setDraft((current) => ({
      projects: current.projects.map((project, pi) =>
        pi !== p
          ? project
          : { ...project, tasks: project.tasks.map((task, ti) => (ti !== t ? task : { ...task, assigneeId: ref })) },
      ),
    }))
  }

  // Best developer to take a task: enough free hours, same specialization first, then least loaded.
  function suggestionFor(task) {
    const owner = byRef[task.assigneeId]
    return agents
      .filter((agent) => agent.ref !== task.assigneeId && hours[agent.ref] + Number(task.estimatedHours) <= CAPACITY)
      .sort((a, b) => {
        const sameA = owner && a.specialization === owner.specialization ? 0 : 1
        const sameB = owner && b.specialization === owner.specialization ? 0 : 1
        return sameA - sameB || hours[a.ref] - hours[b.ref]
      })[0]
  }

  return (
    <div className="rise mt-4 overflow-hidden rounded-2xl border border-red-300 bg-white">
      <div className="flex items-start gap-3 bg-red-600 px-5 py-4 text-white" role="alert">
        <Icon name="alert" className="mt-0.5 shrink-0" />
        <div>
          <p className="text-base font-bold">Overload alert: nothing has been saved yet</p>
          <p className="mt-0.5 text-sm text-red-50">
            {overloaded.length > 0
              ? `${overloaded.map((agent) => `${agent.name} (${hours[agent.ref]}h)`).join(', ')} would exceed the ${CAPACITY} hour capacity. Reassign tasks below, or save anyway.`
              : `All developers are now within the ${CAPACITY} hour capacity. You can save.`}
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tasks of overloaded developers</h3>
          {taskKeys.map((key) => {
            const [p, t] = key.split('-').map(Number)
            const project = draft.projects[p]
            const task = project.tasks[t]
            const isOver = hours[task.assigneeId] > CAPACITY
            const suggestion = isOver ? suggestionFor(task) : null
            return (
              <div
                key={key}
                className={`rounded-xl border p-4 transition-colors ${isOver ? 'border-red-300 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">
                      {project.name} · {task.estimatedHours}h · due {task.deadline}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isOver ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    {isOver ? 'Owner overloaded' : 'Within capacity'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    value={task.assigneeId}
                    onChange={(event) => reassign(p, t, event.target.value)}
                    aria-label={`Assign ${task.title} to`}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  >
                    {agents.map((agent) => (
                      <option key={agent.ref} value={agent.ref}>
                        {agent.name} · {agent.specialization} · {hours[agent.ref]}h
                      </option>
                    ))}
                  </select>
                  {isOver && (
                    <button
                      type="button"
                      disabled={!suggestion}
                      onClick={() => reassign(p, t, suggestion.ref)}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {suggestion ? `Move to ${suggestion.name}` : 'No developer has room'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Capacity after this meeting</h3>
          {agents.map((agent) => (
            <div key={agent.ref} className={capacityStatus(hours[agent.ref]) === 'over' ? 'rounded-lg bg-red-50 p-2' : 'p-2'}>
              <p className="mb-1 text-sm font-semibold text-slate-800">
                {agent.name} <span className="font-normal text-slate-400">· {agent.specialization}</span>
              </p>
              <CapacityBar hours={hours[agent.ref]} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
        <button
          type="button"
          disabled={overloaded.length > 0}
          onClick={() => onSave(draft, false)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save with these assignments
        </button>
        <button
          type="button"
          onClick={() => onSave(draft, true)}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
        >
          Save anyway
        </button>
        <p className="text-sm text-slate-500">
          {overloaded.length > 0 ? 'Resolve the overload to enable the first button.' : 'Everything is checked again on the server before saving.'}
        </p>
      </div>
    </div>
  )
}
