import { catchAsync } from "../../utils/catchAsync.ts";
import { authService } from "./auth.service.ts";

const registerUser = catchAsync(
    async (c) => {
        const data = await authService.registerUser(c)
        if(data && "message" in data && data.message === "Supabase Client is undefined") {
            return c.json({
                success : false,
                message : "Internal Server Error",
                status : 500
            })
        }
        else{
            return c.json({
                data
            })
        }
    }
)

const logInUser = catchAsync(
    async (c) => {
        const data = await authService.logInUser(c)             
        
        if (data && "message" in data && data.message === "Supabase Client is undefined") {
            return c.json({
                success : false,
                message : "Internal Server Error",
                status : 500
            })
        }
        
        return c.json({
            data
        })
    }
)

const logOutUser = catchAsync(
    async (c) => {
        const data = await authService.logOutUser(c)        
        return c.json({
            success : true,
            message : data?.message
        })
    }
)

const googleLogin = catchAsync(
    async (c) => {
        const data = await authService.googleLogin(c)        
        return c.json({
            success : true,
            status : 200,
            data : data
        })
    }
)

const resetPassword = catchAsync(
    async (c) => {
        const data = await authService.resetPassword(c)        
        return c.json({
            status : data?.status,
            success : data?.success,
            message : data?.message
        })
    }
)

export const authController = {
    registerUser,
    logInUser,
    logOutUser,
    googleLogin,
    resetPassword,
}