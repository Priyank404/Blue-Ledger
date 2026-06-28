import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import TransactionsTable from '../components/TransactionsTable';
import { useNotification } from '../context/NotificationContext';
import { addTransaction, deleteTransaction, importTransactionsFromCsv } from '../APIs/transaction';
import { useTransactions } from '../context/TransactionContext';
import {
  readStatementWorkbook,
  parseTransactionStatement,
  parseHoldingsStatement
} from '../utilities/statementParser';

/**
 * Transactions Blotter page. Supports manual trade entry, batch upload (Excel/CSV) for trades and opening positions, and granular history searching.
 */
const Transactions = () => {
  const { transactions, loading, pagination, refreshTransactions } = useTransactions();
  const pageSize = 8;
  const { showNotification } = useNotification();

  // Manual transaction inputs
  const [selectedStock, setSelectedStock] = useState('');
  const [transactionType, setTransactionType] = useState('BUY');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [transactionUploading, setTransactionUploading] = useState(false);
  const [holdingsUploading, setHoldingsUploading] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [filterType, setFilterType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter logic
  const filteredTransactions = transactions.filter((transaction) => {
    const nameText = transaction.name || '';
    const matchesSearch = nameText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = !filterStock || nameText === filterStock;
    const matchesType = !filterType || transaction.type === filterType;
    
    const parsedMinPrice = parseFloat(minPrice);
    const matchesMinPrice = isNaN(parsedMinPrice) || transaction.price >= parsedMinPrice;

    const parsedMaxPrice = parseFloat(maxPrice);
    const matchesMaxPrice = isNaN(parsedMaxPrice) || transaction.price <= parsedMaxPrice;

    const matchesStartDate = !startDate || new Date(transaction.date) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(transaction.date) <= new Date(endDate);

    return matchesSearch && matchesStock && matchesType && matchesMinPrice && matchesMaxPrice && matchesStartDate && matchesEndDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStock('');
    setFilterType('');
    setMinPrice('');
    setMaxPrice('');
    setStartDate('');
    setEndDate('');
  };

  // Statement CSV/XLSX Upload handler
  const importStatementRows = async ({ event, statementType }) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const setUploading = statementType === 'transactions' ? setTransactionUploading : setHoldingsUploading;
    setUploading(true);

    try {
      const sheets = await readStatementWorkbook(file);
      const parsedTransactions = statementType === 'transactions'
        ? parseTransactionStatement(sheets, transactionType)
        : parseHoldingsStatement(sheets);

      if (parsedTransactions.length === 0) {
        showNotification(
          statementType === 'transactions'
            ? 'Transaction statement must include Symbol, Trade Type (Side), Quantity, Price, and Date.'
            : 'Holdings statement must include Symbol, Quantity Available, and Average Price.',
          'error'
        );
        return;
      }

      const result = await importTransactionsFromCsv(parsedTransactions);
      refreshTransactions(1, pageSize);
      if (result.failedCount > 0) {
        showNotification(
          `Imported ${result.importedCount} rows. ${result.failedCount} rows failed. First error: row ${result.failed[0].row} - ${result.failed[0].message}`,
          'warning'
        );
      } else {
        showNotification(`Imported ${result.importedCount} transactions successfully`, 'success');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to import statement', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // Submit manual transaction form
  const handleAddTransaction = async (event) => {
    event.preventDefault();
    try {
      await addTransaction(transactionType, selectedStock, qty, price, date);
      showNotification('Transaction added successfully', 'success');
      setSelectedStock('');
      setQty('');
      setPrice('');
      setDate('');
      setShowAddForm(false);
      refreshTransactions(1, pageSize);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to add transaction', 'error');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await deleteTransaction(transactionId);
      showNotification('Transaction deleted successfully', 'success');
      const nextPage = filteredTransactions.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      refreshTransactions(nextPage, pageSize);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to delete transaction', 'error');
    }
  };

  const handlePageChange = (page) => {
    if (page === pagination.page || page < 1 || page > pagination.totalPages) return;
    refreshTransactions(page, pageSize);
  };

  const pageNumbers = Array.from({ length: pagination.totalPages }, (_, index) => index + 1);

  return (
    <DashboardLayout>
      <div className="screen">
        {/* Title */}
        <section className="screen-head" aria-label="Transactions Blotter View">
          <div>
            <p className="eyebrow">Orders</p>
            <h1 className="screen-title">Transaction Blotter</h1>
            <p className="screen-copy">Filter, import, and enter buy/sell transactions.</p>
          </div>
          <button 
            onClick={() => setShowAddForm((value) => !value)} 
            className="btn-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            aria-expanded={showAddForm}
          >
            {showAddForm ? 'Close Entry' : 'New Transaction'}
          </button>
        </section>

        {/* Input Form or Filters bar */}
        <section className="tile tile-pad">
          {showAddForm ? (
            <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
              {/* Left Column: Import Statements */}
              <div className="grid-stack">
                <div className="tile tile-pad" style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}>
                  <h2 className="tile-title mb-2">Import Tradebook</h2>
                  <p className="screen-copy mb-3 text-xs">Upload tradebook files (CSV or Excel) containing Symbol, side, quantity, price, and date.</p>
                  <label className="btn-primary cursor-pointer text-xs h-9 inline-flex items-center justify-center focus-within:ring-2 focus-within:ring-[var(--accent)]">
                    {transactionUploading ? 'Importing...' : 'Upload Tradebook'}
                    <input 
                      type="file" 
                      accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                      onChange={(event) => importStatementRows({ event, statementType: 'transactions' })} 
                      disabled={transactionUploading} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="tile tile-pad" style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}>
                  <h2 className="tile-title mb-2">Import Holdings</h2>
                  <p className="screen-copy mb-3 text-xs">Upload opening position balances containing Symbol, Quantity Available, and Avg Price.</p>
                  <label className="btn-ghost cursor-pointer text-xs h-9 inline-flex items-center justify-center focus-within:ring-2 focus-within:ring-[var(--line-strong)]">
                    {holdingsUploading ? 'Importing...' : 'Upload Holdings'}
                    <input 
                      type="file" 
                      accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                      onChange={(event) => importStatementRows({ event, statementType: 'holdings' })} 
                      disabled={holdingsUploading} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Right Column: Manual Entry Form */}
              <form onSubmit={handleAddTransaction} className="grid gap-4" aria-label="Manual Transaction Entry Form">
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Transaction Side">
                  {['BUY', 'SELL'].map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setTransactionType(side)}
                      className={transactionType === side ? 'btn-primary' : 'btn-ghost'}
                      style={transactionType === side && side === 'SELL' ? { background: 'var(--negative)' } : undefined}
                      aria-checked={transactionType === side}
                      role="radio"
                    >
                      {side}
                    </button>
                  ))}
                </div>
                <div>
                  <label htmlFor="tx-symbol" className="label">Symbol</label>
                  <input 
                    id="tx-symbol" 
                    type="text" 
                    value={selectedStock} 
                    onChange={(event) => setSelectedStock(event.target.value)} 
                    placeholder="Enter NSE stock name (e.g. RELIANCE)" 
                    className="field" 
                    required 
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="tx-quantity" className="label">Quantity</label>
                    <input 
                      id="tx-quantity" 
                      type="number" 
                      min="1"
                      value={qty} 
                      onChange={(event) => setQty(event.target.value)} 
                      placeholder="Qty" 
                      className="field" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="tx-price" className="label">Price</label>
                    <input 
                      id="tx-price" 
                      type="number" 
                      step="0.01"
                      min="0.01"
                      value={price} 
                      onChange={(event) => setPrice(event.target.value)} 
                      placeholder="Price per unit" 
                      className="field" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="tx-date" className="label">Date</label>
                    <input 
                      id="tx-date" 
                      type="date" 
                      value={date} 
                      onChange={(event) => setDate(event.target.value)} 
                      className="field" 
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full h-10 mt-2">Submit Transaction</button>
              </form>
            </div>
          ) : (
            /* Filtering Console */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4" role="search" aria-label="Transactions Filters">
              <div className="lg:col-span-2">
                <label htmlFor="filter-search" className="label">Search</label>
                <input id="filter-search" type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search symbol" className="field" />
              </div>
              <div>
                <label htmlFor="filter-stock" className="label">Symbol Match</label>
                <select id="filter-stock" value={filterStock} onChange={(event) => setFilterStock(event.target.value)} className="field">
                  <option value="">All</option>
                  {[...new Set(transactions.map(t => t.name))].map((symbolName) => (
                    <option key={symbolName} value={symbolName}>{symbolName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filter-side" className="label">Side</label>
                <select id="filter-side" value={filterType} onChange={(event) => setFilterType(event.target.value)} className="field">
                  <option value="">All</option>
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>
              <div>
                <label htmlFor="filter-min-price" className="label">Min Price</label>
                <input id="filter-min-price" type="number" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} className="field" />
              </div>
              <div>
                <label htmlFor="filter-max-price" className="label">Max Price</label>
                <input id="filter-max-price" type="number" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="field" />
              </div>
              <div className="flex items-end">
                <button onClick={clearFilters} type="button" className="btn-ghost w-full h-9 focus:ring-1 focus:ring-[var(--line-strong)]" aria-label="Reset all search filters">Reset Filters</button>
              </div>
              <div className="lg:col-span-7 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="filter-start-date" className="label">Start Date</label>
                  <input id="filter-start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="field" />
                </div>
                <div>
                  <label htmlFor="filter-end-date" className="label">End Date</label>
                  <input id="filter-end-date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="field" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Transactions Table */}
        <section className="tile tile-pad" aria-labelledby="blotter-table-title">
          <h2 id="blotter-table-title" className="tile-title mb-4">Blotter Records</h2>
          {loading ? (
            <div className="empty" role="status">Loading transactions...</div>
          ) : (
            <TransactionsTable transactions={filteredTransactions} showAll showDelete onDelete={handleDeleteTransaction} />
          )}
        </section>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <section className="tile tile-pad flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Table pagination">
            <p className="text-sm muted">Page {pagination.page} of {pagination.totalPages} / {pagination.total} rows</p>
            <div className="flex gap-2 overflow-x-auto py-1">
              <button type="button" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="btn-ghost h-8 px-3 text-xs" aria-label="Previous page">Prev</button>
              {pageNumbers.map((page) => (
                <button 
                  key={page} 
                  type="button" 
                  onClick={() => handlePageChange(page)} 
                  className={page === pagination.page ? 'btn-primary h-8 px-3 text-xs' : 'btn-ghost h-8 px-3 text-xs'}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === pagination.page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button type="button" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="btn-ghost h-8 px-3 text-xs" aria-label="Next page">Next</button>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
