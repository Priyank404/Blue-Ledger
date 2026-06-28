import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'

const DashboardLayout = ({ children }) => {
  return (
    <div className="terminal-shell">
      <Sidebar />
      <div className="workbench">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <div className="hidden h-6 w-px lg:block" style={{ background: 'var(--line)' }} />
            <div>
              <p className="eyebrow">Blue Ledger</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Trading Workstation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded border px-3 py-1.5 text-xs tabular-nums md:block" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
              MARKET DATA / LOCAL
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="content-pad">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
