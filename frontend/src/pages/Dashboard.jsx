import React, { useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import TransactionsTable from '../components/TransactionsTable';
import { useDashboard } from '../context/DashboardContext';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { HISTORY_RANGES, buildPortfolioHistory, formatHistoryLabel } from '../utilities/portfolioHistory';
import { formatCurrency } from '../utilities/formatters';

const PROFIT_COLORS = ['#28c789', '#20a874', '#17895f', '#116a4b', '#0e513b'];
const LOSS_COLORS = ['#ff6b6b', '#e64f4f', '#c93b3b', '#a82f2f', '#842626'];

/**
 * Main dashboard view offering a high-level overview of portfolio metrics, equity curve, profit/loss leaders, and recent transactions.
 */
const Dashboard = () => {
  const [historyRange, setHistoryRange] = useState('daily');
  const { dashboardData, loading } = useDashboard();

  const {
    totalInvestment = 0,
    currentTotalValue = 0,
    totalPnl = 0,
    numberOfStocks = 0,
    portfolioHistory = [],
    recentTransaction = [],
    profitContribution = [],
    lossContribution = []
  } = dashboardData || {};

  const chartPortfolioHistory = useMemo(
    () => buildPortfolioHistory(portfolioHistory, historyRange),
    [portfolioHistory, historyRange]
  );

  const roi = useMemo(() => {
    if (!totalInvestment) return '0.00';
    return ((totalPnl / totalInvestment) * 100).toFixed(2);
  }, [totalPnl, totalInvestment]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="screen" role="status">
          <div className="empty">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="screen">
        {/* Title & Overall P/L */}
        <section className="screen-head" aria-label="Dashboard metrics header">
          <div>
            <p className="eyebrow">Overview</p>
            <h1 className="screen-title">Portfolio Command</h1>
          </div>
          <div className="tile tile-pad min-w-64">
            <p className="metric-label">Session P/L</p>
            <p className={`metric-value ${totalPnl >= 0 ? 'profit' : 'loss'}`}>
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
            </p>
            <p className={`metric-note ${totalPnl >= 0 ? 'profit' : 'loss'}`}>
              {totalPnl >= 0 ? '+' : ''}{roi}% ROI
            </p>
          </div>
        </section>

        {/* High-level metrics */}
        <section className="metric-grid" aria-label="Key performance indicators">
          <StatCard title="Capital Deployed" value={formatCurrency(totalInvestment)} />
          <StatCard title="Market Value" value={formatCurrency(currentTotalValue)} />
          <StatCard title="Net Gain/Loss" value={formatCurrency(totalPnl)} subtitle={`${roi}%`} trend={totalPnl >= 0 ? 'up' : 'down'} />
          <StatCard title="Open Holdings" value={numberOfStocks} subtitle="Tracked symbols" />
        </section>

        {/* Charts: Equity Curve and Leaders */}
        <section className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
          {/* Equity curve chart */}
          <div className="tile tile-pad">
            <div className="tile-head">
              <div>
                <h2 className="tile-title">Equity Curve</h2>
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Timeframe filter">
                {HISTORY_RANGES.map((range) => (
                  <button
                    key={range.key}
                    type="button"
                    onClick={() => setHistoryRange(range.key)}
                    className={historyRange === range.key ? 'btn-primary h-8 text-xs' : 'btn-ghost h-8 text-xs'}
                    aria-pressed={historyRange === range.key}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {chartPortfolioHistory.length > 0 ? (
              <div className="w-full" style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartPortfolioHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="2 6" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'var(--muted)', fontSize: 11 }}
                      tickFormatter={(value) => formatHistoryLabel(value, historyRange)}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted)', fontSize: 11 }}
                      tickFormatter={(value) => `INR ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => formatHistoryLabel(label, historyRange)}
                      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--text)' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty">No portfolio history available</div>
            )}
          </div>

          {/* Leaders stats list */}
          <div className="grid-stack">
            {/* Profit Leaders */}
            <div className="tile tile-pad">
              <h2 className="tile-title mb-3">Profit Leaders</h2>
              {profitContribution.length > 0 ? (
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitContribution.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={70} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                      <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                      <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                        {profitContribution.slice(0, 5).map((_, index) => (
                          <Cell key={index} fill={PROFIT_COLORS[index % PROFIT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty min-h-32">No profitable holdings</div>
              )}
            </div>

            {/* Loss Leaders */}
            <div className="tile tile-pad">
              <h2 className="tile-title mb-3">Loss Leaders</h2>
              {lossContribution.length > 0 ? (
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lossContribution.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={70} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                      <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                      <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                        {lossContribution.slice(0, 5).map((_, index) => (
                          <Cell key={index} fill={LOSS_COLORS[index % LOSS_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty min-h-32">No loss-making holdings</div>
              )}
            </div>
          </div>
        </section>

        {/* Recent Transactions Blotter */}
        <section className="tile tile-pad" aria-labelledby="recent-tx-title">
          <div className="tile-head">
            <div>
              <h2 id="recent-tx-title" className="tile-title">Recent Transactions</h2>
            </div>
          </div>
          <TransactionsTable transactions={recentTransaction} />
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
