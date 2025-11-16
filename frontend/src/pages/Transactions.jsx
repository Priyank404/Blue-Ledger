import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import TransactionsTable from '../components/TransactionsTable'
import { transactions, stocks } from '../data/dummyData'

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState('')
  const [transactionType, setTransactionType] = useState('Buy')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStock = !selectedStock || transaction.name === selectedStock
    return matchesSearch && matchesStock
  })

  const handleAddTransaction = (e) => {
    e.preventDefault()
    // In a real app, this would add to state/backend
    alert('Transaction added! (This is a demo - no actual data is saved)')
    setQty('')
    setPrice('')
    setDate('')
    setShowAddForm(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
            <p className="text-gray-600">Manage your buy and sell transactions</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mt-4 md:mt-0 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
          >
            {showAddForm ? 'Cancel' : 'Add Transaction'}
          </button>
        </div>

        {/* Filters and Add Transaction Form */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">All Stocks</option>
                {stocks.map((stock) => (
                  <option key={stock.id} value={stock.name}>
                    {stock.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showAddForm && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Transaction</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTransactionType('Buy')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      transactionType === 'Buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('Sell')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      transactionType === 'Sell'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Stock</label>
                  <input
                    type="text"
                    placeholder="Enter stock name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder="Qty"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Price"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
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
        <TransactionsTable transactions={filteredTransactions} showAll={true} />
      </div>
    </DashboardLayout>
  )
}

export default Transactions

