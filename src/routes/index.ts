import { Hono } from "hono";
import { authRoutes } from "../app/modules/auth/auth.routes.ts";
import { supabaseMiddleware } from "../app/middleware/supabase_auth_middleware.ts";
import { getData } from "../app/modules/getData/getData.routes.ts";


export const customRoutes = new Hono()

customRoutes.use("/*", supabaseMiddleware())
customRoutes.route("/auth", authRoutes);
customRoutes.route("/getData", getData);

