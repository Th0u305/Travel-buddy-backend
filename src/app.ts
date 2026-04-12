import { Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import { customRoutes } from './routes/index.ts';
import { HTTPException } from 'hono/http-exception';
import { envVars } from './app/config/env.ts';

export const app = new Hono()

app.use("/api/v1/*", cors({
  origin : envVars.FRONTEND_HOST,
  credentials : true,
  allowMethods : ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders : ["Content-Type", "Authorization"],
  exposeHeaders : ["Content-Length"],
  maxAge : 600,
}))

app.get("/", (c: Context)=>{
  return c.json({
    success : true,
    message : "Welcome to Travel Buddy Meetup API"
  }, 200)
})

app.route("/api/v1", customRoutes)

app.onError((err, c: Context) => {
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: err.name,
      message: err.message,
    }, err.status); 
  }

    // 2. Handle unexpected Server Errors (500s)
  // console.error('Unhandled Exception:', err);
  return c.json({
    success: false,
    error: 'InternalServerError',
    message: 'Something went terribly wrong on our end.',
  }, 500);
});

