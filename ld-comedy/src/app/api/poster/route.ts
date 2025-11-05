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

// POST: Crée une nouvelle affiche (image + description) pour un théâtre ou un artiste
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { theaterProfile: true, artistProfile: true },
  });
  if (!user?.theaterProfile && !user?.artistProfile) {
    return NextResponse.json({ error: "Profil théâtre ou artiste non trouvé" }, { status: 404 });
  }
  const { imageUrl, description, theaterId, artistId } = await req.json();

  // Détermination du type d'utilisateur et de la cible
  let data: any = { imageUrl, description };
  if (user.theaterProfile && (theaterId || user.theaterProfile.id)) {
    const targetTheaterId = theaterId || user.theaterProfile.id;
    if (targetTheaterId !== user.theaterProfile.id) {
      // TODO: Ajouter une vérification d'admin si besoin
      return NextResponse.json({ error: "Non autorisé à uploader pour ce théâtre" }, { status: 403 });
    }
    data.theaterId = targetTheaterId;
  } else if (user.artistProfile && (artistId || user.artistProfile.id)) {
    const targetArtistId = artistId || user.artistProfile.id;
    if (targetArtistId !== user.artistProfile.id) {
      // TODO: Ajouter une vérification d'admin si besoin
      return NextResponse.json({ error: "Non autorisé à uploader pour cet artiste" }, { status: 403 });
    }
    data.artistId = targetArtistId;
    // Pour lier à un théâtre aussi, il faudrait adapter ici si besoin
    // data.theaterId = ...
  } else {
    return NextResponse.json({ error: "Impossible de déterminer le profil cible" }, { status: 400 });
  }

  const poster = await prisma.poster.create({ data });
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
