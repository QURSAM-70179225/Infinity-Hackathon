// App shell: sidebar with navigation for the logged-in role, and the page content.
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/auth.jsx'
import { ROLE_LABEL } from '../utils/format.js'
import Icon from './Icon.jsx'
import { Avatar } from './States.jsx'

const NAV = {
  ADMIN: [
    { to: '/', label: 'All Projects', icon: 'folder' },
    { to: '/team', label: 'Team Directory', icon: 'users' },
  ],
  MANAGER: [
    { to: '/', label: 'My Projects', icon: 'folder' },
    { to: '/team', label: 'Team Directory', icon: 'users' },
  ],
  AGENT: [
    { to: '/tasks', label: 'My Tasks', icon: 'tasks' },
    { to: '/', label: 'My Projects', icon: 'folder' },
    { to: '/team', label: 'Team Directory', icon: 'users' },
  ],
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col bg-slate-950 text-slate-300 md:sticky md:top-0 md:h-screen md:w-64">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-amber-400 text-white">
            <Icon name="spark" size={18} />
          </span>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">NovaWorks CRM</p>
            <p className="text-xs text-slate-400">Meeting to Execution</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
          {NAV[user.role].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 border-t border-slate-800 px-4 py-4">
          <Avatar name={user.name} tone="amber" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{ROLE_LABEL[user.role]}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Log out"
            title="Log out"
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-9">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
