import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FavoriteStatus } from "@prisma/client";

// POST: Envoyer une demande d'ami (théâtre <-> artiste)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { artistId, theaterId } = await req.json();
    const userId = session.user.id;

    // Récupérer l'utilisateur connecté avec ses profils
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true, theaterProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    let friendshipData: any = {};    // Si l'utilisateur est un théâtre et veut ajouter un artiste
    if (user.theaterProfile && artistId) {
      // Vérifier que l'artiste existe
      const artist = await prisma.artistProfile.findUnique({
        where: { id: artistId }
      });

      if (!artist) {
        return NextResponse.json({ error: "Artiste non trouvé" }, { status: 404 });
      }      friendshipData = {
        theaterId: user.theaterProfile.id,
        artistId: artistId,
        status: FavoriteStatus.PENDING,
        requestedBy: "theater" // Le théâtre envoie la demande
      };
    }
    // Si l'utilisateur est un artiste et veut ajouter un théâtre
    else if (user.artistProfile && theaterId) {
      // Vérifier que le théâtre existe
      const theater = await prisma.theaterProfile.findUnique({
        where: { id: theaterId }
      });

      if (!theater) {
        return NextResponse.json({ error: "Théâtre non trouvé" }, { status: 404 });
      }      friendshipData = {
        theaterId: theaterId,
        artistId: user.artistProfile.id,
        status: FavoriteStatus.PENDING,
        requestedBy: "artist" // L'artiste envoie la demande
      };
    } else {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }// Vérifier si une relation n'existe pas déjà
    const existingFriendship = await prisma.favorite.findFirst({
      where: {
        theaterId: friendshipData.theaterId,
        artistId: friendshipData.artistId
      }
    });    if (existingFriendship) {
      if (existingFriendship.status === FavoriteStatus.PENDING) {
        return NextResponse.json({ error: "Demande déjà envoyée" }, { status: 409 });
      } else if (existingFriendship.status === FavoriteStatus.ACCEPTED) {
        return NextResponse.json({ error: "Vous êtes déjà amis" }, { status: 409 });
      }
    }

    // Créer ou mettre à jour la demande d'amitié
    const friendship = await prisma.favorite.upsert({
      where: {
        theaterId_artistId: {
          theaterId: friendshipData.theaterId,
          artistId: friendshipData.artistId
        }
      },      update: {
        status: FavoriteStatus.PENDING
      },
      create: friendshipData
    });

    return NextResponse.json({ 
      success: true, 
      friendship,
      message: "Demande d'ami envoyée"
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande d'ami:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE: Retirer un ami
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { artistId, theaterId } = await req.json();
    const userId = session.user.id;

    console.log("DELETE ami - Données reçues:", { artistId, theaterId, userId });

    // Récupérer l'utilisateur connecté avec ses profils
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true, theaterProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    let whereClause: any = {};

    // Si l'utilisateur est un théâtre et veut retirer un artiste
    if (user.theaterProfile && artistId) {
      whereClause = {
        theaterId: user.theaterProfile.id,
        artistId: artistId
      };
      console.log("Suppression ami - Théâtre retire artiste:", whereClause);
    }
    // Si l'utilisateur est un artiste et veut retirer un théâtre
    else if (user.artistProfile && theaterId) {
      whereClause = {
        theaterId: theaterId,
        artistId: user.artistProfile.id
      };
      console.log("Suppression ami - Artiste retire théâtre:", whereClause);
    } else {
      console.log("Suppression ami - Données invalides:", { userType: user.theaterProfile ? 'theater' : 'artist', artistId, theaterId });
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }    // Supprimer la relation d'amitié
    const deletedFriendship = await prisma.favorite.deleteMany({
      where: whereClause
    });

    console.log("Suppression ami - Résultat:", deletedFriendship.count);

    if (deletedFriendship.count === 0) {
      return NextResponse.json({ error: "Relation d'amitié non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Ami retiré avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression d'ami:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Interface pour typer les amis
interface Friend {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  type: 'artist' | 'theater';
  profileId: string;
  stageName?: string | null;
  specialties?: string[];
  theaterName?: string | null;
  address?: string | null;
}

// GET: Récupérer la liste des amis acceptés
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('GET /api/favorite - userId:', userId);

    // Récupérer l'utilisateur connecté avec ses profils
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true, theaterProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    console.log('User profile type:', {
      hasArtistProfile: !!user.artistProfile,
      hasTheaterProfile: !!user.theaterProfile,
      artistProfileId: user.artistProfile?.id,
      theaterProfileId: user.theaterProfile?.id
    });

    let friends: Friend[] = [];

    // Si l'utilisateur est un théâtre, récupérer ses artistes favoris acceptés
    if (user.theaterProfile) {
      console.log('Recherche des favoris pour le théâtre:', user.theaterProfile.id);
      const favorites = await prisma.favorite.findMany({
        where: {
          theaterId: user.theaterProfile.id,
          status: FavoriteStatus.ACCEPTED
        },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true
                }
              }
            }
          }
        }
      });

      console.log('Favoris trouvés pour théâtre:', favorites.length);
      friends = favorites.map(fav => ({
        id: fav.artist.user.id,
        name: fav.artist.user.name,
        email: fav.artist.user.email,
        profileImage: fav.artist.user.profileImage,
        type: 'artist' as const,
        profileId: fav.artist.id,
        stageName: fav.artist.stageName,
        specialties: fav.artist.specialties
      }));
    }
    // Si l'utilisateur est un artiste, récupérer ses théâtres favoris acceptés
    else if (user.artistProfile) {
      console.log('Recherche des favoris pour l\'artiste:', user.artistProfile.id);
      const favorites = await prisma.favorite.findMany({
        where: {
          artistId: user.artistProfile.id,
          status: FavoriteStatus.ACCEPTED
        },
        include: {
          theater: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true
                }
              }
            }
          }
        }
      });

      console.log('Favoris trouvés pour artiste:', favorites.length);
      friends = favorites.map(fav => ({
        id: fav.theater.user.id,
        name: fav.theater.user.name,
        email: fav.theater.user.email,
        profileImage: fav.theater.user.profileImage,
        type: 'theater' as const,
        profileId: fav.theater.id,
        theaterName: fav.theater.theaterName,
        address: fav.theater.address
      }));
    }

    console.log('Friends à retourner:', friends.length, friends);
    return NextResponse.json({ friends });

  } catch (error) {
    console.error("Erreur lors de la récupération des amis:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
