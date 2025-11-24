import { createContext, useContext, useEffect, useState } from "react";
import { getHoldings } from "../APIs/holdings";
import { getCurrentPrice } from "../data/usePrice";

const HoldingContext = createContext();


export const HoldingProvider = ({ children }) => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      const data = await getHoldings();

      const structured = data.map(h => {
        const currentPrice = getCurrentPrice(h.symbol);

        return {
          id: h._id,
          name: h.symbol,
          qty: Number(h.Quantity),
          avgPrice: Number(h.avgBuyPrice),
          currentPrice: currentPrice,
          totalInvest: Number(h.avgBuyPrice) * Number(h.Quantity),
          currentValue: currentPrice * Number(h.Quantity),
          pnl:
            currentPrice * Number(h.Quantity) -
            Number(h.avgBuyPrice) * Number(h.Quantity),
        };
      });

      setHoldings(structured);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  return (
    <HoldingContext.Provider value={{ holdings, loading }}>
      {children}
    </HoldingContext.Provider>
  );
};

export const useHoldings = () => useContext(HoldingContext);
