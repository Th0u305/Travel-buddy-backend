import { Hono } from "hono";
import { authGuard } from "../../middleware/authGuard.ts";
import { profileControllers } from "./profile.controller.ts";
import { rateLimitPresets } from "../../middleware/rateLimiter_middleware.ts";

export const profileRoutes = new Hono();

profileRoutes.use(rateLimitPresets.user)
profileRoutes.post("/updateProfile",authGuard(),profileControllers.updateProfile)
profileRoutes.get("/updateUserProvider",authGuard(),profileControllers.updateUserProvider)
