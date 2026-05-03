import { Context } from "hono";
import {messageService} from "./message.service.ts";
import { catchAsync } from "../../utils/catchAsync.ts";


const sendMessage = catchAsync(async (c: Context) => {

    const data = await messageService.sendMessage(c);

  return c.json(data)
});

const getMessageHistory = catchAsync(async (c: Context) => {
    const data = await messageService.getMessageHistory(c);
    return c.json(data);
});

const getChatUsers = catchAsync(async (c: Context) => {
    const data = await messageService.getChatUsers(c);
    return c.json(data);
});

export const messageController = {
    sendMessage,
    getMessageHistory,
    getChatUsers
}