export const getPortfolioValueHistory = async () => {
  const res = await api.get("/portfolio/value-history");
  return res.data.data; // array of { date, value }
};