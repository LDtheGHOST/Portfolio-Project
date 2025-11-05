import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET: Récupère le profil public d'un artiste par son id (avec affiches, infos, etc.)
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Correction Next.js : params doit être awaited
    const { id } = await context.params
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

    // Récupérer le profil artiste
    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, profileImage: true, socialLinks: true } },
        posters: {
          include: {
            comments: { include: { user: { select: { name: true, profileImage: true } } } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })
    if (!artist) return NextResponse.json({ error: "Artiste non trouvé" }, { status: 404 })
    return NextResponse.json(artist)
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
