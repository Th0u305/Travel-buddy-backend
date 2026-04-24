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

export interface PrismaTripConditionTs {
  OR?: [
    {
      country: { contains: string; mode: "insensitive" };
    },
    {
      city: { contains: string; mode: "insensitive" };
    },
  ];
  travel_type?: { contains: string; mode: "insensitive" };
}

export interface PrismaTravelBuddiesConditionTs {
  end_date?: {
    gte: string;
  },
  profiles?: {
    is: {
      full_name: {
        contains: string , mode: "insensitive" 
      };
    };
  },
  OR?: [
    {
      country: { contains: string; mode: "insensitive" };
    },
    {
      city: { contains: string; mode: "insensitive" };
    },
  ];

}

export interface PrismaProfileConditionTs {
  avatar_url?: string;
  bio?: string;
  travel_interests?: string;
}