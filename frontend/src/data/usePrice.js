// src/hooks/usePrice.js

import { stocks } from "../data/dummyData";

/**
 * Returns the current price for a given stock symbol.
 * Works with dummy data for now.
 * Later you can replace this with a real LIVE API.
 */
export const getCurrentPrice = (symbol) => {
  if (!symbol) return 0;

  const stock = stocks.find((s) => s.symbol === symbol);

  return stock ? stock.currentPrice : 0;
};
