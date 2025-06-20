import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET: Récupère toutes les affiches d'un théâtre (public, via ?theaterId=...) OU une affiche unique (via ?id=...)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const posterId = searchParams.get("id");
  if (posterId) {
    // Retourne une affiche unique avec likes et commentaires
    const poster = await prisma.poster.findUnique({
      where: { id: posterId },
      include: {
        comments: { include: { user: { select: { name: true, email: true, profileImage: true } } } },
      },
    });
    if (!poster) return NextResponse.json({ error: "Affiche non trouvée" }, { status: 404 });
    return NextResponse.json(poster);
  }
  const theaterId = searchParams.get("theaterId");
  let targetTheaterId = theaterId;

  // Si pas de theaterId fourni, fallback sur le théâtre du user connecté (dashboard)
  if (!targetTheaterId) {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { theaterProfile: true } });
    if (!user?.theaterProfile) return NextResponse.json({ error: "Profil théâtre non trouvé" }, { status: 404 });
    targetTheaterId = user.theaterProfile.id;
  }

  const posters = await prisma.poster.findMany({
    where: { theaterId: targetTheaterId },
    include: {
      comments: { include: { user: { select: { name: true, email: true, profileImage: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ posters });
}

// POST: Crée une nouvelle affiche (image + description) pour un théâtre donné
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { theaterProfile: true } });
  if (!user?.theaterProfile) return NextResponse.json({ error: "Profil théâtre non trouvé" }, { status: 404 });
  const { imageUrl, description, theaterId } = await req.json();
  let targetTheaterId = theaterId || user.theaterProfile.id;
  // (Optionnel) Vérifier que l'utilisateur a le droit d'uploader pour ce théâtre
  // Ici, on autorise seulement le théâtre du user connecté ou admin (à adapter si besoin)
  if (targetTheaterId !== user.theaterProfile.id) {
    // TODO: Ajouter une vérification d'admin si besoin
    return NextResponse.json({ error: "Non autorisé à uploader pour ce théâtre" }, { status: 403 });
  }
  const poster = await prisma.poster.create({
    data: {
      imageUrl,
      description,
      theaterId: targetTheaterId,
    },
  });
  return NextResponse.json({ poster });
}

// DELETE: Supprime une affiche (propriétaire uniquement)
export async function DELETE(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { theaterProfile: true } });
  if (!user?.theaterProfile) return NextResponse.json({ error: "Profil théâtre non trouvé" }, { status: 404 });
  let posterId;
  try {
    const body = await req.json();
    posterId = body.posterId;
  } catch {
    return NextResponse.json({ error: "Aucun posterId fourni" }, { status: 400 });
  }
  if (!posterId) return NextResponse.json({ error: "Aucun posterId fourni" }, { status: 400 });
  // Conversion ObjectId supprimée, Prisma attend un string
  // const poster = await prisma.poster.findUnique({ where: { id: posterIdObj } });
  const poster = await prisma.poster.findUnique({ where: { id: posterId } });
  if (!poster || poster.theaterId !== user.theaterProfile.id) {
    return NextResponse.json({ error: "Non autorisé à supprimer cette affiche" }, { status: 403 });
  }
  await prisma.poster.delete({ where: { id: posterId } });
  return NextResponse.json({ success: true });
}
