import { useMemo } from "react";
import { useHoldings } from "../context/HoldingsContext";

const normalizePortfolioHistory = (data) => {
  const map = new Map();
  data.forEach((item) => {
    const rawDate = item.day || item.date;
    const day = rawDate ? new Date(rawDate).toISOString().split("T")[0] : null;
    if (!day) return;
    map.set(day, { day, value: item.value });
  });
  return Array.from(map.values()).sort((a, b) => new Date(a.day) - new Date(b.day));
};

/**
 * Custom hook to consume historical portfolio data normalized for charts.
 * Derives state directly from HoldingsContext, eliminating provider nesting.
 */
export const useChart = () => {
  const { portfolioHistory: rawHistory, loading } = useHoldings();

  const portfolioHistory = useMemo(
    () => normalizePortfolioHistory(rawHistory || []),
    [rawHistory]
  );

  return {
    portfolioHistory,
    loading,
    error: null,
    refreshPortfolioHistory: () => {}, // Handled by HoldingsContext refresh
  };
};
