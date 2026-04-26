import { envVars } from "../../config/env.ts";
import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { Buffer } from "node:buffer";
import { createClient } from "@supabase/supabase-js";

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

  const { data: isUserExists } = await supabase
    .from("profiles ")
    .select("phone , email")
    .eq("phone", `+${phone_number}`)
    .eq("email", email)
    .single();

  if (isUserExists?.phone === `+${phone_number}`) {
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

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: name,
        phone: `+${phone_number}`,
        country: country,
        is_password : true,
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
  const { email } = await c.req.json();

  const supabase = createClient(envVars.SUPABASE_URL, envVars.PUBLISHABLE_KEY)

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
      status: 404,
      success: false,
    };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/auth/reset-password",
  });

  if (error) {
    return {
      message: "Something went wrong",
      status: 500,
      success: false,
    };
  }

  return {
    message: "Check your email for the reset link",
    status: 200,
    success: true,
  };
};

const exchangeResetToken = async (c: Context) => {
  const { access_token, refresh_token } = await c.req.json();

  const supabase = getSupabase(c);

  const isUndefined = supabase === undefined;

  if (isUndefined) {
    return {
      message: "Supabase Client is undefined",
    };
  }

  if (!access_token) {
    return {
      message: "Invalid token",
      status: 400,
      success: false,
    };
  }

  const { data: session, error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token || "",
  })

  const sessionString = JSON.stringify(session);
  const encoded = encodeURIComponent(
    Buffer.from(sessionString, "utf-8").toString("base64"),
  );

  setCookie(c, "sb_session", encoded, {
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 60 * 2, // 2 minutes
    path: "/",
  });

  if (error) {
    return {
      message: "Invalid token",
      status: 400,
      success: false,
    };
  }

  return {
    message: "Token exchanged successfully",
    status: 200,
    success: true,
  };
};

const resetUpdatePassword = async (c: Context) => {
  const { password } = await c.req.json();
  const supabase = getSupabase(c);

  const isUndefined = supabase === undefined;
  if (isUndefined) {
    return {
      message: "Supabase Client is undefined",
    };
  }

  const { error: updatePasswordError } = await supabase.auth.updateUser({password: password});

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

  if (updatePasswordError) {
    return {
      message: "Something went wrong",
      status: 500,
      success: false,
    };
  }
  
  setCookie(c, "sb_session", "", {
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 60 * 2, // 2 minutes
    path: "/",
  });
  logOutUser(c);

  return {
    message: "Password updated successfully",
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
  exchangeResetToken,
  resetUpdatePassword,
};
