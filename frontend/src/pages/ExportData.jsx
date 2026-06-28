import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { exportData } from '../APIs/export'
import { useNotification } from '../context/NotificationContext'

const EXPORT_ITEMS = [
  ['Transactions', 'All buy and sell records.'],
  ['Holdings', 'Current stock positions and P/L.'],
  ['Summary', 'Portfolio-level statistics.'],
  ['History', 'Time-series portfolio value.'],
  ['All Data', 'Complete JSON export.'],
]

const ExportData = () => {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportType, setExportType] = useState('transactions')
  const { showNotification } = useNotification()

  const handleExport = async () => {
    try {
      const blob = await exportData(exportType, exportFormat)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `${exportType}_${new Date().toISOString().split('T')[0]}.${exportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showNotification('Data exported successfully.', 'success')
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text()
          const json = JSON.parse(text)
          showNotification(json.message || 'Failed to export data', 'error')
        } catch {
          showNotification('Failed to export data', 'error')
        }
      } else {
        showNotification('Failed to export data', 'error')
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="screen">
        <section className="screen-head">
          <div>
            <p className="eyebrow">Data</p>
            <h1 className="screen-title">Export Console</h1>
            <p className="screen-copy">Package backend portfolio data for analysis outside the app.</p>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <div className="tile tile-pad">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Dataset</label>
                <select value={exportType} onChange={(event) => setExportType(event.target.value)} className="field">
                  <option value="transactions">Transactions</option>
                  <option value="holdings">Stock Holdings</option>
                  <option value="portfolioSummary">Portfolio Summary</option>
                  <option value="portfolioHistory">Portfolio History</option>
                  <option value="all">All Data (JSON only)</option>
                </select>
              </div>

              <div>
                <label className="label">Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['csv', 'json'].map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setExportFormat(format)}
                      className={exportFormat === format ? 'btn-primary' : 'btn-ghost'}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--line)' }}>
              <button onClick={handleExport} className="btn-primary w-full md:w-auto">
                Export Dataset
              </button>
            </div>
          </div>

          <aside className="tile tile-pad">
            <h2 className="tile-title mb-4">Payload Map</h2>
            <div className="space-y-4">
              {EXPORT_ITEMS.map(([title, copy]) => (
                <div key={title} className="border-b pb-3 last:border-b-0 last:pb-0" style={{ borderColor: 'var(--line)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
                  <p className="mt-1 text-sm muted">{copy}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default ExportData
