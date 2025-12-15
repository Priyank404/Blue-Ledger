import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import { sectorAllocation, assetAllocation,portfolioValueHistory } from '../data/dummyData'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts'
import { useHoldings } from "../context/HoldingsContext";

const Portfolio = () => {

  const { holdings, loading } = useHoldings();
  


  // Filter states for Stock Holdings table
  const [searchStock, setSearchStock] = useState('')
  const [minQty, setMinQty] = useState('')
  const [maxQty, setMaxQty] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minPnl, setMinPnl] = useState('')
  const [maxPnl, setMaxPnl] = useState('')
  const [pnlFilter, setPnlFilter] = useState('') // 'profit', 'loss', or ''
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) return <DashboardLayout><p>Loading...</p></DashboardLayout>
  
  

  // Compute Portfolio Summary Values
const totalInvestment = holdings.reduce((sum, h) => sum + h.totalInvest, 0);
const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
const totalPnl = holdings.reduce((sum, h) => sum + h.pnl, 0);
const overallROI = totalInvestment > 0 
  ? ((totalPnl / totalInvestment) * 100).toFixed(2) 
  : 0;

// Prepare P&L distribution chart data
const pnlDistribution = holdings.map(h => ({
  name: h.name,
  pnl: h.pnl,
  pnlPercent: ((h.pnl / h.totalInvest) * 100).toFixed(2),
}));

// Prepare Value Allocation chart data
const valueAllocation = holdings
  .map(h => ({
    name: h.name,
    value: h.currentValue,
    percentage: ((h.currentValue / totalValue) * 100).toFixed(1),
  }))
  .sort((a, b) => b.value - a.value);

// Top Performers & Losers
const sortedHoldings = [...holdings].sort((a, b) => b.pnl - a.pnl);
const topPerformers = sortedHoldings.slice(0, 3).filter(h => h.pnl > 0);
const topLosers = sortedHoldings.slice(-3).reverse();

// Portfolio Value Change (use your actual holdings data)
const latestValue = totalValue;
const previousValue = 0; // until you implement real history from backend
const valueChange = latestValue - previousValue;
const valueChangePercent = previousValue > 0 
  ? ((valueChange / previousValue) * 100).toFixed(2) 
  : 0;





  const COLORS = sectorAllocation.map(s => s.color)
  const ASSET_COLORS = assetAllocation.map(a => a.color)




  // Filter stock holdings
  const filteredHoldings = holdings.filter((holding) => {
    const matchesSearch = holding.symbol.toLowerCase().includes(searchStock.toLowerCase())
    const matchesQty = (!minQty || holding.qty >= parseFloat(minQty)) &&
                      (!maxQty || holding.qty <= parseFloat(maxQty))
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h1>
            <p className="text-gray-600">View your portfolio allocation and holdings</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Portfolio Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(latestValue)}</p>
            <p className={`text-sm font-semibold ${valueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {valueChange >= 0 ? '+' : ''}{formatCurrency(valueChange)} ({valueChangePercent >= 0 ? '+' : ''}{valueChangePercent}%)
            </p>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Investment</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvestment )}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Current Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue )}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Profit/Loss</p>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl )}
            </p>
            <p className={`text-sm mt-1 font-semibold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {overallROI >= 0 ? '+' : ''}{overallROI}% ROI
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Number of Holdings</p>
            <p className="text-2xl font-bold text-gray-900">{holdings.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active stocks</p>
          </div>
        </div>

        {/* Sector-wise Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sector-wise Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ sector, percent }) => `${sector}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sector Allocation (Bar Chart)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorAllocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Growth Graph */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Growth Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={portfolioValueHistory}>
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
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Asset Allocation</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {assetAllocation.map((asset) => (
                <div key={asset.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: asset.color }}></div>
                    <span className="text-sm text-gray-700">{asset.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{asset.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* P&L Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profit/Loss by Stock</h2>
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
          {topPerformers.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🏆 Top Performers</h2>
              <div className="space-y-3">
                {topPerformers.map((stock, index) => {
                  const pnlPercent = ((stock.pnl / stock.totalInvest) * 100).toFixed(2)
                  return (
                    <Link
                      key={stock.id}
                      to={`/portfolio/${stock.id}`}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{stock.name}</p>
                          <p className="text-sm text-gray-600">{stock.qty} shares</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{formatCurrency(stock.pnl)}</p>
                        <p className="text-sm text-green-600">+{pnlPercent}%</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top Losers */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📉 Top Losers</h2>
            {topLosers.length > 0 ? (
              <div className="space-y-3">
                {topLosers.map((stock, index) => {
                  const pnlPercent = ((stock.pnl / stock.totalInvest) * 100).toFixed(2)
                  const isNegative = stock.pnl < 0
                  return (
                    <Link
                      key={stock.id}
                      to={`/portfolio/${stock.id}`}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        isNegative 
                          ? 'bg-red-50 hover:bg-red-100' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold ${
                          isNegative ? 'bg-red-600' : 'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{stock.name}</p>
                          <p className="text-sm text-gray-600">{stock.qty} shares</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                          {stock.pnl >= 0 ? '+' : ''}{formatCurrency(stock.pnl)}
                        </p>
                        <p className={`text-sm ${isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                          {pnlPercent >= 0 ? '+' : ''}{pnlPercent}%
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No underperforming stocks</p>
              </div>
            )}
          </div>
        </div>

        {/* Value Allocation */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Value Allocation by Stock</h2>
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
              <div key={item.name} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{item.name}</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(item.value)}</p>
                <p className="text-xs text-gray-500">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Holdings Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Stock Holdings</h2>
            <button 
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
            >
              Clear Filters
            </button>
          </div>

          {/* Filters for Stock Holdings */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Stock</label>
                <input
                  type="text"
                  value={searchStock}
                  onChange={(e) => setSearchStock(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Invest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHoldings.length > 0 ? (
                  filteredHoldings.map((holding) => (
                  <tr key={holding.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/portfolio/${holding.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        {holding.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{holding.qty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(holding.avgPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(holding.currentPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(holding.totalInvest)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(holding.currentValue)}</td>
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
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
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

