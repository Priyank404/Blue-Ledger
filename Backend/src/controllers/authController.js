import logger from "../utilities/logger.js"
import authServices from '../services/authServices.js';
import ApiResponse from "../utilities/apiResponse.js";


export const signUp = async (req, res, next) =>{

   try {
        const {email, password, confirmPassword} = req.body;

        logger.info("User signup attemped", {email});

        const result = await authServices.registerUser({email, password, confirmPassword});

        logger.info("User signup successful", {email});

        res.cookie('token', result.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        })

        logger.info("cookie set successfully");


        return res.status(200).json(
            new ApiResponse(200, result.user, "success")      
        )
   } catch (error) {
        logger.error("Error while signing up user", {error})
        next(error.message)
   }

}

export const logIn = async (req, res, next) =>{

    try {
        const {email, password} = req.body;

        logger.info("User login attemped", {email});

        const result = await authServices.logInUser({email, password});

        logger.info("User login successful", {email});

        res.cookie('token', result.token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        })

        logger.info("cookie set successfully");

        return res.status(200).json(
            new ApiResponse(200, result.user, "success")
        )
    } catch (error) {
        logger.error("Error while logging in user", {error});
        next(error);
    }
}

export const logOut = async (req, res, next) =>{
    
    try {

        logger.info("user Loging out");
        res.clearCookie('token');
        logger.info("cookie cleared successfully");

        return res.status(200).json(new ApiResponse(200, {}, "success"));

    } catch (error) {
        logger.error("Error while logging out user", {error});
        next(error.message)
    }
}
