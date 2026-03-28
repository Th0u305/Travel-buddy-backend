import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";
import { Context } from "hono";

const registerUser = async (c: Context) => {
  const { email, password, name } = await c.req.json();

  const supabase = await getSupabase(c);

  const isUndefined = (await supabase) === undefined; // I bet this logs 'undefined'

  if (isUndefined) {
    return {
      message: "Supabase Client is undefined",
    };
  }
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error?.code === "user_already_exists" && error?.status === 422) {
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
  const { data : user } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });  

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

export const authService = {
  registerUser,
  logInUser,
  logOutUser,
};
