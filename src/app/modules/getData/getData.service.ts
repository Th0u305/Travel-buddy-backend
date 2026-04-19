import { Context } from "hono";
import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";
import { Prisma } from "../../lib/prisma.ts";
import { PrismaTravelBuddiesConditionTs, PrismaTripConditionTs } from "../../types/types.ts";

const getUserData = async (c: Context) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase.auth.getUser();
  const { data: user } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url, profile_picture, username_slug, id")
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
          profile_picture: true,
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
          profile_picture: true,
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
  const formattedDate = todayDate.toISOString().split("T")[0];

  const conditions: PrismaTravelBuddiesConditionTs[] = [
    {
      end_date: {
        gte: formattedDate,
      },
    },
  ];

  if (typeof searchByCountryOrCity === "string" && searchByCountryOrCity.trim() !== "") {
    conditions.push({
      OR: [
        { country: { contains: searchByCountryOrCity.trim(), mode: "insensitive" } },
        { city: { contains: searchByCountryOrCity.trim(), mode: "insensitive" } },
      ],
    });
  }

  if (typeof search === "string" && search.trim() !== "") {
    conditions.push({
      profiles : {
        is: {
          full_name: {
            contains: search.trim(),
            mode: "insensitive",
          },
        }
      }
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
          profile_picture: true,
        },
      },
    },
  })


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
}

const fullUserProfile = async (c: Context) => {
  const id = c.req.param("id") as string

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
      username_slug : id || undefined
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
          image : true,
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
}

const canUserCreateTrip = async (c: Context) => {
  const id = c.req.param("id") as string
  const todayDate = new Date();
  const formattedDate = todayDate.toISOString().split("T")[0];
  const data = await Prisma.travel_plans.findMany({
    where : {
      user_id : id,
      end_date : {
        gte: formattedDate,
      },
    },
    select : {
      end_date : true
    }
  })

  return {
    success: true,
    code: 200,
    data: data.length,
  };
}

export const updateTripStatus = async (c:Context) => {

  const {id} = await c.req.json()

  const trip = await Prisma.travel_plans.findMany({
    where :{
      user_id : id 
    },
    select: { start_date: true, end_date: true, status: true }
  });

  if (!trip) {
    return { success: false, code: 404, message: "Trip not found" };
  }

  if (!trip[0]?.start_date || !trip[0]?.end_date) {
    return { success: true, code: 200, data: trip, message: "Dates missing, status unchanged" };
  }

  // Normalize to local midnight (avoids timezone/off-by-one bugs)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(trip[0]?.start_date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(trip[0]?.end_date);
  endDate.setHours(0, 0, 0, 0);
 
  let newStatus = trip[0]?.status;
  if (today < startDate) {
    newStatus = "upcoming";
  } else if (today >= startDate && today <= endDate) {
    newStatus = "ongoing";
  } else {
    newStatus = "completed";
  }

  // Only update if status actually changed
  if (newStatus !== trip[0]?.status) {
    const updated = await Prisma.travel_plans.updateMany({
      where: { user_id : id },
      data: { status: newStatus }
    });
    console.log(updated);
    return { success: true, code: 200, data: updated };
  }

  return { success: true, code: 200, data: trip };
};

export const getDataService = {
  getUserData,
  getCountryLists,
  getTripLists,
  getTripListById,
  findBuddies,
  fullUserProfile,
  canUserCreateTrip,
  updateTripStatus
};
