import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Récupérer la liste des amis de l'utilisateur connecté
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

    let friends: any[] = [];    // Si l'utilisateur est un théâtre, récupérer ses artistes amis
    if (user.theaterProfile) {
      console.log("Recherche des amis pour théâtre ID:", user.theaterProfile.id);
      const friendships = await prisma.favorite.findMany({
        where: { 
          theaterId: user.theaterProfile.id,
          status: "ACCEPTED"
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
        }
      });

      console.log("API friends - Friendships trouvées pour théâtre:", friendships.length);friends = friendships.map(f => ({
        id: f.artist.id,
        type: 'artist',
        name: f.artist.user.name,
        profileImage: f.artist.user.profileImage,
        email: f.artist.user.email,
        bio: f.artist.bio,
        specialties: f.artist.specialties,
        friendshipId: f.id,
        createdAt: f.createdAt,
        // Structure pour la compatibilité frontend
        artist: {
          id: f.artist.id,
          user: {
            name: f.artist.user.name,
            profileImage: f.artist.user.profileImage
          }
        }
      }));
    }    // Si l'utilisateur est un artiste, récupérer ses théâtres amis
    if (user.artistProfile) {
      console.log("Recherche des amis pour artiste ID:", user.artistProfile.id);
      const friendships = await prisma.favorite.findMany({
        where: { 
          artistId: user.artistProfile.id,
          status: "ACCEPTED"
        }
      });

      console.log("API friends - Friendships trouvées pour artiste:", friendships.length);

      // Récupérer les théâtres liés
      const theaterIds = friendships.map(f => f.theaterId);
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
      });      friends = friendships.map(f => {
        const theater = theaters.find(t => t.id === f.theaterId);
        return {
          id: f.id,
          type: 'theater',
          name: theater?.user?.name || 'Théâtre',
          profileImage: theater?.user?.profileImage || '',
          friendshipId: f.id,
          createdAt: f.createdAt,
          // Structure pour la compatibilité frontend
          theater: {
            id: theater?.id || '',
            user: {
              name: theater?.user?.name || 'Théâtre',
              profileImage: theater?.user?.profileImage || ''
            }
          }
        };
      });
    }

    console.log("API friends - Total amis retournés:", friends.length);

    return NextResponse.json({ 
      friends,
      total: friends.length,
      userType: user.theaterProfile ? 'theater' : 'artist'
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des amis:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
