import api from "./axios";

export const getPortfolioValueHistory = async () => {
  const res = await api.get("/api/portfolio/value-history");
  return res.data.data; // array of { date, value }
};