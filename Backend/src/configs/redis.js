import { Redis } from 'ioredis'
import logger from "../utilities/logger.js";

export const redisClient = new Redis ({
    host: process.env.REDIS_HOST|| 'localhost',
    port: process.env.REDIS_PORT || 6379
});

redisClient.on("connect", ()=>{
    logger.info("Redis connected successfully");
})

redisClient.on("error",(error)=>{
    logger.error("Redis connection fail: ", {error: error.message});
})

export const cacheGet = async(key)=>{
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error("Redis GET error: ",{key,error});
        return null;
    }
}

export const cacheSet = async (key,value,ttl)=>{
    try {
        await redisClient.setex(key,ttl,JSON.stringify(value));
        return true;
    } catch (error) {
        logger.error("Redis SET error: ",{key, value, error: error.message})
        return false;
    }
}

export const cacheDel = async (key) =>{
    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        logger.error("Redis DEL error: ",{key, error})
        return false;
    }
}

//del pattern will delete all the keys with same prefix (ex: portfolio:user:1, portfolio:user:2 )
export const cahceDelPattern = async (keys) =>{
    try {
        if(keys.length > 0){
            await redisClient.del(...keys);
        }
        return true;
    } catch (error) {
        logger.error("Redis DEL PATTERN error: ", {keys})
        return false
    }
}
