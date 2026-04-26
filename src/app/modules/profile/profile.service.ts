import { Context } from "hono";
import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";
import { Prisma } from "../../lib/prisma.ts";

const updateProfile = async (c: Context) => {

  const body = await c.req.json();
  const { user_id, image, bio, travel_interests, country } = body;

  const user = await Prisma.profiles.findUnique({
    where: {
      id: user_id,
    },
  });

  if (!user) {
    return {
      success: false,
      code: 404,
      message: "This user does not exist",
      data: null,
    };
  }

  const data = await Prisma.profiles.update({
    where: {
      id: user_id,
    },
    data: {
      ...(image ? { avatar_url: image.trim() } : {}),
      ...(bio ? { bio: bio.trim() } : {}),
      ...(travel_interests.length > 0
        ? {
          travel_interests: travel_interests.split(",").map((i: string) =>
            i.trim()
          ).filter((i: string) => i !== ""),
        }
        : {}),
      ...(country ? { country: country.trim() } : {}),
    },
  });

  if (!data) {
    return {
      success: false,
      status: 500,
      message: "Failed to update profile",
      data: null,
    };
  }
  return {
    success: true,
    status: 200,
    data: data,
    message: "Profile updated successfully",
  };
};

const updateUserProvider = async (c: Context) => {
  const supabase = getSupabase(c);
  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user?.user?.id) {
    return {
      success: false,
      code: 401,
      message: "Unauthorized",
      data: null,
    };
  }

  const data = await Prisma.profiles.update({
    where: {
      id: user.user.id,
    },
    data: {
      providers: {
        push: "google",
      },
    },
  });

  if (!data) {
    return {
      success: false,
      status: 500,
      message: "Failed to update profile",
      data: null,
    };
  }
  return {
    success: true,
    status: 200,
    data: data,
    message: "Profile updated successfully",
  };
};

export const profileServices = {
  updateProfile,
  updateUserProvider,
};
