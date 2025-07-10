import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Notifications (likes/commentaires) pour l'artiste connecté
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Trouver le profil artiste du user
    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      include: { artistProfile: true } 
    });

    if (!user?.artistProfile) {
      return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 });
    }

    const artistId = user.artistProfile.id;

    // Récupérer toutes les affiches de l'artiste avec commentaires
    const posters = await prisma.poster.findMany({
      where: { artistId },
      include: {
        comments: {
          include: { 
            user: { 
              select: { name: true, email: true, profileImage: true } 
            } 
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Pour chaque affiche, construire les notifications
    const notifications: any[] = [];
    for (const poster of posters) {
      // Likes (on affiche les nouveaux likes, ou tous)
      if (poster.likes && poster.likes.length > 0) {
        for (const userId of poster.likes) {
          try {
            // On va chercher le user
            const liker = await prisma.user.findUnique({ 
              where: { id: userId }, 
              select: { name: true, profileImage: true, email: true } 
            });
            if (liker) {
              notifications.push({
                type: "like",
                posterId: poster.id,
                posterImage: poster.imageUrl,
                user: liker,
                date: poster.updatedAt,
              });
            }          } catch (error) {
            // Continue même si un utilisateur n'est pas trouvé
          }
        }
      }
      
      // Commentaires
      for (const comment of poster.comments) {
        notifications.push({
          type: "comment",
          posterId: poster.id,
          posterImage: poster.imageUrl,
          user: comment.user,
          text: comment.text,
          date: comment.createdAt,
        });
      }
    }    // Tri par date décroissante
    notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json({ notifications });

  } catch (error) {
    console.error("Erreur API notifications artiste:", error);
    return NextResponse.json({ 
      error: "Erreur serveur", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
