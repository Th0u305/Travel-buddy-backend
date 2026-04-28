import { Hono } from "hono";
import { authGuard } from "../middleware/authGuard.ts";
import { paymentControllers } from "./payment.controller.ts";

export const paymentRoutes = new Hono();

paymentRoutes.post("/create-checkout-session", authGuard(), paymentControllers.createCheckoutSession);
paymentRoutes.post("/confirm-payment", authGuard(), paymentControllers.confirmPayment);
