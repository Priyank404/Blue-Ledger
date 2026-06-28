import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Portfolio from './pages/Portfolio'
import PortfolioDetails from './pages/PortfolioDetails'
import ExportData from './pages/ExportData'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { TransactionProvider } from './context/TransactionContext'
import { DashboardProvider } from './context/DashboardContext'
import { HoldingProvider } from './context/HoldingsContext'
import { ThemeProvider } from './context/ThemeContext'

/**
 * Route guard: redirects unauthenticated users to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="terminal-shell flex min-h-screen items-center justify-center muted">
        Checking session...
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

/**
 * Declarative route tree.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/portfolio"
        element={<ProtectedRoute><Portfolio /></ProtectedRoute>}
      />
      <Route
        path="/portfolio/:id"
        element={<ProtectedRoute><PortfolioDetails /></ProtectedRoute>}
      />
      <Route
        path="/transactions"
        element={<ProtectedRoute><Transactions /></ProtectedRoute>}
      />
      <Route
        path="/export"
        element={<ProtectedRoute><ExportData /></ProtectedRoute>}
      />
      <Route
        path="*"
        element={
          <div className="terminal-shell flex min-h-screen items-center justify-center p-4">
            <div className="text-center">
              <h1 className="screen-title mb-4">404</h1>
              <p className="screen-copy mb-4">Page not found</p>
              <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

/**
 * Root app — providers wrap the Router so all contexts are available
 * to every component including those that use router hooks.
 */
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <DashboardProvider>
            <TransactionProvider>
              <HoldingProvider>
                <Router
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <AppRoutes />
                </Router>
              </HoldingProvider>
            </TransactionProvider>
          </DashboardProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
