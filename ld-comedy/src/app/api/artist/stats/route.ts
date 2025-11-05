import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
// import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )    }

    // Retourner des statistiques temporaires en attendant la résolution du problème Prisma
    // TODO: Implémenter les vraies statistiques quand Prisma sera correctement généré
    const stats = {
      totalShows: 0,
      averageRating: 0,
      profileViews: 0,
      totalMessages: 0
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
