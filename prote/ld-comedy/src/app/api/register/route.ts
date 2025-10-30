import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("📝 Début de l'inscription - Prisma initialisé:", !!prisma)

    // Récupérer les données du formulaire (avec firstName et lastName)
    const { email, password, firstName, lastName } = await request.json()
    console.log("📧 Email reçu:", email)

    // Validation des données
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "❌ Tous les champs sont requis (prénom, nom, email, mot de passe)" },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "❌ Format d'email invalide" },
        { status: 400 }
      )
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: "❌ Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    console.log("🔍 Vérification de l'utilisateur existant...")
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    console.log("✅ Vérification terminée, utilisateur trouvé:", !!existingUser)

    if (existingUser) {
      return NextResponse.json(
        { error: "❌ Un compte existe déjà avec cet email" },
        { status: 400 }
      )
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Combiner prénom et nom
    const fullName = `${firstName.trim()} ${lastName.trim()}`

    // Créer l'utilisateur (seulement avec les champs qui existent dans le schéma)
    console.log("💾 Création de l'utilisateur dans la base de données...")
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: fullName,
        password: hashedPassword,
        role: "PENDING",  // En attente de choix du rôle (artiste ou théâtre)
        isVerified: false // Pas encore vérifié
      }
    })
    console.log("✅ Utilisateur créé avec succès, ID:", user.id)

    // Retourner les données sans le mot de passe
    const { password: _, ...userWithoutPassword } = user

    console.log("✅ Utilisateur créé avec succès:", userWithoutPassword)

    return NextResponse.json(
      { 
        message: "✅ Inscription réussie ! Vous pouvez maintenant vous connecter.",
        user: userWithoutPassword 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("❌ Erreur détaillée lors de l'inscription:", error)
    console.error("❌ Type d'erreur:", typeof error)
    console.error("❌ Stack trace:", error instanceof Error ? error.stack : 'No stack')

    // Gestion d'erreurs plus spécifique
    if (error instanceof Error) {
      console.error("❌ Message d'erreur:", error.message)

      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: "❌ Un compte existe déjà avec cet email" },
          { status: 400 }
        )
      }

      // Retourner le message d'erreur détaillé en développement
      return NextResponse.json(
        {
          error: "❌ Erreur serveur lors de l'inscription. Veuillez réessayer.",
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "❌ Erreur serveur lors de l'inscription. Veuillez réessayer." },
      { status: 500 }
    )
  }
}