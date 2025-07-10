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

    // Retourner des spectacles temporaires en attendant la résolution du problème Prisma
    // TODO: Implémenter les vrais spectacles quand Prisma sera correctement généré
    const shows = [
      {
        title: "Spectacle de Noël",
        venue: "Théâtre Municipal",
        date: "2025-12-25T20:00:00Z",
        time: "20:00",
        status: "Confirmé",
        description: "Spectacle spécial pour les fêtes",
        ticketPrice: 25
      },
      {
        title: "Comedy Night",
        venue: "Le Rire Café",
        date: "2025-07-15T19:30:00Z",
        time: "19:30",
        status: "En attente",
        description: "Soirée humour avec plusieurs artistes",
        ticketPrice: 15
      }
    ]

    // Filtrer les spectacles futurs et les trier par date
    const now = new Date()
    const upcomingShows = shows
      .filter(show => new Date(show.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ shows: upcomingShows })

  } catch (error) {
    console.error("Erreur lors de la récupération des spectacles:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
