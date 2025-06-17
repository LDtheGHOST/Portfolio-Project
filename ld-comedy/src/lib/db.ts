import { PrismaClient } from '@prisma/client';

// Évite de créer plusieurs instances de Prisma pendant le hot-reloading en développement
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 