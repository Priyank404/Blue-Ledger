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
  const [sectorAllocation, setSectorAllocation] = useState([]);


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

        const marketDataMap = {};

        priceResponse.data.forEach(p => {
          marketDataMap[p.symbol] ={
            lastPrice: p.lastPrice,
            sector: p.sector
          };
        });

        setPrices(marketDataMap);
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

      //destrctruing price for lastPrice and sectory
      const market = prices[h.symbol] || {};
      const currentPrice = market.lastPrice || 0;
      const sector = market.sector || "Other";

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
        sector
      };
    });

    setHoldings(merged);
  }, [rawHoldings, prices]);

 
   //sector allocations

  useEffect(() => {
  if (!holdings.length) {
    setSectorAllocation([]);
    return;
  }
  const sectorMap = {};
  let totalValue = 0;

  holdings.forEach(h => {
    totalValue += h.currentValue;
    const sector = h.sector;
    sectorMap[sector] =
      (sectorMap[sector] || 0) + h.currentValue;
  });

  const allocation = Object.entries(sectorMap).map(
    ([sector, value]) => ({
      name: sector,
      value: Number(((value / totalValue) * 100).toFixed(2))
    })
  );
  setSectorAllocation(allocation);
}, [holdings]);



  /* ---------------------------
     Final loading state
     --------------------------- */
  const loading = loadingHoldings || loadingPrices;

  return (
    <HoldingContext.Provider value={{ holdings, sectorAllocation, loading }}>
      {children}
    </HoldingContext.Provider>
  );
};

export const useHoldings = () => useContext(HoldingContext);
