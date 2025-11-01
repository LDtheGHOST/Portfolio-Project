import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Artistes qui ont du succès pour la page d'accueil
export async function GET() {
  try {
    // Récupérer tous les artistes avec userId valide
    const allArtists = await prisma.artistProfile.findMany({
      select: {
        id: true,
        userId: true,
        stageName: true,
        bio: true,
        specialties: true,
        experience: true,
        location: true
      },
      where: {
        userId: { not: undefined }
      },
      take: 20
    });

    // Enrichir avec les infos utilisateur et compter les affiches
    const enrichedArtists = [];
    
    for (const artist of allArtists) {
      try {
        const [user, postersCount] = await Promise.all([
          prisma.user.findUnique({
            where: { id: artist.userId },
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              createdAt: true
            }
          }),
          prisma.poster.count({
            where: { artistId: artist.id }
          })
        ]);
        
        if (user) {
          enrichedArtists.push({
            id: artist.id,
            name: artist.stageName || user.name || "Artiste",
            type: artist.specialties?.[0] || "Humoriste",
            city: artist.location || "Ville non spécifiée",
            bio: artist.bio || "Bio non disponible",
            image: user.profileImage || "/placeholder-artist.jpg",
            postersCount,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              joinedAt: user.createdAt
            }
          });
        }
      } catch (error) {
        console.log(`Erreur pour l'artiste ${artist.id}:`, error);
      }
    }

    // Trier par nombre d'affiches et limiter à 8
    const successfulArtists = enrichedArtists
      .sort((a, b) => b.postersCount - a.postersCount)
      .slice(0, 8);

    return NextResponse.json(successfulArtists);

  } catch (error) {
    console.error("Erreur lors de la récupération des artistes à succès:", error);
    // Retourner un tableau vide au lieu d'un objet d'erreur pour éviter les erreurs .map()
    return NextResponse.json([], { status: 200 });
  }
}
