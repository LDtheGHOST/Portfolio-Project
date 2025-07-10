import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Théâtres à la une pour la page d'accueil
export async function GET() {
  try {
    // Récupérer d'abord tous les théâtres sans inclure user
    const allTheaters = await prisma.theaterProfile.findMany({
      select: {
        id: true,
        userId: true,
        theaterName: true,
        description: true,
        address: true,
        city: true,
        capacity: true,
        coverImage: true,
        totalEvents: true,
        totalArtists: true,
        averageRating: true
      },
      orderBy: [
        { totalEvents: 'desc' },
        { totalArtists: 'desc' }
      ],
      take: 20
    });

    // Filtrer ceux qui ont un userId et récupérer les infos utilisateur
    const theatersWithUsers = [];
    
    for (const theater of allTheaters) {
      if (theater.userId) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: theater.userId },
            select: {
              name: true,
              email: true,
              profileImage: true
            }
          });
          
          if (user) {
            // Compter les événements et affiches
            const counts = await Promise.all([
              prisma.event.count({ where: { theaterId: theater.id } }),
              prisma.poster.count({ where: { theaterId: theater.id } })
            ]);
            
            theatersWithUsers.push({
              ...theater,
              user,
              _count: {
                ownedEvents: counts[0],
                posters: counts[1]
              }
            });
          }
        } catch (error) {
          // Ignorer les erreurs pour les théâtres individuels
          console.log(`Erreur pour le théâtre ${theater.id}:`, error);
        }
      }
    }

    // Formatter les données pour l'affichage
    const formattedTheaters = theatersWithUsers.slice(0, 4).map((theater, index) => ({
      id: theater.id,
      name: theater.theaterName || theater.user.name || `Théâtre ${index + 1}`,
      description: theater.description || "Théâtre partenaire de notre plateforme",
      location: theater.address || theater.city || "Paris",
      capacity: theater.capacity || 100,
      image: theater.user.profileImage || theater.coverImage || null,
      contact: theater.user.email || '',
      postersCount: theater._count.ownedEvents + theater._count.posters,
      totalEvents: theater.totalEvents,
      totalArtists: theater.totalArtists,
      averageRating: theater.averageRating || 0,
      recentPosters: [],
      nextShow: null,
      activityScore: (theater.totalEvents * 2) + (theater.totalArtists * 1.5) + ((theater.averageRating || 0) * 10) + (theater._count.posters * 3)
    }));

    // Trier par score d'activité
    formattedTheaters.sort((a, b) => b.activityScore - a.activityScore);

    return NextResponse.json({ theaters: formattedTheaters });
  } catch (error) {
    console.error("Erreur lors de la récupération des théâtres à la une:", error);
    
    // En cas d'erreur, retourner un tableau vide - pas de données de test
    return NextResponse.json({ 
      theaters: []
    });
  }
}
