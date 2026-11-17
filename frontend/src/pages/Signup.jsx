// Create a new account. New accounts are always developer agents;
// the role is decided by the backend, never by this form.
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/auth.jsx'
import Icon from '../components/Icon.jsx'
import { Spinner } from '../components/States.jsx'

const SPECIALIZATIONS = ['Full-Stack', 'App Developer', 'AI Developer']
const COMPANY_DOMAIN = '@novaworks.example'

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

export default function Signup() {
  const { user, signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={user.role === 'AGENT' ? '/tasks' : '/'} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return
    if (!email.trim().toLowerCase().endsWith(COMPANY_DOMAIN)) {
      return setError(`Use your company email. It must end with ${COMPANY_DOMAIN}`)
    }
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('The two passwords do not match.')

    setError('')
    setLoading(true)
    try {
      await signup({ name: name.trim(), email: email.trim(), password, specialization })
      navigate('/tasks', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-5 py-10">
      <div className="rise w-full max-w-md">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-amber-400 text-white">
            <Icon name="spark" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">NovaWorks CRM</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          New accounts join as developer agents. You will see tasks once a manager's project assigns work to you.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input id="name" type="text" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="yourname@novaworks.example" className={inputClass} />
            <p className="mt-1 text-xs text-slate-500">Company email only. It must end with @novaworks.example</p>
          </div>
          <div>
            <label htmlFor="specialization" className="mb-1.5 block text-sm font-medium text-slate-700">
              Specialization
            </label>
            <select id="specialization" value={specialization} onChange={(event) => setSpecialization(event.target.value)} className={inputClass}>
              {SPECIALIZATIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className={inputClass} />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Repeat password" className={inputClass} />
            </div>
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
