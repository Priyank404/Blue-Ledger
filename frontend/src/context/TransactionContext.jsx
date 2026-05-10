import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getTransactions } from "../APIs/transaction";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  });

  const fetchTransactions = useCallback(async (page = 1, limit = 8) => {
    try {
      setLoading(true);
      const data = await getTransactions({ page, limit });
      const transactionData = Array.isArray(data) ? data : data.transactions || [];

      const structedData = transactionData.map((t =>({
        id: t._id,
        date: t.date,
        name: t.symbol,
        qty: t.quantity,
        price: t.pricePerUnit,
        type: t.transactionType,
        totalAmt: Number(t.pricePerUnit) * Number(t.quantity)
      })))

      setTransactions(structedData);
      setPagination(
        Array.isArray(data)
          ? { page, limit, total: structedData.length, totalPages: Math.ceil(structedData.length / limit) }
          : data.pagination
      );
    } catch (err) {
      console.error("Error fetching transactions", err);
      setTransactions([]);
      setPagination({ page, limit, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        pagination,
        refreshTransactions: fetchTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
