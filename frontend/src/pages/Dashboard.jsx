import { useMemo } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import StatCard from '../components/StatCard'
import TransactionsTable from '../components/TransactionsTable'
import { useTransactions } from '../context/TransactionContext'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useChart } from '../context/ChartContext'
import { useHoldings } from '../context/HoldingsContext'

const COLORS = [
  '#3b82f6',
  '#16a34a',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6'
]

// Green shades (dark → light)
const getGreenShade = (index, total) => {
  const lightness = 35 + (index / Math.max(total - 1, 1)) * 40;
  return `hsl(142, 70%, ${lightness}%)`;
};

// Red shades (dark → light)
const getRedShade = (index, total) => {
  const lightness = 35 + (index / Math.max(total - 1, 1)) * 40;
  return `hsl(0, 70%, ${lightness}%)`;
};

const getStatusColor = (pnl) => {
  if (pnl > 0) return "#16a34a"; // green
  if (pnl < 0) return "#dc2626"; // red
  return "#9ca3af";              // gray
};


const Dashboard = () => {
  /* ================= CONTEXTS ================= */
  const { portfolioHistory, loading: chartLoading } = useChart()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { holdings, loading: holdingsLoading } = useHoldings()

  const isDashboardLoading =
    chartLoading || holdingsLoading || transactionsLoading

  /* ================= HELPERS ================= */
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)

  /* ================= CALCULATIONS ================= */
  const totalInvestment = holdings.reduce(
    (sum, h) => sum + h.totalInvest,
    0
  )
  const totalValue = holdings.reduce(
    (sum, h) => sum + h.currentValue,
    0
  )
  const totalPnl = holdings.reduce((sum, h) => sum + h.pnl, 0)

  /* ================= PIE DATA ================= */


  // label render 
 const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
  payload
}) => {
  if (percent < 0.02) return null; // optional cutoff

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const startX = cx + outerRadius * cos;
  const startY = cy + outerRadius * sin;

  const midX = cx + (outerRadius + 14) * cos;
  const midY = cy + (outerRadius + 14) * sin;

  const endX = midX + (cos >= 0 ? 18 : -18);
  const endY = midY;

  const color = getStatusColor(payload.pnl);

  return (
    <g>
      {/* Arrow line */}
      <path
        d={`M${startX},${startY} L${midX},${midY} L${endX},${endY}`}
        stroke={color}
        fill="none"
        strokeWidth={1}
      />

      {/* Dot */}
      <circle cx={endX} cy={endY} r={2} fill={color} />

      {/* Text */}
      <text
        x={endX + (cos >= 0 ? 4 : -4)}
        y={endY}
        textAnchor={cos >= 0 ? "start" : "end"}
        dominantBaseline="central"
        fill={color}
        fontSize={12}
        fontWeight={500}
      >
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};


  // 🟢 Profit Contribution
  const profitContributionData = useMemo(() => {
    return holdings
      .filter(h => h.pnl > 0)
      .map(h => ({
        name: h.symbol,
        value: h.pnl
      }))
      .sort((a, b) => b.value - a.value)
  }, [holdings])



  // 🔴 Loss Contribution (absolute values)
  const lossContributionData = useMemo(() => {
    return holdings
      .filter(h => h.pnl < 0)
      .map(h => ({
        name: h.symbol,
        value: Math.abs(h.pnl)
      }))
      .sort((a, b) => b.value - a.value)
  }, [holdings])

  /* ================= LOADING ================= */
  if (isDashboardLoading) {
    return (
      <DashboardLayout>
        <p className="text-gray-900 dark:text-white">
          Loading dashboard...
        </p>
      </DashboardLayout>
    )
  }

  /* ================= UI ================= */
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's your portfolio overview.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Investment"
            value={formatCurrency(totalInvestment)}
            icon="💰"
          />
          <StatCard
            title="Total Gain/Loss"
            value={formatCurrency(totalPnl)}
            subtitle={`${((totalPnl / totalInvestment) * 100).toFixed(2)}%`}
            trend={totalPnl >= 0 ? 'up' : 'down'}
            icon="📈"
          />
          <StatCard
            title="Number of Stocks"
            value={holdings.length}
            icon="📊"
          />
          <StatCard
            title="Portfolio Value"
            value={formatCurrency(totalValue)}
            icon="💼"
          />
        </div>

        {/* Overall Portfolio Graph */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Overall Portfolio Graph
          </h2>

          {portfolioHistory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No portfolio history yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric'
                    })
                  }
                />
                <YAxis
                  tickFormatter={(value) =>
                    `₹${(value / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString()
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* PROFIT & LOSS CONTRIBUTION (DUAL PIE) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Profit & Loss Contribution
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profit Pie */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                Profit Contribution
              </h3>

              {profitContributionData.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No profitable stocks
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={profitContributionData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      labelLine={false}          // 👈 THIS enables the arrow line
                      label={renderPieLabel}    // 👈 Custom label
                    >
                      {profitContributionData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={getGreenShade(index, profitContributionData.length)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCurrency(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Loss Pie */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Loss Contribution
              </h3>

              {lossContributionData.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No loss-making stocks 🎉
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={lossContributionData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      labelLine={false}          // 👈 THIS enables the arrow line
                      label={renderPieLabel}    // 👈 Custom label
                    >
                      {lossContributionData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={getRedShade(index, lossContributionData.length)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCurrency(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Transactions
          </h2>
          <TransactionsTable transactions={transactions} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
