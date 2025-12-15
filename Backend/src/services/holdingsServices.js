import { Portfolio } from "../models/portfolioSchema.js";
import { Holdings } from "../models/holdingSchema.js";
import ApiError from "../utilities/apiError.js";

export const getHoldings = async({userId})=>{
    const portfolio = await Portfolio.findOne({user:userId});
    
    
    try {
        const holdings = await Holdings.find({Portfolio:portfolio._id});
        
        return holdings;
    } catch (error) {
        throw error;
    }
}
