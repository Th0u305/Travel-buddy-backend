import { Hono } from "hono";
import { getDataController } from "./getData.controller.ts";

export const getData = new Hono()

getData.get("/getUserData", getDataController.getUserData)

