import { Context } from "hono";
import { OTPService } from "./otp.service.ts";


const sendOTP = async (c: Context) => {
    const { email } = await c.req.json()
    const data = await OTPService.sendOTP(email)
    if (data.status === 200) {
        return c.json({
            status: data.status,
            success: data.success,
            message: data.message,
        });
    }
    return c.json({
        statusCode: 400,
        success: false,
        message: "Failed to send OTP",
    });
}

const verifyOTP = async (c: Context) => {
    const { email, otp } = await c.req.json();    
    const data = await OTPService.verifyOTP(email, otp)
    if (data.status === 200) {
        return c.json({
            status: data.status,
            success: data.success,
            message: data.message,
        });
    }
    return c.json({
        statusCode: 400,
        success: false,
        message: "Failed to verify OTP",
    });
}

export const OTPController = {
    sendOTP,
    verifyOTP
};