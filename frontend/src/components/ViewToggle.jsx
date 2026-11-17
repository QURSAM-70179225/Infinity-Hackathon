// Switch between the task list and the Kanban board.
import Icon from './Icon.jsx'

const OPTIONS = [
  { value: 'list', label: 'List', icon: 'tasks' },
  { value: 'board', label: 'Board', icon: 'board' },
]

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5" role="group" aria-label="Task view">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
            value === option.value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Icon name={option.icon} size={14} />
          {option.label}
        </button>
      ))}
    </div>
  )
}
