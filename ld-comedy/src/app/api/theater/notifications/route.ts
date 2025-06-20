import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET: Notifications (likes/commentaires) pour le théâtre connecté
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  // Trouver le profil théâtre du user
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { theaterProfile: true } });
  if (!user?.theaterProfile) return NextResponse.json({ error: "Profil théâtre non trouvé" }, { status: 404 });
  const theaterId = user.theaterProfile.id;

  // Récupérer toutes les affiches du théâtre avec likes et commentaires
  const posters = await prisma.poster.findMany({
    where: { theaterId },
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
    // Likes (on affiche les nouveaux likes, ou tous)
    if (poster.likes && poster.likes.length > 0) {
      for (const userId of poster.likes) {
        // On va chercher le user
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
  // Tri par date décroissante
  notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json({ notifications });
}
