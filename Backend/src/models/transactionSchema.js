
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
     Portfolio: {  // Add portfolio reference instead of user
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portfolio",
        required: true
    },
    
    transactionType:{
        type: String,
        enum: ["BUY", "SELL"],
        required: true
    },

    symbol: {  // Add stock symbol
        type: String,
        required: true,
        uppercase: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    pricePerUnit: {
        type: Number,
        required: true,
        min: 0
    },

    date: {
        type: Date,
        default: Date.now
    }

})

export const Transaction = mongoose.model("Transaction", transactionSchema);