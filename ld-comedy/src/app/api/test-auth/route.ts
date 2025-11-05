import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, requireRole } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Exemple 1: Vérifier si l'utilisateur est connecté
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Exemple 2: Vérifier un rôle spécifique
    await requireRole("ARTIST")

    // Retourner les données pour l'artiste
    return NextResponse.json({
      message: "Bienvenue dans l'API artiste",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Erreur API artiste:", error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("ARTIST")
    const body = await request.json()

    // Exemple de traitement des données
    return NextResponse.json({
      message: "Données traitées avec succès",
      userId: user.id,
      data: body,
    })
  } catch (error) {
    console.error("Erreur POST API artiste:", error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
