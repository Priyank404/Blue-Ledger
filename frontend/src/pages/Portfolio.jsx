import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useHoldings } from '../context/HoldingsContext';
import { useDashboard } from '../context/DashboardContext';
import { formatCurrency } from '../utilities/formatters';

const COLORS = ['#4f8cff', '#28c789', '#f5b84b', '#9f7aea', '#ff6b6b', '#38bdf8'];
const STATUS_COLORS = {
  profit: '#28c789',
  loss: '#ff6b6b',
  neutral: '#8d9aaa'
};

const Empty = ({ children = 'No data available' }) => <div className="empty" role="status">{children}</div>;

/**
 * Portfolio page showcasing holdings distribution, sector performance, performers stats, and a robust position explorer table.
 */
const Portfolio = () => {
  const {
    holdings = [],
    sectorAllocation: portfolioSectorAllocation = [],
    sectorProfit: portfolioSectorProfit = [],
    loading: holdingsLoading
  } = useHoldings();
  const { dashboardData, loading } = useDashboard();

  const {
    totalInvestment = 0,
    currentTotalValue = 0,
    totalPnl = 0,
    numberOfStocks = 0,
    holdingStatus = { profit: 0, loss: 0, neutral: 0 },
    pnlDistribution = [],
    topPerformerStock = [],
    topLosserStock = [],
    valueAllocation = [],
    overallRoi = 0
  } = dashboardData || {};

  const sectorAllocation = portfolioSectorAllocation;
  const sectorProfit = portfolioSectorProfit;

  // Filter States
  const [searchStock, setSearchStock] = useState('');
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minPnl, setMinPnl] = useState('');
  const [maxPnl, setMaxPnl] = useState('');
  const [pnlFilter, setPnlFilter] = useState('');
  const [holdingsPage, setHoldingsPage] = useState(1);
  const holdingsPageSize = 8;

  // Memoized Filtered Holdings
  const filteredHoldings = useMemo(() => {
    return holdings.filter((holding) => {
      const matchesSearch = holding.symbol.toLowerCase().includes(searchStock.toLowerCase());
      
      const parsedMinQty = parseFloat(minQty);
      const matchesMinQty = isNaN(parsedMinQty) || holding.Quantity >= parsedMinQty;
      
      const parsedMaxQty = parseFloat(maxQty);
      const matchesMaxQty = isNaN(parsedMaxQty) || holding.Quantity <= parsedMaxQty;

      const parsedMinPrice = parseFloat(minPrice);
      const matchesMinPrice = isNaN(parsedMinPrice) || holding.currentPrice >= parsedMinPrice;

      const parsedMaxPrice = parseFloat(maxPrice);
      const matchesMaxPrice = isNaN(parsedMaxPrice) || holding.currentPrice <= parsedMaxPrice;

      const parsedMinPnl = parseFloat(minPnl);
      const matchesMinPnl = isNaN(parsedMinPnl) || holding.pnl >= parsedMinPnl;

      const parsedMaxPnl = parseFloat(maxPnl);
      const matchesMaxPnl = isNaN(parsedMaxPnl) || holding.pnl <= parsedMaxPnl;

      const matchesPnlType = !pnlFilter ||
        (pnlFilter === 'profit' && holding.pnl > 0) ||
        (pnlFilter === 'loss' && holding.pnl < 0);

      return matchesSearch && matchesMinQty && matchesMaxQty && matchesMinPrice && matchesMaxPrice && matchesMinPnl && matchesMaxPnl && matchesPnlType;
    });
  }, [holdings, searchStock, minQty, maxQty, minPrice, maxPrice, minPnl, maxPnl, pnlFilter]);

  // Pagination Logic
  const holdingsTotalPages = Math.ceil(filteredHoldings.length / holdingsPageSize);
  const safePage = Math.min(holdingsPage, Math.max(holdingsTotalPages, 1));
  const holdingsStartIndex = (safePage - 1) * holdingsPageSize;
  
  const paginatedHoldings = useMemo(() => {
    return filteredHoldings.slice(holdingsStartIndex, holdingsStartIndex + holdingsPageSize);
  }, [filteredHoldings, holdingsStartIndex, holdingsPageSize]);

  const pageNumbers = Array.from({ length: holdingsTotalPages }, (_, index) => index + 1);
  const valueChange = currentTotalValue - totalInvestment;

  // Sector Data Calculations
  const sectorChartData = useMemo(() => {
    const rawTotal = sectorAllocation.reduce((sum, item) => {
      const val = Number(item.value) || 0;
      return sum + val;
    }, 0);
    const valueLooksLikePercent = rawTotal > 99 && rawTotal < 101;

    return sectorAllocation
      .map((item) => {
        const percentage = Number(item.percentage ?? (valueLooksLikePercent ? item.value : 0)) || 0;
        const exposure = Number(valueLooksLikePercent ? (currentTotalValue * percentage) / 100 : item.value) || 0;
        return {
          ...item,
          name: item.name || item.sector || 'Unknown',
          value: exposure,
          percentage,
        };
      })
      .filter((item) => item.value > 0 || item.percentage > 0)
      .sort((a, b) => b.value - a.value);
  }, [sectorAllocation, currentTotalValue]);

  const clearFilters = () => {
    setSearchStock('');
    setMinQty('');
    setMaxQty('');
    setMinPrice('');
    setMaxPrice('');
    setMinPnl('');
    setMaxPnl('');
    setPnlFilter('');
    setHoldingsPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > holdingsTotalPages) return;
    setHoldingsPage(page);
  };

  if (loading || holdingsLoading) {
    return (
      <DashboardLayout>
        <div className="screen" role="status">
          <Empty>Loading portfolio...</Empty>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="screen">
        {/* Positions Matrix Header */}
        <section className="screen-head" aria-label="Portfolio summary details">
          <div>
            <p className="eyebrow">Positions</p>
            <h1 className="screen-title">Portfolio Matrix</h1>
          </div>
          <div className="tile tile-pad min-w-64">
            <p className="metric-label">Portfolio Value</p>
            <p className="metric-value">{formatCurrency(currentTotalValue)}</p>
            <p className={`metric-note ${valueChange >= 0 ? 'profit' : 'loss'}`}>
              {valueChange >= 0 ? '+' : ''}{formatCurrency(valueChange)} / {overallRoi >= 0 ? '+' : ''}{overallRoi}%
            </p>
          </div>
        </section>

        {/* Core Stats */}
        <section className="metric-grid" aria-label="Key position metrics">
          <div className="metric">
            <p className="metric-label">Investment</p>
            <p className="metric-value">{formatCurrency(totalInvestment)}</p>
          </div>
          <div className="metric">
            <p className="metric-label">Current Value</p>
            <p className="metric-value">{formatCurrency(currentTotalValue)}</p>
          </div>
          <div className="metric">
            <p className="metric-label">Total P/L</p>
            <p className={`metric-value ${totalPnl >= 0 ? 'profit' : 'loss'}`}>
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
            </p>
            <p className={`metric-note ${totalPnl >= 0 ? 'profit' : 'loss'}`}>
              {overallRoi >= 0 ? '+' : ''}{overallRoi}% ROI
            </p>
          </div>
          <div className="metric">
            <p className="metric-label">Holdings</p>
            <p className="metric-value">{numberOfStocks}</p>
            <p className="metric-note">Active symbols</p>
          </div>
        </section>

        {/* Sectors charts */}
        <section className="grid gap-4 xl:grid-cols-3">
          <div className="tile tile-pad">
            <div className="tile-head mb-3">
              <div>
                <h2 className="tile-title">Sector Allocation</h2>
              </div>
            </div>
            {sectorChartData.length > 0 ? (
              <>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sectorChartData} dataKey="value" nameKey="name" outerRadius={86} innerRadius={52} paddingAngle={2}>
                        {sectorChartData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, _name, props) => [
                          `${formatCurrency(value)} (${props.payload.percentage.toFixed(2)}%)`,
                          props.payload.name
                        ]}
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="sector-legend" role="presentation">
                  {sectorChartData.map((sector, index) => (
                    <div key={sector.name} className="sector-row">
                      <span className="sector-swatch" style={{ background: COLORS[index % COLORS.length] }} />
                      <span className="sector-name">{sector.name}</span>
                      <span className="sector-value">{sector.percentage.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <Empty />}
          </div>

          <div className="tile tile-pad xl:col-span-2">
            <h2 className="tile-title mb-4">Sector P/L</h2>
            {sectorProfit.length > 0 ? (
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorProfit} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="2 6" />
                    <XAxis dataKey="sector" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => `INR ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                    <Bar dataKey="profit" radius={[3, 3, 0, 0]}>
                      {sectorProfit.map((entry, index) => (
                        <Cell key={index} fill={entry.profit >= 0 ? 'var(--positive)' : 'var(--negative)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty />}
          </div>
        </section>

        {/* Leaders Lists */}
        <section className="grid gap-4 xl:grid-cols-3">
          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">Holding Status</h2>
            <div className="space-y-3">
              {Object.entries(holdingStatus).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0" style={{ borderColor: 'var(--line)' }}>
                  <span className="text-sm capitalize muted">{name}</span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: STATUS_COLORS[name] }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">Top Performers</h2>
            <div className="space-y-2">
              {topPerformerStock.length > 0 ? topPerformerStock.slice(0, 5).map((stock) => (
                <Link key={stock.id} to={`/portfolio/${stock.id}`} className="flex items-center justify-between rounded border p-3 hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" style={{ borderColor: 'var(--line)' }}>
                  <span className="font-semibold">{stock.symbol}</span>
                  <span className="profit tabular-nums">+{formatCurrency(stock.pnl)}</span>
                </Link>
              )) : <Empty>No profitable positions</Empty>}
            </div>
          </div>

          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">Top Losers</h2>
            <div className="space-y-2">
              {topLosserStock.length > 0 ? topLosserStock.slice(0, 5).map((stock) => (
                <Link key={stock.id} to={`/portfolio/${stock.id}`} className="flex items-center justify-between rounded border p-3 hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" style={{ borderColor: 'var(--line)' }}>
                  <span className="font-semibold">{stock.symbol}</span>
                  <span className="loss tabular-nums">{formatCurrency(stock.pnl)}</span>
                </Link>
              )) : <Empty>No underperforming positions</Empty>}
            </div>
          </div>
        </section>

        {/* Detailed Breakdown Charts */}
        <section className="grid gap-4 xl:grid-cols-2">
          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">P/L by Stock</h2>
            {pnlDistribution.length > 0 ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="2 6" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => `INR ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                    <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                      {pnlDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.pnl >= 0 ? 'var(--positive)' : 'var(--negative)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty />}
          </div>

          <div className="tile tile-pad">
            <h2 className="tile-title mb-4">Value Allocation</h2>
            {valueAllocation.length > 0 ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={valueAllocation} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                    <Bar dataKey="value" fill="var(--accent)" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty />}
          </div>
        </section>

        {/* Interactive Positions Explorer Table */}
        <section className="tile tile-pad" aria-labelledby="holdings-explorer-title">
          <div className="tile-head">
            <div>
              <h2 id="holdings-explorer-title" className="tile-title">Holdings Explorer</h2>
            </div>
            <button type="button" onClick={clearFilters} className="btn-ghost text-xs h-8 px-2" aria-label="Clear all table filters">Clear Filters</button>
          </div>

          {/* Filters Bar */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3" role="search" aria-label="Holdings Filters">
            <input value={searchStock} onChange={(event) => { setSearchStock(event.target.value); setHoldingsPage(1); }} placeholder="Search symbol" aria-label="Search Symbol" className="field lg:col-span-2" />
            <select value={pnlFilter} onChange={(event) => { setPnlFilter(event.target.value); setHoldingsPage(1); }} aria-label="Filter by Profit or Loss" className="field">
              <option value="">All P/L</option>
              <option value="profit">Profit</option>
              <option value="loss">Loss</option>
            </select>
            <input type="number" value={minQty} onChange={(event) => { setMinQty(event.target.value); setHoldingsPage(1); }} placeholder="Min qty" aria-label="Minimum Quantity" className="field" />
            <input type="number" value={maxQty} onChange={(event) => { setMaxQty(event.target.value); setHoldingsPage(1); }} placeholder="Max qty" aria-label="Maximum Quantity" className="field" />
            <input type="number" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setHoldingsPage(1); }} placeholder="Min price" aria-label="Minimum Price" className="field" />
            <input type="number" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setHoldingsPage(1); }} placeholder="Max price" aria-label="Maximum Price" className="field" />
            <input type="number" value={minPnl} onChange={(event) => { setMinPnl(event.target.value); setHoldingsPage(1); }} placeholder="Min P/L" aria-label="Minimum Profit or Loss" className="field" />
          </div>

          {/* Holdings Data Grid */}
          <div className="table-shell">
            <div className="overflow-x-auto">
              <table className="data-table" aria-label="Active Positions">
                <thead>
                  <tr>
                    <th scope="col">Symbol</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Avg Price</th>
                    <th scope="col">Current Price</th>
                    <th scope="col">Invested</th>
                    <th scope="col">Value</th>
                    <th scope="col">P/L</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHoldings.length > 0 ? paginatedHoldings.map((holding) => (
                    <tr key={holding.id}>
                      <td><Link to={`/portfolio/${holding.id}`} className="font-semibold focus:underline" style={{ color: 'var(--accent-2)' }}>{holding.symbol}</Link></td>
                      <td>{holding.Quantity}</td>
                      <td>{formatCurrency(holding.avgBuyPrice)}</td>
                      <td>{formatCurrency(holding.currentPrice)}</td>
                      <td>{formatCurrency(holding.investedValue)}</td>
                      <td>{formatCurrency(holding.currentValue)}</td>
                      <td className={holding.pnl >= 0 ? 'profit' : 'loss'}>{holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}</td>
                      <td><Link to={`/portfolio/${holding.id}`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--accent-2)' }} aria-label={`Open details for stock ${holding.symbol}`}>Open</Link></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="text-center muted">No holdings match current filters</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination controls */}
          {holdingsTotalPages > 1 && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Table pagination">
              <p className="text-sm muted">Page {safePage} of {holdingsTotalPages} / {filteredHoldings.length} holdings</p>
              <div className="flex gap-2 overflow-x-auto py-1">
                <button type="button" onClick={() => handlePageChange(safePage - 1)} disabled={safePage === 1} className="btn-ghost h-8 px-3 text-xs" aria-label="Previous page">Prev</button>
                {pageNumbers.map((page) => (
                  <button key={page} type="button" onClick={() => handlePageChange(page)} className={page === safePage ? 'btn-primary h-8 px-3 text-xs' : 'btn-ghost h-8 px-3 text-xs'} aria-label={`Go to page ${page}`} aria-current={page === safePage ? 'page' : undefined}>{page}</button>
                ))}
                <button type="button" onClick={() => handlePageChange(safePage + 1)} disabled={safePage === holdingsTotalPages} className="btn-ghost h-8 px-3 text-xs" aria-label="Next page">Next</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
