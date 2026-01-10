import { getLivePriceCached } from "./stockPriceCacheServices.js";
import { Portfolio} from "../models/portfolioSchema.js";
import { Holdings } from "../models/holdingSchema.js";
import logger from "../utilities/logger.js";

export const calculatePortfolioAnalytics = async ({userId}) =>{

    try {
        const portfolio = await Portfolio.findOne({user: userId});
    if(!portfolio){
        return emptyPortfolioData();
    }

    const holdings = await Holdings.find({Portfolio: portfolio._id});
     if(!holdings || holdings.length === 0){
        return emptyPortfolioData();
    }

    const symbols = holdings.map(h => h.symbol);
    const livePrice = getLivePriceCached(symbols);

    const priceMap = {};
    const sectorMap = {};

    livePrice.forEach((p) => {
        priceMap[p.symbol] = p.lastPrice;
        sectorMap[p.sector] = p.sector || "Other";
    })

    const holdingWithPnL = holdings.map((h) =>{
        const currentPrice = priceMap[h.symbol] || 0;
        const qty = Number(h.Quantity);
        const avgPrice = Number(h.avgBuyPrice) || 0;
        const investedValue = avgPrice * qty;
        const currentValue = currentPrice * qty;
        const pnl = currentValue - investedValue;

        return {
            id: h._id,
            symbol: h.symbol,
            avgBuyPrice: avgPrice,
            Quantity: qty,
            currentPrice: currentPrice,
            investedValue: investedValue,
            currentValue: currentValue,
            pnl: pnl,
            pnlPercentage: totalInvest > 0 ? ((pnl / totalInvest) * 100).toFixed(2) : "0.00",
            roi: totalInvest > 0 ? ((pnl / totalInvest) * 100).toFixed(2) : "0.00",
            sector: sectorMap[h.sector]
        }
    })

    //Calculate Totals
    const totalInvestment = holdingWithPnL.reduce((sum , h) => sum + h.totalInvest, 0);
    const currentTotalValue = holdingWithPnl.reduce((sum, h) => sum + h.currectValue, 0);
    const totalPnl = currentTotalValue - totalInvestment;
    const totalPnlPercentage = totalInvestment > 0 ? ((totalPnl / totalInvestment) * 100).toFixed(2) : "0.00";
    const overallRoi = totalInvestment > 0 ? ((totalPnl / totalInvestment) * 100).toFixed(2) : "0.00";

    //Sorting and Categorizing
    const sorted = [...holdingsWithPnL].sort((a, b) => b.pnl - a.pnl);
    const profitStock = sorted.filter((h) => h.pnl > 0);
    const lossStock = sorted.filter((h) => h.pnl < 0);
    const neturalStock = sorted.filter((h) => h.pnl === 0);

    const topPerformerStock = profitStock.slice(0,3);
    const topLosserStock = lossStock.slice(0,3);

    //Sector Allocations 
    const sectorValueMap={};

    holdingWithPnL.forEach((h) => {
        sectorValueMap[h.sector] = (sectorValueMap[h.sector] || 0) + h.currentValue;
    });

    const sectorAllocation = Object.entries(sectorValueMap).map(([sector, value]) => ({
      name: sector,
      value: currentValue > 0 ? ((value / currentValue) * 100).toFixed(2) : "0.00",
    }));

    //Sector Profit
    const sectorProfitMap = {};

    holdingWithPnL.forEach((h) => {
        sectorProfitMap[h.sector] = (sectorProfitMap[h.sector] || 0) + h.pnl;
    });

    const sectorProfit = Object.entries(sectorProfitMap).map(([sector, profit]) => ({
      sector,
      profit: Number(profit.toFixed(2)),
    }));


    //PnL Distributions
    const pnlDistribution = holdingWithPnL.map((h) => ({
      name: h.symbol,
      pnl: h.pnl,
      pnlPercent: h.pnlPercentage,
    }));

    //Value Allocations
    const valueAllocation = holdingWithPnL.map((h) => ({
        name: h.symbol,
        value: h.currentValue,
        percentage: currentValue > 0 ? ((h.currentValue / currentValue) * 100).toFixed(1) : "0.0",
    })).sort((a, b) => b.value - a.value);


    //Holding Status
    const holdingStatus = {
      profit: profitStocks.length,
      loss: lossStocks.length,
      neutral: neutralStocks.length,
    };

    //Pnl Contributions
    const profitContribution = profitStocks
      .map((h) => ({
        name: h.symbol,
        value: h.pnl,
        pnl: h.pnl,
      }))
      .sort((a, b) => b.value - a.value);

    const lossContribution = lossStocks
      .map((h) => ({
        name: h.symbol,
        value: Math.abs(h.pnl),
        pnl: h.pnl,
      }))
      .sort((a, b) => b.value - a.value);






      return{
          totalInvestment,
          currentTotalValue,
          totalPnl,
          numberOfStocks: holdings.length,
          holdings: holdingWithPnL,
          overallRoi,
          topPerformerStock,
          topLosserStock,
          sectorAllocation,
          sectorProfit,
          pnlDistribution,
          valueAllocation,
          holdingStatus,
          profitContribution,
          lossContribution
      }

    } catch (error) {
        logger.error("Error while calculating portfolio analytics", {error});
        throw error;
    }
}


function emptyPortfolioData() {
  return {
    totalInvestment: 0,
    currentValue: 0,
    totalPnl: 0,
    overallROI: "0.00",
    numberOfStocks: 0,
    holdings: [],
    topPerformers: [],
    topLosers: [],
    sectorAllocation: [],
    sectorProfit: [],
    pnlDistribution: [],
    valueAllocation: [],
    holdingStatus: { profit: 0, loss: 0, neutral: 0 },
    profitContribution: [],
    lossContribution: [],
  };
}