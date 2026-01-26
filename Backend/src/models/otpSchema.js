import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },

    otpHash:{
        type: String,
        required: true
    },

    expiry:{
        type: Date,
        required: true
    },

    attempts:{
        type:Number,
        required: true
    }
})

export const otp = mongoose.model("otp", otpSchema)