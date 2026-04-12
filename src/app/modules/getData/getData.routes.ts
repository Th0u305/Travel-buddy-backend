import { Hono } from "hono";
import { getDataController } from "./getData.controller.ts";
import { authGuard } from "../../middleware/authGuard.ts";

export const getData = new Hono()

getData.get("/getUserData", authGuard(), getDataController.getUserData)
getData.get("/getCountryLists", getDataController.getCountryLists)

