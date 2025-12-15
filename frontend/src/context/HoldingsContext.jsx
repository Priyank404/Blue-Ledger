import { createContext, useContext, useEffect, useState } from "react";
import { getHoldings } from "../APIs/holdings";
import { getPrice } from "../APIs/FetchPrice";

const HoldingContext = createContext();





export const HoldingProvider = ({ children }) => {
  const [rawHoldings, setRawHoldings] = useState([]);
  const [prices, setPrices] = useState({});
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
  const fetchHoldings = async () => {
    setLoading(true);
    const data = await getHoldings();
    setRawHoldings(data);
    setLoading(false);
  };

  fetchHoldings();
}, []);


useEffect(() => {
  if (!rawHoldings.length) return;

  const fetchPrices = async () => {
    const symbols = rawHoldings.map(h => h.symbol);
    const priceData = await getPrice(symbols);


    const priceMap = {};
    priceData.data.forEach(p => {
      priceMap[p.symbol] = p.lastPrice;
      
    });

    setPrices(priceMap);
  };

  fetchPrices();
}, [rawHoldings]);


useEffect(() => {
  if (!rawHoldings.length || !Object.keys(prices).length) return;

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



  return (
    <HoldingContext.Provider value={{ holdings, loading }}>
      {children}
    </HoldingContext.Provider>
  );
};

export const useHoldings = () => useContext(HoldingContext);
