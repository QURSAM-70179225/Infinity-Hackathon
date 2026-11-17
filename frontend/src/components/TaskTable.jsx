// Task rows: title, description, assigned agent, deadline and estimated hours.
// When `agents` and `onReassign` are given (admin or the project's manager),
// the owner becomes a dropdown so the task can be given to another agent.
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/format.js'
import { TONE_STYLE, timeLeft } from '../utils/deadline.js'
import { Avatar } from './States.jsx'

export default function TaskTable({ tasks, showProject = false, agents = null, onReassign = null, busyId = null }) {
  const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0)
  const canReassign = Boolean(agents && onReassign)

  return (
    <div className="rise overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Task</th>
              {showProject && <th className="px-5 py-3">Project</th>}
              <th className="px-5 py-3">Assigned to</th>
              <th className="px-5 py-3">Deadline</th>
              <th className="px-5 py-3 text-right">Est. hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className="align-top transition-colors hover:bg-slate-50">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="mt-0.5 max-w-md text-slate-500">{task.description}</p>
                </td>
                {showProject && (
                  <td className="px-5 py-4">
                    <Link to={`/projects/${task.projectId}`} className="font-medium text-indigo-700 hover:underline">
                      {task.projectName}
                    </Link>
                    <p className="text-xs text-slate-400">Manager: {task.managerName}</p>
                  </td>
                )}
                <td className="px-5 py-4">
                  {canReassign ? (
                    <select
                      value={task.assignee.id ?? ''}
                      disabled={busyId === task.id}
                      onChange={(event) => onReassign(task, Number(event.target.value))}
                      aria-label={`Assign ${task.title} to`}
                      className="w-full max-w-[220px] rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                    >
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} ({agent.specialization})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Avatar name={task.assignee.name} tone="slate" />
                      <div>
                        <p className="font-medium text-slate-800">{task.assignee.name}</p>
                        <p className="text-xs text-slate-400">{task.assignee.specialization}</p>
                      </div>
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                  <p>{formatDate(task.deadline)}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${TONE_STYLE[timeLeft(task.deadline).tone]}`}>
                    {timeLeft(task.deadline).label}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                    {task.estimatedHours}h
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 text-sm font-semibold text-slate-700">
            <tr>
              <td className="px-5 py-3" colSpan={showProject ? 4 : 3}>
                Total estimated effort
              </td>
              <td className="px-5 py-3 text-right">{totalHours}h</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
