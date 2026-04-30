import { Context } from "hono";
import { Prisma } from "../../lib/prisma.ts";
import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";
import { slugify } from "../../utils/slugify.ts";

const createTravelPlan = async (c: Context) => {
  const supabase = getSupabase(c);
  const userId = await supabase.auth.getUser();
  const body = await c.req.json();

  const slugData = slugify(body.trip_title);
  let slugs = slugData;
  let count = 1;

  while (true) {
    const isExists = await Prisma.travel_plans.findUnique({
      where: {
        slug: slugs,
      },
    });
    if (isExists) {
      count++;
      slugs = `${slugData}-${count}`;
    } else {
      break;
    }
  }

  const data = await Prisma.travel_plans.create({
    data: {
      user_id: `${userId.data.user?.id}`,
      title: body.trip_title,
      country: body.country,
      city: body.city,
      start_date: body.start_date,
      end_date: body.end_date,
      description: body.trip_description,
      min_budget: body.min_budget,
      max_budget: body.max_budget,
      looking_for_buddy: body.looking_for_buddy,
      max_buddies: body.max_travelers,
      status: body.status,
      travel_type: body.travel_type,
      tags: body.tags,
      image: body.cover_url,
      slug: slugs,
    },
  });
  return data;
};

const joinTrip = async (c: Context) => {
  const body = await c.req.json();

  const travelData = await Prisma.travel_plans.findUnique({
    where: {
      slug: body.slug,
    },
  });

  if(!travelData){
    return {
      success : false,
      message : "You can not join the trip because the trip is not found",
      status : 404
    }
  }
  if(travelData.status === "ongoing"){
    return {
      success : false,
      message : "You can not join the trip because the trip is already started",
      status : 400
    }
  }

  if (travelData.travel_type === "Solo") {
    return {
      success : false,
      message : "You can not join the trip because this travel plan is only for solo travelers",
      status : 400
    }
  }

  if(travelData.participantsId.includes(body.userId)){
    return {
      success : false,
      message : "You have already joined this trip",
      status : 400
    }
  }

  if(travelData.max_buddies === travelData.participantsId.length){
    return {
      success : false,
      message : "You can not join the trip because the trip is already full",
      status : 400
    }
  }

  if (travelData.user_id === body.userId) {
    return {
      success : false,
      message : "You can not join the trip because you are the creator of the trip",
      status : 400
    }
  }

  const data = await Prisma.travel_plans.update({
    where: {
      slug: body.slug,
    },
    data: {
      participantsId: {
        push: body.userId
      }
    },
  });

  if (!data) {
    return {
      success : false,
      message : "Something went wrong",
      status : 500
    }
  }

  return {
    success : true,
    message : "You have successfully joined the trip",
    status : 200,
    data : data
  };
};

const removeFromTrip = async (c: Context) => {
  const body = await c.req.json();

  const travelData = await Prisma.travel_plans.findUnique({
    where: {
      slug: body.slug,
    },
  });

  if(!travelData){
    return {
      success : false,
      message : "Trip not found",
      status : 404
    }
  }

  if(!travelData.participantsId.includes(body.userId)){
    return {
      success : false,
      message : "You have not joined this trip",
      status : 400
    }
  }

  const updatedParticipants = travelData.participantsId.filter(id => id !== body.userId);

  const data = await Prisma.travel_plans.update({
    where: {
      slug: body.slug,
    },
    data: {
      participantsId: {
        set: updatedParticipants
      }
    },
  });

  if (!data) {
    return {
      success : false,
      message : "Something went wrong",
      status : 500
    }
  }

  return {
    success : true,
    message : "You have successfully left the trip",
    status : 200,
    data : data
  };
};

export const travelPlanService = {
  createTravelPlan,
  joinTrip,
  removeFromTrip,
};
