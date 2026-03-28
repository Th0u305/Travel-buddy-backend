import { Context } from "hono";
import { catchAsync } from "../../utils/catchAsync.ts";
import { getDataService } from "./getData.service.ts";

const getUserData = catchAsync(async (c: Context) => {
    
    const data = await getDataService.getUserData(c)
    
    return c.json({
        success: true,
        data: data,
    });
});

export const getDataController = {
    getUserData
};