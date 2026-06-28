import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import TransactionsTable from '../components/TransactionsTable';
import { useNotification } from '../context/NotificationContext';
import { deleteTransaction } from '../APIs/transaction';
import { getSingleStokData } from '../APIs/singleStock';
import { formatCurrency } from '../utilities/formatters';

const Empty = ({ children = 'No data available' }) => <div className="empty" role="status">{children}</div>;

/**
 * Detailed view of a single stock position. Shows historical curves, transaction statistics, and raw transaction listings.
 */
const PortfolioDetails = () => {
  const { id } = useParams();
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getSingleStokData(id);
        setStockData(data);
      } catch (err) {
        console.error("Error fetching single stock details", err);
        setStockData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDeleteTransaction = async (transactionId) => {
    try {
      const response = await deleteTransaction(transactionId);
      showNotification(response.message || 'Transaction deleted successfully', 'success');
      // Refresh local view if possible or let context refresh
      if (stockData?.transactions) {
        setStockData(prev => ({
          ...prev,
          transactions: prev.transactions.filter(tx => tx.id !== transactionId)
        }));
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to delete transaction', 'error');
    }
  };

  const buyCount = useMemo(() => {
    return stockData?.transactions?.filter((transaction) => transaction.type === 'BUY').length || 0;
  }, [stockData]);

  const sellCount = useMemo(() => {
    return stockData?.transactions?.filter((transaction) => transaction.type === 'SELL').length || 0;
  }, [stockData]);

  const transactionDistribution = useMemo(() => {
    return [
      { name: 'Buy', value: buyCount },
      { name: 'Sell', value: sellCount },
    ];
  }, [buyCount, sellCount]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="screen" role="status">
          <Empty>Loading stock...</Empty>
        </div>
      </DashboardLayout>
    );
  }

  if (!stockData) {
    return (
      <DashboardLayout>
        <div className="screen">
          <section className="tile tile-pad text-center">
            <h1 className="screen-title">Stock not found</h1>
            <Link to="/portfolio" className="btn-primary mt-5">Return to Portfolio</Link>
          </section>
        </div>
      </DashboardLayout>
    );
  }

  const stock = stockData;
  const priceHistory = stockData.priceHistory || [];
  const stockTransactions = stockData.transactions || [];
  const pnlOverTime = stockData.pnlOverTime || [];
  const priceComparisonData = stockData.priceComparisonData || [];
  const valueOverTime = stockData.valueOverTime || [];

  return (
    <DashboardLayout>
      <div className="screen">
        {/* Header */}
        <section className="screen-head" aria-label="Stock Header">
          <div>
            <p className="eyebrow">Single Position</p>
            <h1 className="screen-title">{stock.symbol}</h1>
            <p className="screen-copy">Price, value, P/L, and transaction history for this holding.</p>
          </div>
          <Link to="/portfolio" className="btn-ghost focus:ring-1 focus:ring-[var(--accent)] rounded">Back to Portfolio</Link>
        </section>

        {/* Core metrics */}
        <section className="metric-grid" aria-label="Key stock price statistics">
          <div className="metric"><p className="metric-label">Current Price</p><p className="metric-value">{formatCurrency(stock.currentPrice)}</p></div>
          <div className="metric"><p className="metric-label">Avg Buy Price</p><p className="metric-value">{formatCurrency(stock.avgPrice)}</p></div>
          <div className="metric"><p className="metric-label">Quantity</p><p className="metric-value">{stock.qty}</p><p className="metric-note">Shares</p></div>
          <div className="metric"><p className="metric-label">ROI</p><p className={`metric-value ${stock.roi >= 0 ? 'profit' : 'loss'}`}>{stock.roi >= 0 ? '+' : ''}{stock.roi}%</p></div>
        </section>

        {/* Investment totals */}
        <section className="metric-grid" aria-label="Key stock valuation metrics">
          <div className="metric"><p className="metric-label">Investment</p><p className="metric-value">{formatCurrency(stock.totalInvest)}</p></div>
          <div className="metric"><p className="metric-label">Current Value</p><p className="metric-value">{formatCurrency(stock.currentValue)}</p></div>
          <div className="metric"><p className="metric-label">Profit/Loss</p><p className={`metric-value ${stock.pnl >= 0 ? 'profit' : 'loss'}`}>{stock.pnl >= 0 ? '+' : ''}{formatCurrency(stock.pnl)}</p><p className={`metric-note ${stock.pnl >= 0 ? 'profit' : 'loss'}`}>{stock.pnlPercentage >= 0 ? '+' : ''}{stock.pnlPercentage}%</p></div>
          <div className="metric"><p className="metric-label">Transactions</p><p className="metric-value">{stockTransactions.length}</p></div>
        </section>

        {/* Historical Charts */}
        <section className="grid gap-4 xl:grid-cols-2">
          {/* Price History */}
          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">Price History</h2>
            {priceHistory.length > 0 ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="2 6" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => `INR ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => new Date(label).toLocaleDateString()} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                    <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty>Price history will appear after market close</Empty>}
          </div>

          {/* Price vs Average */}
          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">Price vs Average</h2>
            {priceComparisonData.length > 0 ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="2 6" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => `INR ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                    <Line type="monotone" dataKey="currentPrice" stroke="var(--accent)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="avgBuyPrice" stroke="var(--positive)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty />}
          </div>

          {/* Value Over Time */}
          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">Value Over Time</h2>
            {valueOverTime.length > 0 ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={valueOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="2 6" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => `INR ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                    <Line type="monotone" dataKey="value" stroke="var(--positive)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="avgBuyValue" stroke="var(--warning)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty />}
          </div>

          {/* P/L Trend */}
          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">P/L Trend</h2>
            {pnlOverTime.length > 0 ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="2 6" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => `INR ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value, name, props) => [`${formatCurrency(value)} (${props.payload.pnlPercent}%)`, 'P/L']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                    <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                      {pnlOverTime.map((entry, index) => (
                        <Cell key={index} fill={entry.pnl > 0 ? 'var(--positive)' : 'var(--negative)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty />}
          </div>
        </section>

        {/* Splits & Details */}
        <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">Investment Details</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['Total Invest', formatCurrency(stock.totalInvest)],
                ['Current Value', formatCurrency(stock.currentValue)],
                ['Quantity', `${stock.qty} shares`],
                ['Avg Buy Price', formatCurrency(stock.avgPrice)],
                ['Profit/Loss', `${stock.pnl >= 0 ? '+' : ''}${formatCurrency(stock.pnl)} (${stock.pnlPercentage}%)`],
                ['ROI', `${stock.roi >= 0 ? '+' : ''}${stock.roi}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded border p-3 bg-[var(--surface-2)]" style={{ borderColor: 'var(--line)' }}>
                  <p className="metric-label">{label}</p>
                  <p className="mt-2 font-semibold tabular-nums">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">Transaction Split</h2>
            {stockTransactions.length > 0 ? (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={transactionDistribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82}>
                      <Cell fill="var(--positive)" />
                      <Cell fill="var(--negative)" />
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty>No transactions found</Empty>}
            <button onClick={() => setShowHistory((value) => !value)} className="btn-ghost mt-4 w-full text-xs h-9" aria-label="Toggle details transaction history log">
              {showHistory ? 'Hide History' : 'View History'}
            </button>
          </div>
        </section>

        {/* Historical Transaction log if requested */}
        {showHistory && stock.transactions.length > 0 && (
          <section className="tile tile-pad" aria-labelledby="tx-history-table-title">
            <h2 id="tx-history-table-title" className="tile-title mb-4">Transaction History</h2>
            <TransactionsTable transactions={stock.transactions} showAll showDelete onDelete={handleDeleteTransaction} />
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PortfolioDetails;
