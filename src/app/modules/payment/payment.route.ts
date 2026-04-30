import { Hono } from "hono";
import { authGuard } from "../../middleware/authGuard.ts";
import { paymentControllers } from "./payment.controller.ts";
import { rateLimitPresets } from "../../middleware/rateLimiter_middleware.ts";

export const paymentRoutes = new Hono();

paymentRoutes.use(rateLimitPresets.payment)
paymentRoutes.post("/create-checkout-session", authGuard(), paymentControllers.createCheckoutSession);
paymentRoutes.post("/confirm-payment", authGuard(), paymentControllers.confirmPayment);
