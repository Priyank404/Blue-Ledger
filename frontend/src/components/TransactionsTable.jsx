import React from 'react';
import { formatCurrency, formatDate } from '../utilities/formatters';

/**
 * Reusable table component for displaying stock transactions.
 */
const TransactionsTable = ({ transactions = [], showAll = false, onDelete = null, showDelete = false }) => {
  const displayTransactions = showAll ? transactions : transactions.slice(0, 6);

  const handleDelete = (transactionId, symbolName) => {
    if (window.confirm(`Are you sure you want to delete this transaction for ${symbolName}?`)) {
      if (onDelete) onDelete(transactionId);
    }
  };

  if (displayTransactions.length === 0) {
    return <div className="empty" role="status">No transactions found</div>;
  }

  return (
    <div className="table-shell">
      <div className="overflow-x-auto">
        <table className="data-table" aria-label="Transactions Log">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Symbol</th>
              <th scope="col">Side</th>
              <th scope="col">Qty</th>
              <th scope="col">Price</th>
              <th scope="col">Notional</th>
              {showDelete && <th scope="col">Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayTransactions.map((transaction, index) => {
              const nameText = transaction.name || transaction.symbol || '';
              return (
                <tr key={transaction.id ?? `tx-${index}`}>
                  <td>{formatDate(transaction.date)}</td>
                  <td className="font-semibold">{nameText}</td>
                  <td>
                    <span 
                      className={`badge ${transaction.type === 'BUY' ? 'badge-buy' : 'badge-sell'}`}
                      aria-label={`Transaction Type: ${transaction.type}`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td>{transaction.qty}</td>
                  <td>{formatCurrency(transaction.price)}</td>
                  <td className="font-semibold">{formatCurrency(transaction.totalAmt)}</td>
                  {showDelete && (
                    <td>
                      <button 
                        onClick={() => handleDelete(transaction.id, nameText)} 
                        className="text-sm font-semibold loss hover:underline focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-1"
                        aria-label={`Delete transaction of ${transaction.qty} shares for ${nameText}`}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;
