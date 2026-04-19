import { Context } from "hono";
import { Prisma } from "../../lib/prisma.ts";
import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";
import { slugify } from "../../utils/slugify.ts";

const createTravelPlan = async (c: Context) => {
    
    const supabase = getSupabase(c);
    const userId = await supabase.auth.getUser()
    const body = await c.req.json()

    const slugData = slugify(body.trip_title)
    let slugs = slugData
    let count = 1

    while(true){
        const isExists = await Prisma.travel_plans.findUnique({
            where : {
                slug : slugs
            }
        })
        if(isExists){
            count++
            slugs = `${slugData}-${count}`
        }else{
            break
        }
    }

    const data = await Prisma.travel_plans.create({
        data : {
            user_id : `${userId.data.user?.id}`,
            title : body.trip_title,
            country : body.country,
            city : body.city,
            start_date : body.start_date,
            end_date : body.end_date,
            description : body.trip_description,
            min_budget : body.min_budget,
            max_budget : body.max_budget,
            looking_for_buddy : body.looking_for_buddy,
            max_buddies : body.max_travelers,
            status : body.status,
            travel_type : body.travel_type,
            tags : body.tags,
            image : body.cover_url,
            slug : slugs    
        }
    })
    await Prisma.profiles.update({
        where : {
            id : `${userId.data.user?.id}`
        },
        data : {
            travel_plans : {
                connect : {
                    id : data.id
                }
            }
        }
    })
    return data    
}

export const travelPlanService = {
    createTravelPlan
}