import mongoose from "mongoose";
import { Portfolio } from "./portfolioSchema";
import { required } from "joi";
import { ExceptionHandler } from "winston";

const holdingsSchema = new mongoose.Schema({
    Portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portfolio",
        required: true
    },

    companyName: {
        type: String,
        required: true
    },

    Quantity: {
        type: Number,
        required: true
    },

    currentValue: {
        type: Number,
        required: true
    },

    avgBuyPrice: {
        type: Number,
        required: true
    },

    totalValue: {
        type: Number,
        required: true
    },

    
})

export const Holdings = mongoose.model("Holdings", holdingsSchema);