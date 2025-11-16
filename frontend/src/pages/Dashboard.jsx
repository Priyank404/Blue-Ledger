import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import StatCard from '../components/StatCard'
import TransactionsTable from '../components/TransactionsTable'
import { portfolioData, portfolioValueHistory, assetAllocation, transactions } from '../data/dummyData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

const Dashboard = () => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your portfolio overview.</p>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Investment"
            value={formatCurrency(portfolioData.totalInvestment)}
            icon="💰"
          />
          <StatCard
            title="Total Gain/Loss"
            value={formatCurrency(portfolioData.totalGainLoss)}
            subtitle={`${((portfolioData.totalGainLoss / portfolioData.totalInvestment) * 100).toFixed(2)}%`}
            trend={portfolioData.totalGainLoss >= 0 ? 'up' : 'down'}
            icon="📈"
          />
          <StatCard
            title="# of Stocks"
            value={portfolioData.numberOfStocks}
            icon="📊"
          />
          <StatCard
            title="Portfolio Value"
            value={formatCurrency(portfolioData.portfolioValue)}
            icon="💼"
          />
        </div>

        {/* Overall Portfolio Graph */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Portfolio Graph</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioValueHistory}>
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
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Portfolio Value"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Asset Allocation</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={assetAllocation} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
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

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            <TransactionsTable transactions={transactions} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard

