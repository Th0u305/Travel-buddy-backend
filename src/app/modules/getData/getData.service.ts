import { Context } from "hono";
import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";
import { Prisma } from "../../lib/prisma.ts";
import {
  PrismaTravelBuddiesConditionTs,
  PrismaTripConditionTs,
} from "../../types/types.ts";

const getUserData = async (c: Context) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase.auth.getUser();
  const { data: user } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url, username_slug, id, providers, is_password")
    .eq("id", data?.user?.id)
    .single();
  if (error) {
    throw error;
  }
  return {
    success: true,
    data: user,
  };
};

const getCountryLists = async (c: Context) => {
  const search = c.req.query("search") || "";

  const data = await Prisma.country_lists.findMany({
    take: 10,
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });

  if (!data) {
    return {
      success: false,
      code: 500,
      data: null,
      message: "Country lists not found",
    };
  }
  return {
    success: true,
    code: 200,
    data: data,
  };
};

const getTripLists = async (c: Context) => {
  const page = c.req.query("page") || "1";
  const search = c.req.query("search") || "";
  const travelType = c.req.query("travelType") || "";

  const conditions: PrismaTripConditionTs[] = [];

  if (typeof search === "string" && search.trim() !== "") {
    conditions.push({
      OR: [
        { country: { contains: search.trim(), mode: "insensitive" } },
        { city: { contains: search.trim(), mode: "insensitive" } },
      ],
    });
  }

  if (typeof travelType === "string" && travelType.trim() !== "") {
    conditions.push({
      travel_type: { contains: travelType.trim(), mode: "insensitive" },
    });
  }

  const data = await Prisma.travel_plans.findMany({
    take: 12,
    skip: (Number(page) - 1) * 10,

    where: conditions.length > 0 ? { AND: conditions } : {},

    include: {
      profiles: {
        select: {
          avatar_url: true,
        },
      },
    },
  });

  if (!data) {
    return {
      success: false,
      code: 500,
      data: null,
      message: "Trip lists not found",
    };
  }
  return {
    success: true,
    code: 200,
    data: data,
  };
};

const getTripListById = async (c: Context) => {
  const id = c.req.param("id");

  if (id?.length === 0) {
    return {
      success: false,
      code: 400,
      data: null,
      message: "Invalid trip id",
    };
  }

  const data = await Prisma.travel_plans.findUnique({
    where: {
      slug: id || undefined,
    },
    include: {
      profiles: {
        select: {
          username_slug: true,
          full_name: true,
          avatar_url: true,
        },
      },
    },
  });

  if (!data) {
    return {
      success: false,
      code: 500,
      data: null,
      message: "Trip list not found",
    };
  }
  return {
    success: true,
    code: 200,
    data: data,
  };
};

const findBuddies = async (c: Context) => {
  const page = c.req.query("page") || "1";
  const search = c.req.query("search") || "";
  const searchByCountryOrCity = c.req.query("searchByCountryOrCity") || "";

  const todayDate = new Date();
  const formattedDate = todayDate.toISOString();

  const conditions: PrismaTravelBuddiesConditionTs[] = [
    {
      end_date: {
        gte: formattedDate,
      },
    },
  ];

  if (
    typeof searchByCountryOrCity === "string" &&
    searchByCountryOrCity.trim() !== ""
  ) {
    conditions.push({
      OR: [
        {
          country: {
            contains: searchByCountryOrCity.trim(),
            mode: "insensitive",
          },
        },
        {
          city: { contains: searchByCountryOrCity.trim(), mode: "insensitive" },
        },
      ],
    });
  }

  if (typeof search === "string" && search.trim() !== "") {
    conditions.push({
      profiles: {
        is: {
          full_name: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
      },
    });
  }

  const data = await Prisma.travel_plans.findMany({
    take: 6,
    skip: (Number(page) - 1) * 12,
    where: {
      AND: conditions,
      travel_type: {
        notIn: ["Solo", "Couple"],
      },
    },
    select: {
      end_date: true,
      start_date: true,
      title: true,
      country: true,
      city: true,
      tags: true,
      slug: true,
      travel_type: true,
      profiles: {
        select: {
          username_slug: true,
          full_name: true,
          avatar_url: true,
        },
      },
    },
  });

  if (!data) {
    return {
      success: false,
      code: 500,
      data: null,
      message: "Upcoming travel plans not found",
    };
  }
  return {
    success: true,
    code: 200,
    data: data,
  };
};

const viewUserProfile = async (c: Context) => {
  const id = c.req.param("id") as string;

  if (id?.length === 0) {
    return {
      success: false,
      code: 400,
      data: null,
      message: "Invalid user id",
    };
  }

  const data = await Prisma.profiles.findUnique({
    where: {
      username_slug: id || undefined,
    },
    include: {
      travel_plans: {
        select: {
          end_date: true,
          start_date: true,
          title: true,
          country: true,
          city: true,
          tags: true,
          slug: true,
          travel_type: true,
          image: true,
          status: true,
        },
      },
    },
  });

  if (!data) {
    return {
      success: false,
      code: 500,
      data: null,
      message: "User profile not found",
    };
  }
  return {
    success: true,
    code: 200,
    data: data,
  };
};

const canUserCreateTrip = async (c: Context) => {
  const id = c.req.param("id") as string;
  const todayDate = new Date();
  const formattedDate = todayDate.toISOString();
  const data = await Prisma.travel_plans.findMany({
    where: {
      user_id: id,
      end_date: {
        gte: formattedDate,
      },
    },
    select: {
      end_date: true,
    },
  });

  return {
    success: true,
    code: 200,
    data: data.length,
  };
};

export const updateTripStatus = async (c: Context) => {
  const supabase = getSupabase(c);

  const { data, error } = await supabase.rpc("bulk_update_trip_statuses");
  await Prisma.$executeRaw`SELECT public.bulk_update_trip_statuses();`;

  if (data) {
    return { success: true, code: 200, data: data };
  }
  if (error) {
    return { success: false, code: 500, data: error };
  }
};

const getUserFullProfile = async (c: Context) => {
  const supabase = getSupabase(c);
  const { data: user } = await supabase.auth.getUser();

  const data = await Prisma.profiles.findUnique({
    where: {
      id: user?.user?.id,
    },
    include: {
      travel_plans: {
        select: {
          end_date: true,
          start_date: true,
          title: true,
          country: true,
          city: true,
          tags: true,
          slug: true,
          travel_type: true,
          image: true,
          status: true,
        },
      },
    },
  });

  if (!data) {
    return {
      success: false,
      code: 500,
      data: null,
      message: "User profile not found",
    };
  }
  return {
    success: true,
    code: 200,
    data: data,
  };
};

export const getDataService = {
  getUserData,
  getCountryLists,
  getTripLists,
  getTripListById,
  findBuddies,
  viewUserProfile,
  canUserCreateTrip,
  updateTripStatus,
  getUserFullProfile,
};
