
interface EnvConfig {
    FRONTEND_HOST : string
    PORT : string
    DIRECT_URL : string
    DATABASE_URL : string
    SUPABASE_URL: string;
    PUBLISHABLE_KEY: string;
    ANON_KEY : string
    GOOGLE_REDIRECT_CALLBACK : string
}

const loadEnvVariables = (): EnvConfig => {

    const requireEnvVariable = [
        "FRONTEND_HOST",
        "PORT",
        "DIRECT_URL",
        "DATABASE_URL",
        "SUPABASE_URL",
        "PUBLISHABLE_KEY",
        "ANON_KEY",
        "GOOGLE_REDIRECT_CALLBACK"  
    ]

    requireEnvVariable.forEach((variable) => {
        if (!Deno.env.get(variable)) {
            return console.error(`Environment variable ${variable} is required but not set in .env file.`);
        }
    })

    return {
        FRONTEND_HOST: Deno.env.get("FRONTEND_HOST") as string,
        PORT: Deno.env.get("PORT") as string,
        DIRECT_URL: Deno.env.get("DIRECT_URL") as string,
        DATABASE_URL: Deno.env.get("DATABASE_URL") as string,
        SUPABASE_URL: Deno.env.get("SUPABASE_URL") as string,
        PUBLISHABLE_KEY: Deno.env.get("PUBLISHABLE_KEY") as string,
        ANON_KEY: Deno.env.get("ANON_KEY") as string,
        GOOGLE_REDIRECT_CALLBACK: Deno.env.get("GOOGLE_REDIRECT_CALLBACK") as string,
    }
}

export const envVars = loadEnvVariables();