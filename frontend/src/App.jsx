import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './utils/auth.jsx'
import Layout from './components/Layout.jsx'
import { PageLoader } from './components/States.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import MyTasks from './pages/MyTasks.jsx'
import Team from './pages/Team.jsx'

// Only logged-in users get past this. Everyone else goes to the login page.
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader label="Loading your workspace" />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <Protected>
                <Layout />
              </Protected>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="team" element={<Team />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
