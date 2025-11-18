import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    holdings:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Holdings",
    },

    totalInvestment: {
        type: Number,
        required: true
    },

    
    totalValue: {
        type: Number,
        required: true
    },


    profitLoss: {
        type: Number,
        required: true
    },

})

export const Portfolio = mongoose.model("Portfolio", portfolioSchema)