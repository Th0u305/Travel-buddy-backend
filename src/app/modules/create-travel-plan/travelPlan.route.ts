import { Hono } from "hono";
import { travelPlanController } from "./travelPlan.controller.ts";
import { authGuard } from "../../middleware/authGuard.ts";

export const travelPlanRoutes = new Hono()

travelPlanRoutes.post("/createTravelPlan",authGuard(), travelPlanController.createTravelPlan)
