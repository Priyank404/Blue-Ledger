import express from "express"
import logger from "../utilities/logger"

const signUp = async (req, res, next) =>{

   try {
        const {email, password} = req.body;

        logger.info("User signup attemped", {email});

        const result = await authServices.registerUser({email, password});

        logger.info("User signup successful", {userID: result._id});

        return res.status(200).json(
            new ApiResponse(200, result, "success")      
        )
   } catch (error) {
        logger.error("Error while signing up user", {error})
        next(error)
   }

}


const logIn = async (req, res, next) =>{

    try {
        const {email, password} = req.body;

        logger.info("User login attemped", {email});

        const result = await authServices.logInUser({email, password});

        logger.info("User login successful", {email});

        return res.status(200).json(
            new ApiResponse(200, result, "success")
        )
    } catch (error) {
        logger.error("Error while logging in user", {error});
        next(error);
    }
}