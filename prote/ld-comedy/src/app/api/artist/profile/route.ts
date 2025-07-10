import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
// import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Retourner un profil temporaire en attendant la résolution du problème Prisma
    // TODO: Implémenter le vrai profil quand Prisma sera correctement généré
    return NextResponse.json({
      success: true,
      profile: {
        id: "temp-id",
        user: {
          name: session.user.name || "Artiste",
          email: session.user.email
        }
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await req.json()
    console.log('[PATCH /api/artist/profile] Body reçu:', body)    // Retourner une réponse temporaire en attendant la résolution du problème Prisma
    // TODO: Implémenter la vraie mise à jour quand Prisma sera correctement généré
    return NextResponse.json({ 
      success: true, 
      message: "Profil mis à jour (temporaire)",
      profile: {
        id: "temp-id",
        user: {
          name: session.user.name || "Artiste",
          email: session.user.email
        }
      }
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
