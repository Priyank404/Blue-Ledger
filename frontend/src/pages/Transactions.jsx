import { useState } from 'react'
import * as XLSX from 'xlsx'
import DashboardLayout from '../layouts/DashboardLayout'
import TransactionsTable from '../components/TransactionsTable'
import { useNotification } from '../context/NotificationContext'
import { addTransaction, deleteTransaction, importTransactionsFromCsv } from '../APIs/transaction'
import { useTransactions } from '../context/TransactionContext'

const Transactions = () => {

  const { transactions, loading, pagination, refreshTransactions } = useTransactions()
  const pageSize = 8

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState('')
  const [transactionType, setTransactionType] = useState('BUY')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [transactionUploading, setTransactionUploading] = useState(false)
  const [holdingsUploading, setHoldingsUploading] = useState(false)
  const { showNotification } = useNotification()
  
  // Filter states
  const [filterType, setFilterType] = useState('') // 'Buy', 'Sell', or ''
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minQty, setMinQty] = useState('')
  const [maxQty, setMaxQty] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStock = !selectedStock || transaction.name === selectedStock
    const matchesType = !filterType || transaction.type === filterType
    const matchesPrice = (!minPrice || transaction.price >= parseFloat(minPrice)) &&
                        (!maxPrice || transaction.price <= parseFloat(maxPrice))
    const matchesQty = (!minQty || transaction.qty >= parseFloat(minQty)) &&
                      (!maxQty || transaction.qty <= parseFloat(maxQty))
    const matchesDate = (!startDate || new Date(transaction.date) >= new Date(startDate)) &&
                       (!endDate || new Date(transaction.date) <= new Date(endDate))
    
    return matchesSearch && matchesStock && matchesType && matchesPrice && matchesQty && matchesDate
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedStock('')
    setFilterType('')
    setMinPrice('')
    setMaxPrice('')
    setMinQty('')
    setMaxQty('')
    setStartDate('')
    setEndDate('')
  }

  const normalizeHeader = (header) => String(header || '').toLowerCase().replace(/[^a-z]/g, '')

  const pickValue = (row, keys) => {
    for (const key of keys) {
      if (row[key]) return row[key]
    }
    return ''
  }

  const normalizeImportDate = (value) => {
    if (!value) return ''
    if (typeof value === 'number') {
      const parsedExcelDate = XLSX.SSF.parse_date_code(value)
      if (!parsedExcelDate) return ''
      const month = String(parsedExcelDate.m).padStart(2, '0')
      const day = String(parsedExcelDate.d).padStart(2, '0')
      return `${parsedExcelDate.y}-${month}-${day}`
    }

    const trimmed = String(value).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

    const parsed = new Date(trimmed)
    if (Number.isNaN(parsed.getTime())) return ''

    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const readStatementWorkbook = async (file) => {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, {
      type: 'array',
      cellDates: true,
      raw: false
    })

    return workbook.SheetNames.map((sheetName) => ({
      sheetName,
      rows: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        defval: '',
        raw: false
      })
    }))
  }

  const isRowEmpty = (row) => row.every((cell) => String(cell || '').trim() === '')

  const rowToObject = (headers, values) =>
    headers.reduce((acc, header, index) => {
      acc[normalizeHeader(header)] = values[index]
      return acc
    }, {})

  const findHeaderIndex = (rows, requiredHeaders) =>
    rows.findIndex((row) => {
      const normalized = row.map(normalizeHeader)
      return requiredHeaders.every((header) => normalized.includes(header))
    })

  const getStatementDate = (rows) => {
    for (const row of rows) {
      const text = row.join(' ')
      const match = text.match(/\b\d{4}-\d{2}-\d{2}\b/)
      if (match) return match[0]
    }
    return new Date().toISOString().slice(0, 10)
  }

  const parseTransactionStatement = (sheets) => {
    const importedRows = []

    sheets.forEach(({ rows }) => {
      const headerIndex = findHeaderIndex(rows, ['symbol', 'quantity', 'price'])
      if (headerIndex === -1) return

      const headers = rows[headerIndex]
      rows.slice(headerIndex + 1).forEach((values) => {
        if (isRowEmpty(values)) return
        const row = rowToObject(headers, values)

        importedRows.push({
          type: (pickValue(row, ['type', 'transactiontype', 'tradetype', 'buysell']) || transactionType).toUpperCase(),
          name: pickValue(row, ['name', 'stock', 'stockname', 'company', 'companyname', 'symbol']),
          quantity: pickValue(row, ['quantity', 'qty', 'shares', 'units']),
          price: pickValue(row, ['price', 'priceperunit', 'rate']),
          date: normalizeImportDate(pickValue(row, ['date', 'transactiondate', 'tradedate', 'orderexecutiontime']))
        })
      })
    })

    return importedRows.filter((row) => row.name || row.quantity || row.price || row.date)
  }

  const parseHoldingsStatement = (sheets) => {
    const importedRows = []
    const equitySheets = sheets.filter(({ sheetName }) => sheetName.toLowerCase().includes('equity'))
    const fallbackSheets = sheets.filter(({ sheetName }) => !sheetName.toLowerCase().includes('mutual'))
    const sheetsToParse = equitySheets.length > 0 ? equitySheets : fallbackSheets

    sheetsToParse.forEach(({ rows }) => {
      const headerIndex = findHeaderIndex(rows, ['symbol', 'quantityavailable', 'averageprice'])
      if (headerIndex === -1) return

      const statementDate = getStatementDate(rows)
      const headers = rows[headerIndex]
      const seenSymbols = new Set()

      rows.slice(headerIndex + 1).forEach((values) => {
        if (isRowEmpty(values)) return
        const row = rowToObject(headers, values)
        const symbol = pickValue(row, ['symbol'])
        const quantity = pickValue(row, ['quantityavailable'])
        const price = pickValue(row, ['averageprice'])

        if (!symbol || !quantity || !price || symbol.includes('FUND') || seenSymbols.has(symbol)) return
        seenSymbols.add(symbol)

        importedRows.push({
          type: 'BUY',
          name: symbol,
          quantity,
          price,
          date: statementDate
        })
      })
    })

    return importedRows
  }

  const importStatementRows = async ({ event, statementType }) => {
    const file = event.target.files?.[0]
    if (!file) return

    const setUploading = statementType === 'transactions'
      ? setTransactionUploading
      : setHoldingsUploading

    setUploading(true)
    try {
      const sheets = await readStatementWorkbook(file)
      const parsedTransactions = statementType === 'transactions'
        ? parseTransactionStatement(sheets)
        : parseHoldingsStatement(sheets)

      if (parsedTransactions.length === 0) {
        showNotification(
          statementType === 'transactions'
            ? 'Transaction statement must include symbol, trade_type, quantity, price and trade_date/date.'
            : 'Holdings statement must include Symbol, Quantity Available and Average Price.',
          'error'
        )
        return
      }

      const result = await importTransactionsFromCsv(parsedTransactions)
      refreshTransactions(1, pageSize)

      if (result.failedCount > 0) {
        showNotification(
          `Imported ${result.importedCount} rows. ${result.failedCount} rows failed. First error: row ${result.failed[0].row} - ${result.failed[0].message}`,
          'warning'
        )
      } else {
        showNotification(`Imported ${result.importedCount} transactions successfully`, 'success')
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to import statement', 'error')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    try {
      const response = await addTransaction(transactionType, selectedStock, qty, price, date)
      showNotification('Transaction added successfully', 'success')
      setSelectedStock('')
      setQty('')
      setPrice('')
      setDate('')
      setShowAddForm(false)
      refreshTransactions(1, pageSize)
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to add transaction', 'error')
    }
  }

  const handleDeleteTransaction = async (transactionId) => {
    try {
      const response = await deleteTransaction(transactionId)
      showNotification('Transaction deleted successfully', 'success')
      const nextPage = filteredTransactions.length === 1 && pagination.page > 1
        ? pagination.page - 1
        : pagination.page
      refreshTransactions(nextPage, pageSize)
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to delete transaction', 'error')
    }
  }

  const handlePageChange = (page) => {
    if (page === pagination.page || page < 1 || page > pagination.totalPages) return
    refreshTransactions(page, pageSize)
  }

  const pageNumbers = Array.from({ length: pagination.totalPages }, (_, index) => index + 1)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transactions</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your buy and sell transactions</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mt-4 md:mt-0 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
          >
            {showAddForm ? 'Cancel' : 'Add Transaction'}
          </button>
        </div>

        {/* Filters and Add Transaction Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
          {!showAddForm && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                <div className="flex gap-2">
                  {showFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>
              </div>

              {/* Basic Filters */}
              {showFilters && (
                <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Stock</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock</label>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              >
                <option value="">All Stocks</option>
                {transactions.map((stock) => (
                  <option key={stock.id} value={stock.name}>
                    {stock.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              >
                <option value="">All Types</option>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Price Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Price (₹)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Minimum price"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Price (₹)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Maximum price"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Quantity Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Quantity</label>
              <input
                type="number"
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                placeholder="Minimum quantity"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Quantity</label>
              <input
                type="number"
                value={maxQty}
                onChange={(e) => setMaxQty(e.target.value)}
                placeholder="Maximum quantity"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>
          </div>
                </>
              )}
            </>
          )}

          {showAddForm && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Transaction</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Import Transaction Statement
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Upload tradebook files with columns like symbol, trade_type, quantity, price and trade_date.
                  </p>
                  <label className="inline-flex items-center justify-center px-4 py-2 text-sm bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors cursor-pointer">
                    {transactionUploading ? 'Importing...' : 'Upload Tradebook'}
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(event) => importStatementRows({ event, statementType: 'transactions' })}
                      disabled={transactionUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Import Holdings Statement
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Upload holdings files with Symbol, Quantity Available and Average Price. These become opening BUY rows.
                  </p>
                  <label className="inline-flex items-center justify-center px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                    {holdingsUploading ? 'Importing...' : 'Upload Holdings'}
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(event) => importStatementRows({ event, statementType: 'holdings' })}
                      disabled={holdingsUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTransactionType('BUY')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      transactionType === 'BUY'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('SELL')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      transactionType === 'SELL'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Name</label>
                  <input
                     type="text"
                      value={selectedStock}
                      onChange={(e) => setSelectedStock(e.target.value)}
                      placeholder="Enter NSE stock name, e.g. Reliance Industries"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder="Qty"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Price"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Add Transaction
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-gray-600 dark:text-gray-300">
            Loading transactions...
          </div>
        ) : (
          <>
            <TransactionsTable 
              transactions={filteredTransactions} 
              showAll={true} 
              showDelete={true}
              onDelete={handleDeleteTransaction}
            />

            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} transactions)
                </p>
                <div className="flex items-center gap-2 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Prev
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`min-w-10 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                        page === pagination.page
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Transactions

