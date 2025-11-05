import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son profil théâtre
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        theaterProfile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: user.theaterProfile,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        description: user.description,
        socialLinks: user.socialLinks
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil théâtre:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { theaterProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const body = await req.json();
    console.log('[PATCH /api/theater/profile] Body reçu:', body);

    // Séparer les données User et TheaterProfile
    const userData: any = {};
    const theaterData: any = {};

    // Champs du User
    if (body.name !== undefined) userData.name = body.name;
    if (body.profileImage !== undefined) userData.profileImage = body.profileImage;
    if (body.description !== undefined) userData.description = body.description;
    if (body.socialLinks !== undefined) userData.socialLinks = body.socialLinks;

    // Champs du TheaterProfile
    if (body.theaterName !== undefined) theaterData.theaterName = body.theaterName;
    if (body.history !== undefined) theaterData.history = body.history;
    if (body.address !== undefined) theaterData.address = body.address;
    if (body.city !== undefined) theaterData.city = body.city;
    if (body.postalCode !== undefined) theaterData.postalCode = body.postalCode;
    if (body.region !== undefined) theaterData.region = body.region;
    if (body.coordinates !== undefined) theaterData.coordinates = body.coordinates;
    if (body.capacity !== undefined) theaterData.capacity = Number(body.capacity);
    if (body.stageType !== undefined) theaterData.stageType = body.stageType;
    if (body.facilities !== undefined) theaterData.facilities = body.facilities;
    if (body.theaterType !== undefined) theaterData.theaterType = body.theaterType;
    if (body.programmingTypes !== undefined) theaterData.programmingTypes = body.programmingTypes;
    if (body.preferredGenres !== undefined) theaterData.preferredGenres = body.preferredGenres;
    if (body.openingHours !== undefined) theaterData.openingHours = body.openingHours;
    if (body.ticketPrices !== undefined) theaterData.ticketPrices = body.ticketPrices;
    if (body.coverImage !== undefined) theaterData.coverImage = body.coverImage;
    if (body.galleryImages !== undefined) theaterData.galleryImages = body.galleryImages;
    if (body.isActive !== undefined) theaterData.isActive = body.isActive;
    if (body.isVerified !== undefined) theaterData.isVerified = body.isVerified;
    if (body.acceptsSubmissions !== undefined) theaterData.acceptsSubmissions = body.acceptsSubmissions;

    // Mettre à jour le User si nécessaire
    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userData
      });
    }

    // Mettre à jour ou créer le profil théâtre
    if (Object.keys(theaterData).length > 0) {
      if (user.theaterProfile) {
        await prisma.theaterProfile.update({
          where: { userId: user.id },
          data: theaterData,
        });
      } else {
        await prisma.theaterProfile.create({
          data: {
            ...theaterData,
            userId: user.id,
            isActive: true,
            isVerified: false,
            acceptsSubmissions: true,
            programmingTypes: theaterData.programmingTypes || [],
            preferredGenres: theaterData.preferredGenres || [],
            galleryImages: theaterData.galleryImages || [],
            totalEvents: 0,
            totalArtists: 0
          }
        });
      }
    }

    // Récupérer le profil mis à jour
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { theaterProfile: true }
    });

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
      profile: updatedUser?.theaterProfile,
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        profileImage: updatedUser?.profileImage,
        description: updatedUser?.description,
        socialLinks: updatedUser?.socialLinks
      }
    });
  } catch (error) {
    console.error("Erreur PATCH /api/theater/profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
