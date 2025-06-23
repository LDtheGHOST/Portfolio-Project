import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Vérifie si l'ID est valide
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de l'artiste invalide" },
        { status: 400 }
      )
    }

    // Récupère la session utilisateur
    const session = await getServerSession(authOptions);

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
        },
        artistProfile: {
          select: {
            bio: true,
            posters: {
              include: {
                comments: { include: { user: { select: { name: true, profileImage: true } } } },
              },
              orderBy: { createdAt: "desc" },
            }
          }
        }
      }
    })

    if (!comedian) {
      return NextResponse.json(
        { error: "Comédien non trouvé" },
        { status: 404 }
      )
    }

    // Fusionne les infos de l'artiste et de son profil
    const result = {
      ...comedian,
      bio: comedian.artistProfile?.bio || null,
      posters: comedian.artistProfile?.posters || [],
      coverImage: comedian.artistProfile?.coverImage || null,
      specialties: comedian.artistProfile?.specialties || [],
      region: comedian.artistProfile?.region || null,
      isOwner: session?.user?.id === comedian.id,
      user: { id: comedian.id },
    }
    delete result.artistProfile

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}