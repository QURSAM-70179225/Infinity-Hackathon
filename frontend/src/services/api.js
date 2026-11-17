// One place for every call to the backend. Adds the login token automatically.
// Where the backend is.
// Deployed: the same site. Vercel forwards every /api request to the Render backend
// (see frontend/vercel.json), so the browser never calls another domain and CORS cannot block it.
// Local development: VITE_API_URL if set, otherwise the local backend on port 5000.
const BASE = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '').replace(/\/api$/, '')
const TOKEN_KEY = 'novaworks_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage can be blocked in private mode. The session then lasts until refresh.
  }
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken()
  let response
  try {
    response = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0)
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // Some responses have no JSON body.
  }

  if (!response.ok) {
    throw new ApiError(data?.message || 'Something went wrong. Please try again.', response.status, data)
  }
  return data
}
