import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
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
    </Routes>
  )
}

function App() {
  return (
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
  )
}

export default App
