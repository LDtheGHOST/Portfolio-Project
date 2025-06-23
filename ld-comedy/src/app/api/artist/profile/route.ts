import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        artistProfile: {
          include: {
            videos: true,
            photos: true,
          },
        },
      },
    })

    if (!user || !user.artistProfile) {
      return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profile: user.artistProfile,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { artistProfile: true },
    })
    if (!user || !user.artistProfile) {
      return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 })
    }
    const body = await req.json()

    // Split update fields between User and ArtistProfile
    const userUpdate: any = {}
    const artistProfileUpdate: any = {}

    // User fields
    if (body.profileImage !== undefined) userUpdate.profileImage = body.profileImage
    if (body.socialLinks !== undefined) userUpdate.socialLinks = body.socialLinks
    if (body.name !== undefined) userUpdate.name = body.name

    // ArtistProfile fields
    if (body.coverImage !== undefined) artistProfileUpdate.coverImage = body.coverImage
    if (body.bio !== undefined) artistProfileUpdate.bio = body.bio
    if (body.specialties !== undefined) artistProfileUpdate.specialties = body.specialties
    if (body.region !== undefined) artistProfileUpdate.region = body.region
    if (body.stageName !== undefined) artistProfileUpdate.stageName = body.stageName
    if (body.experience !== undefined) artistProfileUpdate.experience = body.experience
    if (body.yearsOfExperience !== undefined) artistProfileUpdate.yearsOfExperience = body.yearsOfExperience
    if (body.description !== undefined) artistProfileUpdate.description = body.description
    if (body.location !== undefined) artistProfileUpdate.location = body.location
    // Add more fields as needed

    // Update User if needed
    let updatedProfile = user.artistProfile
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userUpdate,
      })
      // Refetch artistProfile after user update to get latest user fields
      updatedProfile = await prisma.artistProfile.findUnique({
        where: { id: user.artistProfile.id },
        include: { user: true },
      })
    }

    // Update ArtistProfile if needed
    if (Object.keys(artistProfileUpdate).length > 0) {
      updatedProfile = await prisma.artistProfile.update({
        where: { id: user.artistProfile.id },
        data: artistProfileUpdate,
        include: { user: true },
      })
    } else if (Object.keys(userUpdate).length === 0) {
      // If not updated, fetch with user included
      updatedProfile = await prisma.artistProfile.findUnique({
        where: { id: user.artistProfile.id },
        include: { user: true },
      })
      if (!updatedProfile) {
        return NextResponse.json({ error: "Profil artiste non trouvé après mise à jour" }, { status: 404 })
      }
    }

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
