import { Hono } from "hono";
import { authGuard } from "../../middleware/authGuard.ts";
import { messageController } from "./message.controller.ts";

export const messageRoutes = new Hono();

messageRoutes.post("/send",authGuard(),messageController.sendMessage)
messageRoutes.get("/history/:receiver_id/:user_name_slug",authGuard(),messageController.getMessageHistory)
messageRoutes.get("/users",authGuard(),messageController.getChatUsers)
