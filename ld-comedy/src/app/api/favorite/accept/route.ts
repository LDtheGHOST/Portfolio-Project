import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST: Accepter une demande d'ami
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });    }

    const body = await req.json();
    console.log("API accept - Body reçu:", body);
    
    const { artistId, theaterId, action, requestId, friendshipId } = body; // action: "accept" | "reject"
    const userId = session.user.id;

    // Récupérer l'utilisateur connecté avec ses profils
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true, theaterProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    let existingRequest;    // Si friendshipId est fourni, on utilise directement l'ID de la demande
    if (friendshipId || requestId) {
      const id = friendshipId || requestId;
      existingRequest = await prisma.favorite.findFirst({        where: {
          id: id,
          status: "PENDING",
          OR: [
            { theaterId: user.theaterProfile?.id },
            { artistId: user.artistProfile?.id }
          ]
        }
      });
    } else {
      // Sinon, on utilise l'ancienne méthode avec artistId/theaterId
      let whereClause: any = {};
      let canRespond = false;

      // Si l'utilisateur est un théâtre et répond à une demande d'artiste
      if (user.theaterProfile && artistId) {        whereClause = {
          theaterId: user.theaterProfile.id,
          artistId: artistId,
          status: "PENDING"
        };
        canRespond = true;
      }
      // Si l'utilisateur est un artiste et répond à une demande de théâtre
      else if (user.artistProfile && theaterId) {        whereClause = {
          theaterId: theaterId,
          artistId: user.artistProfile.id,
          status: "PENDING"
        };
        canRespond = true;
      }

      if (!canRespond) {
        return NextResponse.json({ error: "Données invalides" }, { status: 400 });
      }

      existingRequest = await prisma.favorite.findFirst({
        where: whereClause
      });
    }

    if (!existingRequest) {
      return NextResponse.json({ error: "Demande d'ami non trouvée" }, { status: 404 });
    }    // Mettre à jour le statut
    const newStatus = action === "accept" ? "ACCEPTED" : "REJECTED";
    const updatedFriendship = await prisma.favorite.update({
      where: { id: existingRequest.id },
      data: {
        status: newStatus
      },
      include: {
        artist: {
          include: {
            user: {
              select: { name: true, profileImage: true }
            }
          }
        }
      }
    });

    const message = action === "accept" ? "Demande d'ami acceptée" : "Demande d'ami refusée";

    return NextResponse.json({ 
      success: true, 
      friendship: updatedFriendship,
      message
    });

  } catch (error) {
    console.error("Erreur lors de la réponse à la demande d'ami:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
