import { createContext, useContext, useEffect, useState } from "react";
import { getPortfolioValueHistory } from "../APIs/ChartApi";

const ChartContext = createContext(null);

export const ChartProvider = ({ children }) => {
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolioHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getPortfolioValueHistory();
      setPortfolioHistory(data || []);
    } catch (err) {
      console.error("Error fetching portfolio chart history", err);
      setError("Failed to load chart data");
      setPortfolioHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioHistory();
  }, []);

  return (
    <ChartContext.Provider
      value={{
        portfolioHistory,
        loading,
        error,
        refreshPortfolioHistory: fetchPortfolioHistory
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};

export const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used inside ChartProvider");
  }
  return context;
};
