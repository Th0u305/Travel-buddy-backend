import { Context } from "hono";
import { catchAsync } from "../../utils/catchAsync.ts";
import { getDataService } from "./getData.service.ts";

const getUserData = catchAsync(async (c: Context) => {
  const data = await getDataService.getUserData(c);
  return c.json({
    success: true,
    data: data,
  });
});

const getCountryLists = catchAsync(async (c: Context) => {
  const data = await getDataService.getCountryLists(c);

  if (!data?.success) {
    return c.json({
      success: false,
      code: data?.code,
      data: data?.data,
      message: data?.message,
    });
  }

  return c.json({
    success: true,
    code: data?.code,
    data: data?.data,
  });
});

const getTripLists = catchAsync(async (c: Context) => {
  const data = await getDataService.getTripLists(c);

  if (!data?.success) {
    return c.json({
      success: false,
      code: data?.code,
      data: data?.data,
      message: data?.message,
    });
  }

  return c.json({
    success: true,
    code: data?.code,
    data: data?.data,
  });
});

const getTripListById = catchAsync(async (c: Context) => {
  const data = await getDataService.getTripListById(c);

  if (!data?.success) {
    return c.json({
      success: false,
      code: data?.code,
      data: data?.data,
      message: data?.message,
    });
  }

  return c.json({
    success: true,
    code: data?.code,
    data: data?.data,
  });
});

const findBuddies = catchAsync(async (c: Context) => {
  const data = await getDataService.findBuddies(c);

  if (!data?.success) {
    return c.json({
      success: false,
      code: data?.code,
      data: data?.data,
      message: data?.message,
    });
  }

  return c.json({
    success: true,
    code: data?.code,
    data: data?.data,
  });
});

const viewUserProfile = catchAsync(async (c: Context) => {
  const data = await getDataService.viewUserProfile(c);

  if (!data?.success) {
    return c.json({
      success: false,
      code: data?.code,
      data: data?.data,
      message: data?.message,
    });
  }

  return c.json({
    success: true,
    code: data?.code,
    data: data?.data,
  });
});

const canUserCreateTrip = catchAsync(async (c: Context) => {
  const data = await getDataService.canUserCreateTrip(c);

  if (!data?.success) {
    return c.json({
      success: false,
      code: data?.code,
      data: data?.data,
    });
  }

  return c.json({
    success: true,
    code: data?.code,
    data: data?.data,
  });
});

const updateTripStatus = catchAsync(async (c: Context) => {
  const data = await getDataService.updateTripStatus(c);

  if (!data?.success) {
    return c.json({
      success: false,
      code: data?.code,
      data: data?.data,
    });
  }

  return c.json({
    success: true,
    code: data?.code,
    data: data?.data,
  });
});

const getUserFullProfile = catchAsync(async (c: Context) => {
  const data = await getDataService.getUserFullProfile(c);

  if (!data?.success) {
    return c.json({
      success: false,
      code: data?.code,
      data: data?.data,
    });
  }

  return c.json({
    success: true,
    code: data?.code,
    data: data?.data,
  });
});

export const getDataController = {
  getUserData,
  getCountryLists,
  getTripLists,
  getTripListById,
  findBuddies,
  viewUserProfile,
  canUserCreateTrip,
  updateTripStatus,
  getUserFullProfile,
};
