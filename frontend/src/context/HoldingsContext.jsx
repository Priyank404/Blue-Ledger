import { createContext, useContext, useEffect, useState } from "react";
import { getPortfolioData } from "../APIs/holdings";

const HoldingsContext = createContext();



export const HoldingProvider = ({ children }) => {
  const [holdings, setHoldings] = useState([]);
  const [sectorAllocation, setSectorAllocation] = useState([]);
  const [sectorProfit, setSectorProfit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const fetchProtfolioData = async () =>{
      try {
        setLoading(true);

        const response = await getPortfolioData();

        setHoldings(response.holdings || []);
        setSectorAllocation(response.sectorAllocation || []);
        setSectorProfit(response.sectorProfit || []);

      } catch (error) {
          console.log("Error fetching portfolio data", error);
          setHoldings([]);
          setSectorAllocation([]);
          setSectorProfit([]);
      }finally{
        setLoading(false);
      }
    }

    fetchProtfolioData();
  },[]);

  return (
    <HoldingsContext.Provider value={{ holdings, sectorAllocation, sectorProfit, loading }}>
      {children}
    </HoldingsContext.Provider>
  );
};


export const useHoldings = () => useContext(HoldingsContext);