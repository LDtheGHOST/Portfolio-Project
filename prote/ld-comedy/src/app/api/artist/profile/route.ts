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

    // Récupérer l'utilisateur avec son profil artiste
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        artistProfile: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profile: user.artistProfile,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        description: user.description,
        specialty: user.specialty,
        socialLinks: user.socialLinks
      }
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

    const body = await req.json()
    console.log('[PATCH /api/artist/profile] Body reçu:', body)

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { artistProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Séparer les données User et ArtistProfile
    const userData: any = {}
    const artistProfileData: any = {}

    // Champs du User
    if (body.name !== undefined) userData.name = body.name
    if (body.profileImage !== undefined) userData.profileImage = body.profileImage
    if (body.description !== undefined) userData.description = body.description
    if (body.specialty !== undefined) userData.specialty = body.specialty
    if (body.socialLinks !== undefined) userData.socialLinks = body.socialLinks

    // Champs de l'ArtistProfile
    if (body.stageName !== undefined) artistProfileData.stageName = body.stageName
    if (body.bio !== undefined) artistProfileData.bio = body.bio
    if (body.specialties !== undefined) artistProfileData.specialties = body.specialties
    if (body.experience !== undefined) artistProfileData.experience = body.experience
    if (body.yearsOfExperience !== undefined) artistProfileData.yearsOfExperience = Number(body.yearsOfExperience)
    if (body.location !== undefined) artistProfileData.location = body.location
    if (body.region !== undefined) artistProfileData.region = body.region
    if (body.availableForTravel !== undefined) artistProfileData.availableForTravel = body.availableForTravel
    if (body.isAvailable !== undefined) artistProfileData.isAvailable = body.isAvailable
    if (body.isPublic !== undefined) artistProfileData.isPublic = body.isPublic
    if (body.minimumFee !== undefined) artistProfileData.minimumFee = Number(body.minimumFee)
    if (body.maxDistance !== undefined) artistProfileData.maxDistance = Number(body.maxDistance)
    if (body.coverImage !== undefined) artistProfileData.coverImage = body.coverImage

    // Mettre à jour le User si nécessaire
    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userData
      })
    }

    // Mettre à jour ou créer le profil artiste
    if (Object.keys(artistProfileData).length > 0) {
      if (user.artistProfile) {
        await prisma.artistProfile.update({
          where: { userId: user.id },
          data: artistProfileData
        })
      } else {
        await prisma.artistProfile.create({
          data: {
            ...artistProfileData,
            userId: user.id,
            isPublic: true,
            isAvailable: true,
            specialties: artistProfileData.specialties || [],
            totalLikes: 0,
            totalShows: 0,
            profileViews: 0
          }
        })
      }
    }

    // Récupérer le profil mis à jour
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { artistProfile: true }
    })

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
      profile: updatedUser?.artistProfile,
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        profileImage: updatedUser?.profileImage,
        description: updatedUser?.description,
        specialty: updatedUser?.specialty,
        socialLinks: updatedUser?.socialLinks
      }
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
