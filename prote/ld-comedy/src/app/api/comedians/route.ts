import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const comedians = await prisma.user.findMany({
      where: {
        role: "ARTIST"
      },
      select: {
        id: true,
        name: true,
        profileImage: true, // Utilisez profileImage au lieu de image
        description: true,
        specialty: true,
        socialLinks: true,
        email: true
      }
    })

    // Transformez les données pour correspondre à l'interface attendue
    const formattedComedians = comedians.map(comedian => ({
      id: comedian.id,
      name: comedian.name,
      image: comedian.profileImage, // Renommez profileImage en image pour le front-end
      description: comedian.description,
      specialty: comedian.specialty,
      socialLinks: comedian.socialLinks
    }))

    return NextResponse.json(formattedComedians)
  } catch (error) {
    console.error("Detailed error:", error)
    // Retourner un tableau vide au lieu d'un objet d'erreur pour éviter les erreurs .map()
    return NextResponse.json([], { status: 200 })
  }
}