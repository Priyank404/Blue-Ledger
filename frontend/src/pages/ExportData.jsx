import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  transactions,
  stockHoldings,
  portfolioData,
  portfolioValueHistory,
  assetAllocation,
  sectorAllocation,
} from '../data/dummyData'

const ExportData = () => {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportType, setExportType] = useState('transactions')

  // Convert array to CSV
  const arrayToCSV = (array, headers) => {
    const csvHeaders = headers.join(',')
    const csvRows = array.map((item) =>
      headers.map((header) => {
        const value = item[header] || ''
        // Handle values with commas by wrapping in quotes
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value
      }).join(',')
    )
    return [csvHeaders, ...csvRows].join('\n')
  }

  // Convert array to JSON
  const arrayToJSON = (array) => {
    return JSON.stringify(array, null, 2)
  }

  // Get data based on export type
  const getExportData = () => {
    switch (exportType) {
      case 'transactions':
        return {
          data: transactions,
          headers: ['id', 'date', 'name', 'type', 'qty', 'price', 'totalAmt'],
          filename: 'transactions',
        }
      case 'holdings':
        return {
          data: stockHoldings,
          headers: [
            'id',
            'name',
            'qty',
            'avgPrice',
            'currentPrice',
            'totalInvest',
            'currentValue',
            'pnl',
          ],
          filename: 'stock_holdings',
        }
      case 'portfolio-summary':
        return {
          data: [portfolioData],
          headers: [
            'totalInvestment',
            'totalGainLoss',
            'numberOfStocks',
            'portfolioValue',
          ],
          filename: 'portfolio_summary',
        }
      case 'portfolio-history':
        return {
          data: portfolioValueHistory,
          headers: ['date', 'value'],
          filename: 'portfolio_history',
        }
      case 'all-data':
        return {
          data: {
            transactions,
            stockHoldings,
            portfolioData,
            portfolioValueHistory,
            assetAllocation,
            sectorAllocation,
          },
          headers: null,
          filename: 'all_portfolio_data',
        }
      default:
        return { data: [], headers: [], filename: 'export' }
    }
  }

  // Handle export
  const handleExport = () => {
    const { data, headers, filename } = getExportData()
    let content = ''
    let mimeType = ''
    let fileExtension = ''

    if (exportFormat === 'csv') {
      if (exportType === 'all-data') {
        alert(
          'CSV export is not available for "All Data". Please use JSON format.'
        )
        return
      }
      content = arrayToCSV(data, headers)
      mimeType = 'text/csv'
      fileExtension = 'csv'
    } else {
      // JSON format
      content = arrayToJSON(data)
      mimeType = 'application/json'
      fileExtension = 'json'
    }

    // Create blob and download
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
                  <option value="portfolio-summary">Portfolio Summary</option>
                  <option value="portfolio-history">Portfolio History</option>
                  <option value="all-data">All Data (JSON only)</option>
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
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Preview
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {exportType === 'all-data' ? (
                  arrayToJSON(getExportData().data).substring(0, 500) + '...'
                ) : exportFormat === 'csv' ? (
                  arrayToCSV(
                    getExportData().data.slice(0, 3),
                    getExportData().headers
                  ) + '\n...'
                ) : (
                  arrayToJSON(getExportData().data.slice(0, 3)).substring(
                    0,
                    500
                  ) + '...'
                )}
              </pre>
            </div>
          </div>

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

