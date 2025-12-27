import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Portfolio from './pages/Portfolio'
import PortfolioDetails from './pages/PortfolioDetails'
import Settings from './pages/Settings'
import ExportData from './pages/ExportData'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { TransactionProvider } from './context/TransactionContext'
import { HoldingProvider } from './context/HoldingsContext'
import { ChartProvider } from './context/ChartContext'
import { ThemeProvider } from './context/ThemeContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Loading authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return user ? children : <Navigate to="/login" replace />;
};
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Loading...</div>; // 🔒 BLOCK EVERYTHING
  }
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portfolio"
        element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portfolio/:id"
        element={
          <ProtectedRoute>
            <PortfolioDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/export"
        element={
          <ProtectedRoute>
            <ExportData />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Page not found</p>
              <Link to="/dashboard" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                Go to Dashboard
              </Link>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <TransactionProvider>
          <HoldingProvider>
            <AuthProvider>
              <ChartProvider>
                <Router>
                  <AppRoutes />
                </Router>
              </ChartProvider>
            </AuthProvider>
          </HoldingProvider>
        </TransactionProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
