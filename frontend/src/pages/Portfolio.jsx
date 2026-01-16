import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts'
import { useHoldings } from "../context/HoldingsContext";
import { useDashboard } from "../context/DashboardContext";
import { useChart } from '../context/ChartContext'


//color for pie chart
const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#ef4444",
  "#14b8a6"
];
const STATUS_COLORS = {
  profit: "#16a34a",   // green
  loss: "#dc2626",     // red
  neutral: "#9ca3af"   // gray
};

const Portfolio = () => {

  const {
    holdings,
    loading: holdingsLoading
  } = useHoldings();
  

  const { dashboardData, loading} = useDashboard();
  console.log(dashboardData);

  const {
      totalInvestment,
      currentTotalValue,
      totalPnl,
      numberOfStocks,
      portfolioHistory,
      recentTransaction,
      profitContribution,
      lossContribution,
      sectorAllocation,
      sectorProfit,
      holdingStatus,
      pnlDistribution,
      topPerformerStock,
      topLosserStock,
      valueAllocation,
      overallRoi
    } = dashboardData

  const [searchStock, setSearchStock] = useState('')
  const [minQty, setMinQty] = useState('')
  const [maxQty, setMaxQty] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minPnl, setMinPnl] = useState('')
  const [maxPnl, setMaxPnl] = useState('')
  const [pnlFilter, setPnlFilter] = useState('') // 'profit', 'loss', or ''
  const [showFilters, setShowFilters] = useState(false)




 const isPortfolioLoading = loading || holdingsLoading ;

 if (isPortfolioLoading) {
    return (
      <DashboardLayout>
        <p className="text-gray-900 dark:text-white">Loading portfolio...</p>
      </DashboardLayout>
    );
  }

  


  // Filter states for Stock Holdings table
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

 
  
  

  // Filter stock holdings
  const filteredHoldings = dashboardData.holdings.filter((holding) => {
    const matchesSearch = holding.symbol.toLowerCase().includes(searchStock.toLowerCase())
    const matchesQty = (!minQty || holding.Quantity >= parseFloat(minQty)) &&
                      (!maxQty || holding.Quantity <= parseFloat(maxQty))
    const matchesPrice = (!minPrice || holding.currentPrice >= parseFloat(minPrice)) &&
                        (!maxPrice || holding.currentPrice <= parseFloat(maxPrice))
    const matchesPnl = (!minPnl || holding.pnl >= parseFloat(minPnl)) &&
                      (!maxPnl || holding.pnl <= parseFloat(maxPnl))
    const matchesPnlType = !pnlFilter || 
                          (pnlFilter === 'profit' && holding.pnl > 0) ||
                          (pnlFilter === 'loss' && holding.pnl < 0)
    return matchesSearch && matchesQty && matchesPrice && matchesPnl && matchesPnlType
  })

  const clearFilters = () => {
    setSearchStock('')
    setMinQty('')
    setMaxQty('')
    setMinPrice('')
    setMaxPrice('')
    setMinPnl('')
    setMaxPnl('')
    setPnlFilter('')
  }

  const valueChange = currentTotalValue - totalInvestment;

  

  

   


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Portfolio Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">View your portfolio allocation and holdings</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentTotalValue)}</p>
            <p className={`text-sm font-semibold ${valueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {valueChange >= 0 ? '+' : ''}{formatCurrency(valueChange)} ({overallRoi >= 0 ? '+' : ''}{overallRoi}%)
            </p>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Investment</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalInvestment )}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentTotalValue )}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Profit/Loss</p>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl )}
            </p>
            <p className={`text-sm mt-1 font-semibold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {overallRoi >= 0 ? '+' : ''}{overallRoi }% ROI
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Number of Holdings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{numberOfStocks}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active stocks</p>
          </div>
        </div>

        {/* Sector-wise Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sector-wise Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorAllocation}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={false}
                >
                  {sectorAllocation.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index %COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "12px",
                    paddingTop: "10px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>


        {/* Sector Wise Profit/Loss */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sector Wise Profit/Loss</h2>
           <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={sectorProfit}
                margin={{ top: 20, right: 20, left: 10, bottom: 70 }}
              >
                {/* Soft grid */}
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                {/* X Axis */}
                <XAxis
                  dataKey="sector"
                  tick={{ fontSize: 10, fill: "#374151" }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />

                {/* Y Axis */}
                <YAxis
                  tick={{ fontSize: 12, fill: "#374151" }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />

                {/* Tooltip */}
                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString()}`
                  }
                  cursor={{ fill: "rgba(59,130,246,0.08)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px"
                  }}
                />

                {/* Bars */}
                <Bar
                  dataKey="profit"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                >
                  {sectorProfit.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.profit >= 0 ? "#22c55e" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* Portfolio Growth Graph */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Portfolio Growth Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={portfolioHistory}>
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPortfolio)"
                name="Portfolio Value"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Holdings Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(holdingStatus).map(([name,value])=>({
                    name, value,
                  }))}
                  dataKey="value"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {Object.entries(holdingStatus).map(([name],index)=>(
                    <Cell
                      key={index}
                      fill={STATUS_COLORS[name]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* P&L Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profit/Loss by Stock</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pnlDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="pnl" name="Profit/Loss" radius={[8, 8, 0, 0]}>
                  {pnlDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers and Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          {topPerformerStock.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🏆 Top Performers</h2>
              <div className="space-y-3">
                {topPerformerStock.map((stock, index) => {
                  return (
                    <Link
                      key={stock.id}
                      to={`/portfolio/${stock.id}`}
                      className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{stock.Quantity} shares</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">+{formatCurrency(stock.pnl)}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">+{stock.pnlPercentage}%</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top Losers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📉 Top Losers</h2>
            {topLosserStock.length > 0 ? (
              <div className="space-y-3">
                {topLosserStock.map((stock, index) => {
                  
                  const isNegative = stock.pnl < 0
                  return (
                    <Link
                      key={stock.id}
                      to={`/portfolio/${stock.id}`}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        isNegative 
                          ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold ${
                          isNegative ? 'bg-red-600' : 'bg-gray-400 dark:bg-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{stock.Quantity} shares</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {stock.pnl >= 0 ? '+' : ''}{formatCurrency(stock.pnl)}
                        </p>
                        <p className={`text-sm ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {stock.pnlPercentage >= 0 ? '+' : ''}{stock.pnlPercentage}%
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No underperforming stocks</p>
              </div>
            )}
          </div>
        </div>

        {/* Value Allocation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Value Allocation by Stock</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={valueAllocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {valueAllocation.slice(0, 4).map((item) => (

              <div key={item.name} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.name}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(item.value)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Holdings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Stock Holdings</h2>
            <div className="flex gap-2">
              {showFilters && (
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          {/* Filters for Stock Holdings */}
          {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Stock</label>
                <input
                  type="text"
                  value={searchStock}
                  onChange={(e) => setSearchStock(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">P/L Type</label>
                <select
                  value={pnlFilter}
                  onChange={(e) => setPnlFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">All</option>
                  <option value="profit">Profit Only</option>
                  <option value="loss">Loss Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Quantity</label>
                <input
                  type="number"
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
                  placeholder="Min qty"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Quantity</label>
                <input
                  type="number"
                  value={maxQty}
                  onChange={(e) => setMaxQty(e.target.value)}
                  placeholder="Max qty"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₹)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₹)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min P/L (₹)</label>
                <input
                  type="number"
                  value={minPnl}
                  onChange={(e) => setMinPnl(e.target.value)}
                  placeholder="Min P/L"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max P/L (₹)</label>
                <input
                  type="number"
                  value={maxPnl}
                  onChange={(e) => setMaxPnl(e.target.value)}
                  placeholder="Max P/L"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Invest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredHoldings.length > 0 ? (
                  filteredHoldings.map((holding) => (
                  <tr key={holding.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/portfolio/${holding.id}`}
                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      >
                        {holding.symbol}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{holding.Quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(holding.avgBuyPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(holding.currentPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(holding.investedValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(holding.currentValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-semibold ${
                          holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/portfolio/${holding.id}`}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No holdings match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Portfolio

