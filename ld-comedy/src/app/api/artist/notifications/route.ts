import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { artistProfile: true }
    });

    if (!user || !user.artistProfile) {
      return NextResponse.json({ notifications: [] });
    }

    const posters = await prisma.poster.findMany({
      where: { artistId: user.artistProfile.id },
      include: {
        comments: {
          include: { user: { select: { name: true, email: true, profileImage: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const notifications: any[] = [];
    for (const poster of posters) {
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
  } catch (error) {
    console.error("Erreur API notifications:", error);
    return NextResponse.json({ notifications: [] });
  }
}
