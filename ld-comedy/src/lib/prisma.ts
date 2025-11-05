import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  console.log("🔄 Création d'une nouvelle instance PrismaClient")
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Gestion de la déconnexion propre
if (process.env.NODE_ENV === "production") {
  // En production (Vercel), on garde la connexion ouverte
  // Vercel gère automatiquement le cycle de vie
} else {
  // En développement, on nettoie proprement
  process.on("beforeExit", async () => {
    await prisma.$disconnect()
  })
}

console.log("✅ Prisma Client initialisé")

export default prisma