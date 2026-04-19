import { envVars } from "../../config/env.ts";
import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";
import { Context } from "hono";
import { slugify } from "../../utils/slugify.ts";
import { Prisma } from "../../lib/prisma.ts";

const registerUser = async (c: Context) => {
  const body = await c.req.json();

  const { email, password, name, phone_number, country } = body;

  const supabase = await getSupabase(c);

  const isUndefined = (await supabase) === undefined; // I bet this logs 'undefined'

  if (isUndefined) {
    return {
      message: "Supabase Client is undefined",
    };
  }

  const { data: isPhoneExists } = await supabase
    .from("profiles ")
    .select("phone")
    .eq("phone", `+${phone_number}`)
    .single();
  const { data: isUserExists } = await supabase
    .from("profiles ")
    .select("email")
    .eq("email", email)
    .single();

  if (isPhoneExists?.phone === `+${phone_number}`) {
    return {
      code: "phone_number_error",
      status: 422,
    };
  }
  if (isUserExists?.email === email) {
    return {
      code: "email_error",
      status: 422,
    };
  }

  const slugData = slugify(name);
  let slugs = slugData;
  let count = 1;
  while (true) {
    const isExists = await Prisma.profiles.findUnique({
      where: {
        username_slug: slugs,
      },
    });
    if (isExists) {
      count++;
      slugs = `${slugData}-${count}`;
    } else {
      break;
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: name,
        phone: `+${phone_number}`,
        country: country,
      },
    },
  });

  if (error) {
    return error;
  } else {
    return data;
  }
};

const logInUser = async (c: Context) => {
  const { email, password } = await c.req.json();

  const supabase = getSupabase(c);

  const isUndefined = supabase === undefined;

  if (isUndefined) {
    return {
      message: "Supabase Client is undefined",
    };
  }
  const { data: user, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return error;
  }
  return user;
};

const logOutUser = async (c: Context) => {
  const supabase = getSupabase(c);

  const { error } = await supabase.auth.signOut();

  if (error) {
    return error;
  }

  return {
    message: "User logged out successfully",
  };
};

const googleLogin = async (c: Context) => {
  const supabase = getSupabase(c);

  const isUndefined = supabase === undefined;

  if (isUndefined) {
    return {
      message: "Supabase Client is undefined",
    };
  }
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: envVars.GOOGLE_REDIRECT_CALLBACK,
    },
  });

  return data.url;
};

const resetPassword = async (c: Context) => {
  const { email, password } = await c.req.json();

  const supabase = getSupabase(c);

  const isUndefined = supabase === undefined;

  if (isUndefined) {
    return {
      message: "Supabase Client is undefined",
    };
  }

  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("email", email)
    .single();

  if (!data || data === null) {
    return {
      message: "This email address is not registered",
      status: 400,
      success: false,
    };
  }

  const { error: updatePasswordError } = await supabase.auth.updateUser({
    password: password,
  });

  if (
    updatePasswordError?.code === "same_password" &&
    updatePasswordError?.status === 422
  ) {
    return {
      message: "Your old password and new password are the same",
      status: 422,
      success: false,
    };
  }

  return {
    message: "Password reset successfully",
    status: 200,
    success: true,
  };
};

export const authService = {
  registerUser,
  logInUser,
  logOutUser,
  googleLogin,
  resetPassword,
};
