import { NseIndia } from "stock-nse-india";
const nse = new NseIndia();

export const getStockPrice= ({symbol})=>{
    try {
        const result = nse.getEquityDetails(symbol)
        return result;
    } catch (error) {
        throw error;
    }
}

