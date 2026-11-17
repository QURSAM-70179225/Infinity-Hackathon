import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/auth.jsx'
import Icon from '../components/Icon.jsx'
import { Spinner } from '../components/States.jsx'

// One-click fill for the supplied demo accounts. They still log in through the real login API.
const DEMO_ACCOUNTS = [
  { ref: 'ADMIN', name: 'Admin', role: 'Administrator', email: 'admin@novaworks.example' },
  { ref: 'PM01', name: 'Ayesha Khan', role: 'Manager · Web PM', email: 'ayesha@novaworks.example' },
  { ref: 'PM02', name: 'Bilal Ahmed', role: 'Manager · Mobile PM', email: 'bilal@novaworks.example' },
  { ref: 'PM03', name: 'Hina Malik', role: 'Manager · AI PM', email: 'hina@novaworks.example' },
  { ref: 'DEV01', name: 'Ali Raza', role: 'Agent · Full-Stack', email: 'ali@novaworks.example' },
  { ref: 'DEV02', name: 'Hamza Shah', role: 'Agent · Full-Stack', email: 'hamza@novaworks.example' },
  { ref: 'DEV03', name: 'Sara Noor', role: 'Agent · App Developer', email: 'sara@novaworks.example' },
  { ref: 'DEV04', name: 'Usman Tariq', role: 'Agent · App Developer', email: 'usman@novaworks.example' },
  { ref: 'DEV05', name: 'Zain Abbas', role: 'Agent · AI Developer', email: 'zain@novaworks.example' },
  { ref: 'DEV06', name: 'Maryam Asif', role: 'Agent · AI Developer', email: 'maryam@novaworks.example' },
]

const STEPS = [
  { icon: 'lock', title: 'Log in', text: 'Each role gets its own view.' },
  { icon: 'spark', title: 'Paste the meeting', text: 'AI reads the final decisions.' },
  { icon: 'tasks', title: 'Work is created', text: 'Projects, owners, deadlines, hours.' },
]

const homeFor = (role) => (role === 'AGENT' ? '/tasks' : '/')

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={homeFor(user.role)} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const loggedIn = await login(email.trim(), password)
      navigate(homeFor(loggedIn.role), { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-amber-500/25 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-amber-400">
            <Icon name="spark" />
          </span>
          <span className="text-lg font-bold tracking-tight">NovaWorks CRM</span>
        </div>

        <div className="relative">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            From meeting
            <br />
            to <span className="bg-gradient-to-r from-indigo-400 to-amber-300 bg-clip-text text-transparent">execution</span>
            <br />
            in one click.
          </h1>
          <p className="mt-5 max-w-md text-lg text-slate-300">
            Paste a meeting transcript. The CRM creates every project and task, with the right owner, deadline and estimate.
          </p>

          <div className="mt-10 grid gap-4">
            {STEPS.map((step, index) => (
              <div key={step.title} className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-amber-300">
                  <Icon name={step.icon} size={17} />
                </span>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-white">
                    {index + 1}. {step.title}.
                  </span>{' '}
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-slate-500">NovaWorks Technologies, Lahore</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="rise w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-lg font-bold tracking-tight text-slate-900">NovaWorks CRM</p>
            <p className="text-sm text-slate-500">From meeting to execution in one click.</p>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Log in with a demo account to open your workspace.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@novaworks.example"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Demo123!"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
                <Icon name="alert" size={16} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {loading && <Spinner className="h-4 w-4" />}
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            New to NovaWorks?{' '}
            <Link to="/signup" className="font-semibold text-indigo-700 hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Ten demo accounts · password Demo123! · click one to fill the form
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email)
                    setPassword('Demo123!')
                    setError('')
                  }}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <span className="w-14 shrink-0 rounded-md bg-slate-900 px-1.5 py-1 text-center font-mono text-[11px] font-bold text-amber-300">
                    {account.ref}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">{account.name}</span>
                    <span className="block truncate text-xs text-slate-500">{account.role}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
