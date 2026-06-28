import { createContext, useContext, useEffect, useState } from "react";
import { getPortfolioData } from "../APIs/holdings";
import { useAuth } from "../context/AuthContext";

const HoldingsContext = createContext();

export const HoldingProvider = ({ children }) => {
  const [holdings, setHoldings] = useState([]);
  const [sectorAllocation, setSectorAllocation] = useState([]);
  const [sectorProfit, setSectorProfit] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [marketDataStatus, setMarketDataStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const response = await getPortfolioData({ signal: controller.signal });
        setHoldings(response.holdings || []);
        setSectorAllocation(response.sectorAllocation || []);
        setSectorProfit(response.sectorProfit || []);
        setPortfolioHistory(response.portfolioHistory || []);
        setMarketDataStatus(response.marketDataStatus || null);
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") return;
        console.error("Error fetching portfolio data", error);
        setHoldings([]);
        setSectorAllocation([]);
        setSectorProfit([]);
        setPortfolioHistory([]);
        setMarketDataStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();

    return () => controller.abort();
  }, [user, authLoading]);

  return (
    <HoldingsContext.Provider
      value={{ holdings, sectorAllocation, sectorProfit, portfolioHistory, marketDataStatus, loading }}
    >
      {children}
    </HoldingsContext.Provider>
  );
};

export const useHoldings = () => useContext(HoldingsContext);
