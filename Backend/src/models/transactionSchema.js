import { required } from "joi";
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    transactionType:{
        type: String,
        enum: ["BUY", "SELL"],
        required: true
    },

    companyName: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    pricePerUnite: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }

})

export const Transaction = mongoose.model("Transaction", transactionSchema);