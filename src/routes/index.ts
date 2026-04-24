import { Hono } from "hono";
import { authRoutes } from "../app/modules/auth/auth.routes.ts";
import { supabaseMiddleware } from "../app/middleware/supabase_auth_middleware.ts";
import { getData } from "../app/modules/getData/getData.routes.ts";
import { travelPlanRoutes } from "../app/modules/create-travel-plan/travelPlan.route.ts";
import { OtpRoutes } from "../app/modules/otp/otp.routes.ts";
import { profileRoutes } from "../app/modules/profile/profile.route.ts";


export const customRoutes = new Hono()

customRoutes.use("/*", supabaseMiddleware())
customRoutes.route("/auth", authRoutes);
customRoutes.route("/getData", getData);
customRoutes.route("/travel-plan", travelPlanRoutes);
customRoutes.route("/otp", OtpRoutes);
customRoutes.route("/profile", profileRoutes);

