import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      )
    }

    // Compter les messages non lus dans toutes les conversations où l'utilisateur participe
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          has: user.id
        }
      }
    })

    let unreadCount = 0
    
    for (const conversation of conversations) {
      const count = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: user.id }, // Messages pas envoyés par l'utilisateur
          isRead: false
        }
      })
      unreadCount += count
    }

    return NextResponse.json({ count: unreadCount })

  } catch (error) {
    console.error("Erreur lors du comptage des messages non lus:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
