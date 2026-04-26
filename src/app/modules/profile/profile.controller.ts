import { Context } from "hono";
import { catchAsync } from "../../utils/catchAsync.ts";
import { profileServices } from "./profile.service.ts";

const updateProfile = catchAsync(async (c: Context) => {
  const data = await profileServices.updateProfile(c);

  if (!data?.success) {
    return c.json({
      success: false,
      status: data?.status,
      message: data?.message,
      data: data?.data,
    });
  }

  return c.json({
    success: true,
    status: data?.status,
    data: data?.data,
  });
});

const updateUserProvider = catchAsync(async (c: Context) => {
  const data = await profileServices.updateUserProvider(c);

  if (!data?.success) {
    return c.json({
      success: false,
      status: data?.status,
      message: data?.message,
      data: data?.data,
    });
  }

  return c.json({
    success: true,
    status: data?.status,
    data: data?.data,
  });
});

export const profileControllers = {
  updateProfile,
  updateUserProvider
};
