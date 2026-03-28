import { catchAsync } from "../../utils/catchAsync.ts";
import { authService } from "./auth.service.ts";

const registerUser = catchAsync(
    async (c) => {
        const data = await authService.registerUser(c)        
        
        if((data && 'status' in data && data.status === 422) && ("code" in data && data.code === "user_already_exists")) {
            return c.json({
                success : false,
                message : "User already exists",
                code : 422
            })
        }        
        
        if(data && "message" in data && data.message === "Supabase Client is undefined") {
            return c.json({
                success : false,
                message : "Internal Server Error",
                code : 500
            })
        }
        
        return c.json({
            success : true,
            message : "Account created successfully",
            data : data
        })
    }
)

const logInUser = catchAsync(
    async (c) => {
        const data = await authService.logInUser(c)        
        
        if ((data && 'status' in data && data.status === 422) && ("code" in data && data.code === "user_not_found")) {
            return c.json({
                success : false,
                message : "User does not exist",
                code : 404
            })
        }        
        
        if (data && "message" in data && data.message === "Supabase Client is undefined") {
            return c.json({
                success : false,
                message : "Internal Server Error",
                code : 500
            })
        }
        
        return c.json({
            success : true,
            message : "Logged in successfully",
            data : data
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


export const authController = {
    registerUser,
    logInUser,
    logOutUser
}