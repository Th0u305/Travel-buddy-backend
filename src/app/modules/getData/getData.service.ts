import { Context } from "hono";
import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";
import { Prisma } from "../../lib/prisma.ts";

const getUserData = async (c: Context) => {
    const supabase = getSupabase(c);
    const { data, error } = await supabase.auth.getUser();    
    const { data: user } = await supabase
            .from("profiles")
            .select("full_name, email, avatar_url, profile_picture")
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

const getCountryLists = async (c: Context) => {


    // const page = parseInt(c.req.query('page') || '1')
    // const limit = parseInt(c.req.query('limit') || '10')
    // const offset = (page - 1) * limit
    const search = c.req.query('search') || ''

    // if (search.length === 0) {
    //     return {
    //         success: false,
    //         code : 400,
    //         data: null,
    //         message : "Search query is required"
    //     }
    // }


    const data = await Prisma.country_lists.findMany({
        take: 10,
        where: {
            name: {
                contains: search,
                mode: "insensitive",
            },
        },
    })

    if (!data) {
        return {
            success: false,
            code : 500,
            data: null,
            message : "Country lists not found"
        }
    }
    return {
        success: true,
        code : 200,
        data: data,
    };
};

export const getDataService = {
    getUserData,
    getCountryLists
};