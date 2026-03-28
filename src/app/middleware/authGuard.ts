import { MiddlewareHandler } from "hono";
import { UnauthorizedError } from "../utils/error.ts";

export const authGuard = (): MiddlewareHandler => {
  return async (c, next) => {
    // 1. Grab the Supabase client that your first middleware attached
    const supabase = c.get("supabase");

    // 2. Securely fetch the user. 
    // (getUser cryptographically verifies the token, which is much safer than getSession)
    const { data: { user }, error } = await supabase.auth.getUser();
    const { data : { session }} = await supabase.auth.getSession();
    
    // 3. If there's no valid user, throw our 401 error
    if (error || !user || !session) {
      throw new UnauthorizedError("You must be logged in to access this resource.");
    }

    // 4. Attach the user to the context so your controllers can use it!
    c.set("user", user);

    // 5. Let the request continue to the route handler
    await next();
  };
};


export const isUserLoggedIn = (): MiddlewareHandler => {
  return async (c, next) => {
    const supabase = c.get("supabase");

    const { data : { session }} = await supabase.auth.getSession();
    
    if (session && session?.access_token) {
      return c.json({
        success : false,
        message : "You're already logged in",
        code : 302
      })
    }

    c.set("user", {});

    // 5. Let the request continue to the route handler
    await next();
  };
};
