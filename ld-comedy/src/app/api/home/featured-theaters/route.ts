import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Théâtres à la une pour la page d'accueil
export async function GET() {
  try {
    // Récupérer tous les théâtres avec userId valide
    const allTheaters = await prisma.theaterProfile.findMany({
      select: {
        id: true,
        userId: true,
        theaterName: true,
        description: true,
        address: true,
        city: true,
        capacity: true
      },      where: {
        userId: { not: undefined }
      },
      take: 20
    });

    // Enrichir avec les infos utilisateur et compter les affiches
    const enrichedTheaters = [];
    
    for (const theater of allTheaters) {
      try {
        const [user, postersCount] = await Promise.all([
          prisma.user.findUnique({
            where: { id: theater.userId },
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              createdAt: true
            }
          }),
          prisma.poster.count({
            where: { theaterId: theater.id }
          })
        ]);
        
        if (user) {
          enrichedTheaters.push({
            id: theater.id,
            name: theater.theaterName || user.name || "Théâtre",
            city: theater.city || "Ville non spécifiée",
            description: theater.description || "Description non disponible",
            image: user.profileImage || "/placeholder-theater.jpg",
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
        console.log(`Erreur pour le théâtre ${theater.id}:`, error);
      }
    }

    // Trier par nombre d'affiches et limiter à 6
    const featuredTheaters = enrichedTheaters
      .sort((a, b) => b.postersCount - a.postersCount)
      .slice(0, 6);

    return NextResponse.json(featuredTheaters);

  } catch (error) {
    console.error("Erreur lors de la récupération des théâtres à la une:", error);
    // Retourner un tableau vide au lieu d'un objet d'erreur pour éviter les erreurs .map()
    return NextResponse.json([], { status: 200 });
  }
}
