import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { logOutUser } from '../APIs/Auth'


const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { showNotification } = useNotification()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async() => {
    try {
      const res = await logOutUser()
      
      if(res.message == "success"){
        logout();
        showNotification('Logged out successfully. See you soon!', 'error');
        navigate("/login");
      } else {
        showNotification('Logout failed. Please try again.', 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Logout failed. Please try again.';
      showNotification(errorMessage, 'error');
      console.log(error);
    }
  }

  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/portfolio', label: 'Portfolio', icon: '📊' },
    { path: '/transactions', label: 'Transactions', icon: '💼' },
    { path: '/export', label: 'Export Data', icon: '📥' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-primary-800 to-primary-900 text-white transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : '-translate-x-full lg:translate-x-0 w-64'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <p className="text-primary-300 text-sm">Tracker</p>
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-primary-100 hover:bg-primary-700'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-4 border-t border-primary-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary-100 hover:bg-primary-700 transition-all"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar

