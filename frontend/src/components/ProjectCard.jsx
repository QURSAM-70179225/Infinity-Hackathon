import { Link } from 'react-router-dom'
import { formatDate, plural } from '../utils/format.js'
import Icon from './Icon.jsx'
import { Avatar } from './States.jsx'

const ACCENTS = ['from-indigo-500 to-violet-500', 'from-amber-400 to-orange-500', 'from-emerald-400 to-teal-500']

export default function ProjectCard({ project, index = 0 }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="rise group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={`h-1.5 bg-gradient-to-r ${ACCENTS[index % ACCENTS.length]}`} />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{project.clientName}</p>
        <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-700">{project.name}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">{project.description || 'No description.'}</p>

        <div className="mt-4 flex items-center gap-2">
          <Avatar name={project.manager.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{project.manager.name}</p>
            <p className="text-xs text-slate-400">Project manager</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <Icon name="calendar" size={15} className="text-slate-400" />
            {formatDate(project.deadline)}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="tasks" size={15} className="text-slate-400" />
            {plural(project.taskCount, 'task')}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="clock" size={15} className="text-slate-400" />
            {project.totalHours}h
          </span>
        </div>
      </div>
    </Link>
  )
}
