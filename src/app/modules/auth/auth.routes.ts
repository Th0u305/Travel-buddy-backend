import { Hono } from "hono";
import { authController } from "./auth.controller.ts";
import { authGuard, isUserLoggedIn } from "../../middleware/authGuard.ts";

export const authRoutes = new Hono()

authRoutes.post("/register", authController.registerUser)
authRoutes.post("/login", isUserLoggedIn(), authController.logInUser)
authRoutes.get("/logout", authGuard() , authController.logOutUser)

