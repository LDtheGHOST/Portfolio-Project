import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // Récupérer les données du formulaire (avec firstName et lastName)
    const { email, password, firstName, lastName } = await request.json()

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
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

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
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: fullName,
        password: hashedPassword,
        role: "PENDING",  // En attente de choix du rôle (artiste ou théâtre)
        isVerified: false // Pas encore vérifié
      }
    })

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
    console.error("❌ Erreur lors de l'inscription:", error)
    
    // Gestion d'erreurs plus spécifique
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: "❌ Un compte existe déjà avec cet email" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "❌ Erreur serveur lors de l'inscription. Veuillez réessayer." },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}