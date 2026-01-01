import { parse } from "json2csv";
import ApiError from "../utilities/apiError.js";

const csvConfigs = {
  transactions: {
    filename: "transactions.csv",
    fields: [
      { label: "Date", value: row => row.date instanceof Date ? row.date.toISOString().split("T")[0]: "" },
      { label: "Type", value: "transactionType" },
      { label: "Symbol", value: "symbol" },
      { label: "Quantity", value: "quantity" },
      { label: "Price Per Unit", value: "price" },
      { label: "Total Value", value: "totalValue" }
    ]
  },

  holdings: {
    filename: "holdings.csv",
    fields: [
      { label: "Symbol", value: "symbol" },
      { label: "Quantity", value: "quantity" },
      { label: "Avg Buy Price", value: "avgBuyPrice" },
      { label: "Current Price", value: "livePrice" },
      { label: "Invested Value", value: "totalValue" },
      { label: "Current Value", value: "currentValue" },
      { label: "PnL", value: "pnl" },
      { label: "PnL %", value: "pnlPercentage" }
    ]
  },

  portfolioSummary: {
    filename: "portfolio_summary.csv",
    fields: [
      { label: "Total Invested", value: "totalInvested" },
      { label: "Current Value", value: "currentValue" },
      { label: "Total PnL", value: "pnl" },
      { label: "PnL %", value: "pnlPercentage" },
      { label: "Holding Count", value: "holdingCount" }
    ]
  },

  portfolioHistory: {
    filename: "portfolio_history.csv",
    fields: [
      { label: "Date", value: row => row.date ? new Date(row.date).toISOString().split("T")[0] : "" },
      { label: "Portfolio Value", value: "value" }
    ]
  }
};

export const toCsv = (type, data) => {
  const config = csvConfigs[type];

  if (!config) {
    throw new ApiError(400, "CSV export not supported for this type");
  }

  const csv = parse(data, { fields: config.fields });

  return {
    csv,
    filename: config.filename
  };
};

