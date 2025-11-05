import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { role } = await request.json()

    if (!role || !["ARTIST", "THEATER"].includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      )
    }

    // Mise à jour du rôle de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { 
        email: session.user.email 
      },
      data: { 
        role 
      },
    })

    // Création du profil approprié s'il n'existe pas déjà
    if (role === "ARTIST") {
      const existingProfile = await prisma.artistProfile.findFirst({
        where: { userId: updatedUser.id }
      })

      if (!existingProfile) {
        await prisma.artistProfile.create({
          data: {
            userId: updatedUser.id,
            isPublic: true,
            isAvailable: true,
            specialties: [],
            totalLikes: 0,
            totalShows: 0,
            profileViews: 0
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du rôle" },
      { status: 500 }
    )
  }
}