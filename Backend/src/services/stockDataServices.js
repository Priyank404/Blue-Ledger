import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import axios from "axios";
import { NseIndia } from "stock-nse-india";
import YahooFinance from "yahoo-finance2";
import ApiError from "../utilities/apiError.js";

const nse = new NseIndia();
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

dayjs.extend(customParseFormat);

const stockResolveCache = new Map();

const normalizeSearchText = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ");

const normalizeSymbol = (symbol) => String(symbol || "").trim().toUpperCase();

const getCachedResolvedStock = (query) => {
  const key = normalizeSearchText(query);
  return stockResolveCache.get(key);
};

const setCachedResolvedStock = (query, value) => {
  const key = normalizeSearchText(query);
  stockResolveCache.set(key, value);
};

const getEquityDetails = async (symbol) => {
  const cleanSymbol = normalizeSymbol(symbol);
  if (!cleanSymbol) {
    throw new ApiError(400, "Stock symbol is required.");
  }

  return nse.getEquityDetails(cleanSymbol);
};

const getLastUpdateIso = (result) => {
  const rawDate = result?.preOpenMarket?.lastUpdateTime;
  const parsed = rawDate ? dayjs(rawDate, "DD-MMM-YYYY HH:mm:ss") : null;
  return parsed?.isValid() ? parsed.toISOString() : new Date().toISOString();
};

const sectorCache = new Map();

const getSectorFromYahoo = async (symbol) => {
  const cleanSymbol = String(symbol || "").trim().toUpperCase();
  if (!cleanSymbol) return "Other";
  if (sectorCache.has(cleanSymbol)) {
    return sectorCache.get(cleanSymbol);
  }

  try {
    const yahooSymbol = `${cleanSymbol}.NS`;
    const result = await yahooFinance.quoteSummary(yahooSymbol, {
      modules: ["summaryProfile"],
    });
    const sector = String(result?.summaryProfile?.sector || "Other").trim().toUpperCase();
    if (sector && sector !== "OTHER") {
      sectorCache.set(cleanSymbol, sector);
    }
    return sector;
  } catch {
    return "Other";
  }
};

const toPricePayload = async (result, requestedSymbol) => {
  if (!result?.info?.symbol || !result?.priceInfo) return null;

  const symbol = result.info.symbol || normalizeSymbol(requestedSymbol);
  let sector = result.industryInfo?.sector || "";
  if (!sector || sector.trim() === "") {
    sector = await getSectorFromYahoo(symbol);
  } else {
    sector = sector.trim().toUpperCase();
  }

  return {
    symbol,
    lastPrice: Number(result.priceInfo.lastPrice || 0),
    sector: sector || "Other",
    companyName: result.info.companyName || result.info.symbol || normalizeSymbol(requestedSymbol),
  };
};

const verifySymbol = async (symbol) => {
  const result = await getEquityDetails(symbol);
  if (!result?.info?.symbol || !result?.priceInfo) {
    throw new ApiError(400, "Stock does not exist in NSE.");
  }

  return {
    symbol: result.info.symbol,
    companyName: result.info.companyName || result.info.symbol,
  };
};

const searchNseStocks = async (query) => {
  try {
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
  } catch {
    const queryText = normalizeSearchText(query);
    const symbols = await nse.getAllStockSymbols();

    return symbols
      .filter((symbol) => normalizeSearchText(symbol).includes(queryText))
      .slice(0, 10)
      .map((symbol) => ({ symbol }));
  }
};

export const resolveNseStock = async (query) => {
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    throw new ApiError(400, "Stock name is required.");
  }

  const cached = getCachedResolvedStock(cleanQuery);
  if (cached) return cached;

  try {
    const exactSymbol = await verifySymbol(cleanQuery);
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
  const result = await getEquityDetails(symbol);
  const price = await toPricePayload(result, symbol);
  if (!price) {
    throw new ApiError(404, "Stock price not found.");
  }

  return [
    {
      date: getLastUpdateIso(result),
      price: price.lastPrice,
    },
  ];
};

export const BulkPrice = async ({ symbols }) => {
  const cleanSymbols = [...new Set((symbols || []).map(normalizeSymbol).filter(Boolean))];
  if (cleanSymbols.length === 0) return [];

  const result = await Promise.allSettled(
    cleanSymbols.map((symbol) => getEquityDetails(symbol))
  );

  const payloadPromises = result.map((item, index) =>
    item.status === "fulfilled" ? toPricePayload(item.value, cleanSymbols[index]) : null
  );

  const resolvedPayloads = await Promise.all(payloadPromises);
  const finalData = resolvedPayloads.filter(Boolean);

  if (finalData.length === 0) {
    const firstError = result.find((item) => item.status === "rejected")?.reason;
    throw firstError || new ApiError(404, "Stock prices not found.");
  }

  return finalData;
};
