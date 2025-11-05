import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FavoriteStatus } from "@prisma/client";

// GET: Récupérer les demandes d'amis ENVOYÉES (pas reçues)
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

    let sentRequests: any[] = [];

    if (user.theaterProfile) {
      console.log("Recherche des demandes envoyées par théâtre ID:", user.theaterProfile.id);
      // Pour un théâtre, récupérer les demandes ENVOYÉES À des artistes
      const favoriteRequests = await prisma.favorite.findMany({
        where: {
          theaterId: user.theaterProfile.id,
          status: FavoriteStatus.PENDING
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

      console.log("Demandes envoyées par théâtre:", favoriteRequests.length);
      sentRequests = favoriteRequests;
    }

    if (user.artistProfile) {
      console.log("Recherche des demandes envoyées par artiste ID:", user.artistProfile.id);
      // Pour un artiste, récupérer les demandes ENVOYÉES À des théâtres
      const favoriteRequests = await prisma.favorite.findMany({
        where: {
          artistId: user.artistProfile.id,
          status: FavoriteStatus.PENDING
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
      sentRequests = favoriteRequests.map(f => {
        const theater = theaters.find(t => t.id === f.theaterId);
        return {
          ...f,
          theater
        };
      });

      console.log("Demandes envoyées par artiste:", sentRequests.length);
    }

    return NextResponse.json({
      sentRequests,
      total: sentRequests.length,
      userType: user.theaterProfile ? 'theater' : 'artist'
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des demandes envoyées:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
