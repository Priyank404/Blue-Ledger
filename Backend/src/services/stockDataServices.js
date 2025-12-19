import { NseIndia } from "stock-nse-india";
const nse = new NseIndia();

export const getStockPrice= async ({symbol})=>{
    try {
        const result = await nse.getEquityDetails(symbol)
        return result;
    } catch (error) {
        throw error;
    }
}

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

