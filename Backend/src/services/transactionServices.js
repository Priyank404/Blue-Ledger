import logger from "../utilities/logger.js";
import { Transaction } from "../models/transactionSchema.js";
import { Portfolio } from "../models/portfolioSchema.js";
import mongoose, { get } from "mongoose";
import { Holdings } from "../models/holdingSchema.js";

import ApiError from "../utilities/apiError.js";

export const createTransaction = async({ userId ,type, name, quantity, price, date}) =>{

    async function getOrCreatePortfolio(userId){
      let portfolio = await Portfolio.findOne({user: userId});

      if(!portfolio){
         portfolio = await Portfolio.create({user: userId});
      }

      return portfolio;
    }

    const portfolio = await getOrCreatePortfolio(userId);

    const session = await mongoose.startSession();
    session.startTransaction()
    
    try {
      const transaction = await Transaction.create([{
        portfolio: portfolio._id,
        transactionType: type,
        symbol: name,
        quantity,
        pricePerUnit: price,
        date
      }],{ session });
    

    if(type == "BUY"){
      await updateHoldingBuy({portfolioId: portfolio._id, name, quantity, price, date});
    }else{
      await updateHoldingSell({portfolioId: portfolio._id, name, quantity, price, date});
    }

    await session.commitTransaction();
    session.endSession();

    return transaction;

    } catch (error) {
      session.abortTransaction();
      session.endSession();
      throw error
    }

    async function updateHoldingBuy({portfolioId, name, quantity, price, date}){

      let holding = await Holdings.findOne({Portfolio: portfolioId, symbol: name}).session(session)
      
      if(!holding){
        await Holdings.create([{
          Portfolio: portfolioId,
          symbol: name,
          Quantity: quantity,
          avgBuyPrice: price,
          lastBuyDate: date
        }],{ session })


      }else{
        const totalQuantity = holding.Quantity + quantity;
        //.holdings is from database and normal price and quntity if from request
        const totalInvestment = (holding.avgBuyPrice * holding.Quantity) + (price * quantity)

        holding.Quantity = totalQuantity;
        holding.avgBuyPrice = totalInvestment / totalQuantity;
        holding.lastBuyDate = date;
        
        await holding.save({ session });  
      }
    }

    async function updateHoldingSell({portfolioId, name, quantity, price, date}) {
      const holding = await Holdings.findOne({Portfolio: portfolioId, symbol: name}).session(session);

      if(!holding){
        throw new ApiError(400, "Holding not found");
      }else{

        


        const totalQuantity = holding.Quantity - quantity;

         if (totalQuantity < 0){
          throw new ApiError(400, "Invalid quantity");
        }
        holding.Quantity = totalQuantity;
        

        if(totalQuantity == 0){
          await holding.deleteOne({ session });
        }     

        await holding.save({ session})
      }
    }
    
    
}