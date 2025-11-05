import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FavoriteStatus } from "@prisma/client";

// GET: Récupérer les demandes d'amis REÇUES (pas envoyées)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer l'utilisateur connecté avec ses profils
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true, theaterProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    let pendingRequests: any[] = [];    if (user.theaterProfile) {
      console.log("Recherche des demandes reçues pour théâtre ID:", user.theaterProfile.id);
      // Pour un théâtre, récupérer seulement les demandes ENVOYÉES PAR des artistes
      // (requestedBy = "artist" et theaterId = user.theaterProfile.id)
      const favoriteRequests = await prisma.favorite.findMany({
        where: {
          theaterId: user.theaterProfile.id,
          status: FavoriteStatus.PENDING,
          requestedBy: "artist" // Demandes envoyées par un artiste au théâtre
        },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log("Demandes trouvées pour théâtre:", favoriteRequests.length);
      pendingRequests = favoriteRequests;
    }

    if (user.artistProfile) {
      console.log("Recherche des demandes reçues pour artiste ID:", user.artistProfile.id);
      // Pour un artiste, récupérer seulement les demandes ENVOYÉES PAR des théâtres
      // (requestedBy = "theater" et artistId = user.artistProfile.id)
      const favoriteRequests = await prisma.favorite.findMany({
        where: {
          artistId: user.artistProfile.id,
          status: FavoriteStatus.PENDING,
          requestedBy: "theater" // Demandes envoyées par un théâtre à l'artiste
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Pour les artistes, nous devons récupérer les infos du théâtre manuellement
      const theaterIds = favoriteRequests.map(f => f.theaterId);
      const theaters = await prisma.theaterProfile.findMany({
        where: {
          id: { in: theaterIds }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              email: true
            }
          }
        }
      });

      // Combiner les données
      pendingRequests = favoriteRequests.map(f => {
        const theater = theaters.find(t => t.id === f.theaterId);
        return {
          ...f,
          theater
        };
      });

      console.log("Demandes trouvées pour artiste:", pendingRequests.length);
    }    return NextResponse.json({
      requests: pendingRequests,
      total: pendingRequests.length,
      userType: user.theaterProfile ? 'theater' : 'artist'
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des demandes d'amis:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
