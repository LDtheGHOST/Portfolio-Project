import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET: Récupère le profil public d'un comédien par son id (avec affiches, infos, etc.)
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

    // On utilise le modèle ArtistProfile (comédien = artiste dans ce projet)
    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, profileImage: true, socialLinks: true } },
      },
    })
    if (!artist) return NextResponse.json({ error: "Comédien non trouvé" }, { status: 404 })

    // Charger les posters liés à cet artiste (clé artistId)
    const posters = await prisma.poster.findMany({
      where: { artistId: id },
      include: {
        comments: { include: { user: { select: { name: true, profileImage: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ ...artist, posters })
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
