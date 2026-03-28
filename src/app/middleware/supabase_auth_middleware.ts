import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { envVars } from "../config/env.ts";


export const getSupabase = (c: Context) => {
  return c.get("supabase");
};

export const supabaseMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    if (!envVars.SUPABASE_URL) {

      throw new Error("SUPABASE_URL missing!");
    }

    if (!envVars.PUBLISHABLE_KEY) {

      throw new Error("SUPABASE_PUBLISHABLE_KEY missing!");
    }

    const supabase = createServerClient(
      envVars.SUPABASE_URL,
      envVars.PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            // 1. Get all cookies as a standard object from Hono
            const parsedCookies = getCookie(c);

            // 2. Map that object into the specific Array format Supabase demands
            return Object.keys(parsedCookies).map((name) => ({
              name,
              value: parsedCookies[name],
            }));
          },
          setAll(cookiesToSet) {            
            cookiesToSet.forEach(({ name, value, options }) => {
              setCookie(c, name, value, options as any);
            });
          },
        },
      },
    );

    c.set("supabase", supabase as unknown as SupabaseClient);

    await next();
  };
};
