import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { NseIndia } from "stock-nse-india";
const nse = new NseIndia();



dayjs.extend(customParseFormat);

export const getStockPrice = async ({ symbol }) => {
  try {
    const result = await nse.getEquityDetails(symbol);

    const rawDate = result.preOpenMarket.lastUpdateTime; 
    // "23-Dec-2025 09:07:16"

    const isoDate = dayjs(
      rawDate,
      "DD-MMM-YYYY HH:mm:ss"
    ).toISOString();

    return [
      {
        date: isoDate,                    // ✅ chart-safe
        price: result.priceInfo.lastPrice // ✅ frontend expects this
      }
    ];
  } catch (error) {
    throw error;
  }
};




export const BulkPrice = async ({symbols})=>{
    try {     
    
        const result = await Promise.all(
            symbols.map( symbol => nse.getEquityDetails(symbol))
        )

        const finalData = result.map((item) => ({
            symbol: item.info.symbol,
            lastPrice: item.priceInfo.lastPrice,
            sector: item.industryInfo.sector
        }))


        return finalData;
    } catch (error) {
        throw error;
    }
}

