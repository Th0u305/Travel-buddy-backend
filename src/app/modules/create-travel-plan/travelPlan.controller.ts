import { catchAsync } from "../../utils/catchAsync.ts";
import { travelPlanService } from "./travelPlan.service.ts";

const createTravelPlan = catchAsync(
  async (c) => {
    const data = await travelPlanService.createTravelPlan(c);

    if (!data) {
      return c.json({
        message: "Travel plan not created",
        status: 400,
        success: false,
      });
    }
    return c.json({
      message: "Travel plan created successfully",
      status: 200,
      success: true,
    });
  },
);


const joinTrip = catchAsync(
  async (c) => {
    const data = await travelPlanService.joinTrip(c);

    return c.json({
      message: data?.message,
      status: data?.status,
      success: data?.success,
      data : data?.data
    });
  },
);

const removeFromTrip = catchAsync(
  async (c) => {
    const data = await travelPlanService.removeFromTrip(c);

    return c.json({
      message: data?.message,
      status: data?.status,
      success: data?.success,
      data: data?.data
    });
  },
);

export const travelPlanController = {
  createTravelPlan,
  joinTrip,
  removeFromTrip
};
