import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// POST: Like ou unlike une affiche (toggle)
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  const { posterId } = await req.json();
  // Conversion ObjectId supprimée, Prisma attend un string
  const poster = await prisma.poster.findUnique({ where: { id: posterId } });
  if (!poster) return NextResponse.json({ error: "Affiche non trouvée" }, { status: 404 });
  let likes = (poster as any).likes || [];
  const hasLiked = likes.includes(user.id);
  if (hasLiked) {
    likes = likes.filter((id: string) => id !== user.id);
  } else {
    likes.push(user.id);
  }
  await prisma.poster.update({ where: { id: posterId }, data: { likes } });
  return NextResponse.json({ liked: !hasLiked, likesCount: likes.length });
}

// DELETE: Unlike une affiche
export async function DELETE(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  let posterId;
  try {
    const body = await req.json();
    posterId = body.posterId;
  } catch {
    return NextResponse.json({ error: "Aucun posterId fourni" }, { status: 400 });
  }
  if (!posterId) return NextResponse.json({ error: "Aucun posterId fourni" }, { status: 400 });
  // Conversion ObjectId supprimée, Prisma attend un string
  const poster = await prisma.poster.findUnique({ where: { id: posterId } });
  if (!poster) return NextResponse.json({ error: "Affiche non trouvée" }, { status: 404 });
  let likes = (poster as any).likes || [];
  likes = likes.filter((id: string) => id !== user.id);
  await prisma.poster.update({ where: { id: posterId }, data: { likes } });
  return NextResponse.json({ liked: false, likesCount: likes.length });
}
