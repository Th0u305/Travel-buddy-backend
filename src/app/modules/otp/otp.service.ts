import crypto from "node:crypto";
import { redisClient } from "../../config/redis.config.ts";
import { sendEmail } from "../../utils/sendEmail.ts";

const generateOtp = (length = 6) => {
    //6 digit otp
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()

    // 10 ** 5 => 10 * 10 *10 *10 *10 * 10 => 1000000

    return otp
}

const sendOTP = async (email: string ) => {
    const otp = generateOtp();
    const redisKey = `otp:${email}`;

    await redisClient.setEx(redisKey, 120, otp);

    await sendEmail({
        to: email,
        subject: "Your OTP Code",
        templateName: "otp",
        templateData: {
            name: name,
            otp: otp
        }
    })
    
    return { 
        success : true,
        status : 200,
        message: "OTP sent successfully" 
    };
};

const verifyOTP = async (email: string, otp: string) => {
    const redisKey = `otp:${email}`

    const savedOtp = await redisClient.get(redisKey)

    if (!savedOtp) {
        throw new Error("OTP expired or not found");
    }

    if (savedOtp !== otp) {
        throw new Error("Invalid OTP");
    }

    await redisClient.del(redisKey)

    return { 
        success : true,
        status : 200,
        message: "OTP verified successfully" 
    };
};

export const OTPService = {
    sendOTP,
    verifyOTP
}