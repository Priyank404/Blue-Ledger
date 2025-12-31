import logger from "../utilities/logger.js";
import { User } from "../models/userSchema.js";
import { Portfolio } from '../models/portfolioSchema.js'
import { Transaction } from '../models/transactionSchema.js'
import { Holdings } from '../models/holdingSchema.js'
import ApiError from "../utilities/apiError.js";
import { BulkPrice } from "./stockDataServices.js";
import { PortfolioSnapshot } from "../models/portfolioSnapshot.js";


const exportTransactions = async (portfolioId) => {
    const transactions = await Transaction.find({ Portfolio: portfolioId }).sort({ date: -1 }).lean();
    return transactions.map(txn => ({
    date: txn.date,
    symbol: txn.symbol,
    transactionType: txn.transactionType,
    quantity: txn.quantity,
    price: txn.pricePerUnit,
    totalValue: txn.quantity * txn.pricePerUnit
  })); 
}

const exportHoldings = async (portfolioId) => {  
    const holdings = await Holdings.find({ Portfolio: portfolioId }).lean();
    const symbols = holdings.map(hld =>(hld.symbol));
    
    const priceArray = await BulkPrice({ symbols });

    const priceMap = priceArray.reduce((map, item) => {
        map[item.symbol] = item.lastPrice;
        return map
    },{})
    
    const result = holdings.map(hld =>{
        const livePrice = priceMap[hld.symbol] || null;

        const totalValue= hld.avgBuyPrice * hld.Quantity;
        const currentValue= livePrice ? Number((livePrice * hld.Quantity).toFixed(2)) : null;
        const pnl = livePrice ? Number((currentValue - totalValue).toFixed(2)) : null;
        const pnlPercentage = livePrice ? Number(((pnl/totalValue) * 100).toFixed(2)) : null;
        return {
            symbol: hld.symbol,
            quantity: hld.Quantity,
            avgBuyPrice: Number((hld.avgBuyPrice).toFixed(2)),
            livePrice,
            totalValue,
            currentValue,
            pnl,
            pnlPercentage
        }
    })
    return result;
}

const exportSummary = async(portfolioId) =>{
     const holding = await Holdings.find({ Portfolio: portfolioId }).lean();

    if(holding.length == 0){
        return {
            currentValue:0,
            totalInvested:0,
            holdingCount:0,
            pnl:0,
            pnlPercentage:0
        }
    }

     

    const symbols = holding.map(hld =>(hld.symbol));
    
    const priceArray = await BulkPrice({ symbols });

    const priceMap = priceArray.reduce((map, item) => {
        map[item.symbol] = item.lastPrice;
        return map
    },{})

    let totalInvested = 0;
    let currentValue = 0;

    for (const hld of holding) {
        const livePrice = priceMap[hld.symbol] || 0;

        const invested = Number(hld.avgBuyPrice) * Number(hld.Quantity);
        const current = livePrice * Number(hld.Quantity);

        totalInvested += invested;
        currentValue += current;
    }

    const pnl = (currentValue - totalInvested).toFixed(2);
    
    const pnlPercentage = totalInvested > 0 ? Number((pnl/totalInvested) * 100).toFixed(2) : 0;

    const holdingCount = await Holdings.countDocuments({ Portfolio: portfolioId, Quantity: { $gt: 0 }});


    return {
        totalInvested,
        currentValue,
        pnl,
        pnlPercentage,
        holdingCount
    }
}

const exportHistory = async (portfolioId) => {
    const history = await PortfolioSnapshot.find({ portfolio: portfolioId }).sort({ date: -1 }).lean();

    

    return history.map(hst => ({
        date: hst.date,
        value: hst.value,
    }));
}

export const exportAllData = async (portfolioId) => {


  const holdings = await Holdings.find({
    Portfolio: portfolioId,
    Quantity: { $gt: 0 }
  }).lean();

  const symbols = holdings.map(h => h.symbol);
  const priceArray = symbols.length ? await BulkPrice({ symbols }) : [];

  const priceMap = priceArray.reduce((map, p) => {
    map[p.symbol] = Number(p.lastPrice);
    return map;
  }, {});


  let totalInvested = 0;
  let totalCurrentValue = 0;

  const enrichedHoldings = holdings.map(h => {
    const priceAtDate = priceMap[h.symbol] || 0;

    const investedValue = h.avgBuyPrice * h.Quantity;
    const currentValue = priceAtDate * h.Quantity;
    const pnl = currentValue - investedValue;

    totalInvested += investedValue;
    totalCurrentValue += currentValue;

    return {
      symbol: h.symbol,
      quantity: h.Quantity,
      avgBuyPrice: h.avgBuyPrice,
      priceAtDate,
      investedValue,
      currentValue,
      pnl
    };
  });

  const totalPnL = totalCurrentValue - totalInvested;
  const totalPnLPercent =
    totalInvested > 0
      ? Number(((totalPnL / totalInvested) * 100).toFixed(2))
      : 0;


  const transactions = await Transaction.find({
    Portfolio: portfolioId
  })
    .sort({ date: -1 })
    .lean();

    const cleanTransactions =  transactions.map(txn => ({
    date: txn.date,
    symbol: txn.symbol,
    transactionType: txn.transactionType,
    quantity: txn.quantity,
    price: txn.pricePerUnit,
    totalValue: txn.quantity * txn.pricePerUnit
  })); 


  return {
    asOfDate: new Date().toISOString().split("T")[0],
    totalInvested,
    totalCurrentValue,
    totalPnL,
    totalPnLPercent,
    holdingCount: enrichedHoldings.length,
    holdings: enrichedHoldings,
    transactions: cleanTransactions
  };
};




export const exportData = async (userId, type) =>{
    try {

        const user = await User.findById(userId);
        if(!user){
            logger.error("User not found", {userId});
            throw new ApiError(404, "User not found");
        }


        const portfolio = await Portfolio.findOne({user: userId});

        if(!portfolio){
            logger.error("Portfolio not found", {userId});
            throw new ApiError(404, "Portfolio not found");
        }

        switch (type) {

            case "transactions":
                const transaactions = await exportTransactions(portfolio._id);
                return {
                    transaactions
                }
            
            case "holdings":
                const holdings = await exportHoldings(portfolio._id);
                return {
                    holdings
                }
            
            case "portfolioHistory":
                const portfolioHistory = await exportHistory(portfolio._id);
                return {
                    portfolioHistory
                }

            case "portfolioSummary":
                const protfolioSummary = await exportSummary(portfolio._id);
                return{
                    protfolioSummary
                }
            
            case "all":
                return await exportAllData(portfolio._id);
                

            default:
            throw new ApiError(400, "Export type not implemented");
        }
    } catch (error) {
        logger.error("Error while exporting data",{error});
        throw error;
    }
}