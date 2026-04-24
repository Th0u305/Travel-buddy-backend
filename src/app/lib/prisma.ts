import { PrismaClient } from "../../../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { envVars } from "../config/env.ts";

const connectionString = `${envVars.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const Prisma = new PrismaClient({ adapter, log: ["error"] });

export { Prisma };
