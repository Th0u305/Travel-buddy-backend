// src/modules/otp/otp.routes.ts
import { Hono } from "hono";
import { OTPController } from "./otp.controller.ts";

export const OtpRoutes = new Hono();

OtpRoutes.post("/send", OTPController.sendOTP);
OtpRoutes.post("/verify", OTPController.verifyOTP);

