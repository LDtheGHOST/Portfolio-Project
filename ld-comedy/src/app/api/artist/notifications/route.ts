import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET: Notifications (likes/commentaires) pour l'artiste connecté
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  // Trouver le profil artiste du user
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { artistProfile: true } });
  if (!user?.artistProfile) return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 });
  const artistId = user.artistProfile.id;

  // Récupérer toutes les affiches de l'artiste avec likes et commentaires
  const posters = await prisma.poster.findMany({
    where: { artistId },
    include: {
      comments: {
        include: { user: { select: { name: true, email: true, profileImage: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Pour chaque affiche, construire les notifications
  const notifications = [];
  for (const poster of posters) {
    // Likes
    if (poster.likes && poster.likes.length > 0) {
      for (const userId of poster.likes) {
        const liker = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, profileImage: true, email: true } });
        if (liker) {
          notifications.push({
            type: "like",
            posterId: poster.id,
            posterImage: poster.imageUrl,
            user: liker,
            date: poster.updatedAt,
          });
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
  }
  notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json({ notifications });
}
