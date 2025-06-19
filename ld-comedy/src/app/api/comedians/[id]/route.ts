import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id

    // Vérifie si l'ID est valide
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de l'artiste invalide" },
        { status: 400 }
      )
    }

    const comedian = await prisma.user.findFirst({
      where: {
        id: id,
        role: "ARTIST"
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
        description: true,
        specialty: true,
        socialLinks: true,
        shows: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          },
          select: {
            id: true,
            title: true,
            venue: true,
            date: true,
            time: true,
            price: true,
            status: true
          }
        }
      }
    })

    if (!comedian) {
      return NextResponse.json(
        { error: "Artiste non trouvé" },
        { status: 404 }
      )
    }

    // Formatage des dates pour l'affichage et ajout des statistiques
    const formattedComedian = {
      ...comedian,
      totalShows: comedian.shows?.length || 0,
      shows: comedian.shows?.map(show => ({
        ...show,
        date: new Date(show.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })) || []
    }

    return NextResponse.json(formattedComedian)
  } catch (error) {
    console.error("Erreur détaillée:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données de l'artiste" },
      { status: 500 }
    )
  }
}