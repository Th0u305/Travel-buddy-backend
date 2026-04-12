import { SupabaseClient } from "@supabase/supabase-js";
import "hono";

declare module "hono" {
  interface ContextVariableMap {
    supabase: SupabaseClient;
  }
}

export enum TravelType {
  solo = "solo",
  couple = "couple",
  family = "family",
  friends = "friends",
}