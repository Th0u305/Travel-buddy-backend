import { Context } from "hono";
import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";

const getUserData = async (c: Context) => {
    const supabase = getSupabase(c);
    const { data, error } = await supabase.auth.getUser();    
    const { data: user } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data?.user?.id)
            .single()

    if (error) {
        throw error;
    }
    return {
        success: true,
        data: user,
    };
};

export const getDataService = {
    getUserData
};