import { createContext, useContext, useEffect, useState } from "react";
import { getHoldings } from "../APIs/holdings";
import { getPrice } from "../APIs/FetchPrice";

const HoldingContext = createContext();

export const HoldingProvider = ({ children }) => {
  const [rawHoldings, setRawHoldings] = useState([]);
  const [prices, setPrices] = useState({});
  const [holdings, setHoldings] = useState([]);
  const [loadingHoldings, setLoadingHoldings] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(false);

  /* ---------------------------
     1️⃣ Fetch holdings (DB)
     --------------------------- */
  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoadingHoldings(true);
        const data = await getHoldings(); // always array

        setRawHoldings(data);

        // 👉 IMPORTANT: empty holdings is a VALID state
        if (data.length === 0) {
          setPrices({});
          setHoldings([]);
        }
      } catch (err) {
        console.error("Error fetching holdings", err);
        setRawHoldings([]);
        setPrices({});
        setHoldings([]);
      } finally {
        setLoadingHoldings(false);
      }
    };

    fetchHoldings();
  }, []);

  /* ---------------------------
     2️⃣ Fetch prices (bulk)
     --------------------------- */
  useEffect(() => {
    if (rawHoldings.length === 0) return;

    const fetchPrices = async () => {
      try {
        setLoadingPrices(true);

        const symbols = rawHoldings.map(h => h.symbol);
        const priceResponse = await getPrice(symbols);

        const priceMap = {};
        priceResponse.data.forEach(p => {
          priceMap[p.symbol] = p.lastPrice;
        });

        setPrices(priceMap);
      } catch (err) {
        console.error("Error fetching prices", err);
        setPrices({});
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
  }, [rawHoldings]);

  /* ---------------------------
     3️⃣ Merge holdings + prices
     --------------------------- */
  useEffect(() => {
    if (!rawHoldings.length) return;

    const merged = rawHoldings.map(h => {
      const currentPrice = prices[h.symbol] || 0;
      const qty = Number(h.Quantity);
      const avg = Number(h.avgBuyPrice);

      return {
        id: h._id,
        symbol: h.symbol,
        qty,
        avgPrice: avg,
        currentPrice,
        totalInvest: avg * qty,
        currentValue: currentPrice * qty,
        pnl: (currentPrice - avg) * qty,
      };
    });

    setHoldings(merged);
  }, [rawHoldings, prices]);

  /* ---------------------------
     Final loading state
     --------------------------- */
  const loading = loadingHoldings || loadingPrices;

  return (
    <HoldingContext.Provider value={{ holdings, loading }}>
      {children}
    </HoldingContext.Provider>
  );
};

export const useHoldings = () => useContext(HoldingContext);
