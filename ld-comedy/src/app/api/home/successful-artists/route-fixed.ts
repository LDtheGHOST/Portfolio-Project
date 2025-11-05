import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Artistes qui ont du succès pour la page d'accueil
export async function GET() {
  try {
    // Récupérer d'abord tous les artistes sans inclure user
    const allArtists = await prisma.artistProfile.findMany({
      select: {
        id: true,
        userId: true,
        stageName: true,
        bio: true,
        specialties: true,
        experience: true,
        coverImage: true,
        totalLikes: true,
        totalShows: true,
        profileViews: true
      },
      orderBy: [
        { totalLikes: 'desc' },
        { totalShows: 'desc' },
        { profileViews: 'desc' }
      ],
      take: 20
    });

    // Filtrer ceux qui ont un userId et récupérer les infos utilisateur
    const artistsWithUsers = [];
    
    for (const artist of allArtists) {
      if (artist.userId) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: artist.userId },
            select: {
              name: true,
              email: true,
              profileImage: true
            }
          });
          
          if (user) {
            // Compter les affiches
            const postersCount = await prisma.poster.count({ 
              where: { artistId: artist.id } 
            });
            
            artistsWithUsers.push({
              ...artist,
              user,
              _count: {
                posters: postersCount
              }
            });
          }
        } catch (error) {
          // Ignorer les erreurs pour les artistes individuels
          console.log(`Erreur pour l'artiste ${artist.id}:`, error);
        }
      }
    }

    // Formatter les données pour l'affichage
    const formattedArtists = artistsWithUsers.slice(0, 8).map((artist, index) => ({
      id: artist.id,
      name: artist.user.name || artist.stageName || `Artiste ${index + 1}`,
      stageName: artist.stageName || artist.user.name || `Artist${index + 1}`,
      bio: artist.bio || "Artiste talentueux de notre plateforme",
      specialties: artist.specialties || ["Stand-up"],
      experience: artist.experience || "Confirmé",
      image: artist.user.profileImage || artist.coverImage || null,
      contact: artist.user.email,
      postersCount: artist._count.posters || 0,
      totalLikes: artist.totalLikes,
      totalShows: artist.totalShows,
      profileViews: artist.profileViews,
      recentPosters: [],
      nextShow: null,
      successScore: (artist.totalLikes * 2) + (artist.totalShows * 3) + (artist.profileViews * 0.1) + (artist._count.posters * 5)
    }));

    // Trier par score de succès
    formattedArtists.sort((a, b) => b.successScore - a.successScore);

    return NextResponse.json({ artists: formattedArtists });
  } catch (error) {
    console.error("Erreur lors de la récupération des artistes à succès:", error);
    
    // En cas d'erreur, retourner un tableau vide - pas de données de test
    return NextResponse.json({ 
      artists: []
    });
  }
}
