import { Context } from "hono";
import { catchAsync } from "../utils/catchAsync.ts";
import { paymentService } from "./payment.service.ts";

const createCheckoutSession = catchAsync(async (c: Context) => {
  const data = await paymentService.createCheckoutSession(c);

  if (!data?.success) {
    return c.json({
      success: false,
      status: data?.status || 500,
      message: data?.message || "Something went wrong during checkout initialization",
      data: data?.data,
    });
  }

  return c.json({
    success: true,
    status: data?.status || 200,
    message: data?.message,
    data: data?.data,
  });
});

const confirmPayment = catchAsync(async (c: Context) => {
  const data = await paymentService.confirmPayment(c);

  if (!data?.success) {
    return c.json({
      success: false,
      status: data?.status || 500,
      message: data?.message || "Something went wrong during payment confirmation",
      data: data?.data,
    });
  }

  return c.json({
    success: true,
    status: data?.status || 200,
    message: data?.message,
    data: data?.data,
  });
});

export const paymentControllers = {
  createCheckoutSession,
  confirmPayment,
};
