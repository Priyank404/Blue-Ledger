import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import axios from "axios";
import { NseIndia } from "stock-nse-india";
import ApiError from "../utilities/apiError.js";
const nse = new NseIndia();



dayjs.extend(customParseFormat);

const stockResolveCache = new Map();

const normalizeSearchText = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ");

const getCachedResolvedStock = (query) => {
  const key = normalizeSearchText(query);
  return stockResolveCache.get(key);
};

const setCachedResolvedStock = (query, value) => {
  const key = normalizeSearchText(query);
  stockResolveCache.set(key, value);
};

const verifySymbol = async (symbol) => {
  const result = await nse.getEquityDetails(symbol);
  if (!result?.info?.symbol || !result?.priceInfo) {
    throw new ApiError(400, "Stock does not exist in NSE.");
  }

  return {
    symbol: result.info.symbol,
    companyName: result.info.companyName || result.info.symbol,
  };
};

const searchNseStocks = async (query) => {
  const response = await axios.get("https://www.nseindia.com/api/search/autocomplete", {
    params: { q: query },
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json,text/plain,*/*",
      Referer: "https://www.nseindia.com/",
    },
    timeout: 10000,
  });

  const symbols = response.data?.symbols || response.data?.data || [];
  return Array.isArray(symbols) ? symbols : [];
};

export const resolveNseStock = async (query) => {
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    throw new ApiError(400, "Stock name is required.");
  }

  const cached = getCachedResolvedStock(cleanQuery);
  if (cached) return cached;

  try {
    const exactSymbol = await verifySymbol(cleanQuery.toUpperCase());
    setCachedResolvedStock(cleanQuery, exactSymbol);
    return exactSymbol;
  } catch {
    // Not an exact symbol. Continue with name search below.
  }

  try {
    const queryText = normalizeSearchText(cleanQuery);
    const matches = await searchNseStocks(cleanQuery);
    const bestMatch = matches.find((item) => {
      const symbol = normalizeSearchText(item.symbol || item.metadata?.symbol);
      const name = normalizeSearchText(
        item.name || item.companyName || item.metadata?.companyName || item.meta?.companyName
      );

      return symbol === queryText || name === queryText || name.includes(queryText);
    }) || matches[0];

    const symbol = bestMatch?.symbol || bestMatch?.metadata?.symbol;
    if (!symbol) {
      throw new ApiError(400, `"${cleanQuery}" does not exist in NSE.`);
    }

    const resolvedStock = await verifySymbol(symbol);
    setCachedResolvedStock(cleanQuery, resolvedStock);
    return resolvedStock;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, `"${cleanQuery}" does not exist in NSE.`);
  }
};

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


        const finalData = result
          .filter(item => item && item.info && item.priceInfo)
          .map(item => ({
            symbol: item.info.symbol,
            lastPrice: item.priceInfo.lastPrice,
            sector: item.industryInfo?.sector || "N/A"
          }));


        return finalData;
    } catch (error) {
        throw error;
    }
}

