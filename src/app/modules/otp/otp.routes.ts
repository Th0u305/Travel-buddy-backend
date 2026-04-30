// src/modules/otp/otp.routes.ts
import { Hono } from "hono";
import { OTPController } from "./otp.controller.ts";
import { rateLimitPresets } from "../../middleware/rateLimiter_middleware.ts";

export const OtpRoutes = new Hono();

OtpRoutes.use(rateLimitPresets.api)
OtpRoutes.post("/send", OTPController.sendOTP);
OtpRoutes.post("/verify", OTPController.verifyOTP);
