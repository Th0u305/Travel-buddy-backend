interface EnvConfig {
  FRONTEND_HOST: string;
  PORT: string;
  DIRECT_URL: string;
  DATABASE_URL: string;
  SUPABASE_URL: string;
  PUBLISHABLE_KEY: string;
  ANON_KEY: string;
  GOOGLE_REDIRECT_CALLBACK: string;
  MAIL_REDIS_PORT: string;
  MAIL_REDIS_HOST_NAME: string;
  MAIL_REDIS_PASSWORD: string;
  MAIL_REDIS_USERNAME: string;
  MAIL_SMTP_PASS: string;
  MAIL_SMTP_FROM: string;
  MAIL_SMTP_USER: string;
  MAIL_SMTP_PORT: string;
  MAIL_SMTP_HOST: string;
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
    "GOOGLE_REDIRECT_CALLBACK",
    "MAIL_REDIS_PORT",
    "MAIL_REDIS_HOST_NAME",
    "MAIL_REDIS_PASSWORD",
    "MAIL_REDIS_USERNAME",
    "MAIL_SMTP_PASS",
    "MAIL_SMTP_FROM",
    "MAIL_SMTP_USER",
    "MAIL_SMTP_PORT",
    "MAIL_SMTP_HOST",
  ];

  requireEnvVariable.forEach((variable) => {
    if (!Deno.env.get(variable)) {
      return console.error(
        `Environment variable ${variable} is required but not set in .env file.`,
      );
    }
  });

  return {
    FRONTEND_HOST: Deno.env.get("FRONTEND_HOST") as string,
    PORT: Deno.env.get("PORT") as string,
    DIRECT_URL: Deno.env.get("DIRECT_URL") as string,
    DATABASE_URL: Deno.env.get("DATABASE_URL") as string,
    SUPABASE_URL: Deno.env.get("SUPABASE_URL") as string,
    PUBLISHABLE_KEY: Deno.env.get("PUBLISHABLE_KEY") as string,
    ANON_KEY: Deno.env.get("ANON_KEY") as string,
    GOOGLE_REDIRECT_CALLBACK: Deno.env.get(
      "GOOGLE_REDIRECT_CALLBACK",
    ) as string,
    MAIL_REDIS_PORT: Deno.env.get("MAIL_REDIS_PORT") as string,
    MAIL_REDIS_HOST_NAME: Deno.env.get("MAIL_REDIS_HOST_NAME") as string,
    MAIL_REDIS_PASSWORD: Deno.env.get("MAIL_REDIS_PASSWORD") as string,
    MAIL_REDIS_USERNAME: Deno.env.get("MAIL_REDIS_USERNAME") as string,
    MAIL_SMTP_PASS: Deno.env.get("MAIL_SMTP_PASS") as string,
    MAIL_SMTP_FROM: Deno.env.get("MAIL_SMTP_FROM") as string,
    MAIL_SMTP_USER: Deno.env.get("MAIL_SMTP_USER") as string,
    MAIL_SMTP_PORT: Deno.env.get("MAIL_SMTP_PORT") as string,
    MAIL_SMTP_HOST: Deno.env.get("MAIL_SMTP_HOST") as string,
  };
};

export const envVars = loadEnvVariables();
