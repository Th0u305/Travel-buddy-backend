import { Hono } from "hono";
import { getDataController } from "./getData.controller.ts";
import { authGuard } from "../../middleware/authGuard.ts";

export const getData = new Hono();

getData.get("/getUserData", authGuard(), getDataController.getUserData);
getData.get("/getCountryLists", getDataController.getCountryLists);
getData.get("/getTravelLists", getDataController.getTripLists);
getData.get("/getTravelListById/:id", getDataController.getTripListById);
getData.get("/findBuddies", getDataController.findBuddies);
getData.get("/viewUserProfile/:id", getDataController.viewUserProfile);
getData.get(
  "/canUserCreateTrip/:id",
  authGuard(),
  getDataController.canUserCreateTrip,
);
getData.post(
  "/updateTripStatus",
  authGuard(),
  getDataController.updateTripStatus,
);
getData.get(
  "/getUserFullProfile",
  authGuard(),
  getDataController.getUserFullProfile,
);
