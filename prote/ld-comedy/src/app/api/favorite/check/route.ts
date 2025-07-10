import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Vérifier si deux profils sont amis
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get("artistId");
    const theaterId = searchParams.get("theaterId");
    const userId = session.user.id;

    // Récupérer l'utilisateur connecté avec ses profils
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true, theaterProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    let whereClause: any = {};

    // Si l'utilisateur est un théâtre et vérifie un artiste
    if (user.theaterProfile && artistId) {
      whereClause = {
        theaterId: user.theaterProfile.id,
        artistId: artistId
      };
    }
    // Si l'utilisateur est un artiste et vérifie un théâtre
    else if (user.artistProfile && theaterId) {
      whereClause = {
        theaterId: theaterId,
        artistId: user.artistProfile.id
      };
    } else {
      return NextResponse.json({ 
        isFavorite: false,
        error: "Paramètres invalides"
      }, { status: 400 });
    }    // Vérifier si la relation d'amitié existe
    const favorite = await prisma.favorite.findFirst({
      where: whereClause
    });

    return NextResponse.json({ 
      isFavorite: !!favorite,
      favorite: favorite || null
    });

  } catch (error) {
    console.error("Erreur lors de la vérification d'amitié:", error);
    return NextResponse.json({ 
      isFavorite: false,
      error: "Erreur serveur" 
    }, { status: 500 });
  }
}
