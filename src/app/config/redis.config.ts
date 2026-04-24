import { createClient } from 'redis';
import { envVars } from "./env.ts";

export const redisClient = createClient({
    username: envVars.MAIL_REDIS_USERNAME,
    password: envVars.MAIL_REDIS_PASSWORD,
    socket: {
        host: envVars.MAIL_REDIS_HOST_NAME,
        port: Number(envVars.MAIL_REDIS_PORT)
    },
    pingInterval : 1000
});

// eslint-disable-next-line no-console
redisClient.on('error', err => console.log('Redis Client Error', err));


export const connectRedis = async()=>{
    if (!redisClient.isOpen) {
        await redisClient.connect()
    }
}