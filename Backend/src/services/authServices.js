
import bcrypt from 'bcrypt';
import logger from '../utilities/logger.js';
import {User} from '../models/userSchema.js';
import ApiError from '../utilities/apiError.js';
import jwt from 'jsonwebtoken';



const registerUser = async ({email, password, confirmPassword})=>{
    
    

    try {
        let user = await User.findOne({email});

        if(user){
            logger.error("User already exists", {email});
            throw new ApiError(400, "User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({email, password: hashedPassword});


         const token = jwt.sign({
            id: user._id,
            email: user.email
        }, process.env.JWT_SECRET_KEY, {expiresIn: '1d'});

        logger.info("JWT token generated successfully");

        return {
           user:{
            id: user._id,
            email: user.email
           },
           token
        };

    } catch (error) {
       throw error
    }
};


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

        const token = jwt.sign({
            id: user._id,
            email: user.email
        }, process.env.JWT_SECRET_KEY, {expiresIn: '1d'});

        logger.info("JWT token generated successfully");

        return {
           user:{
            id: user._id,
            email: user.email
           },
           token
        };


    } catch (error) {
        throw error
    }
};

const authServices = {
  registerUser,
  logInUser
};

export default authServices;
