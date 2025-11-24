import { Portfolio } from "../models/portfolioSchema.js";
import { Holdings } from "../models/holdingSchema.js";
import ApiError from "../utilities/apiError.js";

export const getHoldings = async({userId})=>{
    const portfolio = await Portfolio.findOne({user:userId});
    if(!portfolio){
        throw new ApiError(400, "Portfolio not found");
    }
    
    try {
        const holdings = await Holdings.find({Portfolio:portfolio._id});
        if(holdings.length === 0){
            throw new ApiError(400, "No holdings found in this portfolio");
        }
        return holdings;
    } catch (error) {
        throw error;
    }
}
