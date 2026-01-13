import { createContext, useContext, useEffect, useState } from "react";
import { getPortfolioValueHistory } from "../APIs/ChartApi";
import { getPortfolioData } from "../APIs/holdings";

const ChartContext = createContext(null);

export const ChartProvider = ({ children }) => {
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const normalizePortfolioHistory = (data) => {
  const map = new Map();

  data.forEach(item => {
    const day = new Date(item.date).toISOString().split("T")[0];

    // overwrite → keeps LAST value of the day
    map.set(day, {
      date: day,
      value: item.value
    });
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};


  const fetchPortfolioHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPortfolioData();




      setPortfolioHistory(normalizePortfolioHistory(response.portfolioHistory || []));
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
