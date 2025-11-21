import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

})

export const Portfolio = mongoose.model("Portfolio", portfolioSchema)