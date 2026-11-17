// App shell: sidebar navigation for the logged-in role, a top bar with the active user,
// and the demo user switcher.
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/auth.jsx'
import { ROLE_LABEL } from '../utils/format.js'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../utils/demoAccounts.js'
import Icon from './Icon.jsx'
import Reminders from './Reminders.jsx'
import InstallButton from './InstallButton.jsx'
import { Avatar, Spinner } from './States.jsx'

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

const BADGE = {
  ADMIN: { label: 'ADMIN', style: 'bg-slate-900 text-amber-300' },
  MANAGER: { label: 'MANAGER', style: 'bg-indigo-100 text-indigo-800' },
  AGENT: { label: 'DEVELOPER', style: 'bg-amber-100 text-amber-900' },
}

const homeFor = (role) => (role === 'AGENT' ? '/tasks' : '/')

export default function Layout() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [switching, setSwitching] = useState(false)
  const [switchError, setSwitchError] = useState('')

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Demo switcher: a REAL login as the chosen demo account. The backend issues a new token,
  // so everything on screen is reloaded with that user's own permissions.
  async function switchUser(email) {
    if (!email || email === user.email || switching) return
    setSwitchError('')
    setSwitching(true)
    try {
      const next = await login(email, DEMO_PASSWORD)
      navigate(homeFor(next.role), { replace: true })
    } catch (err) {
      setSwitchError(err.message)
    } finally {
      setSwitching(false)
    }
  }

  const badge = BADGE[user.role]
  const isDemoUser = DEMO_ACCOUNTS.some((account) => account.email === user.email)

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

        <div className="hidden items-center gap-3 border-t border-slate-800 px-4 py-4 md:flex">
          <Avatar name={user.name} tone="amber" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-10">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.specialization}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${badge.style}`}>{badge.label}</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <InstallButton />
            <Reminders userId={user.id} role={user.role} />
            <label htmlFor="demo-switch" className="hidden text-xs font-medium text-slate-500 sm:block">
              Demo: switch user
            </label>
            <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 py-1 pl-3 pr-1">
              {switching ? <Spinner className="h-4 w-4 text-indigo-600" /> : <Icon name="users" size={15} className="text-slate-500" />}
              <select
                id="demo-switch"
                value={isDemoUser ? user.email : ''}
                disabled={switching}
                onChange={(event) => switchUser(event.target.value)}
                className="max-w-[150px] rounded-full bg-transparent py-1 pr-2 text-sm font-semibold text-slate-800 outline-none disabled:opacity-50 sm:max-w-none"
              >
                {!isDemoUser && <option value="">{user.name}</option>}
                <optgroup label="Administrator">
                  {DEMO_ACCOUNTS.filter((a) => a.ref === 'ADMIN').map((a) => (
                    <option key={a.email} value={a.email}>
                      {a.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Project Managers">
                  {DEMO_ACCOUNTS.filter((a) => a.ref.startsWith('PM')).map((a) => (
                    <option key={a.email} value={a.email}>
                      {a.ref} · {a.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Developers">
                  {DEMO_ACCOUNTS.filter((a) => a.ref.startsWith('DEV')).map((a) => (
                    <option key={a.email} value={a.email}>
                      {a.ref} · {a.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-300 hover:text-red-700"
            >
              <Icon name="logout" size={15} />
              Log out
            </button>
          </div>
          {switchError && (
            <p className="w-full text-right text-xs font-medium text-red-700" role="alert">
              Could not switch user: {switchError}
            </p>
          )}
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-9">
          {/* The key remounts the page when the user changes, so all data is fetched again for the new user. */}
          <div key={user.id} className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
