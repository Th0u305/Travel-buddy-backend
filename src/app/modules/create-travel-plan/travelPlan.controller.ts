import { catchAsync } from "../../utils/catchAsync.ts";
import { travelPlanService } from "./travelPlan.service.ts";

const createTravelPlan = catchAsync(
  async (c) => {
    const data = await travelPlanService.createTravelPlan(c);

    if (!data) {
      return c.json({
        message: "Travel plan not created",
        code: 400,
        success: false,
      });
    }
    return c.json({
      message: "Travel plan created successfully",
      code: 200,
      success: true,
    });
  },
);

export const travelPlanController = {
  createTravelPlan,
};
