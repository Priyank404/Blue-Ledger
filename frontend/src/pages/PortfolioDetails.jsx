import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import { stockHoldings, stockPriceHistory } from '../data/dummyData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const PortfolioDetails = () => {
  const { id } = useParams()
  const stock = stockHoldings.find((s) => s.id === parseInt(id))

  if (!stock) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stock not found</h1>
          <Link to="/portfolio" className="text-primary-600 hover:text-primary-700">
            Return to Portfolio
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const priceHistory = stockPriceHistory[stock.name] || []

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const pnlPercentage = ((stock.pnl / stock.totalInvest) * 100).toFixed(2)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Details: {stock.name}</h1>
            <p className="text-gray-600">Detailed view of {stock.name} stock</p>
          </div>
          <Link
            to="/portfolio"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Return to Portfolio
          </Link>
        </div>

        {/* Stock Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Stock Name</p>
            <p className="text-2xl font-bold text-gray-900">{stock.name}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Current Price</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stock.currentPrice)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Average Buy Price</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stock.avgPrice)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Quantity</p>
            <p className="text-2xl font-bold text-gray-900">{stock.qty}</p>
          </div>
        </div>

        {/* Stock Graph */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Graph of {stock.name}</h2>
          {priceHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Price"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">No price history available</p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Invest</span>
                <span className="font-semibold text-gray-900">{formatCurrency(stock.totalInvest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Value</span>
                <span className="font-semibold text-gray-900">{formatCurrency(stock.currentValue)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Profit/Loss</span>
                <span className={`font-semibold ${stock.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.pnl >= 0 ? '+' : ''}{formatCurrency(stock.pnl)} ({pnlPercentage}%)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Buy More
              </button>
              <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                Sell
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default PortfolioDetails

