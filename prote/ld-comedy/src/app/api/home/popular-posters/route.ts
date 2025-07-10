import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Affiches populaires pour la page d'accueil
export async function GET() {
  try {
    // Récupérer les affiches les plus populaires, triées par nombre de likes
    const popularPosters = await prisma.poster.findMany({
      select: {
        id: true,
        imageUrl: true,
        description: true,
        createdAt: true,
        likes: true,
        theaterId: true,
        artistId: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Prendre plus pour filtrer après
    });

    // Enrichir avec les infos des auteurs et compter les commentaires
    const enrichedPosters = [];
    
    for (const poster of popularPosters) {
      try {
        let author = null;
        
        // Si c'est un poster de théâtre
        if (poster.theaterId) {
          const theater = await prisma.theaterProfile.findUnique({
            where: { id: poster.theaterId },
            select: {
              id: true,
              theaterName: true,
              city: true,
              userId: true,
              user: {
                select: {
                  name: true,
                  profileImage: true
                }
              }
            }
          });
          
          if (theater && theater.user) {
            author = {
              id: theater.id,
              name: theater.user.name,
              image: theater.user.profileImage,
              type: 'theater' as const,
              theaterName: theater.theaterName,
              city: theater.city
            };
          }
        }
        
        // Si c'est un poster d'artiste
        if (poster.artistId && !author) {
          const artist = await prisma.artistProfile.findUnique({
            where: { id: poster.artistId },
            select: {
              id: true,
              stageName: true,
              location: true,
              userId: true,
              user: {
                select: {
                  name: true,
                  profileImage: true
                }
              }
            }
          });
          
          if (artist && artist.user) {
            author = {
              id: artist.id,
              name: artist.user.name,
              image: artist.user.profileImage,
              type: 'artist' as const,
              artistName: artist.stageName,
              city: artist.location
            };
          }
        }
        
        // Compter les commentaires
        const commentsCount = await prisma.posterComment.count({
          where: { posterId: poster.id }
        });
        
        if (author) {
          enrichedPosters.push({
            id: poster.id,
            imageUrl: poster.imageUrl,
            description: poster.description || "Nouvelle affiche",
            createdAt: poster.createdAt,
            likesCount: Array.isArray(poster.likes) ? poster.likes.length : 0,
            commentsCount,
            author
          });
        }
      } catch (error) {
        console.log(`Erreur pour l'affiche ${poster.id}:`, error);
      }
    }

    // Trier par popularité (likes + commentaires) et limiter à 6
    const sortedPosters = enrichedPosters
      .sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount))
      .slice(0, 6);

    return NextResponse.json(sortedPosters);

  } catch (error) {
    console.error("Erreur lors de la récupération des affiches populaires:", error);
    return NextResponse.json({ 
      error: "Erreur serveur", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
