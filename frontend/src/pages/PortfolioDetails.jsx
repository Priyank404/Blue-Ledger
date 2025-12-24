import { useState, useEffect,useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../APIs/axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import TransactionsTable from '../components/TransactionsTable'
import { useNotification } from '../context/NotificationContext'
import { deleteTransaction } from '../APIs/transaction'
import { useHoldings } from "../context/HoldingsContext"
import { useTransactions } from "../context/TransactionContext";

const PortfolioDetails = () => {
  const { id } = useParams()
  const [livePrice, setlivePrice] = useState([]);
  const [PriceHistory, setPriceHistory] = useState([]);

 const { holdings, loading } = useHoldings();
 const { transactions, loading: transactionsLoading } = useTransactions();

  const [showHistory, setShowHistory] = useState(false)
  const [stockTransactionsList, setStockTransactionsList] = useState([])
  const { showNotification } = useNotification()

   const stockTransactions = stockTransactionsList


//getting stock id
  const stock = useMemo(() => {
    return holdings.find(h => h.id === id);
  }, [holdings, id]);


//filtering stock
  useEffect(() => {
  if (stock) {
    const filtered = transactions.filter(
    (t) => t.name === stock.symbol
  );
  setStockTransactionsList(filtered);
  }
}, [stock, transactions])

  //fetching price of stock


useEffect(() => {
  if (!stock) return;

  const fetchLive = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stock/${stock.symbol}/price`,
        {
          credentials: "include", // 🔥 THIS IS REQUIRED
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json(); // ✅ IMPORTANT

      setlivePrice(data.data || []); // depends on your backend response
    } catch (err) {
      console.error("Error fetching price history", err);
      setlivePrice([]);
    }
  };

  fetchLive();
}, [stock]);

//fetching history of the price 
useEffect(() => {
  if (!stock) return;

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stock/${stock.symbol}/history`,
        {
          credentials: "include", // 🔥 THIS IS REQUIRED
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json(); // ✅ IMPORTANT

      setPriceHistory(data.data || []); // depends on your backend response
    } catch (err) {
      console.error("Error fetching price history", err);
      setPriceHistory([]);
    }
  };

  fetchHistory();
}, [stock]);



//loading screen if the stock is loading
if (loading || transactionsLoading) {
    return <DashboardLayout><p>Loading...</p></DashboardLayout>;
  }

  
 

// loading screen if stock not found
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

    // Calculate additional metrics
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const pnlPercentage = ((stock.pnl / stock.totalInvest) * 100).toFixed(2)
  const priceChangeFromAvg = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice * 100).toFixed(2)
  const roi = ((stock.currentValue - stock.totalInvest) / stock.totalInvest * 100).toFixed(2)
  
  // Calculate price change (from last price in history)
  const lastPrice = livePrice.length > 0 ? livePrice[livePrice.length - 1].price : stock.currentPrice
  const prevPrice = livePrice.length > 1 ? livePrice[livePrice.length - 2].price : stock.currentPrice
  const dayChange = lastPrice - prevPrice
  const dayChangePercent = prevPrice > 0 ? ((dayChange / prevPrice) * 100).toFixed(2) : '0.00'

  // Prepare data for value over time chart
  const valueOverTime = livePrice.map((entry) => ({
    date: entry.date,
    price: entry.price,
    value: entry.price * stock.qty,
    avgBuyPrice: stock.avgPrice,
    avgBuyValue: stock.avgPrice * stock.qty,
  }))

  // Prepare data for price comparison chart
  const priceComparisonData = livePrice.map((entry) => ({
    date: entry.date,
    currentPrice: entry.price,
    avgBuyPrice: stock.avgPrice,
  }))

  // P&L calculation over time
  const pnlOverTime = livePrice.map((entry) => {
  const pnlValue = (entry.price - stock.avgPrice) * stock.qty;
  const pnlPercent = (pnlValue / stock.totalInvest) * 100;

  return {
    date: entry.date,
    pnl: Number(pnlValue),
    pnlPercent: Number(pnlPercent.toFixed(2)),
  };
});


  // Buy/Sell distribution
  const buyCount = stockTransactions.filter((t) => t.type === 'BUY').length
  const sellCount = stockTransactions.filter((t) => t.type === 'SELL').length
  const transactionDistribution = [
    { name: 'Buy', value: buyCount, color: '#10b981' },
    { name: 'Sell', value: sellCount, color: '#ef4444' },
  ]

  const COLORS = ['#10b981', '#ef4444']

  


  
  












  const handleDeleteTransaction = async (transactionId) => {
    try {
      const response = await deleteTransaction(transactionId)
      showNotification(response.message || 'Transaction deleted successfully', 'success')
      setStockTransactionsList((prev) => prev.filter((t) => t.id !== transactionId))
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to delete transaction', 'error')
    }
  }

 

 
  


  
 

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Details: {stock.symbol}</h1>
            <p className="text-gray-600">Detailed view of {stock.symbol} stock</p>
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
            <p className="text-2xl font-bold text-gray-900">{stock.symbol}</p>

          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Current Price</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stock.currentPrice)}</p>
            <p className={`text-sm mt-1 font-semibold ${dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dayChange >= 0 ? '+' : ''}{formatCurrency(dayChange)} ({dayChangePercent >= 0 ? '+' : ''}{dayChangePercent}%)
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Average Buy Price</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stock.avgPrice)}</p>
            <p className={`text-sm mt-1 font-semibold ${priceChangeFromAvg >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChangeFromAvg >= 0 ? '+' : ''}{priceChangeFromAvg}% from avg
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Quantity</p>
            <p className="text-2xl font-bold text-gray-900">{stock.qty}</p>
            <p className="text-xs text-gray-500 mt-1">Shares</p>
          </div>
        </div>

        {/* Additional Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Investment</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stock.totalInvest)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Current Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stock.currentValue)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Profit/Loss</p>
            <p className={`text-2xl font-bold ${stock.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stock.pnl >= 0 ? '+' : ''}{formatCurrency(stock.pnl)}
            </p>
            <p className={`text-sm mt-1 font-semibold ${stock.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage}%
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">ROI</p>
            <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {roi >= 0 ? '+' : ''}{roi}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Return on Investment</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Price History */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Price History</h2>
            {PriceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={PriceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    name="Stock Price"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
             <div className="h-64 flex items-center justify-center text-gray-500">
                Price history will appear after market close
              </div>
            )}
          </div>

          {/* Price Comparison Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Price vs Average Buy Price</h2>
            {priceComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="currentPrice"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Current Price"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgBuyPrice"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Avg Buy Price"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>

          {/* Value Over Time */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Holding Value Over Time</h2>
            {valueOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={valueOverTime}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAvgValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    name="Current Value"
                  />
                  <Area
                    type="monotone"
                    dataKey="avgBuyValue"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#colorAvgValue)"
                    name="Investment Amount"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>

          {/* P&L Over Time */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profit/Loss Trend</h2>
            {pnlOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pnlOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value, name, props) => {
                      const percent = props.payload.pnlPercent;
                      return [`${formatCurrency(value)} (${percent}%)`, 'P&L'];
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />

                  <Legend />
                  <Bar dataKey="pnl" name="Profit/Loss" radius={[8, 8, 0, 0]}>
                    {pnlOverTime.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.pnl > 0 ? "#22c55e" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity</span>
                <span className="font-semibold text-gray-900">{stock.qty} shares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Buy Price</span>
                <span className="font-semibold text-gray-900">{formatCurrency(stock.avgPrice)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Profit/Loss</span>
                <span className={`font-semibold ${stock.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.pnl >= 0 ? '+' : ''}{formatCurrency(stock.pnl)} ({pnlPercentage}%)
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">ROI</span>
                <span className={`font-semibold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roi >= 0 ? '+' : ''}{roi}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Distribution</h3>
            {stockTransactions.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={transactionDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {transactionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Transactions</span>
                    <span className="font-semibold text-gray-900">{stockTransactions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buy Orders</span>
                    <span className="font-semibold text-green-600">{buyCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sell Orders</span>
                    <span className="font-semibold text-red-600">{sellCount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No transactions found
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md">
                Buy More
              </button>
              <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md">
                Sell
              </button>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-md"
              >
                {showHistory ? 'Hide History' : 'View Full History'}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        {showHistory && stockTransactions.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Transaction History for {stock.symbol}
            </h3>
            <TransactionsTable 
              transactions={stockTransactions} 
              showAll={true} 
              showDelete={true}
              onDelete={handleDeleteTransaction}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default PortfolioDetails

