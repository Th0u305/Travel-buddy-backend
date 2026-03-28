import { Context, Next, Handler } from 'hono';

export const catchAsync = (fn: Handler): Handler => {
    return async (c: Context, next: Next) => {
        try {
            return await fn(c, next);
        } catch (error: any) {
            throw error; 
        }
    };
};