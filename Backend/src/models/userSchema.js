import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   email: {
        type: String,
        required: true,
        unique: true,      
        lowercase: true,   
        trim: true 
   },

   authProvider:{
     type: String,
     enum:["google", "email_otp"],
     required: true
   },

   googleId:{
     type:String,
     default: null
   },

   isVerified:{
     type: Boolean,
     default:true
   },

   password: {
        type: String,
   },
})

export const User = mongoose.model("User", userSchema);