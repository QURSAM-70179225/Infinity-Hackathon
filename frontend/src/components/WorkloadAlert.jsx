// Warns admins and managers when a developer they can see is over the 40 hour capacity.
// A manager only receives developers who work on their projects, and only the total hours:
// no task details from other managers' projects are sent by the backend.
import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { CAPACITY } from '../utils/capacity.js'
import Icon from './Icon.jsx'

export default function WorkloadAlert({ refreshKey = 0, isManager = false }) {
  const [overloaded, setOverloaded] = useState([])

  useEffect(() => {
    api('/workload')
      .then((data) => setOverloaded(data.workload.filter((entry) => entry.status === 'over')))
      .catch(() => setOverloaded([]))
  }, [refreshKey])

  if (overloaded.length === 0) return null

  return (
    <div className="rise flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900" role="alert">
      <Icon name="alert" className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-bold">
          Overload warning: {overloaded.length === 1 ? '1 developer is' : `${overloaded.length} developers are`} above {CAPACITY} hours
        </p>
        <ul className="mt-1 space-y-0.5 text-sm">
          {overloaded.map((entry) => (
            <li key={entry.id}>
              <span className="font-semibold">{entry.name}</span>: {entry.hours}h assigned
              {isManager && entry.hoursInYourProjects !== undefined
                ? ` across all projects (${entry.hoursInYourProjects}h in yours)`
                : ''}
            </li>
          ))}
        </ul>
        <p className="mt-1 text-sm text-red-800">Open a project and reassign a task to a developer with free capacity.</p>
      </div>
    </div>
  )
}
