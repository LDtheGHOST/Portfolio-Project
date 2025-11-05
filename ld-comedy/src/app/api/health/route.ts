import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🏥 Health check démarré")

    // Vérifier les variables d'environnement critiques
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    }

    console.log("📋 Variables d'environnement:", envCheck)

    // Tester la connexion à la base de données
    const startTime = Date.now()
    await prisma.$connect()
    const connectionTime = Date.now() - startTime

    // Tester une simple requête
    const userCount = await prisma.user.count()
    const queryTime = Date.now() - startTime - connectionTime

    console.log("✅ Health check réussi")

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        connected: true,
        connectionTime: `${connectionTime}ms`,
        queryTime: `${queryTime}ms`,
        userCount,
      },
      prisma: {
        initialized: !!prisma,
      },
    })
  } catch (error) {
    console.error("❌ Health check échoué:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        environment: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
          NODE_ENV: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    )
  }
}
