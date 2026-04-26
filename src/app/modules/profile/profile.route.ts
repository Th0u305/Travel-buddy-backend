import { Hono } from "hono";
import { authGuard } from "../../middleware/authGuard.ts";
import { profileControllers } from "./profile.controller.ts";

export const profileRoutes = new Hono();

profileRoutes.post("/updateProfile",authGuard(),profileControllers.updateProfile)
profileRoutes.get("/updateUserProvider",authGuard(),profileControllers.updateUserProvider)
