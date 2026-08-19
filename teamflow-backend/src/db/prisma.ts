import { PrismaClient } from '@/generated/prisma/client.js';
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from '@/config/env.js';
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.databaseUrl })
})

export default prisma;