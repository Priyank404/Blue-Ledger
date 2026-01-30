import bcrypt from "bcrypt"
import crypto from "crypto"
import { User } from "../models/userSchema.js";
import { otp } from "../models/otpSchema.js"

const OtpExpiry = 5;
const MaxAttemp = 3;

export const otpGenerator = async(email)=>{
    const Otp = crypto.randomInt(100000 , 999999).toString();  

    const hash = await bcrypt.hash(Otp,10)

    const expiry = new Date(Date.now() + OtpExpiry *60 * 1000);

    await otp.deleteMany({email});

    await otp.create({
        email,
        otpHash : hash,
        expiry,
        
    })

    return Otp
}


export const otpVerify = async(email, Otp)=>{
    
    const found = await otp.findOne({email});

    

    if(!found) throw new Error("Otp not found");

    if(found.expiry < Date.now()) throw new Error ("Otp expired");

    if(found.attempts > MaxAttemp) throw new Error("Otp attempts exceeded");

    const isValidOtp = await bcrypt.compare(Otp, found.otpHash);

    if(!isValidOtp){
        found.attempts += 1;
        await found.save();
        throw new Error("Invalid Otp");
    }

    await otp.deleteOne({email});

    return true
}