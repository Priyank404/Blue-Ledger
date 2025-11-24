import { createContext, useContext, useEffect, useState } from "react";
import { getTransactions } from "../APIs/transaction";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();

      const structedData = data.map((t =>({
        id: t._id,
        date: t.date,
        name: t.symbol,
        qty: t.quantity,
        price: t.pricePerUnit,
        type: t.transactionType,
        totalAmt: Number(t.pricePerUnit) * Number(t.quantity)
      })))

      setTransactions(structedData);
    } catch (err) {
      console.error("Error fetching transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        refreshTransactions: fetchTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
