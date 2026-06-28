import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { logOutUser } from '../APIs/Auth';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', short: 'DB' },
  { path: '/portfolio', label: 'Portfolio', short: 'PF' },
  { path: '/transactions', label: 'Transactions', short: 'TX' },
  { path: '/export', label: 'Export', short: 'EX' },
];

/**
 * Sidebar component supporting desktop layout (fixed left aside) and mobile layout (fixed bottom bar).
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showNotification } = useNotification();

  const handleLogout = async () => {
    try {
      const res = await logOutUser();
      if (res.message === 'success') {
        logout();
        showNotification('Logged out successfully.', 'success');
        navigate('/login');
      } else {
        showNotification('Logout failed. Please try again.', 'error');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Logout failed. Please try again.', 'error');
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-screen w-[84px] border-r lg:flex lg:flex-col lg:items-center lg:justify-between lg:py-4"
        style={{ background: 'var(--chrome)', borderColor: 'var(--line)' }}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col items-center gap-5">
          <Link
            to="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded border text-sm font-bold hover:border-[var(--line-strong)] transition-colors"
            style={{ borderColor: 'var(--line-strong)', color: 'var(--text)' }}
            aria-label="Blue Ledger home"
          >
            BL
          </Link>

          <nav className="flex flex-col gap-2" aria-label="Main navigation menu">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex h-11 w-11 items-center justify-center rounded border text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
                    isActive
                      ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--accent-2)]'
                      : 'border-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
                  }`
                }
                aria-label={item.label}
                title={item.label}
              >
                {item.short}
                <span
                  className="pointer-events-none absolute left-14 top-1/2 hidden -translate-y-1/2 rounded border px-2 py-1 text-xs group-hover:block z-50 shadow-md"
                  style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--text)' }}
                  role="tooltip"
                >
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex h-11 w-11 items-center justify-center rounded border text-xs font-semibold hover:border-[var(--line-strong)] hover:text-[var(--text)] transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
          style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
          title="Logout"
          aria-label="Sign out from application"
        >
          OUT
        </button>
      </aside>

      {/* Mobile Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t lg:hidden shadow-lg"
        style={{ background: 'var(--chrome)', borderColor: 'var(--line)' }}
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex h-14 flex-col items-center justify-center text-[11px] font-semibold transition-colors ${
                isActive ? 'text-[var(--accent-2)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`
            }
            aria-label={item.label}
          >
            <span>{item.short}</span>
            <span className="mt-0.5 text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
