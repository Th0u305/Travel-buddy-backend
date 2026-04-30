import { Hono } from "hono";
import { travelPlanController } from "./travelPlan.controller.ts";
import { authGuard } from "../../middleware/authGuard.ts";
import { rateLimitPresets } from "../../middleware/rateLimiter_middleware.ts";

export const travelPlanRoutes = new Hono();

travelPlanRoutes.use(rateLimitPresets.api)
travelPlanRoutes.post("/createTravelPlan",authGuard(),travelPlanController.createTravelPlan);
travelPlanRoutes.post("/joinTrip",authGuard(),travelPlanController.joinTrip);
travelPlanRoutes.post("/removeFromTrip",authGuard(),travelPlanController.removeFromTrip);
