import express from 'express';
import bcrypt from 'bcrypt';
import logger from '../utilities/logger.js';
import User from '../models/userSchema.js';


const registerUser = async ({email, password})=>{
    
    

    try {
        let user = await User.findOne({email});

        if(user){
            logger.error("User already exists", {email});
            throw new ApiError(400, "User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({email, password: hashedPassword});


        return {
            _id: user._id,
            email: user.email
        }

    } catch (error) {
       throw error
    }
}


const logInUser = async ({email, password})=>{
    
    try {

        let user = await User.findOne({email});

        if(!user){
            logger.error("User not found", {email});
            throw new ApiError(400, "User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            logger.error("Login Failed, invalid password", {email});
            throw new ApiError(400, "Invalid credentials");
        }

        logger.debug('Password verified successfully');

        return {
            _id: user._id,
            email: user.email
        }


    } catch (error) {
        
        throw error
    }
}