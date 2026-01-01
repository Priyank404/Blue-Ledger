import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { exportData } from '../APIs/export'
import { useNotification } from '../context/NotificationContext'


const ExportData = () => {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportType, setExportType] = useState('transactions')
  const { showNotification } = useNotification()

  const handleExport = async () => {
    try {
    const blob = await exportData(exportType, exportFormat);

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportType}_${new Date().toISOString().split("T")[0]}.${exportFormat}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
  } catch (err) {
        if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);

          showNotification(json.message || "Failed to export data", "error");
        } catch {
          showNotification("Failed to export data", "error");
        }
      } else {
        showNotification("Failed to export data", "error");
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Export Data</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Export your portfolio data in various formats
          </p>
        </div>

        {/* Export Options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Export Options
            </h2>

            {/* Export Type Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Type
                </label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="transactions">Transactions</option>
                  <option value="holdings">Stock Holdings</option>
                  <option value="portfolioSummary">Portfolio Summary</option>
                  <option value="portfolioHistory">Portfolio History</option>
                  <option value="all">All Data (JSON only)</option>
                </select>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      disabled={exportType === 'all-data'}
                      className="h-4 w-4 text-primary-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">CSV</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="h-4 w-4 text-primary-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">JSON</span>
                  </label>
                </div>
                {exportType === 'all-data' && (
                  <p className="mt-2 text-sm text-gray-500">
                    Note: All Data export is only available in JSON format
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Data Preview */}
        

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <span>📥</span>
            <span>Export Data</span>
          </button>
        </div>

        {/* Export Information */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Export Information
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>
              • <strong>Transactions:</strong> All your buy and sell
              transactions
            </li>
            <li>
              • <strong>Stock Holdings:</strong> Current holdings with P&L
              information
            </li>
            <li>
              • <strong>Portfolio Summary:</strong> Overall portfolio statistics
            </li>
            <li>
              • <strong>Portfolio History:</strong> Historical portfolio value
              data
            </li>
            <li>
              • <strong>All Data:</strong> Complete portfolio data in JSON
              format
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ExportData

