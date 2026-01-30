import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import logger from "../utilities/logger.js";

const connectDB = async()=>{
    try {


        await mongoose.connect(process.env.MONGO_DB_URL);
        logger.info("Database connected");
    } catch (error) {


        logger.error("Error connecting to database", error);
    }
}

export default connectDB