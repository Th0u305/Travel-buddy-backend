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

const getCountryLists = catchAsync(async (c: Context) => {
    
    const data = await getDataService.getCountryLists(c)

    if (!data?.success) {
        return c.json({
            success: false,
            code : data?.code,
            data: data?.data,
            message : data?.message
        });
    }

    return c.json({
        success: true,
        code : data?.code,
        data: data?.data,
    });
});

export const getDataController = {
    getUserData,
    getCountryLists
};