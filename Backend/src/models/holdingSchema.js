import mongoose from "mongoose";

const holdingsSchema = new mongoose.Schema({
    Portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portfolio",
        required: true
    },

    symbol: {  // Stock symbol (e.g., RELIANCE, TCS)
        type: String,
        required: true,
        uppercase: true
    },

    Quantity: {
        type: Number,
        required: true,
        min:0
    },

    avgBuyPrice: {
        type: Number,
        required: true,
        min:0
    },

    lastBuyDate: {
    type: Date,
    required: true
    }

    
})

holdingsSchema.index({ Portfolio: 1, symbol: 1 }, { unique: true });

export const Holdings = mongoose.model("Holdings", holdingsSchema);