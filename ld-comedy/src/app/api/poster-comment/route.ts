import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// POST: Ajoute un commentaire à une affiche
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  const { posterId, text } = await req.json();
  if (!posterId || !text) return NextResponse.json({ error: "posterId ou texte manquant" }, { status: 400 });
  // Conversion ObjectId supprimée, Prisma attend un string
  const comment = await prisma.posterComment.create({
    data: {
      text,
      posterId: posterId,
      userId: user.id,
    },
    include: { user: { select: { name: true, email: true, profileImage: true } } },
  });
  return NextResponse.json(comment);
}
